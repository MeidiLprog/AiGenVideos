import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { generateScript, generateVoice, generateVideo } from "@/lib/openai";
import type { Video } from "@shared/schema";
import { RefreshCw, Sparkles, Mic, Video as VideoIcon, CheckCircle, Download, Image, FileText } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const [scenario, setScenario] = useState("");
  const [voiceType, setVoiceType] = useState("female");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [step, setStep] = useState<"input" | "generating" | "completed">("input");
  const { toast } = useToast();

  const demoUser = { id: 1, name: "Demo User", email: "demo@test.com", credits: 10 };

  const handleGenerateVideo = async () => {
    if (!scenario.trim()) {
      toast({
        title: "Scénario requis",
        description: "Veuillez décrire votre idée de vidéo",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setStep("generating");
    setProgress(0);

    try {
      setProgress(20);
      const scriptResult = await generateScript({
        topic: scenario,
        duration: "20-30",
        style: "engaging"
      });

      setProgress(40);
      const videoResponse = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: demoUser.id,
          topic: scenario,
          script: scriptResult.script
        })
      });

      if (!videoResponse.ok) {
        throw new Error('Failed to create video');
      }

      const videoResult = await videoResponse.json() as { video: Video };
      setCurrentVideo(videoResult.video);

      setProgress(60);
      await generateVoice(scriptResult.script, videoResult.video.id);

      setProgress(80);
      await generateVideo(videoResult.video.id, demoUser.id);

      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/videos/${videoResult.video.id}/status`);
          const statusData = await statusResponse.json();
          
          if (statusData.status === "completed" && statusData.videoUrl) {
            clearInterval(pollInterval);
            setProgress(100);
            setStep("completed");
            setCurrentVideo(prev => prev ? { ...prev, videoUrl: statusData.videoUrl, status: "completed" } : null);
            toast({
              title: "Vidéo prête !",
              description: "Votre vidéo a été générée avec succès",
            });
            setLoading(false);
          } else if (statusData.status === "failed") {
            clearInterval(pollInterval);
            throw new Error("Generation failed");
          } else {
            setProgress(prev => Math.min(prev + 2, 95));
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 3000);

      setTimeout(() => {
        clearInterval(pollInterval);
        if (loading) {
          setLoading(false);
          setStep("input");
          toast({
            title: "Timeout",
            description: "La génération prend plus de temps que prévu",
            variant: "destructive"
          });
        }
      }, 300000);

    } catch (error) {
      setLoading(false);
      setStep("input");
      toast({
        title: "Erreur",
        description: "Impossible de générer la vidéo",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setStep("input");
    setScenario("");
    setProgress(0);
    setCurrentVideo(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Navigation Header */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">VideoAI</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/image-generator">
                <Button variant="ghost" className="text-slate-300 hover:text-white flex items-center space-x-2">
                  <Image className="w-4 h-4" />
                  <span>Générateur Image</span>
                </Button>
              </Link>
              <Link href="/script-generator">
                <Button variant="ghost" className="text-slate-300 hover:text-white flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Générateur Script</span>
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
          <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">
            ✨ IA Générateur de Vidéos
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Créez des Vidéos Virales
            <span className="block bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              en Quelques Clics
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Décrivez votre idée, choisissez une voix, et notre IA crée automatiquement 
            votre vidéo avec images, animations et sous-titres.
          </p>
          
          {/* Quick Access Tools */}
          <div className="flex justify-center space-x-4 mt-8 mb-8">
            <Link href="/image-generator">
              <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                <Image className="w-4 h-4 mr-2" />
                Générer Images
              </Button>
            </Link>
            <Link href="/script-generator">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <FileText className="w-4 h-4 mr-2" />
                Script & Voix
              </Button>
            </Link>
          </div>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-8">
            {step === "input" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Décrivez votre vidéo
                  </label>
                  <Textarea
                    placeholder="Ex: 5 astuces pour être plus productif au travail, comment préparer un café parfait, les bienfaits de la méditation..."
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    className="min-h-[120px] bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Type de voix
                  </label>
                  <Select value={voiceType} onValueChange={setVoiceType}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="female">Voix féminine (claire et engageante)</SelectItem>
                      <SelectItem value="male">Voix masculine (profonde et assurée)</SelectItem>
                      <SelectItem value="neutral">Voix neutre (polyvalente)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleGenerateVideo}
                  disabled={loading || !scenario.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-6 text-lg"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Créer ma vidéo
                    </>
                  )}
                </Button>
              </div>
            )}

            {step === "generating" && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-white animate-spin" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-2">Création en cours...</h3>
                  <p className="text-slate-300 mb-6">Notre IA génère votre vidéo avec images et animations</p>
                  
                  <Progress value={progress} className="w-full mb-6" />
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex flex-col items-center text-green-400">
                      <CheckCircle className="w-6 h-6 mb-2" />
                      <span>Script créé</span>
                    </div>
                    <div className="flex flex-col items-center text-green-400">
                      <Mic className="w-6 h-6 mb-2" />
                      <span>Voix générée</span>
                    </div>
                    <div className="flex flex-col items-center text-blue-400">
                      <RefreshCw className="w-6 h-6 mb-2 animate-spin" />
                      <span>Images IA</span>
                    </div>
                    <div className="flex flex-col items-center text-slate-400">
                      <VideoIcon className="w-6 h-6 mb-2" />
                      <span>Assemblage</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === "completed" && currentVideo && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mx-auto flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-2">Vidéo prête ! 🎉</h3>
                  <p className="text-slate-300 mb-6">Votre vidéo a été créée avec succès</p>
                </div>

                {currentVideo.videoUrl && (
                  <div className="bg-black rounded-xl mb-6 relative aspect-[9/16] max-w-sm mx-auto overflow-hidden">
                    <video 
                      controls 
                      className="w-full h-full object-cover"
                    >
                      <source src={currentVideo.videoUrl} type="video/mp4" />
                      Votre navigateur ne supporte pas la lecture vidéo.
                    </video>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {currentVideo.videoUrl && (
                    <Button 
                      asChild
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                    >
                      <a href={currentVideo.videoUrl} download={`video_${currentVideo.id}.mp4`}>
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger
                      </a>
                    </Button>
                  )}
                  
                  <Button 
                    onClick={resetForm}
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Créer une nouvelle vidéo
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}