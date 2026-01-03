# 🚀 Guide de Déploiement - Plateformes Recommandées

## 📊 Vue d'ensemble

Votre application a **2 composants** à déployer :
1. **Backend API** (Node.js + Express + SQLite)
2. **Frontend Admin** (Next.js)

## 🎯 Recommandations par Composant

### 1. Backend API (Node.js + SQLite)

#### ⭐ **Option 1 : Railway** (RECOMMANDÉ)
- ✅ Supporte Node.js et SQLite
- ✅ Déploiement automatique depuis GitHub
- ✅ Base de données persistante
- ✅ Gratuit avec limitations (500h/mois)
- ✅ Facile à configurer

**Prix** : Gratuit (plan hobby) ou $5/mois

#### ⭐ **Option 2 : Render**
- ✅ Supporte Node.js
- ✅ SQLite supporté (avec stockage persistant)
- ✅ Déploiement automatique
- ✅ Gratuit avec limitations

**Prix** : Gratuit (plan free) ou $7/mois

#### ⭐ **Option 3 : DigitalOcean App Platform**
- ✅ Excellent pour Node.js
- ✅ Supporte SQLite (ou PostgreSQL recommandé)
- ✅ Scaling facile
- ⚠️ Plus cher

**Prix** : $5-12/mois

#### ⭐ **Option 4 : VPS (Hetzner, DigitalOcean Droplet)**
- ✅ Contrôle total
- ✅ SQLite fonctionne parfaitement
- ✅ PM2 déjà configuré
- ⚠️ Nécessite configuration manuelle

**Prix** : €4-10/mois (Hetzner) ou $6-12/mois (DigitalOcean)

#### ❌ **Non recommandé pour Backend** :
- **Vercel** : Limité pour les backends, SQLite problématique
- **Netlify** : Pas idéal pour les backends avec base de données
- **Heroku** : Payant maintenant

---

### 2. Frontend Admin (Next.js)

#### ⭐ **Option 1 : Vercel** (RECOMMANDÉ)
- ✅ **MEILLEUR** pour Next.js (créé par l'équipe Next.js)
- ✅ Déploiement automatique
- ✅ CDN global
- ✅ Gratuit avec limitations généreuses
- ✅ SSL automatique

**Prix** : Gratuit (plan hobby)

#### ⭐ **Option 2 : Netlify**
- ✅ Excellent pour Next.js
- ✅ Déploiement automatique
- ✅ CDN global
- ✅ Gratuit avec limitations

**Prix** : Gratuit (plan starter)

#### ⭐ **Option 3 : Railway**
- ✅ Supporte Next.js
- ✅ Même plateforme que le backend (simplicité)
- ⚠️ Moins optimisé que Vercel pour Next.js

**Prix** : Gratuit (plan hobby) ou $5/mois

---

## 🎯 Configuration Recommandée

### **Option A : Séparé (RECOMMANDÉ)**
- **Backend** : Railway ou Render
- **Frontend Admin** : Vercel
- **Avantage** : Chaque service utilise la meilleure plateforme

### **Option B : Tout sur Railway**
- **Backend** : Railway
- **Frontend Admin** : Railway
- **Avantage** : Tout au même endroit, facturation unique

### **Option C : VPS (Contrôle total)**
- **Backend + Frontend** : VPS (Hetzner/DigitalOcean)
- **Avantage** : Contrôle total, PM2 déjà configuré
- **Inconvénient** : Configuration manuelle, maintenance

---

## 📝 Guides de Déploiement par Plateforme

### Railway (Backend + Frontend)

#### Backend
1. Créer un compte sur [railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub repo"
3. Sélectionner le repo et le dossier `backend`
4. Railway détecte automatiquement Node.js
5. Ajouter les variables d'environnement :
   ```
   NODE_ENV=production
   PORT=3000
   CORS_ORIGIN=https://votre-admin.vercel.app
   JWT_SECRET=votre-secret-securise
   DB_PATH=./database/ehk.db
   ```
6. Déploiement automatique !

#### Frontend Admin
1. Même projet Railway ou nouveau projet
2. "Deploy from GitHub repo" → dossier `frontend-admin`
3. Variables d'environnement :
   ```
   NEXT_PUBLIC_API_URL=https://votre-backend.railway.app/api
   ```
4. Build command : `npm run build`
5. Start command : `npm start`

---

### Vercel (Frontend Admin uniquement)

1. Créer un compte sur [vercel.com](https://vercel.com)
2. "Add New Project" → Importer depuis GitHub
3. Sélectionner le repo et le dossier `frontend-admin`
4. Configuration :
   - Framework Preset : Next.js
   - Build Command : `npm run build`
   - Output Directory : `.next`
5. Variables d'environnement :
   ```
   NEXT_PUBLIC_API_URL=https://votre-backend.railway.app/api
   ```
6. Déployer !

---

### Render (Backend)

1. Créer un compte sur [render.com](https://render.com)
2. "New" → "Web Service"
3. Connecter le repo GitHub
4. Configuration :
   - Build Command : `npm install --production`
   - Start Command : `node server.js`
   - Environment : Node
5. Variables d'environnement (même que Railway)
6. Déployer !

---

## 🔧 Configuration Requise

### Backend - Variables d'environnement
```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://votre-admin.vercel.app
JWT_SECRET=changez-ce-secret-en-production
DB_PATH=./database/ehk.db
SERVER_URL=https://votre-backend.railway.app
```

### Frontend Admin - Variables d'environnement
```env
NEXT_PUBLIC_API_URL=https://votre-backend.railway.app/api
```

---

## 💰 Comparaison des Coûts

| Plateforme | Backend | Frontend | Total/mois |
|------------|---------|----------|------------|
| **Railway (tout)** | Gratuit/$5 | Gratuit/$5 | $0-10 |
| **Render + Vercel** | Gratuit/$7 | Gratuit | $0-7 |
| **VPS (Hetzner)** | €4 | €4 | €4 |
| **DigitalOcean** | $6 | $6 | $12 |

---

## 🎯 Ma Recommandation Finale

**Pour commencer (Gratuit)** :
- Backend : **Railway** (gratuit)
- Frontend Admin : **Vercel** (gratuit)

**Pour la production (Payant)** :
- Backend : **Railway** ($5/mois) ou **VPS Hetzner** (€4/mois)
- Frontend Admin : **Vercel** (gratuit, excellent pour Next.js)

**Pour le contrôle total** :
- Tout sur un **VPS** (Hetzner €4/mois ou DigitalOcean $6/mois)
- Utiliser PM2 (déjà configuré dans votre projet)

---

## 📚 Ressources

- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

