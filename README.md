# Système de Gestion Textile - Frontend Angular

Application frontend développée avec Angular 18 pour le système de gestion textile. Compatible avec le backend ASP.NET.

## Fonctionnalités

### Modules Implémentés

1. **Authentification et Autorisation**
   - Connexion/déconnexion sécurisée
   - Gestion des rôles et permissions
   - Guards de route

2. **Gestion de Stock**
   - Suivi granulaire du stock (libre/réservé)
   - Visualisation par emplacement physique
   - Alertes pour seuils critiques
   - Traçabilité complète des mouvements

3. **Gestion des Commandes Clients**
   - Saisie et validation des commandes
   - Calcul automatique des besoins
   - Workflow de validation des ressources
   - Statuts automatisés

4. **Gestion des Tâches**
   - Création automatisée à partir des commandes
   - Assignation aux équipes
   - Suivi visuel avec dashboard
   - Gestion des statuts et progression

5. **Gestion Clients/Fournisseurs**
   - Fiches détaillées avec historiques
   - CRUD complet avec logs
   - Préférences clients
   - Liens avec commandes et stocks

6. **Gestion des Achats**
   - Formulaires d'ajout liés aux commandes
   - Workflow de validation
   - Génération automatique de PDF
   - Traçabilité complète

7. **Gestion des Importations**
   - Enregistrement des importations
   - Upload de justificatifs
   - Mise à jour automatique du stock
   - Multi-produits et multi-commandes

8. **Gestion des Utilisateurs et Rôles**
   - Création de comptes sécurisés
   - Définition de rôles personnalisés
   - Affectation des permissions
   - Historique des connexions

9. **Mouvements**
   - Historique complet des flux
   - Gestion des transferts internes
   - Formulaires dédiés
   - Liaison avec tous les modules

## Architecture Technique

### Structure du Projet

```
src/
├── app/
│   ├── core/                 # Services globaux, guards, intercepteurs
│   │   ├── guards/           # Guards de route
│   │   ├── interceptors/     # Intercepteurs HTTP
│   │   └── services/         # Services métier
│   ├── shared/               # Composants et modèles partagés
│   │   ├── components/       # Composants réutilisables
│   │   ├── models/           # Modèles TypeScript
│   │   └── services/         # Services utilitaires
│   ├── features/             # Modules fonctionnels
│   │   ├── auth/            # Authentification
│   │   ├── dashboard/       # Tableau de bord
│   │   ├── stock/           # Gestion de stock
│   │   ├── commandes/       # Commandes clients
│   │   ├── taches/          # Gestion des tâches
│   │   ├── clients-fournisseurs/ # Partenaires
│   │   ├── achats/          # Achats
│   │   ├── importations/    # Importations
│   │   ├── utilisateurs/    # Utilisateurs et rôles
│   │   └── mouvements/      # Mouvements de stock
│   └── layout/              # Composants de layout
│       ├── header/          # En-tête
│       ├── sidebar/         # Menu latéral
│       └── footer/          # Pied de page
├── assets/                  # Ressources statiques
└── environments/            # Configuration par environnement
```

### Technologies Utilisées

- **Angular 18** - Framework frontend
- **Angular Material** - Composants UI
- **TypeScript** - Langage de programmation
- **RxJS** - Programmation réactive
- **SCSS** - Préprocesseur CSS

### Fonctionnalités Techniques

- **Lazy Loading** - Chargement à la demande des modules
- **Standalone Components** - Architecture moderne d'Angular
- **Reactive Forms** - Formulaires réactifs
- **HTTP Interceptors** - Gestion automatique des tokens et erreurs
- **Route Guards** - Protection des routes
- **Responsive Design** - Interface adaptative

## Installation et Configuration

### Prérequis

- Node.js 18.x ou supérieur
- npm 9.x ou supérieur
- Angular CLI 18.x

### Installation

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd gestion-textile-frontend
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration de l'environnement**
   
   Modifier le fichier `src/environments/environment.ts` :
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'https://localhost:7001/api', // URL de votre API ASP.NET
     apiTimeout: 30000,
     tokenKey: 'textile_auth_token',
     refreshTokenKey: 'textile_refresh_token'
   };
   ```

4. **Démarrer l'application**
   ```bash
   npm start
   # ou
   ng serve
   ```

   L'application sera accessible sur `http://localhost:4200`

## Configuration Backend ASP.NET

Pour une intégration complète avec le backend ASP.NET, assurez-vous que :

### CORS

Le backend doit autoriser les requêtes depuis l'origine Angular :

```csharp
// Dans Startup.cs ou Program.cs
services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        builder =>
        {
            builder.WithOrigins("http://localhost:4200")
                   .AllowAnyHeader()
                   .AllowAnyMethod()
                   .AllowCredentials();
        });
});
```

### Authentification JWT

Le backend doit être configuré pour JWT :

```csharp
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "your-issuer",
            ValidAudience = "your-audience",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("your-secret-key"))
        };
    });
```

### Endpoints API Attendus

L'application Angular attend les endpoints suivants :

```
# Authentification
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me

# Clients
GET    /api/clients
GET    /api/clients/{id}
POST   /api/clients
PUT    /api/clients/{id}
DELETE /api/clients/{id}
PATCH  /api/clients/{id}/toggle-status

# Fournisseurs
GET    /api/fournisseurs
GET    /api/fournisseurs/{id}
POST   /api/fournisseurs
PUT    /api/fournisseurs/{id}
DELETE /api/fournisseurs/{id}
PATCH  /api/fournisseurs/{id}/toggle-status

# Stock
GET    /api/stock
GET    /api/stock/{id}
POST   /api/stock
PUT    /api/stock/{id}
DELETE /api/stock/{id}

# Commandes
GET    /api/commandes
GET    /api/commandes/{id}
POST   /api/commandes
PUT    /api/commandes/{id}
DELETE /api/commandes/{id}

# Autres modules similaires...
```

## Déploiement

### Build de Production

```bash
npm run build
# ou
npm run build:prod
```

Les fichiers de production seront générés dans le dossier `dist/`.

### Déploiement sur IIS

1. Copier le contenu du dossier `dist/gestion-textile-frontend/` vers le répertoire IIS
2. Configurer le fichier `web.config` pour le routing Angular :

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="Angular Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

## Scripts NPM Disponibles

- `npm start` - Démarrer en mode développement
- `npm run build` - Build de production
- `npm run watch` - Build en mode watch
- `npm test` - Exécuter les tests unitaires
- `npm run lint` - Linter le code

## Contribution

1. Suivre les conventions de nommage Angular
2. Utiliser les Standalone Components
3. Implémenter les tests unitaires
4. Respecter les principes SOLID
5. Commenter le code complexe

## Support

Pour toute question ou problème, veuillez consulter la documentation technique ou contacter l'équipe de développement.
