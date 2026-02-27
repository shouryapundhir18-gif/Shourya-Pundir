import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface OutfitSuggestion {
  title: string;
  description: string;
  items: {
    category: string;
    name: string;
    reason: string;
  }[];
  styleTips: string[];
}

export async function getOutfitSuggestions(occasion: string, weather?: string): Promise<OutfitSuggestion> {
  const prompt = `Act as a professional fashion stylist. Generate a complete outfit recommendation for the following:
  Occasion: ${occasion}
  ${weather ? `Weather: ${weather}` : ""}

  Provide a cohesive look including top, bottom, shoes, and accessories. 
  Explain why each item works for this specific occasion and weather.
  Include 3 specific style tips.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                name: { type: Type.STRING },
                reason: { type: Type.STRING },
              },
              required: ["category", "name", "reason"],
            },
          },
          styleTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["title", "description", "items", "styleTips"],
      },
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("Failed to generate suggestions. Please try again.");
  }
}

export async function generateOutfitImage(suggestion: OutfitSuggestion): Promise<string> {
  const itemsList = suggestion.items.map(i => `${i.category}: ${i.name}`).join(", ");
  const prompt = `A high-quality, professional fashion photography shot of a complete outfit. 
  Items: ${itemsList}. 
  Style: ${suggestion.description}. 
  The setting should be elegant and appropriate for the outfit's purpose. 
  Editorial style, clean composition, soft studio lighting.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "3:4",
      },
    },
  });

  const candidate = response.candidates?.[0];
  if (candidate?.content?.parts) {
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  throw new Error("No image generated");
}
