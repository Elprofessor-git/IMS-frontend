# Document d'Architecture et Feature Mapping - Projet Angular IMS

## 1. Structure Complète du Projet

Le projet Angular est actuellement basé sur Angular 17+ et se trouve dans une phase de transition inachevée entre l'ancienne architecture basée sur les `NgModules` et la nouvelle architecture `Standalone Components`. 

L'application est "bootstrappée" via `main.ts` en utilisant `bootstrapApplication(AppComponent, appConfig)`, ce qui signifie que l'application est fondamentalement **Standalone**. 

### Arborescence `src/app`
- **`app.component.ts`** : Composant racine (Standalone).
- **`app.config.ts`** : Configuration racine de l'application (providers, router).
- **`app.routes.ts`** : Définition des routes principales (lazy-loading via `loadChildren` ou `loadComponent`).
- **`app.module.ts`** : **[DÉPRÉCIÉ/MORT]** Ce fichier existe encore et importe tous les Feature Modules, mais il n'est probablement pas utilisé par le processus de build Standalone, créant une énorme confusion.
- **`core/`** : Cœur de l'application.
  - `auth/` : Services d'authentification.
  - `guards/` : Guards de routage (ex: `AuthGuard`).
  - `interceptors/` : Intercepteurs HTTP (`AuthInterceptor`, `ErrorInterceptor`, `LoadingInterceptor`).
  - `services/` : Services globaux d'accès aux APIs (⚠️ contient des duplications avec les features).
- **`features/`** : Modules fonctionnels (14 dossiers).
  - `achats/`, `admin/`, `auth/`, `chatbot/`, `clients-fournisseurs/`, `commandes/`, `dashboard/`, `emplacements/`, `importations/`, `mouvements/`, `rapports/`, `stock/`, `taches/`, `utilisateurs/`.
- **`layout/`** : Composants de structure globale (`header`, `sidebar`).
- **`shared/`** : Éléments partagés.
  - `components/` : Composants réutilisables (`NotificationsComponent`).
  - `models/` : Interfaces TypeScript et DTOs (ex: `stock.model.ts`).

### Points Faibles Détectés dans l'Architecture
1. **Modules Fantômes (Dead Code)** : Des fichiers comme `app.module.ts` et de multiples `feature.module.ts` (ex: `stock.module.ts`) existent, déclarent des composants et importent des dépendances, mais le routing (`app.routes.ts`) charge les composants Standalone ou les routes directement en ignorant ces modules.
2. **Duplication Sévère des Services** : On retrouve des services identiques ou concurrents à deux endroits. Par exemple : `src/app/core/services/stock.service.ts` ET `src/app/features/stock/stock.service.ts`. Cela casse le pattern Singleton attendu par Angular et rend le debug impossible.
3. **Faux Appels API (Mocks concurrents)** : Dans plusieurs formulaires (comme `ImportationFormComponent`), le code exécute un faux succès via un `setTimeout` qui redirige l'utilisateur, tout en lançant la vraie requête API dans le vide sans gérer son résultat. Cela donne l'illusion que le bouton "Ajouter" fonctionne, alors que rien n'est sauvegardé en base.

---

## 2. Feature Mapping Complet

