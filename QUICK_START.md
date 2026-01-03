# 🚀 Guide de Démarrage Rapide - Déploiement

## Prérequis

1. **Node.js** (v18+) installé
2. **PM2** installé globalement : `npm install -g pm2`
3. Accès SSH à votre serveur

## ⚡ Déploiement Rapide

### Option 1 : Script automatique (Linux/Mac)

```bash
chmod +x deploy.sh
./deploy.sh all
```

### Option 2 : Script automatique (Windows PowerShell)

```powershell
.\deploy.ps1 all
```

### Option 3 : Déploiement manuel

#### Backend

```bash
cd backend
npm install --production

# Créez .env avec :
# NODE_ENV=production
# PORT=3000
# CORS_ORIGIN=https://votre-domaine-admin.com
# JWT_SECRET=votre-secret-securise
# DB_PATH=./database/ehk.db

npm run init-db
pm2 start ecosystem.config.js --env production
pm2 save
```

#### Frontend Admin

```bash
cd frontend-admin
npm install

# Créez .env.local avec :
# NEXT_PUBLIC_API_URL=https://api.votre-domaine.com/api

npm run build
pm2 start ecosystem.config.js --env production
pm2 save
```

## 📝 Configuration des fichiers .env

### Backend (.env)

```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://admin.votre-domaine.com
JWT_SECRET=changez-ce-secret-en-production
DB_PATH=./database/ehk.db
SERVER_URL=https://api.votre-domaine.com
```

### Frontend Admin (.env.local)

```env
NEXT_PUBLIC_API_URL=https://api.votre-domaine.com/api
```

## 🔍 Vérification

```bash
# Vérifier les processus PM2
pm2 list

# Voir les logs
pm2 logs ehk-api
pm2 logs ehk-admin

# Tester l'API
curl http://localhost:3000/api/health
```

## 🌐 Configuration Nginx (optionnel)

Voir `DEPLOYMENT.md` pour la configuration complète de Nginx et SSL.

## 📱 Mise à jour de l'app mobile

Après déploiement, mettez à jour `mobile/lib/config/api_config.dart` :

```dart
static const String baseUrl = 'https://api.votre-domaine.com/api';
```

## 🆘 Problèmes courants

### Port déjà utilisé
```bash
# Trouver le processus
netstat -tulpn | grep 3000
# Ou sur Windows
netstat -ano | findstr :3000
```

### PM2 ne démarre pas
```bash
# Vérifier l'installation
pm2 --version
# Réinstaller si nécessaire
npm install -g pm2
```

### Erreurs de build Next.js
```bash
# Nettoyer et rebuilder
cd frontend-admin
rm -rf .next
npm run build
```

