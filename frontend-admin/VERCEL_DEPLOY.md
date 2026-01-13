# 🚀 Guide de Déploiement Frontend Admin sur Vercel

Ce guide vous explique comment déployer le frontend admin EHK sur Vercel étape par étape.

## 📋 Prérequis

- Un compte GitHub (gratuit)
- Un compte Vercel (gratuit)
- Le code frontend-admin dans la branche `frontend-admin` de votre dépôt
- Le backend déployé sur Railway (URL : `https://etoiles-hore-koubi.up.railway.app`)

## 🎯 Étape 1 : Créer un compte Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Sign Up"**
3. Connectez-vous avec votre compte GitHub

## 🎯 Étape 2 : Créer un nouveau projet

1. Dans le dashboard Vercel, cliquez sur **"Add New..."** → **"Project"**
2. Sélectionnez votre dépôt GitHub : `Ibrahim-Sempy/ehk-cotisations`
3. Vercel va détecter automatiquement que c'est un projet Next.js

## 🎯 Étape 3 : Configurer le projet

### 3.1 Sélectionner la branche et le dossier

1. Dans **"Configure Project"**, configurez :
   - **Framework Preset** : Next.js (détecté automatiquement)
   - **Root Directory** : Cliquez sur **"Edit"** et sélectionnez `frontend-admin`
   - **Branch** : `frontend-admin` (ou laissez `main` si vous préférez)

### 3.2 Configurer les variables d'environnement

Cliquez sur **"Environment Variables"** et ajoutez :

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_URL` | `https://etoiles-hore-koubi.up.railway.app/api` |

⚠️ **Important** : 
- Le préfixe `NEXT_PUBLIC_` est obligatoire pour que la variable soit accessible dans le navigateur
- L'URL doit se terminer par `/api` (pas juste le domaine)

### 3.3 Configuration du build (optionnel)

Vercel détecte automatiquement Next.js, mais vous pouvez vérifier :
- **Build Command** : `npm run build` (par défaut)
- **Output Directory** : `.next` (par défaut)
- **Install Command** : `npm install` (par défaut)

## 🎯 Étape 4 : Déployer

1. Cliquez sur **"Deploy"**
2. Vercel va :
   - Installer les dépendances (`npm install`)
   - Builder l'application (`npm run build`)
   - Déployer sur leur CDN global
3. Le déploiement prend généralement 1-2 minutes

## ✅ Vérification

Une fois déployé, Vercel vous donne une URL automatique (ex: `ehk-frontend-admin.vercel.app`)

### Testez votre application :

1. **Page d'accueil** :
   ```
   https://votre-app.vercel.app
   ```

2. **Page de login** :
   ```
   https://votre-app.vercel.app/login
   ```

3. **Vérifiez que l'API est accessible** :
   - Ouvrez la console du navigateur (F12)
   - Allez sur la page de login
   - Essayez de vous connecter
   - Vérifiez qu'il n'y a pas d'erreurs CORS ou de connexion

## 🔧 Configuration avancée

### Déploiement automatique

Vercel déploie automatiquement à chaque push sur la branche `frontend-admin`. Pour désactiver :

1. Allez dans **Settings** → **"Git"**
2. Désactivez **"Automatic deployments"** si nécessaire

### Domaines personnalisés

1. Allez dans **Settings** → **"Domains"**
2. Cliquez sur **"Add Domain"**
3. Entrez votre domaine (ex: `admin.etoiles-hore-koubi.com`)
4. Suivez les instructions pour configurer le DNS

### Variables d'environnement par environnement

Vous pouvez définir des variables différentes pour :
- **Production** : `https://etoiles-hore-koubi.up.railway.app/api`
- **Preview** : `https://etoiles-hore-koubi.up.railway.app/api` (ou une autre URL de test)
- **Development** : `http://localhost:3000/api`

Dans **Settings** → **"Environment Variables"**, vous pouvez spécifier pour quel environnement chaque variable s'applique.

### Logs

Pour voir les logs en temps réel :

1. Allez dans l'onglet **"Deployments"**
2. Cliquez sur le déploiement actif
3. Cliquez sur **"View Function Logs"**

## 🐛 Dépannage

### L'application ne se connecte pas à l'API

1. Vérifiez que `NEXT_PUBLIC_API_URL` est bien défini dans Vercel
2. Vérifiez que l'URL se termine par `/api`
3. Vérifiez que le backend Railway est accessible : `https://etoiles-hore-koubi.up.railway.app/api/health`
4. Vérifiez les logs dans la console du navigateur (F12)

### Erreur CORS

1. Vérifiez que dans Railway, la variable `CORS_ORIGIN` contient l'URL de votre frontend Vercel
2. Format : `https://votre-app.vercel.app` (sans `/` à la fin)
3. Redéployez le backend après avoir modifié `CORS_ORIGIN`

### Erreur de build

1. Vérifiez les logs de build dans Vercel
2. Vérifiez que toutes les dépendances sont dans `package.json`
3. Vérifiez que le Root Directory est bien `frontend-admin`

### L'application fonctionne en local mais pas sur Vercel

1. Vérifiez que `NEXT_PUBLIC_API_URL` est bien défini dans Vercel (pas seulement dans `.env.local`)
2. Les variables d'environnement doivent être définies dans l'interface Vercel
3. Redéployez après avoir ajouté/modifié les variables

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Next.js sur Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Variables d'environnement Vercel](https://vercel.com/docs/concepts/projects/environment-variables)

## 💰 Coûts

- **Plan Hobby (Gratuit)** : Illimité pour les projets personnels
- **Plan Pro ($20/mois)** : Pour les équipes et projets commerciaux

Pour ce projet, le plan gratuit devrait suffire largement !

---

**🎉 Félicitations ! Votre frontend admin est maintenant déployé sur Vercel !**

