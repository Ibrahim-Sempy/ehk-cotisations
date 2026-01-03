#!/bin/bash

# Script de déploiement pour Les Étoiles de Horè-Koubi
# Usage: ./deploy.sh [backend|admin|all]

set -e

DEPLOY_TARGET=${1:-all}

echo "🚀 Déploiement de Les Étoiles de Horè-Koubi"
echo "============================================"

# Fonction pour déployer le backend
deploy_backend() {
    echo ""
    echo "📦 Déploiement du Backend..."
    cd backend
    
    # Installation des dépendances
    echo "📥 Installation des dépendances..."
    npm install --production
    
    # Vérification du fichier .env
    if [ ! -f .env ]; then
        echo "⚠️  Fichier .env non trouvé. Créez-le à partir de .env.example"
        echo "   cp .env.example .env"
        echo "   Puis éditez .env avec vos configurations"
        exit 1
    fi
    
    # Initialisation de la base de données si nécessaire
    if [ ! -f database/ehk.db ]; then
        echo "🗄️  Initialisation de la base de données..."
        npm run init-db
    fi
    
    # Création du dossier logs
    mkdir -p logs
    
    # Démarrage avec PM2
    echo "🔄 Démarrage avec PM2..."
    pm2 delete ehk-api 2>/dev/null || true
    pm2 start ecosystem.config.js --env production
    pm2 save
    
    echo "✅ Backend déployé avec succès!"
    echo "   Vérifiez avec: pm2 logs ehk-api"
    cd ..
}

# Fonction pour déployer le frontend admin
deploy_admin() {
    echo ""
    echo "🎨 Déploiement du Frontend Admin..."
    cd frontend-admin
    
    # Installation des dépendances
    echo "📥 Installation des dépendances..."
    npm install
    
    # Vérification du fichier .env.local
    if [ ! -f .env.local ]; then
        echo "⚠️  Fichier .env.local non trouvé. Créez-le avec:"
        echo "   NEXT_PUBLIC_API_URL=https://votre-api.com/api"
        echo "   Puis relancez le déploiement"
        exit 1
    fi
    
    # Build de production
    echo "🔨 Build de production..."
    npm run build
    
    # Création du dossier logs
    mkdir -p logs
    
    # Démarrage avec PM2
    echo "🔄 Démarrage avec PM2..."
    pm2 delete ehk-admin 2>/dev/null || true
    pm2 start ecosystem.config.js --env production
    pm2 save
    
    echo "✅ Frontend Admin déployé avec succès!"
    echo "   Vérifiez avec: pm2 logs ehk-admin"
    cd ..
}

# Déploiement selon la cible
case $DEPLOY_TARGET in
    backend)
        deploy_backend
        ;;
    admin)
        deploy_admin
        ;;
    all)
        deploy_backend
        deploy_admin
        ;;
    *)
        echo "❌ Cible invalide: $DEPLOY_TARGET"
        echo "Usage: ./deploy.sh [backend|admin|all]"
        exit 1
        ;;
esac

echo ""
echo "✨ Déploiement terminé!"
echo ""
echo "📊 Statut des applications:"
pm2 list

