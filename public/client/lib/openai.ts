import { apiRequest } from "./queryClient";

export interface ScriptGenerationRequest {
  topic: string;
  duration?: string;
  style?: string;
}

export interface ScriptGenerationResponse {
  script: string;
}

export const generateScript = async (request: ScriptGenerationRequest): Promise<ScriptGenerationResponse> => {
  const response = await apiRequest("POST", "/api/generate-script", request);
  return response.json();
};

export const generateVoice = async (script: string, videoId: number) => {
  const response = await apiRequest("POST", "/api/generate-voice", {
    script,
    videoId
  });
  return response.json();
};

export const generateVideo = async (videoId: number, userId: number) => {
  const response = await apiRequest("POST", "/api/generate-video", {
    videoId,
    userId
  });
  return response.json();
};
