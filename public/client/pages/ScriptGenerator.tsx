import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Mic, Play, Pause, RefreshCw, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function ScriptGenerator() {
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("30");
  const [style, setStyle] = useState("engaging");
  const [script, setScript] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const generateScript = async () => {
    if (!topic.trim()) {
      toast({
        title: "Sujet requis",
        description: "Veuillez décrire le sujet de votre script",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, duration, style })
      });

      if (!response.ok) {
        throw new Error('Failed to generate script');
      }

      const data = await response.json();
      setScript(data.script);
      setAudioUrl(null); // Reset audio when new script is generated
      
      toast({
        title: "Script généré !",
        description: "Votre script a été créé avec succès"
      });
    } catch (error) {
      console.error('Script generation error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le script",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateVoice = async () => {
    if (!script.trim()) {
      toast({
        title: "Script requis",
        description: "Veuillez d'abord générer un script",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/generate-voice-only', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script })
      });

      if (!response.ok) {
        throw new Error('Failed to generate voice');
      }

      const data = await response.json();
      setAudioUrl(data.audioUrl);
      
      toast({
        title: "Voix générée !",
        description: "Votre narration audio a été créée avec succès"
      });
    } catch (error) {
      console.error('Voice generation error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la voix",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePlayback = () => {
    if (!audioUrl) return;

    if (isPlaying && audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      if (audioElement) {
        audioElement.play();
      } else {
        const audio = new Audio(audioUrl);
        audio.onended = () => setIsPlaying(false);
        audio.play();
        setAudioElement(audio);
      }
      setIsPlaying(true);
    }
  };

  const downloadScript = () => {
    if (!script) return;
    
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'script.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = 'narration.mp3';
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
              <Link href="/image-generator">
                <Button variant="ghost" className="text-slate-300 hover:text-white">
                  Générateur Image
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

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Générateur Script & Voix
          </h1>
          <p className="text-xl text-slate-300">
            Créez des scripts personnalisés avec narration IA
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Configuration du script</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="topic" className="text-slate-300">
                  Sujet du script
                </Label>
                <Textarea
                  id="topic"
                  placeholder="Exemple: 5 citations inspirantes de Marcus Aurelius..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="mt-2 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration" className="text-slate-300">
                    Durée (secondes)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    min="5"
                    max="30"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="mt-2 bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-slate-300">Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engaging">Engageant</SelectItem>
                      <SelectItem value="educational">Éducatif</SelectItem>
                      <SelectItem value="inspirational">Inspirant</SelectItem>
                      <SelectItem value="professional">Professionnel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={generateScript}
                disabled={loading || !topic.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Générer le script
                  </>
                )}
              </Button>

              {script && (
                <div className="space-y-3">
                  <Button 
                    onClick={generateVoice}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Génération voix...
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 mr-2" />
                        Générer la voix
                      </>
                    )}
                  </Button>

                  <Button 
                    onClick={downloadScript}
                    variant="outline"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger le script
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Result Section */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Script généré</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {script ? (
                <div className="space-y-4">
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {script}
                    </p>
                  </div>

                  {audioUrl && (
                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-slate-300 font-medium">Narration audio</span>
                        <Button
                          onClick={togglePlayback}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <Button
                        onClick={downloadAudio}
                        variant="outline"
                        className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger l'audio
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <FileText className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-center">
                    Votre script apparaîtra ici
                  </p>
                  <p className="text-sm text-center mt-2 opacity-70">
                    Décrivez votre sujet et cliquez sur générer
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Examples Section */}
        <Card className="bg-slate-800/50 border-slate-700 mt-8">
          <CardHeader>
            <CardTitle className="text-white">Exemples de sujets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h4 className="text-slate-300 font-medium mb-2">Philosophie</h4>
                <p className="text-sm text-slate-400">
                  "5 citations inspirantes de Socrate sur la sagesse"
                </p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h4 className="text-slate-300 font-medium mb-2">Science</h4>
                <p className="text-sm text-slate-400">
                  "5 faits fascinants sur l'espace et les galaxies"
                </p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h4 className="text-slate-300 font-medium mb-2">Motivation</h4>
                <p className="text-sm text-slate-400">
                  "Les secrets du succès selon les entrepreneurs"
                </p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h4 className="text-slate-300 font-medium mb-2">Histoire</h4>
                <p className="text-sm text-slate-400">
                  "5 leçons de vie des grands leaders historiques"
                </p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h4 className="text-slate-300 font-medium mb-2">Culture</h4>
                <p className="text-sm text-slate-400">
                  "Traditions japonaises et leur signification moderne"
                </p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h4 className="text-slate-300 font-medium mb-2">Innovation</h4>
                <p className="text-sm text-slate-400">
                  "Technologies qui vont changer notre futur"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}