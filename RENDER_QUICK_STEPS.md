# 🚀 Render - Étapes Rapides

## 📝 Checklist Simple

### ✅ Étape 1 : Créer le Service
- [ ] Cliquez sur **"+ New +"** → **"Web Service"**
- [ ] Connectez votre GitHub : `Ibrahim-Sempy/ehk-cotisations`

### ✅ Étape 2 : Configuration (IMPORTANT)

```
Name: ehk-backend
Region: (choisissez le plus proche)
Branch: main
Root Directory: backend  ← TRÈS IMPORTANT !
```

### ✅ Étape 3 : Build & Start

```
Build Command: npm install --production
Start Command: node server.js
```

### ✅ Étape 4 : Variables d'Environnement

Cliquez sur **"Advanced"** → **"Environment Variables"**, ajoutez :

```
NODE_ENV = production
PORT = 3000
CORS_ORIGIN = *
JWT_SECRET = (générez un secret aléatoire)
DB_PATH = ./database/ehk.db
SERVER_URL = (laissez vide pour l'instant)
```

### ✅ Étape 5 : Déployer

- [ ] Cliquez sur **"Create Web Service"**
- [ ] Attendez 2-5 minutes
- [ ] Copiez l'URL générée (ex: `https://ehk-backend-xxxx.onrender.com`)

### ✅ Étape 6 : Tester

Ouvrez dans votre navigateur :
```
https://ehk-backend-xxxx.onrender.com/api/health
```

Vous devriez voir : `{"status":"OK",...}`

---

## ⚠️ Points Critiques

1. **Root Directory = `backend`** ← Ne l'oubliez pas !
2. **Build Command = `npm install --production`**
3. **Start Command = `node server.js`**
4. **PORT = 3000** dans les variables d'environnement

---

## 🆘 Si ça ne marche pas

Dites-moi :
- À quelle étape vous êtes bloqué
- Le message d'erreur exact
- Une capture d'écran si possible

