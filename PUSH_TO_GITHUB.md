# 📤 Instructions pour pousser sur GitHub

## Étape 1 : Créer le repository sur GitHub

1. Allez sur [github.com/new](https://github.com/new)
2. Connectez-vous avec vos identifiants :
   - Username: `Ibrahim-Sempy`
   - Password: `B626818384y`
3. Remplissez les informations :
   - **Repository name** : `ehk-cotisations` (ou un autre nom)
   - **Description** : "Application de gestion des cotisations - Les Étoiles de Horè-Koubi"
   - **Visibility** : Public ou Private
   - **NE PAS** cocher "Initialize with README", "Add .gitignore", ou "Choose a license"
4. Cliquez sur **"Create repository"**

## Étape 2 : Ajouter le remote et pousser

Une fois le repo créé, GitHub affichera des instructions. Exécutez ces commandes dans PowerShell :

```powershell
cd D:\EHK

# Remplacez NOM_DU_REPO par le nom que vous avez choisi
git remote add origin https://github.com/Ibrahim-Sempy/NOM_DU_REPO.git

# Pousser le code
git push -u origin main
```

Quand on vous demande les identifiants :
- Username: `Ibrahim-Sempy`
- Password: `B626818384y`

## Alternative : Utiliser un Personal Access Token

Si l'authentification par mot de passe ne fonctionne pas :

1. Allez sur [github.com/settings/tokens](https://github.com/settings/tokens)
2. Cliquez sur "Generate new token" → "Generate new token (classic)"
3. Donnez un nom (ex: "EHK Project")
4. Cochez "repo" (toutes les permissions repo)
5. Cliquez sur "Generate token"
6. **Copiez le token** (vous ne pourrez plus le voir après)
7. Utilisez le token comme mot de passe lors du `git push`

