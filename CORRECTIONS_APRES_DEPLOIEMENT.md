# 📋 CORRECTIONS APRÈS DÉPLOIEMENT

> Ce fichier recense tous les bugs identifiés après déploiement ainsi que leurs solutions.
> **À mettre à jour à chaque correction de bug.**

---

## Format d'entrée

```
### BUG-XXX : [Titre court du bug]
- **Date**        : JJ/MM/AAAA
- **Fichier(s)**  : chemin/vers/fichier
- **Symptôme**    : Ce que l'utilisateur observe
- **Cause**       : Explication technique de la cause
- **Solution**    : Ce qui a été modifié
- **Commit**      : hash ou message du commit
```

---

## 🐛 Liste des corrections

---

### BUG-001 : Bouton "Ajouter Utilisateur" ne fonctionne pas

- **Date**       : 01/05/2026
- **Fichier(s)** : `src/app/features/utilisateurs/utilisateurs.component.ts`
- **Symptôme**   : Cliquer sur le bouton "Nouvel Utilisateur" (ou "Modifier") ne fait rien — aucune navigation, aucune erreur visible.
- **Cause**      : La méthode `openUserForm()` et `editUser()` étaient vides (corps vide `{}`). De plus, le service `Router` d'Angular n'était pas injecté dans le composant, rendant toute navigation impossible.
- **Solution**   :
  1. Ajout de l'import `Router` depuis `@angular/router`
  2. Injection de `Router` dans le constructeur
  3. Implémentation de `openUserForm()` :
     - Sans argument → navigue vers `/utilisateurs/nouveau` (création)
     - Avec un utilisateur → navigue vers `/utilisateurs/:id` (édition)
  4. Simplification de `editUser()` pour naviguer directement vers `/utilisateurs/:id`
- **Commit**     : `fix: bouton ajouter utilisateur - ajout navigation Router`

---

### BUG-002 : "Rôles et Permissions" dans la barre latérale affiche le formulaire d'ajout d'utilisateur

- **Date**       : 01/05/2026
- **Fichier(s)** : `src/app/features/utilisateurs/utilisateurs.routes.ts`
- **Symptôme**   : Cliquer sur "Rôles et Permissions" dans la sidebar charge le formulaire d'ajout d'utilisateur au lieu de la page des rôles.
- **Cause**      : Dans le fichier de routes, la route dynamique `':id'` était déclarée **avant** la route statique `'roles'`. Angular évalue les routes dans l'ordre de déclaration, donc `'roles'` était interprété comme un ID utilisateur et chargeait `UtilisateurFormComponent`.
  ```
  // ❌ Ancien ordre (bugué)
  { path: ':id', ... }   ← "roles" matché ici comme un ID
  { path: 'roles', ... } ← jamais atteint
  ```
- **Solution**   : Déplacer toutes les routes statiques (`roles`, `roles/nouveau`, `roles/:id`) **avant** la route dynamique `':id'`.
  ```
  // ✅ Nouveau ordre (correct)
  { path: 'nouveau', ... }
  { path: 'roles', ... }       ← routes statiques en premier
  { path: 'roles/nouveau', ... }
  { path: 'roles/:id', ... }
  { path: ':id', ... }         ← route dynamique en dernier
  ```
- **Commit**     : `fix: ordre des routes utilisateurs - roles avant :id`

---

> 💡 **Règle générale Angular** : Toujours déclarer les routes **statiques** avant les routes **dynamiques** (`:parametre`), sinon les routes statiques ne seront jamais atteintes.

