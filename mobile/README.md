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
Modifiez `lib/config/api_config.dart` :

**Pour émulateur Android :**
- Utilisez : `http://10.0.2.2:3000/api`
- `10.0.2.2` est l'adresse spéciale de l'émulateur qui pointe vers votre ordinateur

**Pour appareil physique (téléphone/tablette) :**
- Utilisez : `http://192.168.x.x:3000/api` (remplacez par votre IP locale)
- Trouver votre IP :
  - Windows : `ipconfig` (cherchez "Adresse IPv4")
  - Mac/Linux : `ifconfig` ou `ip addr show`
- ⚠️ Important : Votre téléphone et votre ordinateur doivent être sur le même réseau Wi-Fi

**Pourquoi ?**
- Sur un appareil physique, `localhost` pointe vers l'appareil lui-même, pas vers votre ordinateur
- Il faut donc utiliser l'adresse IP locale de votre ordinateur sur le réseau

3. **Lancer l'application** :
```bash
flutter run
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
