import { GoogleGenAI } from "@google/genai";
import { DesignStyle, ChatLink } from "../types";

/**
 * Using Gemini 2.5 Flash for rapid, reliable interior design generation.
 * This model uses the standard process.env.API_KEY without requiring a mandatory 
 * key selection dialog, resolving the 403 Permission Denied issues.
 */
const MODEL_IMAGE = 'gemini-2.5-flash-image';
const MODEL_CHAT = 'gemini-3-flash-preview';

const cleanBase64 = (base64: string): string => {
  if (typeof base64 !== 'string') return '';
  if (base64.includes(',')) {
    return base64.split(',')[1];
  }
  return base64;
};

// Reimagines the design of a room based on a chosen style
export const generateReimaginedDesign = async (
  originalImageBase64: string,
  style: DesignStyle
): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `You are an elite interior designer. Redesign this room in a beautiful ${style} style. 
  Keep the basic room structure (windows, doors, walls) but completely update the furniture, flooring, decor, and lighting. 
  The final result must be a single, photorealistic, and highly aesthetic interior design image.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE,
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64(originalImageBase64),
              mimeType: 'image/png'
            }
          },
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (error: any) {
    console.error("Design Generation Error:", error);
    throw error;
  }
  return null;
};

// Edits an existing design based on natural language instructions
export const editDesign = async (
  currentImageBase64: string,
  instruction: string
): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE,
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64(currentImageBase64),
              mimeType: 'image/png'
            }
          },
          { text: `Modify this room design according to the following instruction: "${instruction}". Keep the quality and style consistent with the original image.` }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (error: any) {
    console.error("Design Edit Error:", error);
    throw error;
  }
  return null;
};

// Provides professional design advice using Google Search for grounding
export const getDesignAdvice = async (
  userPrompt: string,
  imageBase64?: string
): Promise<{ text: string; links?: ChatLink[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const parts: any[] = [{ text: userPrompt }];
    if (imageBase64) {
      parts.push({
        inlineData: {
          data: cleanBase64(imageBase64),
          mimeType: 'image/png'
        }
      });
    }

    const response = await ai.models.generateContent({
      model: MODEL_CHAT,
      contents: { parts },
      config: {
        systemInstruction: "You are Lumina, an AI Interior Design Consultant. Provide professional, inspiring advice on interior decor, spatial layout, and color palettes. Use Google Search to find specific, real products that the user can buy to achieve the look.",
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "I'm looking into your design request...";
    const links: ChatLink[] = [];
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          links.push({
            uri: chunk.web.uri,
            title: chunk.web.title
          });
        }
      });
    }

    return { text, links };
  } catch (error: any) {
    throw error;
  }
};