# 📱 Configuration IP pour votre appareil

## Votre configuration actuelle

**Adresse IP de votre ordinateur :** `192.168.88.15`

## Configuration selon votre cas

### ✅ Si vous testez sur un émulateur Android
Utilisez dans `lib/config/api_config.dart` :
```dart
static const String baseUrl = 'http://10.0.2.2:3000/api';
```

### ✅ Si vous testez sur un téléphone/tablette physique
Utilisez dans `lib/config/api_config.dart` :
```dart
static const String baseUrl = 'http://192.168.88.15:3000/api';
```

## ⚠️ Important

1. **Votre téléphone et votre ordinateur doivent être sur le même réseau Wi-Fi**
   - Vérifiez que les deux sont connectés au même routeur Wi-Fi

2. **Le backend doit être démarré sur votre ordinateur**
   ```bash
   cd backend
   npm run dev
   ```

3. **Vérifiez que le firewall Windows autorise les connexions entrantes sur le port 3000**
   - Ouvrez le port 3000 dans le Pare-feu Windows si nécessaire

4. **Testez la connexion depuis votre téléphone**
   - Ouvrez un navigateur sur votre téléphone
   - Allez sur : `http://192.168.88.15:3000/api/health`
   - Vous devriez voir : `{"status":"OK","message":"API Les Étoiles de Horè-Koubi",...}`

## 🔄 Si votre IP change

Si vous changez de réseau Wi-Fi, votre IP peut changer. Pour trouver votre nouvelle IP :
```powershell
ipconfig
```
Cherchez "Adresse IPv4" sous "Carte réseau sans fil Wi-Fi"

## 🚀 Pour la production

En production, vous utiliserez une URL fixe comme :
```dart
static const String baseUrl = 'https://api.votre-domaine.com/api';
```

