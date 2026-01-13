# 🔐 Créer un utilisateur Admin sur Railway

Ce guide vous explique comment créer un utilisateur admin avec les identifiants :
- **Email** : `admin@ehk.org`
- **Password** : `admin123`

## 📋 Méthode 1 : Via Railway CLI (Recommandé)

### Étape 1 : Installer Railway CLI

```bash
npm i -g @railway/cli
```

### Étape 2 : Se connecter à Railway

```bash
railway login
```

Cela ouvrira votre navigateur pour vous connecter.

### Étape 3 : Lier votre projet

```bash
railway link
```

Sélectionnez votre projet Railway dans la liste.

### Étape 4 : Initialiser la base de données (si pas déjà fait)

```bash
railway run sh -c "cd backend && npm run init-db"
```

### Étape 5 : Créer l'utilisateur admin

**Option A : Utiliser les identifiants par défaut (admin@ehk.org / admin123)**

```bash
railway run sh -c "cd backend && npm run create-admin"
```

**Option B : Spécifier explicitement les identifiants**

```bash
railway run sh -c "cd backend && npm run create-admin admin@ehk.org admin123"
```

Vous devriez voir :
```
✅ Admin user created successfully!
   Email: admin@ehk.org
   Password: admin123
   Role: admin
   ID: 1
```

---

## 📋 Méthode 2 : Via Railway Dashboard (Console)

### Étape 1 : Accéder à la console

1. Allez sur [railway.app](https://railway.app)
2. Ouvrez votre projet
3. Cliquez sur votre service backend
4. Allez dans l'onglet **"Deployments"**
5. Cliquez sur le dernier déploiement
6. Cliquez sur **"View Logs"** ou cherchez un bouton **"Console"** / **"Terminal"**

### Étape 2 : Exécuter les commandes

Dans la console, tapez :

```bash
cd backend
npm run init-db
npm run create-admin
```

⚠️ **Important** : N'oubliez pas de faire `cd backend` avant d'exécuter les commandes !

---

## ✅ Vérification

Une fois l'utilisateur créé, testez la connexion :

1. **Via l'API** :
   ```bash
   curl -X POST https://etoiles-hore-koubi.up.railway.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@ehk.org","password":"admin123"}'
   ```

2. **Via le frontend admin** :
   - Allez sur votre frontend admin déployé sur Vercel
   - Connectez-vous avec :
     - Email : `admin@ehk.org`
     - Password : `admin123`

---

## 🔒 Sécurité

⚠️ **IMPORTANT** : Changez le mot de passe par défaut après votre première connexion !

Pour changer le mot de passe :
1. Connectez-vous au frontend admin
2. Allez dans votre profil
3. Changez le mot de passe

Ou via l'API (nécessite d'être connecté) :
```bash
curl -X PUT https://etoiles-hore-koubi.up.railway.app/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{"currentPassword":"admin123","newPassword":"VotreNouveauMotDePasse"}'
```

---

## 🆘 Problèmes courants

### Erreur : "User already exists with this email"

L'utilisateur existe déjà. Vous pouvez :
- Utiliser les identifiants existants
- Ou créer un autre utilisateur avec un email différent :
  ```bash
  railway run sh -c "cd backend && npm run create-admin autre@email.com autrepassword"
  ```

### Erreur : "Could not read package.json"

Assurez-vous d'être dans le bon répertoire :
```bash
cd backend
```

### Erreur : "Database not initialized"

Exécutez d'abord :
```bash
railway run sh -c "cd backend && npm run init-db"
```

