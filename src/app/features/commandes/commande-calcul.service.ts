import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ModeleBom, FournitureBom } from './modele-bom.service';

export interface TaillesCommande {
  XS: number;
  S: number;
  M: number;
  L: number;
  XL: number;
  XXL: number;
}

export interface BesoinCalcule {
  articleId: number;
  designation: string;
  unite: string;
  qteNette: number;
  qteAvecSecurite: number;
  stockDispo: number;
  couverturePct: number;
}

export interface FaisabiliteResult {
  besoins: BesoinCalcule[];
  realisable: boolean;
  manques: BesoinCalcule[];
  nbPieces: number;
}

@Injectable({ providedIn: 'root' })
export class CommandeCalculService {
  private stockUrl = `${environment.apiUrl}/Stock`;

  constructor(private http: HttpClient) {}

  calculerFaisabilite(
    bom: ModeleBom,
    tailles: TaillesCommande,
    pctSecurite: number
  ): Observable<FaisabiliteResult> {
    const nbPieces = Object.values(tailles).reduce((s, v) => s + (v || 0), 0);

    if (nbPieces === 0 || !bom.fournitures?.length) {
      return of({ besoins: [], realisable: false, manques: [], nbPieces });
    }

    return this.http.get<any[]>(this.stockUrl).pipe(
      catchError(() => of([])),
      map(stocks => {
        const stockParArticle = new Map<number, number>();
        stocks.forEach(s => {
          const id = s.articleId ?? s.article?.id;
          const qte = (s.quantite ?? 0) - (s.quantiteReservee ?? 0);
          if (id != null) {
            stockParArticle.set(id, (stockParArticle.get(id) ?? 0) + Math.max(0, qte));
          }
        });

        const besoins: BesoinCalcule[] = bom.fournitures.map(f => {
          const qteNette = f.qteParPiece * nbPieces;
          const qteAvecSecurite = qteNette * (1 + pctSecurite / 100);
          const stockDispo = stockParArticle.get(f.articleId) ?? 0;
          const couverturePct = qteAvecSecurite > 0
            ? Math.round((stockDispo / qteAvecSecurite) * 100)
            : 100;

          return {
            articleId: f.articleId,
            designation: f.designation,
            unite: f.unite,
            qteNette: Math.round(qteNette * 1000) / 1000,
            qteAvecSecurite: Math.round(qteAvecSecurite * 1000) / 1000,
            stockDispo,
            couverturePct
          };
        });

        const manques = besoins.filter(b => b.couverturePct < 100);
        const realisable = manques.length === 0;

        return { besoins, realisable, manques, nbPieces };
      })
    );
  }

  getCouleurCouverture(pct: number): string {
    if (pct >= 100) return '#4caf50';
    if (pct >= 70) return '#ff9800';
    return '#f44336';
  }

  getClasseCouverture(pct: number): string {
    if (pct >= 100) return 'couverture-ok';
    if (pct >= 70) return 'couverture-warning';
    return 'couverture-danger';
  }
}
