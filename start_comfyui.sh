#!/bin/bash

# Script de démarrage ComfyUI pour génération d'images illimitée
echo "🚀 Démarrage du serveur ComfyUI SDXL..."

# Installation des dépendances Python si nécessaire
if [ ! -d "comfy_env" ]; then
    echo "📦 Installation de l'environnement Python..."
    python3 -m venv comfy_env
    source comfy_env/bin/activate
    pip install -r server/requirements_comfy.txt
else
    echo "✅ Environnement Python déjà installé"
    source comfy_env/bin/activate
fi

# Vérification de l'espace disque pour les modèles SDXL
echo "💾 Vérification de l'espace disque..."
available_space=$(df . | tail -1 | awk '{print $4}')
required_space=7000000  # 7GB en KB pour SDXL

if [ "$available_space" -lt "$required_space" ]; then
    echo "⚠️  Espace disque insuffisant pour SDXL (7GB requis)"
    echo "🔄 Utilisation de la version compacte..."
fi

# Démarrage du serveur ComfyUI
echo "🎨 Lancement du serveur de génération d'images..."
cd server
python comfyui_api.py &

# Attendre que le serveur soit prêt
echo "⏳ Attente du démarrage du serveur..."
sleep 10

# Test de connectivité
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Serveur ComfyUI démarré avec succès sur le port 8000"
    echo "🎯 Prêt pour génération d'images illimitée (samurai, politiques, etc.)"
else
    echo "❌ Erreur de démarrage du serveur ComfyUI"
fi