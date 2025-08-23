# IMS-frontend
Ce dépôt contient la partie **frontend** de l’application **Inventory Management System (IMS)** développée pour la gestion du stock et des opérations de production dans un atelier de confection.

## 🚀 Technologies utilisées

* **Angular 18** (framework frontend)
* **TypeScript**
* **HTML5 / SCSS**
* **Nginx** (pour la mise en production avec Docker)

## 📌 Fonctionnalités principales

* Authentification et gestion des sessions (via JWT fourni par le backend).
* Tableau de bord avec indicateurs de stock.
* Gestion des produits, des commandes et des fournitures.
* Intégration avec l’API backend ASP.NET Core.
* UI responsive adaptée aux besoins d’un atelier textile.

## 📂 Structure du projet

```
/gestion-textile-frontend
 ├── src/               # Code source Angular
 ├── dist/              # Build de production
 ├── package.json       # Dépendances npm
 ├── angular.json       # Config Angular
 ├── Dockerfile         # Dockerisation frontend
 └── nginx.conf         # Config Nginx pour le déploiement
```

## ⚙️ Installation & exécution en local

1. Cloner le repo :

   ```bash
   git clone https://github.com/ton-compte/ims-frontend.git
   cd ims-frontend
   ```
2. Installer les dépendances :

   ```bash
   npm install
   ```
3. Lancer l’application en mode dev :

   ```bash
   ng serve -o
   ```
4. Accéder à l’app : [http://localhost:4200](http://localhost:4200)

## 🐳 Exécution avec Docker

1. Construire l’image :

   ```bash
   docker build -t ims-frontend .
   ```
2. Lancer le conteneur :

   ```bash
   docker run -p 4200:80 ims-frontend
   ```
3. Accéder à l’app via [http://localhost:4200](http://localhost:4200)

## 🔗 Dépendances

Ce frontend communique avec :

* **Backend API ASP.NET Core** (gestion du stock, authentification, etc.)
* **Chatbot FastAPI** (intégration IA)
* **PostgreSQL** (base de données principale via backend)


