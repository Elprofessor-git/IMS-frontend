# 🗺️ Carte de l'API Backend - IMS (Version Unifiée & Sécurisée)

Ce document sert de référence pour le frontend Angular afin de s'assurer que les services pointent vers les bonnes routes et utilisent les bons formats de données.

---

## 🔒 Authentification & Profil
**Base URL : `/api/Auth`**

| Méthode | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/Auth/login` | Connexion. Retourne `{ token, expiration, roles, ... }` |
| `POST` | `/api/Auth/register` | Création de compte (Public/Admin). |
| `POST` | `/api/Auth/forgot-password` | Demande de réinitialisation de mot de passe (Local). |

---

## 👥 Gestion des Utilisateurs & Rôles
**Base URL : `/api/Account/users` et `/api/roles`**

| Méthode | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/Account/users` | Liste tous les utilisateurs (Admin requis). |
| `GET` | `/api/Account/users/{id}` | Détails d'un utilisateur. |
| `PUT` | `/api/Account/users/{id}` | Mise à jour des informations utilisateur. |
| `DELETE` | `/api/Account/users/{id}` | Suppression d'un utilisateur. |
| `GET` | `/api/roles` | **Liste tous les rôles Identity (Admin requis).** |
| `POST` | `/api/roles` | Création d'un nouveau rôle. |
| `DELETE` | `/api/roles/{id}` | Suppression d'un rôle. |

---

## 📦 Stock & Articles
**Base URL : `/api/Stock` et `/api/Article`**

| Méthode | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/Stock` | Liste complète du stock. |
| `GET` | `/api/Stock/Reserve` | Liste du stock réservé (**Inclut CommandeClient**). |
| `GET` | `/api/Stock/Alertes` | Articles sous le seuil d'alerte. |
| `POST` | `/api/Stock/{id}/Valider` | Validation manuelle d'une entrée. |
| `POST` | `/api/Stock/{id}/Reserver` | Réservation manuelle d'une quantité. |

---

## 🏭 Production (Commandes & Tâches)
**Base URL : `/api/CommandeClient` et `/api/TacheProduction`**

| Méthode | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/CommandeClient` | Liste des commandes de production. |
| `POST` | `/api/CommandeClient/ValiderRessources/{id}` | Calcule la couverture des besoins (**Gère le stock réservé**). |
| `GET` | `/api/TacheProduction` | Liste toutes les tâches. |
| `PUT` | `/api/TacheProduction/{id}/statut` | Mise à jour du statut (ex: `EnCours`, `Termine`). |
| `PUT` | `/api/TacheProduction/{id}/equipe` | Assignation d'une équipe. |
| `POST` | `/api/TacheProduction/{id}/Commencer` | Démarre la tâche. |
| `POST` | `/api/TacheProduction/{id}/Terminer` | Termine la tâche et met à jour la commande. |

---

## 🛒 Achats & Approvisionnement
**Base URL : `/api/Achat`**

| Méthode | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/Achat` | Liste des achats fournisseurs. |
| `POST` | `/api/Achat/{id}/Soumettre` | Validation technique et cohérence besoins. |
| `POST` | `/api/Achat/{id}/Confirmer` | Confirmation fournisseur. |
| `POST` | `/api/Achat/{id}/Livrer` | **Réception physique. Crée du stock lié à la CommandeClientId.** |

---

## 🔧 Notes Techniques
- **CORS** : Le backend accepte les requêtes de `https://ims-frontend-sage.vercel.app`.
- **JSON** : Toutes les propriétés sont retournées en `camelCase` (ex: `commandeClientId` et non `CommandeClientId`).
- **Auth** : Toutes les routes (sauf Login/Register/Health) nécessitent le header `Authorization: Bearer <TOKEN>`.
