# Guide d'installation et de démarrage

## Prérequis

- Node.js (v18 ou supérieur)
- npm ou yarn
- Flutter SDK (pour l'application mobile)

## Installation

### 1. Backend

```bash
cd backend
npm install
```

Créer un fichier `.env` à partir de `.env.example` :
```bash
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
DB_PATH=./database/ehk.db
CORS_ORIGIN=http://localhost:3001
```

Initialiser la base de données :
```bash
npm run init-db
```

Créer un utilisateur admin par défaut :
```bash
npm run create-admin
# ou avec email/password personnalisés :
npm run create-admin admin@ehk.org motdepasse123
```

Démarrer le serveur :
```bash
npm run dev
```

Le serveur sera accessible sur `http://localhost:3000`

### 2. Frontend Admin

```bash
cd frontend-admin
npm install
```

Créer un fichier `.env.local` :
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

Démarrer le serveur de développement :
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3001`

### 3. Application Mobile

```bash
cd mobile
flutter pub get
```

Configurer l'URL de l'API dans `lib/config/api_config.dart`

Lancer l'application :
```bash
flutter run
```

## Structure des dossiers

```
EHK/
├── backend/
│   ├── config/          # Configuration (database, etc.)
│   ├── models/          # Modèles de données
│   ├── routes/          # Routes API
│   ├── middleware/      # Middleware (auth, etc.)
│   ├── services/        # Services (PDF, etc.)
│   ├── database/        # Scripts SQL
│   └── scripts/         # Scripts utilitaires
├── frontend-admin/
│   ├── pages/           # Pages Next.js
│   ├── components/      # Composants React
│   └── lib/             # Utilitaires
└── mobile/
    └── lib/             # Code Flutter
```

## Tests de l'API

Vous pouvez tester l'API avec curl ou Postman :

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ehk.org","password":"admin123"}'

# Get members (avec token)
curl -X GET http://localhost:3000/api/members \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Prochaines étapes

1. Développer l'interface admin web
2. Développer l'application mobile
3. Ajouter les tests
4. Déployer l'application

