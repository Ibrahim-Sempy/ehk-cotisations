# 🚀 Guide de Déploiement

## 📱 Pourquoi l'adresse IP pour l'appareil physique ?

### Émulateur Android
- L'émulateur Android crée un réseau virtuel isolé
- `localhost` ou `127.0.0.1` dans l'app pointe vers l'émulateur lui-même, pas vers votre ordinateur
- **Solution** : Utiliser `10.0.2.2` qui est l'adresse spéciale de l'émulateur pointant vers votre ordinateur hôte

### Appareil physique (téléphone/tablette)
- L'appareil est sur le même réseau Wi-Fi que votre ordinateur
- `localhost` pointe vers l'appareil lui-même, pas vers votre ordinateur
- **Solution** : Utiliser l'adresse IP locale de votre ordinateur (ex: `192.168.1.100`)

### Comment trouver votre IP locale ?

**Windows :**
```powershell
ipconfig
# Cherchez "Adresse IPv4" sous votre connexion Wi-Fi/Ethernet
# Exemple: 192.168.1.100
```

**Mac/Linux :**
```bash
ifconfig
# ou
ip addr show
```

**Important** : Cette IP change si vous changez de réseau Wi-Fi. Pour un déploiement en production, utilisez un domaine ou une IP fixe.

---

## 🌐 Déploiement en Production

### 1. Backend (API)

#### Option A : VPS (Serveur dédié)
- **Hébergeurs recommandés** : DigitalOcean, AWS, OVH, Hetzner
- **Configuration minimale** : 1 CPU, 1GB RAM, 25GB SSD

**Étapes :**
```bash
# 1. Se connecter au serveur
ssh user@votre-serveur.com

# 2. Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Installer PM2 (gestionnaire de processus)
sudo npm install -g pm2

# 4. Cloner le projet
git clone votre-repo backend
cd backend

# 5. Installer les dépendances
npm install --production

# 6. Configurer les variables d'environnement
nano .env
# PORT=3000
# NODE_ENV=production
# JWT_SECRET=votre-secret-super-securise
# JWT_EXPIRES_IN=7d
# DB_PATH=./database/ehk.db
# CORS_ORIGIN=https://votre-domaine-admin.com

# 7. Initialiser la base de données
npm run init-db
npm run create-admin

# 8. Démarrer avec PM2
pm2 start server.js --name ehk-backend
pm2 save
pm2 startup
```

**Configuration Nginx (reverse proxy) :**
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
    }
}
```

#### Option B : Plateforme Cloud (Heroku, Railway, Render)
- **Heroku** : Facile mais payant après le free tier
- **Railway** : Bon compromis prix/performance
- **Render** : Gratuit avec limitations

**Exemple avec Railway :**
1. Créer un compte sur railway.app
2. Créer un nouveau projet
3. Connecter votre repo GitHub
4. Configurer les variables d'environnement
5. Déployer automatiquement

---

### 2. Frontend Admin (Next.js)

#### Option A : Vercel (Recommandé)
```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Se connecter
vercel login

# 3. Déployer
cd frontend-admin
vercel

# 4. Configurer les variables d'environnement
# Dans le dashboard Vercel :
# NEXT_PUBLIC_API_URL=https://api.votre-domaine.com/api
```

#### Option B : Netlify
```bash
# 1. Installer Netlify CLI
npm i -g netlify-cli

# 2. Build
cd frontend-admin
npm run build

# 3. Déployer
netlify deploy --prod
```

#### Option C : VPS (avec Nginx)
```bash
# 1. Build
cd frontend-admin
npm run build

# 2. Copier le dossier .next et public sur le serveur
scp -r .next public user@serveur:/var/www/ehk-admin/

# 3. Configurer Nginx
```

**Nginx config :**
```nginx
server {
    listen 80;
    server_name admin.votre-domaine.com;

    location / {
        root /var/www/ehk-admin;
        try_files $uri $uri/ /index.html;
    }
}
```

---

### 3. Application Mobile (Flutter)

#### Build APK (pour installation directe)
```bash
cd mobile

# Build APK
flutter build apk --release

# Le fichier sera dans : build/app/outputs/flutter-apk/app-release.apk
```

#### Build AAB (pour Google Play Store)
```bash
cd mobile

# Build AAB
flutter build appbundle --release

