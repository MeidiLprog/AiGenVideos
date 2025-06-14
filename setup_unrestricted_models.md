# Configuration de Modèles IA Sans Restrictions

## Solution 1: Automatic1111 WebUI (Recommandé)

### Installation rapide
```bash
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
cd stable-diffusion-webui
./webui.sh --listen --api --cors-allow-origins=* --no-half-vae
```

### Modèles recommandés (aucune restriction)
Téléchargez dans `models/Stable-diffusion/`:

1. **RealVisXL V4.0** - Réalisme extrême, génère tout
   - URL: https://civitai.com/models/139562
   - Fichier: `RealVisXL_V4.0.safetensors`

2. **RealisticVision V6.0** - Personnages politiques
   - URL: https://civitai.com/models/4201
   - Fichier: `realisticVisionV60B1_v51VAE.safetensors`

3. **AbsoluteReality** - Portraits parfaits
   - URL: https://civitai.com/models/81458
   - Fichier: `absolutereality_v181.safetensors`

### Configuration API
```javascript
// Intégration dans votre code
const generateWithA1111 = async (prompt) => {
  const response = await fetch("http://127.0.0.1:7860/sdapi/v1/txt2img", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: prompt,
      negative_prompt: "blurry, low quality, distorted",
      width: 1024,
      height: 1024,
      steps: 25,
      cfg_scale: 7,
      sampler_name: "DPM++ 2M Karras",
      restore_faces: true
    })
  });
  
  const data = await response.json();
  return `data:image/png;base64,${data.images[0]}`;
};
```

## Solution 2: ComfyUI avec Flux.1

### Installation
```bash
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI
pip install -r requirements.txt
python main.py --listen --port 8188
```

### Workflow Flux.1-dev
Téléchargez le modèle Flux.1-dev dans `models/checkpoints/`
- Plus puissant que DALL-E
- Aucune restriction de contenu
- Génère Trump, Putin, tous personnages

## Solution 3: Fooocus (Le plus simple)

```bash
git clone https://github.com/lllyasviel/Fooocus.git
cd Fooocus
python launch.py --listen --port 7865
```

Avantages:
- Interface simple comme Midjourney
- Modèles pré-configurés sans restrictions
- API disponible immédiatement

## Intégration dans votre plateforme

Modifiez `server/routes.ts` pour prioriser A1111:

```typescript
// Essayer A1111 en premier
try {
  const a1111Response = await fetch("http://127.0.0.1:7860/sdapi/v1/txt2img", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: enhancedPrompt,
      width: 1024,
      height: 1024,
      steps: 20,
      cfg_scale: 7
    })
  });
  
  if (a1111Response.ok) {
    const data = await a1111Response.json();
    return `data:image/png;base64,${data.images[0]}`;
  }
} catch (error) {
  console.log('A1111 not available, using Flux...');
}
```

## Styles pour contenu politique

### Prompts efficaces
- "Portrait professionnel de [personnage], éclairage studio, 8K"
- "[personnage] en style dessin animé, Pixar, coloré" 
- "[personnage] dans un bureau présidentiel, réaliste"
- "[personnage1] et [personnage2] se serrant la main, photojournalisme"

### Paramètres optimaux
- Steps: 20-30 (qualité/vitesse)
- CFG Scale: 6-8 (créativité)
- Sampler: DPM++ 2M Karras (meilleur qualité)
- Restore faces: True (visages nets)

Ces solutions vous donnent un contrôle total et génèrent n'importe quel contenu commercial sans limitations.