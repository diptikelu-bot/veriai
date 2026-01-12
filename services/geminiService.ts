
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ContentType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER, description: "AI probability (0-100)" },
    verdict: { type: Type.STRING },
    summary: { type: Type.STRING },
    details: {
      type: Type.OBJECT,
      properties: {
        complexity: { type: Type.NUMBER },
        predictability: { type: Type.NUMBER },
        artifactRating: { type: Type.NUMBER },
        consistencyScore: { type: Type.NUMBER },
        structure: { type: Type.STRING },
      },
      required: ["structure"],
    },
    highlights: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING, description: "Visual description or text snippet" },
          reason: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["ai", "human", "mixed"] },
        },
        required: ["text", "reason", "type"],
      },
    },
  },
  required: ["score", "verdict", "summary", "details", "highlights"],
};

export async function verifyContent(
  type: ContentType, 
  content: string, 
  mimeType?: string
): Promise<AnalysisResult> {
  const model = "gemini-3-pro-preview";
  let prompt = "";
  let parts: any[] = [];

  if (type === 'text') {
    prompt = `Act as a forensic linguist. Analyze if this text is AI-generated. Look for low burstiness, repetitive structures, and typical LLM transition markers. 
    Input: ${content}`;
    parts = [{ text: prompt }];
  } else if (type === 'image') {
    prompt = `Act as a digital forensics expert. Analyze this image for AI generation signs:
    - Inconsistent lighting or shadows.
    - Anatomical errors (fingers, eyes).
    - Strange textures in hair or backgrounds.
    - Non-sensical text/signage.
    - Perfect smoothness vs natural camera noise.`;
    parts = [
      { inlineData: { data: content.split(',')[1], mimeType: mimeType || 'image/jpeg' } },
      { text: prompt }
    ];
  } else if (type === 'video') {
    prompt = `Act as a video forensics specialist. Based on this frame/clip, detect signs of AI synthesis (Deepfake, Sora, Kling, etc.):
    - Temporal flickering or "morphing" of objects.
    - Unnatural physics or motion blur.
    - Background consistency issues.
    - Synthetic facial expressions.`;
    parts = [
      { inlineData: { data: content.split(',')[1], mimeType: mimeType || 'image/jpeg' } },
      { text: prompt }
    ];
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA,
    },
  });

  return JSON.parse(response.text || "{}");
}
