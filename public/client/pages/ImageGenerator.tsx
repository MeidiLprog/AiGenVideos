import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Download, Image, Sparkles, RefreshCw } from "lucide-react";
import { Link } from "wouter";

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt requis",
        description: "Veuillez décrire l'image que vous souhaitez générer",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      setImageUrl(data.imageUrl);
      
      toast({
        title: "Image générée !",
        description: "Votre image a été créée avec succès"
      });
    } catch (error) {
      console.error('Image generation error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer l'image",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'generated-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/">
                <div className="flex items-center space-x-3 cursor-pointer">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white">VideoAI</span>
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" className="text-slate-300 hover:text-white">
                  Générateur Vidéo
                </Button>
              </Link>
              <Link href="/script-generator">
                <Button variant="ghost" className="text-slate-300 hover:text-white">
                  Générateur Script
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" className="text-slate-300 hover:text-white">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Générateur d'Images IA
          </h1>
          <p className="text-xl text-slate-300">
            Créez des images uniques avec Stable Diffusion XL
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Image className="w-5 h-5" />
                <span>Description de l'image</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="prompt" className="text-slate-300">
                  Décrivez l'image que vous souhaitez générer
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="Exemple: Un paysage japonais avec des cerisiers en fleurs, style traditionnel, lumière dorée..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="mt-2 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  rows={6}
                />
              </div>

              <Button 
                onClick={generateImage}
                disabled={loading || !prompt.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Générer l'image
                  </>
                )}
              </Button>

              <div className="text-sm text-slate-400">
                <p className="font-medium mb-2">Conseils pour de meilleurs résultats :</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Soyez précis dans votre description</li>
                  <li>Mentionnez le style artistique souhaité</li>
                  <li>Indiquez l'éclairage et l'ambiance</li>
                  <li>Ajoutez des détails sur les couleurs</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Result Section */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Image className="w-5 h-5" />
                <span>Image générée</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {imageUrl ? (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src={imageUrl}
                      alt="Generated image"
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
                  </div>
                  <Button
                    onClick={downloadImage}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger l'image
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <Image className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-center">
                    Votre image générée apparaîtra ici
                  </p>
                  <p className="text-sm text-center mt-2 opacity-70">
                    Décrivez l'image souhaitée et cliquez sur générer
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Examples Section */}
        <Card className="bg-slate-800/50 border-slate-700 mt-8">
          <CardHeader>
            <CardTitle className="text-white">Exemples de prompts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-slate-300 font-medium">Philosophie antique</h4>
                <div className="text-sm text-slate-400 bg-slate-700/50 p-3 rounded">
                  "Statue grecque antique de Socrate, marbre blanc, éclairage doré, architecture classique d'Athènes"
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-slate-300 font-medium">Science spatiale</h4>
                <div className="text-sm text-slate-400 bg-slate-700/50 p-3 rounded">
                  "Nébuleuse colorée dans l'espace profond, galaxies lointaines, style photographie NASA"
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-slate-300 font-medium">Art japonais</h4>
                <div className="text-sm text-slate-400 bg-slate-700/50 p-3 rounded">
                  "Jardin zen japonais, cerisiers en fleurs, rivière qui coule, montagnes brumeuses"
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-slate-300 font-medium">Laboratoire moderne</h4>
                <div className="text-sm text-slate-400 bg-slate-700/50 p-3 rounded">
                  "Laboratoire scientifique moderne, équipements de recherche, éclairage bleu, environnement high-tech"
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}