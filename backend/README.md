# Backend API - Les Étoiles de Horè-Koubi

## 📚 Documentation API (Swagger)

Une fois le serveur démarré, accédez à la documentation Swagger :

**URL locale** : http://localhost:3000/api-docs

**URL production** : https://votre-backend.onrender.com/api-docs

## 🚀 Démarrage

### Développement
```bash
npm run dev
```

### Production
```bash
npm start
```

## 📝 Variables d'environnement

Créez un fichier `.env` :

```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=*
JWT_SECRET=votre-secret-securise
DB_PATH=./database/ehk.db
SERVER_URL=http://localhost:3000
```

## 🔐 Authentification

La plupart des endpoints nécessitent un token JWT. Obtenez-le via `/api/auth/login` et utilisez-le dans le header :

```
Authorization: Bearer <votre-token>
```

Dans Swagger UI, cliquez sur le bouton "Authorize" en haut à droite et entrez votre token.

