# 🚀 Déploiement sur Render - Guide Final

## ✅ Prérequis

- [x] Swagger installé et configuré
- [x] Code poussé sur GitHub
- [x] Repository : `Ibrahim-Sempy/ehk-cotisations`

## 📝 Étapes de Déploiement

### 1. Créer le Web Service

1. Allez sur [render.com](https://render.com)
2. Connectez-vous avec GitHub
3. Cliquez sur **"+ New +"** → **"Web Service"**
4. Sélectionnez le repository : **`ehk-cotisations`**

### 2. Configuration (CRITIQUE)

```
Name: ehk-backend
Region: (choisissez le plus proche)
Branch: main
Root Directory: backend  ← TRÈS IMPORTANT !
```

### 3. Build & Start Commands

```
Build Command: npm install --production
Start Command: node server.js
```

### 4. Variables d'Environnement

Cliquez sur **"Advanced"** → Ajoutez ces variables :

```
NODE_ENV = production
PORT = 3000
CORS_ORIGIN = *
JWT_SECRET = (générez un secret aléatoire - ex: openssl rand -hex 32)
DB_PATH = ./database/ehk.db
SERVER_URL = (laissez vide, sera rempli automatiquement)
```

**Pour générer un JWT_SECRET sécurisé** :
```bash
# Sur Windows PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

### 5. Déployer

1. Cliquez sur **"Create Web Service"**
2. Attendez 2-5 minutes
3. Copiez l'URL générée (ex: `https://ehk-backend-xxxx.onrender.com`)

### 6. Tester

1. **Health Check** : `https://ehk-backend-xxxx.onrender.com/api/health`
2. **Swagger Docs** : `https://ehk-backend-xxxx.onrender.com/api-docs`

### 7. Mettre à jour SERVER_URL

Une fois l'URL obtenue, allez dans **Environment** et mettez à jour :

```
SERVER_URL = https://ehk-backend-xxxx.onrender.com
```

Puis redéployez (Render le fera automatiquement).

## 📚 Accès à Swagger

Après le déploiement, accédez à :
```
https://ehk-backend-xxxx.onrender.com/api-docs
```

Vous pourrez :
- Voir toutes les routes API
- Tester les endpoints directement
- Voir les schémas de données
- Utiliser l'authentification JWT

## 🔄 Mise à jour du Frontend

Dans `frontend-admin/.env` :
```env
NEXT_PUBLIC_API_URL=https://ehk-backend-xxxx.onrender.com/api
```

Dans `mobile/lib/config/api_config.dart` :
```dart
static const String baseUrl = 'https://ehk-backend-xxxx.onrender.com/api';
```

## ⚠️ Notes Importantes

1. **Root Directory = `backend`** - Ne l'oubliez pas !
2. Le plan gratuit met l'app en "sleep" après 15 min d'inactivité
3. La première requête après le sleep prend 30-50 secondes
4. Pour éviter le sleep, utilisez le plan Starter ($7/mois)

## 🆘 Problèmes ?

Si vous rencontrez des erreurs :
1. Vérifiez les logs dans Render
2. Vérifiez que **Root Directory = `backend`**
3. Vérifiez les variables d'environnement
4. Vérifiez que le Build Command est correct

