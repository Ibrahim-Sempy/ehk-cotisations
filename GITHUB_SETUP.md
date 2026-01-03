# 🚀 Configuration GitHub

## Étape 1 : Créer le repository sur GitHub

1. Allez sur [github.com](https://github.com)
2. Cliquez sur le bouton **"+"** en haut à droite → **"New repository"**
3. Remplissez les informations :
   - **Repository name** : `ehk-cotisations` (ou un nom de votre choix)
   - **Description** : "Application de gestion des cotisations - Les Étoiles de Horè-Koubi"
   - **Visibility** : Public ou Private (selon votre choix)
   - **NE PAS** cocher "Initialize with README" (le repo est déjà initialisé)
4. Cliquez sur **"Create repository"**

## Étape 2 : Connecter le repo local à GitHub

Une fois le repo créé, GitHub vous donnera des instructions. Utilisez ces commandes :

```bash
git remote add origin https://github.com/Ibrahim-Sempy/NOM_DU_REPO.git
git branch -M main
git push -u origin main
```

## Alternative : Utiliser GitHub CLI

Si vous avez GitHub CLI installé :

```bash
gh repo create ehk-cotisations --public --source=. --remote=origin --push
```

