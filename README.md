# 🌟 Application de Gestion des Cotisations
## Les Étoiles de Horè-Koubi

Application numérique pour la gestion des cotisations de l'association, remplaçant le système papier actuel.

## 📁 Structure du projet

```
EHK/
├── backend/          # API REST (Node.js + Express + SQLite)
├── frontend-admin/   # Interface Admin Web (Next.js)
├── mobile/          # Application Mobile (Flutter)
└── docs/            # Documentation
```

## 🚀 Technologies

- **Backend**: Node.js + Express + SQLite
- **Frontend Admin**: Next.js
- **Mobile**: Flutter (Android)
- **Authentification**: JWT
- **Documents**: Génération PDF

## 📋 Fonctionnalités

- ✅ Gestion des membres
- ✅ Gestion des cotisations (mensuelles, baptêmes, mariages, cas particuliers)
- ✅ Suivi des paiements
- ✅ Génération de rapports PDF
- ✅ Mode hors ligne (mobile)
- ✅ Rôles utilisateurs (Admin, Secrétaire, Trésorier)

## 🛠️ Installation

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend Admin
```bash
cd frontend-admin
npm install
npm run dev
```

### Mobile
```bash
cd mobile
flutter pub get
flutter run
```

## 📝 Documentation

- [Cahier des charges](./cahier_des_charges_application_de_gestion_des_cotisations_les_etoiles_de_hore_koubi%20(1).md)
- [Guide d'installation](./docs/SETUP.md)
- [Documentation API](./docs/API.md)
- [État d'avancement](./PROGRESS.md)

## 🚀 Démarrage rapide

### Backend
```bash
cd backend
npm install
npm run init-db
npm run create-admin
npm run dev
```

### Frontend Admin
```bash
cd frontend-admin
npm install
npm run dev
```

### Mobile
```bash
cd mobile
flutter pub get
flutter run
```

## 📊 État du projet

Le backend est **100% fonctionnel** avec toutes les fonctionnalités du cahier des charges :
- ✅ Authentification JWT
- ✅ Gestion des membres
- ✅ Gestion des cotisations
- ✅ Génération de rapports PDF
- ✅ API REST complète

Le frontend admin et l'application mobile sont en cours de développement.

Voir [PROGRESS.md](./PROGRESS.md) pour plus de détails.

