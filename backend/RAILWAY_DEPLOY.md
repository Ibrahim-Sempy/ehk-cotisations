# 🚀 Guide de Déploiement Backend sur Railway

Ce guide vous explique comment déployer le backend EHK sur Railway étape par étape.

## 📋 Prérequis

- Un compte GitHub (gratuit)
- Un compte Railway (gratuit avec 500h/mois)
- Le code backend dans la branche `backend` de votre dépôt

## 🎯 Étape 1 : Créer un compte Railway

1. Allez sur [railway.app](https://railway.app)
2. Cliquez sur **"Start a New Project"**
3. Connectez-vous avec votre compte GitHub

## 🎯 Étape 2 : Créer un nouveau projet

1. Dans le dashboard Railway, cliquez sur **"New Project"**
2. Sélectionnez **"Deploy from GitHub repo"**
3. Autorisez Railway à accéder à votre dépôt GitHub si nécessaire
4. Sélectionnez votre dépôt : `Ibrahim-Sempy/ehk-cotisations`
5. Railway va détecter automatiquement que c'est un projet Node.js

## 🎯 Étape 3 : Configurer le service

### 3.1 Sélectionner la branche et le dossier ⚠️ IMPORTANT

**Cette étape est CRUCIALE** - Sans cela, Railway cherchera à la racine et ne trouvera pas le `package.json` !

1. Dans les **Settings** du service, allez dans **"Source"**
2. Sélectionnez la branche : **`backend`**
3. **Définissez le Root Directory** : **`backend`** (sans le slash `/`)
   - Railway va maintenant chercher les fichiers dans le dossier `backend/`
   - ⚠️ **Vérifiez bien que le Root Directory est `backend` et non vide ou `/`**
4. **Sauvegardez** les changements
5. Railway devrait maintenant détecter le `package.json` dans `backend/package.json`

### 3.2 Configurer les variables d'environnement

Allez dans **"Variables"** et ajoutez les variables suivantes :

```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://votre-frontend-admin.vercel.app
JWT_SECRET=votre-secret-jwt-tres-securise
DB_PATH=./database/ehk.db
```

**Important pour JWT_SECRET** :
- **Sur Windows (PowerShell)** :
  ```powershell
  [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
  ```
- **Sur Linux/Mac** :
  ```bash
  openssl rand -base64 32
  ```
- **Ou utilisez un générateur en ligne** : https://randomkeygen.com/

**Important pour CORS_ORIGIN** :
- Remplacez `https://votre-frontend-admin.vercel.app` par l'URL réelle de votre frontend admin
- Si vous n'avez pas encore déployé le frontend, vous pouvez utiliser `*` temporairement (moins sécurisé)

### 3.3 Configuration de la base de données SQLite

**Option A : Utiliser le système de fichiers Railway (Recommandé - Plus simple)**

Railway persiste automatiquement les fichiers dans le système de fichiers. Utilisez simplement un chemin local :

1. Dans les **Variables d'environnement**, définissez :
   ```
   DB_PATH=./database/ehk.db
   ```
   (c'est déjà la valeur par défaut, vous n'avez rien à changer si vous utilisez cette option)

2. Railway conservera automatiquement le fichier `database/ehk.db` entre les redéploiements.

**Option B : Utiliser un volume persistant (si disponible dans votre plan)**

Si vous voyez l'option "Volumes" ou "Storage" dans les Settings :

1. Dans les **Settings**, cherchez **"Volumes"**, **"Storage"** ou **"Persistent Storage"**
2. Cliquez sur **"Add Volume"**, **"Create Volume"** ou **"Add Storage"**
3. Nommez-le : `database`
4. Chemin du montage : `/data`
5. Cliquez sur **"Add"** ou **"Create"**

Puis modifiez la variable d'environnement :
```
DB_PATH=/data/ehk.db
```

⚠️ **Important** : 
- Si vous ne configurez pas de persistance, votre base de données SQLite sera perdue à chaque redéploiement !
- **L'Option A (chemin local `./database/ehk.db`) fonctionne généralement bien sur Railway** et est plus simple à configurer
- Si vous ne voyez pas l'option "Volumes", utilisez l'Option A

## 🎯 Étape 4 : Déployer

1. Railway va automatiquement détecter votre `package.json`
2. Il va installer les dépendances avec `npm install`
3. Il va démarrer l'application avec `npm start`
4. Le déploiement commence automatiquement !

## 🎯 Étape 5 : Configurer l'URL du serveur

Une fois le déploiement terminé :

1. Allez dans **"Settings"** → **"Networking"**
2. Railway vous donne une URL automatique (ex: `ehk-backend-production.up.railway.app`)
3. Vous pouvez créer un domaine personnalisé si vous le souhaitez
4. **Copiez cette URL** et mettez à jour la variable d'environnement `SERVER_URL` :
   ```
   SERVER_URL=https://votre-backend.railway.app
   ```
5. Redéployez pour appliquer les changements

## 🎯 Étape 6 : Initialiser la base de données et créer un admin

### Option A : Via Railway CLI (Recommandé)

1. Installez Railway CLI :
   ```bash
   npm i -g @railway/cli
   ```

2. Connectez-vous :
   ```bash
   railway login
   ```

3. Liez votre projet :
   ```bash
   railway link
   ```

4. Exécutez le script d'initialisation :
   ```bash
   railway run npm run init-db
   ```

5. Créez un utilisateur admin :
   ```bash
   railway run npm run create-admin
   ```

### Option B : Via Railway Dashboard

1. Allez dans votre service Railway
2. Cliquez sur l'onglet **"Deployments"**
3. Cliquez sur le dernier déploiement
4. Ouvrez la **console** (terminal)
5. Exécutez :
   ```bash
   npm run init-db
   npm run create-admin
   ```

## ✅ Vérification

Une fois déployé, testez votre API :

1. **Health Check** :
   ```
   https://votre-backend.railway.app/api/health
   ```
   Devrait retourner : `{"status":"OK","message":"API Les Étoiles de Horè-Koubi"}`

2. **Documentation Swagger** :
   ```
   https://votre-backend.railway.app/api-docs
   ```

3. **Test de connexion** :
   ```bash
   curl https://votre-backend.railway.app/api/health
   ```

## 🔧 Configuration avancée

### Déploiement automatique

Railway déploie automatiquement à chaque push sur la branche `backend`. Pour désactiver :

1. Allez dans **Settings** → **"Deploy"**
2. Désactivez **"Auto Deploy"** si nécessaire

### Logs

Pour voir les logs en temps réel :

1. Allez dans l'onglet **"Deployments"**
2. Cliquez sur le déploiement actif
3. Cliquez sur **"View Logs"**

Ou via CLI :
```bash
railway logs
```

### Monitoring

Railway fournit des métriques de base :
- CPU usage
- Memory usage
- Network traffic

Accédez-y via le dashboard Railway.

## 🐛 Dépannage

### L'application ne démarre pas

1. Vérifiez les logs dans Railway
2. Vérifiez que toutes les variables d'environnement sont définies
3. Vérifiez que `DB_PATH` est correctement défini
4. Vérifiez que `PORT` est bien défini (Railway le définit automatiquement)

### La base de données est vide après redéploiement

1. Vérifiez que `DB_PATH` est bien défini (ex: `./database/ehk.db` ou `/data/ehk.db`)
2. Vérifiez que le volume persistant est bien configuré (si vous utilisez `/data`)
3. Réinitialisez la base de données si nécessaire avec `railway run npm run init-db`

### Erreur CORS

1. Vérifiez que `CORS_ORIGIN` contient l'URL exacte de votre frontend
2. Pour le développement, vous pouvez temporairement utiliser `*`

### Erreur JWT

1. Vérifiez que `JWT_SECRET` est défini et assez long (minimum 32 caractères)
2. Ne changez pas `JWT_SECRET` après la création des utilisateurs (ils ne pourront plus se connecter)

## 📚 Ressources

- [Documentation Railway](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Exemples Railway](https://github.com/railwayapp/examples)

## 💰 Coûts

- **Plan Hobby (Gratuit)** : 500h/mois, $5 de crédit gratuit
- **Plan Pro ($5/mois)** : Illimité, plus de ressources

Pour ce projet, le plan gratuit devrait suffire largement !

---

**🎉 Félicitations ! Votre backend est maintenant déployé sur Railway !**

