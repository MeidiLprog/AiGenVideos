import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { generateScript, generateVoice, generateVideo } from "@/lib/openai";
import { apiRequest } from "@/lib/queryClient";
import type { User, Video } from "@shared/schema";
import { RefreshCw, Play, Pause, Download, Share2, Plus, Edit3, Mic, Video as VideoIcon, Sparkles, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";

interface VideoCreatorProps {
  user: User;
  onUserUpdate: (user: User) => void;
}

export default function VideoCreator({ user, onUserUpdate }: VideoCreatorProps) {
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("15-20");
  const [style, setStyle] = useState("tips");
  const [format, setFormat] = useState("9:16");
  const [visualStyle, setVisualStyle] = useState("modern");
  const [script, setScript] = useState("");
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  const handleGenerateScript = async () => {
    if (!topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic for your video",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await generateScript({ topic, duration, style });
      setScript(result.script);
      setStep(2);
      
      // Create video record
      const videoResponse = await apiRequest("POST", "/api/videos", {
        userId: user.id,
        topic,
        script: result.script,
        duration: duration === "15-20" ? 20 : duration === "20-30" ? 30 : 15
      });
      const videoData = await videoResponse.json();
      setCurrentVideo(videoData.video);
      
      toast({
        title: "Script generated!",
        description: "Your script has been created successfully",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le script. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVoice = async () => {
    if (!currentVideo) return;
    
    setLoading(true);
    try {
      await generateVoice(script, currentVideo.id);
      setStep(3);
      toast({
        title: "Voix-off générée !",
        description: "L'audio de votre vidéo est prêt",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer la voix-off",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!currentVideo || user.credits <= 0) {
      toast({
        title: "Insufficient credits",
        description: "You don't have enough credits available",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setStep(4);
    setProgress(0);

    try {
      // Start video generation
      const result = await generateVideo(currentVideo.id, user.id);
      
      if (result.remainingCredits !== undefined) {
        onUserUpdate({ ...user, credits: result.remainingCredits });
      }

      // Poll for video status
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/videos/${currentVideo.id}/status`);
          const statusData = await statusResponse.json();
          
          if (statusData.status === "completed" && statusData.videoUrl) {
            clearInterval(pollInterval);
            setProgress(100);
            setStep(5);
            // Update video data
            setCurrentVideo(prev => prev ? { ...prev, videoUrl: statusData.videoUrl, status: "completed" } : null);
            toast({
              title: "Video ready!",
              description: "Your video has been generated successfully",
            });
            setLoading(false);
          } else if (statusData.status === "failed") {
            clearInterval(pollInterval);
            toast({
              title: "Generation failed",
              description: "Video generation encountered an error",
              variant: "destructive"
            });
            setStep(3);
            setLoading(false);
          } else {
            // Update progress based on status
            if (statusData.status === "generating") {
              setProgress(prev => Math.min(prev + 5, 95));
            }
          }
        } catch (error) {
          console.error("Status polling error:", error);
        }
      }, 2000);

      // Safety timeout
      setTimeout(() => {
        clearInterval(pollInterval);
        if (loading) {
          setLoading(false);
          setStep(3);
          toast({
            title: "Generation timeout",
            description: "Video generation is taking longer than expected",
            variant: "destructive"
          });
        }
      }, 300000); // 5 minutes timeout
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start video generation",
        variant: "destructive"
      });
      setStep(3);
      setLoading(false);
    }
  };

  const resetWorkflow = () => {
    setStep(1);
    setTopic("");
    setScript("");
    setCurrentVideo(null);
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Topic Input */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">1</span>
            </div>
            <CardTitle className="text-white">Your video topic</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Describe your video idea
            </label>
            <Textarea
              placeholder="Ex: Give me 3 tips to be more productive at work..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="min-h-[120px] bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>
          
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Duration</label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="5-15">5-15 seconds</SelectItem>
                  <SelectItem value="15-20">15-20 seconds</SelectItem>
                  <SelectItem value="20-30">20-30 seconds</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Content Style</label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="tips">Practical tips</SelectItem>
                  <SelectItem value="motivation">Motivation</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Format</label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="9:16">Vertical (9:16)</SelectItem>
                  <SelectItem value="16:9">Horizontal (16:9)</SelectItem>
                  <SelectItem value="1:1">Square (1:1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Visual Style</label>
            <Select value={visualStyle} onValueChange={setVisualStyle}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="modern">Modern & Clean</SelectItem>
                <SelectItem value="gradient">Gradient Background</SelectItem>
                <SelectItem value="cinematic">Cinematic Style</SelectItem>
                <SelectItem value="minimalist">Minimalist</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleGenerateScript}
            disabled={loading || !topic.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate script with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Step 2: Generated Script */}
      {step >= 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-hsl(10, 81%, 59%) text-white rounded-full flex items-center justify-center">
                  <span className="text-sm">✓</span>
                </div>
                <CardTitle>Script généré</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleGenerateScript}
                disabled={loading}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Régénérer
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <div className="text-hsl(207, 90%, 54%) mt-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-800 leading-relaxed">{script}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={handleGenerateVoice}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-hsl(291, 84%, 61%) to-hsl(328, 74%, 60%) text-white"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Générer la voix-off
                  </>
                )}
              </Button>
              <Button variant="outline" className="px-6">
                <Edit3 className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Voice Preview & Settings */}
      {step >= 3 && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-hsl(249, 84%, 68%) text-white rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">3</span>
              </div>
              <CardTitle>Prévisualisation et génération</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Audio Player */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
              <div className="flex items-center space-x-4">
                <Button
                  size="icon"
                  className="w-12 h-12 bg-gradient-to-r from-hsl(291, 84%, 61%) to-hsl(328, 74%, 60%) text-white rounded-full"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Voix-off générée</span>
                    <span className="text-sm text-gray-500">0:18</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2">
                    <div className="bg-gradient-to-r from-hsl(291, 84%, 61%) to-hsl(328, 74%, 60%) h-2 rounded-full transition-all duration-300" style={{ width: "0%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Settings */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Style visuel</label>
                <Select defaultValue="gradient">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gradient">Fond dégradé moderne</SelectItem>
                    <SelectItem value="solid">Fond uni coloré</SelectItem>
                    <SelectItem value="stock">Image de stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                <Select defaultValue="9:16">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9:16">9:16 (Vertical - TikTok/Reels)</SelectItem>
                    <SelectItem value="16:9">16:9 (Horizontal - YouTube)</SelectItem>
                    <SelectItem value="1:1">1:1 (Carré - Instagram)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Generate Video */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Prêt à générer votre vidéo ?</h3>
                  <p className="text-gray-600 text-sm">Cela utilisera 1 crédit de votre compte</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-hsl(10, 81%, 59%)">1</p>
                  <p className="text-xs text-gray-500">crédit</p>
                </div>
              </div>
              <Button 
                onClick={handleGenerateVideo}
                disabled={user.credits <= 0 || loading}
                className="w-full bg-gradient-to-r from-hsl(10, 81%, 59%) to-hsl(166, 76%, 37%) text-white"
              >
                <VideoIcon className="w-4 h-4 mr-2" />
                Générer ma vidéo (1 crédit)
              </Button>
              {user.credits <= 0 && (
                <p className="text-red-600 text-sm mt-2">Plus de crédits disponibles</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Advanced Generation Progress */}
      {step === 4 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-white animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Video Generation in Progress</h3>
              <p className="text-slate-300 mb-6">Creating your professional video with AI images and animations</p>
              
              <Progress value={progress} className="w-full mb-6" />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex flex-col items-center text-green-400">
                  <span className="w-6 h-6 mb-2 text-lg">✓</span>
                  <span>Script parsed</span>
                </div>
                <div className="flex flex-col items-center text-green-400">
                  <span className="w-6 h-6 mb-2 text-lg">✓</span>
                  <span>Voice generated</span>
                </div>
                <div className="flex flex-col items-center text-blue-400">
                  <RefreshCw className="w-6 h-6 mb-2 animate-spin" />
                  <span>AI images</span>
                </div>
                <div className="flex flex-col items-center text-slate-400">
                  <RefreshCw className="w-6 h-6 mb-2" />
                  <span>Video assembly</span>
                </div>
              </div>

              <div className="mt-6 text-xs text-slate-400 space-y-1">
                <p>• Generating unique AI images for each segment</p>
                <p>• Applying zoom and pan animations</p>
                <p>• Synchronizing audio with animated subtitles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Video Ready with Player */}
      {step === 5 && currentVideo && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">Video Ready!</h3>
              <p className="text-slate-300">Your AI-generated video with images and animations</p>
            </div>

            {/* Video Player */}
            {currentVideo.videoUrl ? (
              <div className="bg-black rounded-xl mb-6 relative aspect-[9/16] max-w-sm mx-auto overflow-hidden">
                <video 
                  controls 
                  className="w-full h-full object-cover"
                  poster="/api/placeholder/360/640"
                >
                  <source src={currentVideo.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div className="bg-gray-900 rounded-xl mb-6 relative aspect-[9/16] max-w-sm mx-auto">
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-white animate-spin" />
                </div>
              </div>
            )}

            {/* Video Info */}
            <div className="bg-slate-700 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Topic:</span>
                  <p className="text-white font-medium">{topic}</p>
                </div>
                <div>
                  <span className="text-slate-400">Format:</span>
                  <p className="text-white font-medium">{format}</p>
                </div>
                <div>
                  <span className="text-slate-400">Style:</span>
                  <p className="text-white font-medium">{visualStyle}</p>
                </div>
                <div>
                  <span className="text-slate-400">Duration:</span>
                  <p className="text-white font-medium">~30 seconds</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {currentVideo.videoUrl && (
                <Button 
                  asChild
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                >
                  <a href={currentVideo.videoUrl} download={`video_${currentVideo.id}.mp4`}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Video
                  </a>
                </Button>
              )}
              <Button 
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                onClick={() => {
                  if (currentVideo.videoUrl) {
                    navigator.share?.({
                      title: `AI Video: ${topic}`,
                      url: currentVideo.videoUrl
                    });
                  }
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button 
                variant="outline" 
                onClick={resetWorkflow}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Video
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