### Feature : Stock & Articles
- **Composants** : `StockComponent` (Liste), `ArticlesComponent`, `ArticleFormComponent` (Ajout/Modif), `StockFormDialogComponent`, `StockDetailsDialogComponent`.
- **Services** : `ArticleService` (dans core), `StockService` (dupliqué).
- **Routes** : `/stock` (Lazy-loaded via `stock.routes.ts`), `/stock/articles`, `/stock/articles/nouveau`.
- **State Management** : Aucun (utilisation basique d'Observables directement dans les composants).
- **API Endpoints** : `GET /api/stock`, `POST /api/stock`, `PUT /api/stock/:id`, `POST /api/articles`.
- **Statut** : ⚠️ Partiellement cassé.
- **Bugs Connus** : 
  - Problème de validation des formulaires. Les objets envoyés (ex: `Article`) ne correspondent parfois pas exactement aux DTOs attendus par le backend.
  - Gestion des erreurs silencieuses dans les formulaires d'ajouts.

### Feature : Importations
- **Composants** : `ImportationsComponent` (Liste), `ImportationFormComponent` (Ajout), `ImportationDetailsComponent`, `LigneImportationComponent`.
- **Services** : `ImportationService`, `FournisseurService`, `ArticleService`.
- **Routes** : `/importations` (Lazy-loaded).
- **State Management** : Aucun (Formulaires complexes gérés via `FormArray`).
- **API Endpoints** : `GET /api/importations`, `POST /api/importations`, `PUT /api/importations/:id`.
- **Statut** : ❌ Cassé (Bouton d'ajout inopérant).
- **Bugs Connus** : 
  - **Critique** : Le bouton "Créer" déclenche un `setTimeout` de 1 seconde qui redirige l'utilisateur vers la liste et affiche "Succès", ignorant complètement le résultat de la véritable requête `importationService.create(...)`. Si le backend renvoie une erreur (400 Bad Request), le frontend l'ignore et l'utilisateur ne voit jamais son importation ajoutée.

### Feature : Mouvements de Stock
- **Composants** : `MouvementsComponent`, `MouvementFormComponent`, `MouvementDetailsComponent`.
- **Services** : `MouvementStockService` (dupliqué entre `stock/` et `mouvements/`).
- **Routes** : `/mouvements`.
- **API Endpoints** : `GET /api/mouvements`, `POST /api/mouvements`.
- **Statut** : ⚠️ Partiellement cassé (problèmes de duplication de services).

### Feature : Utilisateurs & Rôles
- **Composants** : `UtilisateursComponent`, `UtilisateurFormComponent`.
- **Services** : `UserService`, `UtilisateurService` (Conflit de nommage/duplication).
- **Routes** : `/utilisateurs`.
- **API Endpoints** : `GET /api/users`, `POST /api/users`, `PUT /api/users/:id`, `DELETE /api/users/:id`.
- **Statut** : ✅ Fonctionne (mais à refactorer pour enlever les duplications).

### Autres Features (Tâches, Achats, Commandes, Dashboard, etc.)
- Suivent un schéma similaire. Tous souffrent du manque de State Management et de l'architecture hybride Standalone/NgModule.

---

## 3. Cartographie des APIs (Principales)

Toutes ces URL sont préfixées par `environment.apiUrl`.

| Méthode | Endpoint | Service concerné | Fonctionnalité |
|---------|----------|------------------|----------------|
| **GET** | `/api/users` | `UserService` | Liste des utilisateurs |
| **POST**| `/api/users` | `UserService` | Création utilisateur (Payload: `User`) |
| **GET** | `/api/roles` | `UserService` | Liste des rôles |
| **GET** | `/api/taches` | `TacheService` | Liste des tâches |
| **POST**| `/api/taches` | `TacheService` | Création tâche |
| **PUT** | `/api/taches/:id/statut` | `TacheService` | Mise à jour statut tâche |
| **GET** | `/api/stock` | `StockService` | Liste des stocks actuels |
| **POST**| `/api/stock/reserve` | `StockService` | Réservation de stock |
| **GET** | `/api/mouvements` | `MouvementStockService` | Historique des mouvements |
| **POST**| `/api/mouvements` | `MouvementStockService` | Ajout d'un mouvement |
| **GET** | `/api/importations` | `ImportationService`| Liste des importations |
| **POST**| `/api/importations` | `ImportationService`| Création (Payload: `Importation`) |
| **GET** | `/Article?pageSize=1`| `DashboardService`| Dashboard KPIs |
| **GET** | `/CommandeClient` | `DashboardService`| Dashboard Commandes actives |

---

## 4. Problèmes Critiques Détectés

### 1. Fausse soumission des formulaires (Le bug des "Boutons d'ajout")
C'est le problème le plus urgent. Dans des fichiers comme `importation-form.component.ts`, la méthode `onSubmit()` contient un "Mock" :
```typescript
setTimeout(() => {
  this.router.navigate(['/...']);
  this.snackBar.open('Succès!');
}, 1000);
const request = this.importationService.create(data);
request.subscribe({...}); // La réponse (succès ou erreur API) arrive trop tard, la page a déjà changé !
```
**Conséquence :** L'utilisateur valide un formulaire, l'API renvoie potentiellement une erreur (ex: champs manquants), mais l'UI affiche un succès et redirige. Les données n'apparaissent donc pas dans les tableaux.

### 2. Architecture Hybride Bancale (NgModule vs Standalone)
Des fichiers de modules (ex: `stock.module.ts`, `app.module.ts`) sont maintenus pour rien. Pire, le `app.module.ts` importe des feature modules, forçant un chargement initial complet (Eager Loading), alors que le `app.routes.ts` tente de faire du Lazy Loading. 

### 3. Services Dupliqués
Plusieurs services existent en double (ex: `UtilisateurService` vs `UserService`, `StockService` dans `core` et dans `features/stock`). Cela cause des instanciations multiples de `HttpClient` et casse l'état applicatif.

### 4. Memory Leaks (Fuites mémoire)
Il y a de nombreux `.subscribe()` dans les composants (`ngOnInit` et méthodes d'actions) sans aucun `.unsubscribe()` (ni `takeUntil`, ni `takeUntilDestroyed`), ce qui engendre des fuites mémoires importantes lorsque l'utilisateur navigue entre les pages.

---

## 5. Recommandations d’Architecture pour le Refactoring

### 1. Nettoyage Standalone (Urgence : Élevée)
- **Supprimer tous les fichiers `.module.ts`** de l'application (y compris `app.module.ts`).
- S'assurer que tous les composants ont `standalone: true`.
- Vérifier que `app.routes.ts` charge les composants ou les routes enfants directement (`loadComponent` ou `loadChildren` pointant vers des `Routes`, pas vers des Modules).

### 2. Correction des Formulaires et des Appels API (Urgence : Critique)
- **Supprimer tous les `setTimeout`** simulant des succès.
- Gérer les formulaires correctement dans les `.subscribe()` :
```typescript
this.service.create(data).subscribe({
  next: (res) => {
    this.snackBar.open('Succès');
    this.router.navigate(['/...']);
  },
  error: (err) => {
    // Afficher la VRAIE erreur envoyée par le backend
    this.snackBar.open(err.error.message || 'Erreur lors de la création');
  }
});
```

### 3. Restructuration des Dossiers (Architecture Cible)
Adopter une architecture "Feature-based" propre :
```
src/app/
├── core/
│   ├── auth/ (services, guards)
│   ├── interceptors/
│   └── http/ (API base services)
├── shared/
│   ├── ui/ (Boutons, Modales, Snackbars mutualisés)
│   ├── utils/ (Helpers, Formatters)
│   └── models/ (Interfaces Typescript)
├── features/
│   ├── [nom-feature]/ (ex: importations)
│   │   ├── components/ (liste, detail, form)
│   │   ├── services/ (Uniquement les services propres à cette feature)
│   │   └── [nom-feature].routes.ts
```

### 4. Gestion d'État et Bonnes Pratiques
- **Signaux (Signals)** : Migrer les Observables simples vers les **Signals** (Angular 17+) pour gérer l'état local des composants de manière synchrone et performante (ex: `isLoading = signal(false)`).
- **RxJS / Unsubscribe** : Utiliser `takeUntilDestroyed()` de Angular 16+ pour éviter les fuites mémoires dans les composants.
- **Dédoublonnage** : Supprimer immédiatement les doublons dans `core/services` s'ils existent déjà dans `features/*/services`. Un service lié à une entité métier (ex: Stock) doit vivre dans sa Feature, sauf s'il est massivement utilisé ailleurs.
