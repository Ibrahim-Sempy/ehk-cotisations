# Frontend Admin - Les Étoiles de Horè-Koubi

Interface d'administration web pour la gestion des cotisations.

## 🚀 Démarrage

### Développement
```bash
npm run dev
```

L'application sera accessible sur http://localhost:3001

### Production
```bash
npm run build
npm start
```

## 🚀 Déploiement sur Vercel

Pour déployer ce frontend sur Vercel, suivez le guide complet :

👉 **[Guide de déploiement Vercel](./VERCEL_DEPLOY.md)**

### Déploiement rapide

1. Créez un compte sur [vercel.com](https://vercel.com)
2. Créez un nouveau projet depuis GitHub
3. Sélectionnez la branche `frontend-admin` et le dossier `frontend-admin`
4. Ajoutez la variable d'environnement :
   - `NEXT_PUBLIC_API_URL` = `https://etoiles-hore-koubi.up.railway.app/api`
5. Déployez !

## 📝 Variables d'environnement

Créez un fichier `.env.local` pour le développement :

```env
NEXT_PUBLIC_API_URL=https://etoiles-hore-koubi.up.railway.app/api
```

Pour la production sur Vercel, ajoutez cette variable dans l'interface Vercel.

## 🔐 Authentification

L'application utilise JWT pour l'authentification. Connectez-vous avec les identifiants admin créés dans le backend.

## 📚 Technologies

- **Next.js 14** - Framework React
- **Axios** - Client HTTP
- **React Icons** - Icônes
- **Date-fns** - Manipulation de dates

