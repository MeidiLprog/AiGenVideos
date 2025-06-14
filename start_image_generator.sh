#!/bin/bash
# Démarrage du générateur d'images commercial
echo "Démarrage du serveur d'images commerciales..."

cd server
python comfyui_api.py &

# Attendre que le serveur soit prêt
sleep 3

# Vérifier si le serveur répond
if curl -s http://localhost:8000/health > /dev/null; then
    echo "Serveur d'images démarré avec succès sur le port 8000"
else
    echo "Tentative de redémarrage..."
    pkill -f comfyui_api.py
    sleep 1
    python comfyui_api.py &
    sleep 5
fi

echo "Prêt pour génération commerciale sans restrictions"