# Le fichier sera dans : build/app/outputs/bundle/release/app-release.aab
```

#### Configuration pour production
1. Modifier `lib/config/api_config.dart` :
```dart
static const String baseUrl = 'https://api.votre-domaine.com/api';
```

2. Mettre à jour le nom de l'app dans `pubspec.yaml`

3. Configurer les icônes et splash screen

4. Signer l'application (pour Google Play)

---

### 4. Base de données en Production

#### SQLite (Développement)
- ✅ Simple pour commencer
- ❌ Pas idéal pour la production (pas de concurrence élevée)

#### Migration vers PostgreSQL/MySQL (Recommandé pour production)
1. Installer PostgreSQL sur le serveur
2. Créer la base de données
3. Migrer les données depuis SQLite
4. Modifier le backend pour utiliser PostgreSQL

**Exemple avec PostgreSQL :**
```bash
# Installer pg
npm install pg

# Modifier config/database.js pour utiliser PostgreSQL
```

---

### 5. Sécurité en Production

#### Checklist de sécurité :
- [ ] Changer `JWT_SECRET` par une clé forte et aléatoire
- [ ] Activer HTTPS (certificat SSL avec Let's Encrypt)
- [ ] Configurer un firewall (UFW)
- [ ] Limiter les tentatives de connexion
- [ ] Sauvegarder régulièrement la base de données
- [ ] Utiliser des variables d'environnement pour les secrets
- [ ] Désactiver les logs en production
- [ ] Configurer CORS correctement

#### Certificat SSL (Let's Encrypt)
```bash
# Installer Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtenir un certificat
sudo certbot --nginx -d api.votre-domaine.com
```

---

### 6. Sauvegarde

#### Script de sauvegarde automatique
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_PATH="/path/to/ehk.db"

# Créer le dossier de backup
mkdir -p $BACKUP_DIR

# Copier la base de données
cp $DB_PATH $BACKUP_DIR/ehk_$DATE.db

# Garder seulement les 7 derniers backups
ls -t $BACKUP_DIR/ehk_*.db | tail -n +8 | xargs rm -f
```

**Cron job (tous les jours à 2h du matin) :**
```bash
0 2 * * * /path/to/backup.sh
```

---

### 7. Monitoring

#### PM2 Monitoring
```bash
pm2 monit
pm2 logs
```

#### Uptime Monitoring
- Utiliser des services comme UptimeRobot (gratuit)
- Configurer des alertes en cas de panne

---

## 📋 Checklist de déploiement

### Avant le déploiement
- [ ] Tester toutes les fonctionnalités en local
- [ ] Vérifier que toutes les variables d'environnement sont configurées
- [ ] Changer tous les secrets par défaut
- [ ] Configurer les domaines DNS
- [ ] Préparer les certificats SSL

### Backend
- [ ] Déployer sur serveur/VPS
- [ ] Configurer Nginx
- [ ] Activer HTTPS
- [ ] Configurer PM2
- [ ] Tester l'API avec Postman/curl
- [ ] Configurer les sauvegardes

### Frontend Admin
- [ ] Build de production
- [ ] Déployer sur Vercel/Netlify/VPS
- [ ] Configurer l'URL de l'API
- [ ] Tester la connexion
- [ ] Vérifier le responsive design

### Mobile
- [ ] Mettre à jour l'URL de l'API
- [ ] Build APK/AAB
- [ ] Tester sur appareil réel
- [ ] Publier sur Google Play (si nécessaire)

### Post-déploiement
- [ ] Tester toutes les fonctionnalités
- [ ] Vérifier les performances
- [ ] Configurer le monitoring
- [ ] Documenter les accès et mots de passe (de manière sécurisée)

---

## 🔗 URLs de production typiques

```
Backend API    : https://api.ehk.org/api
Frontend Admin : https://admin.ehk.org
Mobile App     : (APK distribué ou Google Play)
```

---

## 💡 Conseils

1. **Commencez petit** : Déployez d'abord le backend, testez, puis le frontend
2. **Utilisez un staging** : Environnement de test avant la production
3. **Documentez tout** : URLs, mots de passe, configurations
4. **Sauvegardez régulièrement** : Base de données et fichiers
5. **Monitorer** : Surveillez les logs et les performances

---

## 🆘 Support

En cas de problème :
1. Vérifier les logs : `pm2 logs` ou `journalctl -u nginx`
2. Vérifier la connectivité : `curl https://api.votre-domaine.com/api/health`
3. Vérifier les certificats SSL : `certbot certificates`
4. Vérifier les permissions de fichiers

