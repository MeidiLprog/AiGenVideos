#!/bin/bash
# Installation Automatic1111 WebUI avec modèles spécialisés
echo "Installation d'Automatic1111 WebUI pour génération sans restrictions..."

# Cloner le repository
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
cd stable-diffusion-webui

# Installer les dépendances
./webui.sh --listen --api --cors-allow-origins=* --no-half-vae --xformers &

echo "WebUI sera disponible sur http://localhost:7860"
echo "API disponible sur http://localhost:7860/sdapi/v1/"

# Modèles recommandés à télécharger :
echo "Téléchargez ces modèles dans models/Stable-diffusion/ :"
echo "1. RealVisXL V4.0 (réalisme extrême) : https://civitai.com/models/139562"
echo "2. SDXL Base 1.0 : https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0"
echo "3. RealisticVision V6.0 : https://civitai.com/models/4201"

echo "Installation terminée. Lancez ./webui.sh pour démarrer."