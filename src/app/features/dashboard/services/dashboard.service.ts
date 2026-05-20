import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DashboardData, StockAlert, RecentActivity } from '../models/dashboard.model';
import { environment } from '../../../../environments/environment';

// Définir les interfaces pour les réponses API brutes
interface PaginatedArticles {
  items: any[];
  totalRecords: number;
}

interface StockItem {
  article: { prixUnitaireMoyen: number };
  quantite: number;
}

interface CommandeClient {
  statut: string;
}

interface TacheDashboard {
  enCours: number;
}

interface ApiStockAlert {
  id: string;
  designation: string;
  quantite: number;
  seuilAlerte: number;
  estCritique: boolean;
}

// Interfaces pour les activités récentes
interface ApiAchat {
  id: number;
  numeroAchat: string;
  dateCreation: string;
  fournisseur: { nom: string };
  montantTotal: number;
}

interface ApiMouvementStock {
  id: number;
  motif: string;
  dateMouvement: string;
  effectuePar: string;
  typeMouvement: string;
}


@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getDashboardData(): Observable<DashboardData> {
    // Stats
    const articles$ = this.http.get<PaginatedArticles>(`${this.apiUrl}/Article?pageSize=1`);
    const stockValue$ = this.http.get<StockItem[]>(`${this.apiUrl}/Stock`);
    const activeOrders$ = this.http.get<CommandeClient[]>(`${this.apiUrl}/CommandeClient`);
    const tasks$ = this.http.get<TacheDashboard>(`${this.apiUrl}/TacheProduction/Dashboard`);
    const stockAlerts$ = this.http.get<ApiStockAlert[]>(`${this.apiUrl}/Stock/Alertes`);

    // Recent Activities
    const recentPurchases$ = this.http.get<ApiAchat[]>(`${this.apiUrl}/Achat`);
    const recentMovements$ = this.http.get<ApiMouvementStock[]>(`${this.apiUrl}/MouvementStock`);

    return forkJoin({
      // Stats calls
      articles: articles$.pipe(catchError(() => of({ items: [], totalRecords: 0 }))),
      stockValue: stockValue$.pipe(catchError(() => of([]))),
      activeOrders: activeOrders$.pipe(catchError(() => of([]))),
      tasks: tasks$.pipe(catchError(() => of({ enCours: 0 }))),
      stockAlerts: stockAlerts$.pipe(catchError(() => of([]))),
      // Recent activities calls
      recentPurchases: recentPurchases$.pipe(catchError(() => of([]))),
      recentMovements: recentMovements$.pipe(catchError(() => of([])))
    }).pipe(
      map(results => {
        // 1. Calculer les statistiques
        const totalArticles = results.articles.totalRecords ?? 0;
        const totalStockValue = results.stockValue?.reduce((sum, item) => sum + (item.article?.prixUnitaireMoyen * item.quantite), 0) ?? 0;
        const activeOrdersCount = results.activeOrders?.filter(c => c.statut !== 'Terminee' && c.statut !== 'Annulee').length ?? 0;
        const activeTasksCount = results.tasks?.enCours ?? 0;

        // 2. Mapper les alertes de stock
        const mappedStockAlerts: StockAlert[] = results.stockAlerts?.map(alert => ({
          id: alert.id,
          productName: alert.designation,
          currentStock: alert.quantite,
          alertThreshold: alert.seuilAlerte,
          severity: alert.estCritique ? 'critical' : 'low'
        })) ?? [];

        // 3. Mapper et combiner les activités récentes
        const purchaseActivities: RecentActivity[] = results.recentPurchases.map(p => ({
          id: `achat-${p.id}`,
          type: 'achat',
          description: `Achat #${p.numeroAchat}`,
          timestamp: new Date(p.dateCreation),
          user: p.fournisseur?.nom ?? 'Fournisseur',
          details: { supplier: p.fournisseur?.nom }
        }));

        const adjustmentActivities: RecentActivity[] = results.recentMovements
          .filter(m => m.typeMouvement === 'Ajustement')
          .map(m => ({
            id: `ajust-${m.id}`,
            type: 'ajustement',
            description: m.motif || 'Ajustement de stock',
            timestamp: new Date(m.dateMouvement),
            user: m.effectuePar || 'Système',
            details: { reason: m.motif }
          }));

        const recentActivities = [...purchaseActivities, ...adjustmentActivities]
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 10);

        // 4. Construire l'objet DashboardData
        const dashboardData: DashboardData = {
          stats: [
            { value: totalArticles, label: 'Articles en Stock', icon: 'inventory_2', color: 'bg-blue-500' },
            { value: `${totalStockValue.toFixed(2)}€`, label: 'Valeur du Stock', icon: 'euro_symbol', color: 'bg-green-500' },
            { value: activeOrdersCount, label: 'Commandes Actives', icon: 'shopping_cart', color: 'bg-orange-500' },
            { value: activeTasksCount, label: 'Tâches en Cours', icon: 'assignment', color: 'bg-purple-500' }
          ],
          stockAlerts: mappedStockAlerts,
          recentActivities: recentActivities,
          achatsChart: this.createAchatsChart(results.recentPurchases),
        };

        return dashboardData;
      })
    );
  }

  private createAchatsChart(purchases: ApiAchat[]) {
    const monthlyAchats = new Map<string, number>();
    const monthNames = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Dec'];

    purchases.forEach(achat => {
      const date = new Date(achat.dateCreation);
      const month = date.getMonth();
      const year = date.getFullYear();
      const key = `${year}-${month.toString().padStart(2, '0')}`;

      const current = monthlyAchats.get(key) ?? 0;
      monthlyAchats.set(key, current + achat.montantTotal);
    });

    const sortedKeys = Array.from(monthlyAchats.keys()).sort().slice(-6);

    const labels = sortedKeys.map(key => {
      const [, monthIndex] = key.split('-');
      return monthNames[parseInt(monthIndex, 10)];
    });

    const data = sortedKeys.map(key => monthlyAchats.get(key) ?? 0);

    return {
      labels,
      datasets: [
        {
          label: 'Achats Mensuels',
          data,
          borderColor: '#4F46E5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          fill: true
        }
      ]
    };
  }
}


