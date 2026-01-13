# 📱 EHK Cotisations - Application Mobile

**Votre association dans votre poche**

Application Flutter pour la gestion des cotisations de l'association Les Étoiles de Horè-Koubi.

## ✨ Fonctionnalités

- ✅ Authentification sécurisée
- ✅ Liste des cotisations avec filtres
- ✅ Ajout rapide de cotisations
- ✅ Mode hors ligne (stockage local SQLite)
- ✅ Synchronisation automatique
- ✅ Affichage des détails
- ✅ Interface moderne et intuitive

## 🚀 Installation

### Prérequis
- Flutter SDK (>=3.0.0)
- Android Studio / VS Code avec extension Flutter
- Un appareil Android ou un émulateur

### Configuration

1. **Installer les dépendances** :
```bash
flutter pub get
```

2. **Configurer l'URL de l'API** :
L'API est déjà configurée pour utiliser Railway (production) :
- URL : `https://etoiles-hore-koubi.up.railway.app/api`

✅ **Aucune configuration nécessaire !** L'application est prête à utiliser l'API déployée.

3. **Lancer l'application** :
```bash
flutter run
```

## 📱 Générer et Installer l'APK

Pour installer l'application sur un appareil Android sans passer par le Play Store :

👉 **[Guide complet de génération et installation d'APK](./BUILD_APK.md)**

**Résumé rapide** :
```bash
cd mobile
flutter build apk --release
# L'APK sera dans : build/app/outputs/flutter-apk/app-release.apk
# Copiez-le sur votre téléphone et installez-le
```

## 📱 Utilisation

### Connexion
- Email : `admin@ehk.org`
- Mot de passe : `admin123`

### Mode hors ligne
L'application fonctionne même sans connexion internet :
- Les données sont stockées localement
- Les nouvelles cotisations sont mises en file d'attente
- Synchronisation automatique dès la reconnexion

### Synchronisation
Appuyez sur l'icône de synchronisation dans la barre d'outils pour forcer une synchronisation manuelle.

## 🏗️ Architecture

- **Services** :
  - `api_service.dart` : Communication avec l'API backend
  - `local_storage.dart` : Stockage local SQLite
  - `sync_service.dart` : Synchronisation des données

- **Pages** :
  - `login_page.dart` : Page de connexion
  - `home_page.dart` : Liste des cotisations
  - `add_contribution_page.dart` : Ajout de cotisation
  - `contribution_detail_page.dart` : Détails d'une cotisation

- **Modèles** :
  - `user.dart` : Modèle utilisateur
  - `member.dart` : Modèle membre
  - `contribution.dart` : Modèle cotisation

## 📝 Notes

- L'application nécessite une connexion internet pour la première synchronisation
- Les données sont automatiquement sauvegardées localement
- Le mode hors ligne permet d'ajouter des cotisations même sans connexion
