# Guide de Déploiement - Les Étoiles de Horè-Koubi

Ce guide explique comment déployer l'API backend et l'interface d'administration.

## 📋 Prérequis

- Node.js (version 18 ou supérieure)
- npm ou yarn
- Un serveur (VPS, cloud, etc.) avec accès SSH
- Un domaine (optionnel mais recommandé)

## 🚀 Déploiement du Backend (API)

### 1. Préparation

```bash
cd backend
npm install --production
```

### 2. Configuration

Créez un fichier `.env` à partir de `.env.example` :

```bash
cp .env.example .env
```

Éditez `.env` et configurez :

```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://votre-domaine-admin.com
JWT_SECRET=votre-secret-jwt-tres-securise
DB_PATH=./database/ehk.db
SERVER_URL=https://api.votre-domaine.com
```

### 3. Initialisation de la base de données

```bash
npm run init-db
npm run create-admin
```

### 4. Démarrage avec PM2 (recommandé)

Installez PM2 globalement :

```bash
npm install -g pm2
```

Démarrez l'application :

```bash
pm2 start server.js --name ehk-api
pm2 save
pm2 startup
```

### 5. Configuration Nginx (optionnel mais recommandé)

Créez `/etc/nginx/sites-available/ehk-api` :

```nginx
server {
    listen 80;
    server_name api.votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activez la configuration :

```bash
sudo ln -s /etc/nginx/sites-available/ehk-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🎨 Déploiement du Frontend Admin

### 1. Préparation

```bash
cd frontend-admin
npm install
```

### 2. Configuration

Créez un fichier `.env.local` :

```env
NEXT_PUBLIC_API_URL=https://api.votre-domaine.com/api
```

### 3. Build de production

```bash
npm run build
```

### 4. Démarrage avec PM2

```bash
pm2 start npm --name ehk-admin -- start
pm2 save
```

### 5. Configuration Nginx

Créez `/etc/nginx/sites-available/ehk-admin` :

```nginx
server {
    listen 80;
    server_name admin.votre-domaine.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activez la configuration :

```bash
sudo ln -s /etc/nginx/sites-available/ehk-admin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 Configuration SSL avec Let's Encrypt

Installez Certbot :

```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
```

Obtenez les certificats :

```bash
sudo certbot --nginx -d api.votre-domaine.com
sudo certbot --nginx -d admin.votre-domaine.com
```

## 📱 Configuration de l'application mobile

Après le déploiement, mettez à jour `mobile/lib/config/api_config.dart` :

```dart
static const String baseUrl = 'https://api.votre-domaine.com/api';
```

## 🔍 Vérification

1. **Backend** : `https://api.votre-domaine.com/api/health`
2. **Admin** : `https://admin.votre-domaine.com`
3. **Mobile** : Testez la connexion depuis l'app

## 🛠️ Commandes utiles PM2

```bash
# Voir les processus
pm2 list

# Voir les logs
pm2 logs ehk-api
pm2 logs ehk-admin

# Redémarrer
pm2 restart ehk-api
pm2 restart ehk-admin

# Arrêter
pm2 stop ehk-api
pm2 stop ehk-admin

# Supprimer
pm2 delete ehk-api
pm2 delete ehk-admin
```

## 📝 Notes importantes

1. **Sécurité** : Changez le `JWT_SECRET` en production
2. **Base de données** : Faites des sauvegardes régulières de `ehk.db`
3. **CORS** : Configurez `CORS_ORIGIN` avec votre domaine admin
4. **Ports** : Assurez-vous que les ports 3000 et 3001 sont ouverts
5. **Firewall** : Configurez votre firewall pour autoriser les connexions nécessaires

## 🆘 Dépannage

### Le backend ne démarre pas
- Vérifiez les logs : `pm2 logs ehk-api`
- Vérifiez que le port 3000 n'est pas utilisé : `netstat -tulpn | grep 3000`
- Vérifiez les permissions sur le fichier de base de données

### Le frontend ne se connecte pas à l'API
- Vérifiez `NEXT_PUBLIC_API_URL` dans `.env.local`
- Vérifiez que le backend est accessible
- Vérifiez les logs du navigateur (F12)

### Erreurs CORS
- Vérifiez `CORS_ORIGIN` dans le `.env` du backend
- Assurez-vous que l'URL correspond exactement

