# Script de déploiement PowerShell pour Les Étoiles de Horè-Koubi
# Usage: .\deploy.ps1 [backend|admin|all]

param(
    [string]$Target = "all"
)

Write-Host "🚀 Déploiement de Les Étoiles de Horè-Koubi" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Fonction pour déployer le backend
function Deploy-Backend {
    Write-Host ""
    Write-Host "📦 Déploiement du Backend..." -ForegroundColor Yellow
    Set-Location backend
    
    # Installation des dépendances
    Write-Host "📥 Installation des dépendances..." -ForegroundColor Green
    npm install --production
    
    # Vérification du fichier .env
    if (-not (Test-Path .env)) {
        Write-Host "⚠️  Fichier .env non trouvé. Créez-le à partir de .env.example" -ForegroundColor Red
        Write-Host "   Copiez .env.example vers .env et éditez-le avec vos configurations" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    
    # Initialisation de la base de données si nécessaire
    if (-not (Test-Path database\ehk.db)) {
        Write-Host "🗄️  Initialisation de la base de données..." -ForegroundColor Green
        npm run init-db
    }
    
    # Création du dossier logs
    if (-not (Test-Path logs)) {
        New-Item -ItemType Directory -Path logs | Out-Null
    }
    
    # Démarrage avec PM2
    Write-Host "🔄 Démarrage avec PM2..." -ForegroundColor Green
    pm2 delete ehk-api 2>$null
    pm2 start ecosystem.config.js --env production
    pm2 save
    
    Write-Host "✅ Backend déployé avec succès!" -ForegroundColor Green
    Write-Host "   Vérifiez avec: pm2 logs ehk-api" -ForegroundColor Cyan
    Set-Location ..
}

# Fonction pour déployer le frontend admin
function Deploy-Admin {
    Write-Host ""
    Write-Host "🎨 Déploiement du Frontend Admin..." -ForegroundColor Yellow
    Set-Location frontend-admin
    
    # Installation des dépendances
    Write-Host "📥 Installation des dépendances..." -ForegroundColor Green
    npm install
    
    # Vérification du fichier .env.local
    if (-not (Test-Path .env.local)) {
        Write-Host "⚠️  Fichier .env.local non trouvé. Créez-le avec:" -ForegroundColor Red
        Write-Host "   NEXT_PUBLIC_API_URL=https://votre-api.com/api" -ForegroundColor Red
        Write-Host "   Puis relancez le déploiement" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    
    # Build de production
    Write-Host "🔨 Build de production..." -ForegroundColor Green
    npm run build
    
    # Création du dossier logs
    if (-not (Test-Path logs)) {
        New-Item -ItemType Directory -Path logs | Out-Null
    }
    
    # Démarrage avec PM2
    Write-Host "🔄 Démarrage avec PM2..." -ForegroundColor Green
    pm2 delete ehk-admin 2>$null
    pm2 start ecosystem.config.js --env production
    pm2 save
    
    Write-Host "✅ Frontend Admin déployé avec succès!" -ForegroundColor Green
    Write-Host "   Vérifiez avec: pm2 logs ehk-admin" -ForegroundColor Cyan
    Set-Location ..
}

# Déploiement selon la cible
switch ($Target) {
    "backend" {
        Deploy-Backend
    }
    "admin" {
        Deploy-Admin
    }
    "all" {
        Deploy-Backend
        Deploy-Admin
    }
    default {
        Write-Host "❌ Cible invalide: $Target" -ForegroundColor Red
        Write-Host "Usage: .\deploy.ps1 [backend|admin|all]" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "✨ Déploiement terminé!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Statut des applications:" -ForegroundColor Cyan
pm2 list

