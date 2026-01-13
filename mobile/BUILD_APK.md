# 📱 Guide de Génération et Installation de l'APK

Ce guide vous explique comment générer un fichier APK et l'installer directement sur un appareil Android sans passer par le Play Store.

## 📋 Prérequis

1. **Flutter SDK** installé (>=3.0.0)
   - Vérifiez avec : `flutter doctor`
   - Téléchargez depuis : [flutter.dev](https://flutter.dev/docs/get-started/install)

2. **Android Studio** (optionnel mais recommandé)
   - Pour configurer les outils Android SDK

3. **Un appareil Android** ou un émulateur pour tester

## 🚀 Étape 1 : Vérifier la Configuration

### 1.1 Vérifier que Flutter est prêt

```bash
flutter doctor
```

Assurez-vous que tout est vert (✓). Si Android n'est pas configuré, suivez les instructions affichées.

### 1.2 Vérifier l'URL de l'API

Le fichier `lib/config/api_config.dart` doit pointer vers Railway :

```dart
static const String baseUrl = 'https://etoiles-hore-koubi.up.railway.app/api';
```

✅ **C'est déjà configuré !** L'API pointe vers votre backend Railway.

## 🏗️ Étape 2 : Générer l'APK

### Option A : APK Debug (pour tester rapidement)

```bash
cd mobile
flutter build apk --debug
```

**Résultat** : `build/app/outputs/flutter-apk/app-debug.apk`

**Avantages** :
- ✅ Génération rapide
- ✅ Parfait pour tester

**Inconvénients** :
- ⚠️ Plus volumineux
- ⚠️ Non optimisé
- ⚠️ Contient des outils de débogage

### Option B : APK Release (pour distribution) ⭐ RECOMMANDÉ

```bash
cd mobile
flutter build apk --release
```

**Résultat** : `build/app/outputs/flutter-apk/app-release.apk`

**Avantages** :
- ✅ Optimisé et plus léger
- ✅ Prêt pour la distribution
- ✅ Meilleures performances

**Inconvénients** :
- ⚠️ Nécessite une signature (voir ci-dessous)

### Option C : APK Release avec Split par ABI (plus léger)

Génère des APK séparés pour chaque architecture (armeabi-v7a, arm64-v8a, x86_64) :

```bash
cd mobile
flutter build apk --split-per-abi --release
```

**Résultat** : 
- `build/app/outputs/flutter-apk/app-armeabi-v7a-release.apk` (32-bit)
- `build/app/outputs/flutter-apk/app-arm64-v8a-release.apk` (64-bit) ⭐ Le plus courant
- `build/app/outputs/flutter-apk/app-x86_64-release.apk` (émulateurs)

**Avantages** :
- ✅ APK plus petits (environ 20-30 MB chacun)
- ✅ Installation plus rapide

**Recommandation** : Utilisez `app-arm64-v8a-release.apk` pour la plupart des appareils modernes.

## 📦 Étape 3 : Signer l'APK (Optionnel mais Recommandé)

Pour installer un APK release sur un appareil, vous devez le signer. Flutter le fait automatiquement avec une clé de debug pour les tests, mais pour la distribution, créez une clé de release.

### 3.1 Créer une clé de signature

```bash
keytool -genkey -v -keystore ~/ehk-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias ehk
```

**Windows PowerShell** :
```powershell
keytool -genkey -v -keystore $env:USERPROFILE\ehk-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias ehk
```

Vous devrez entrer :
- Mot de passe du keystore
- Informations sur vous (nom, organisation, etc.)

### 3.2 Créer le fichier `android/key.properties`

Créez le fichier `mobile/android/key.properties` :

```properties
storePassword=VOTRE_MOT_DE_PASSE_KEYSTORE
keyPassword=VOTRE_MOT_DE_PASSE_KEY
keyAlias=ehk
storeFile=CHEMIN_VERS_VOTRE_KEYSTORE
```

**Exemple Windows** :
```properties
storePassword=monMotDePasse123
keyPassword=monMotDePasse123
keyAlias=ehk
storeFile=C:\\Users\\VotreNom\\ehk-release-key.jks
```

### 3.3 Configurer `android/app/build.gradle.kts`

Ajoutez cette configuration dans `android/app/build.gradle.kts` :

```kotlin
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    ...
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

**Note** : Pour un test rapide, vous pouvez ignorer cette étape et utiliser l'APK debug.

## 📱 Étape 4 : Installer l'APK sur un Appareil Android

### Méthode 1 : Via USB (Recommandé)

1. **Activer le mode développeur** sur votre téléphone :
   - Allez dans **Paramètres** → **À propos du téléphone**
   - Appuyez 7 fois sur **"Numéro de build"** ou **"Version"**
   - Un message confirme que vous êtes développeur

2. **Activer le débogage USB** :
   - Allez dans **Paramètres** → **Options pour les développeurs**
   - Activez **"Débogage USB"**

3. **Connecter votre téléphone** à l'ordinateur via USB

4. **Vérifier la connexion** :
   ```bash
   flutter devices
   ```
   Vous devriez voir votre appareil listé.

5. **Installer directement** :
   ```bash
   flutter install
   ```
   Ou copiez l'APK et installez-le manuellement (voir Méthode 2).

### Méthode 2 : Installation Manuelle

1. **Copier l'APK** sur votre téléphone :
   - Via USB : Copiez `build/app/outputs/flutter-apk/app-release.apk` sur votre téléphone
   - Via email : Envoyez-vous l'APK par email
   - Via cloud : Uploadez sur Google Drive, Dropbox, etc.

2. **Autoriser l'installation depuis des sources inconnues** :
   - Allez dans **Paramètres** → **Sécurité**
   - Activez **"Sources inconnues"** ou **"Installer des applications inconnues"**
   - Sur Android 8+ : Autorisez pour l'application que vous utilisez (Fichiers, Chrome, etc.)

3. **Ouvrir l'APK** :
   - Utilisez un gestionnaire de fichiers (Fichiers, ES File Explorer, etc.)
   - Trouvez l'APK et appuyez dessus
   - Suivez les instructions d'installation

4. **Installer** :
   - Appuyez sur **"Installer"**
   - Attendez la fin de l'installation
   - Appuyez sur **"Ouvrir"** pour lancer l'application

### Méthode 3 : Via ADB (Android Debug Bridge)

```bash
# Installer l'APK directement
adb install build/app/outputs/flutter-apk/app-release.apk

# Ou forcer la réinstallation
adb install -r build/app/outputs/flutter-apk/app-release.apk
```

## ✅ Étape 5 : Vérifier l'Installation

1. **Lancez l'application** sur votre téléphone
2. **Connectez-vous** avec :
   - Email : `admin@ehk.org`
   - Password : `admin123`
3. **Vérifiez** que les données se chargent depuis Railway

## 🔧 Dépannage

### Erreur : "App not installed"

**Causes possibles** :
- APK signé avec une clé différente d'une version précédente
- Espace de stockage insuffisant
- Version Android incompatible

**Solutions** :
1. Désinstallez l'ancienne version si elle existe
2. Vérifiez l'espace disponible
3. Vérifiez que votre Android est >= 5.0 (API 21)

### Erreur : "Parse error"

**Cause** : APK corrompu ou incomplet

**Solution** :
1. Régénérez l'APK : `flutter clean && flutter build apk --release`
2. Vérifiez que le téléchargement est complet

### L'application ne se connecte pas à l'API

**Vérifications** :
1. Vérifiez votre connexion internet
2. Vérifiez que l'URL dans `api_config.dart` est correcte
3. Vérifiez que Railway est accessible : `https://etoiles-hore-koubi.up.railway.app/api/health`

## 📊 Tailles Approximatives des APK

- **APK Debug** : ~50-80 MB
- **APK Release** : ~30-50 MB
- **APK Release (split)** : ~20-30 MB par architecture

## 🎯 Résumé Rapide

```bash
# 1. Aller dans le dossier mobile
cd mobile

# 2. Installer les dépendances
flutter pub get

# 3. Générer l'APK release
flutter build apk --release

# 4. Trouver l'APK
# Windows: mobile\build\app\outputs\flutter-apk\app-release.apk
# Mac/Linux: mobile/build/app/outputs/flutter-apk/app-release.apk

# 5. Copier sur votre téléphone et installer
```

## 📝 Notes Importantes

- ⚠️ **Gardez votre keystore en sécurité** ! Vous en aurez besoin pour mettre à jour l'application
- ⚠️ **Testez toujours** l'APK sur un appareil réel avant de le distribuer
- ✅ L'APK fonctionne sur tous les appareils Android (pas besoin du Play Store)
- ✅ Vous pouvez partager l'APK par email, USB, cloud, etc.

## 🚀 Prochaines Étapes

Une fois l'APK installé et testé :
1. Partagez l'APK avec les membres de l'association
2. Créez un QR code pour faciliter le téléchargement
3. Mettez à jour l'APK quand vous faites des modifications (régénérez et redistribuez)

