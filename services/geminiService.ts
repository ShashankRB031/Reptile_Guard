
import { GoogleGenAI, Type } from "@google/genai";
import { ReptileData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const identifyReptile = async (
  imageBase64s: string[]
): Promise<ReptileData> => {
  try {
    const prompt = `Identify this reptile shown in the provided images. 
    There may be multiple images of the same individual from different angles.
    Provide the details in the following JSON format.
    Ensure all text fields (name, description, precautions, habitat) are in English.
    For scientificName, provide the standard Latin binomial name.
    
    The 'habitat' field should describe the typical environment where this specific reptile is found.
    `;

    const imageParts = imageBase64s.map(base64 => ({
      inlineData: { mimeType: "image/jpeg", data: base64 }
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          ...imageParts,
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            scientificName: { type: Type.STRING },
            description: { type: Type.STRING },
            isVenomous: { type: Type.BOOLEAN },
            dangerLevel: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
            precautions: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }
            },
            habitat: { type: Type.STRING }
          },
          required: ["name", "scientificName", "description", "isVenomous", "dangerLevel", "precautions", "habitat"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ReptileData;
    } else {
      throw new Error("No identification results received.");
    }
  } catch (error) {
    console.error("Error identifying reptile:", error);
    throw error;
  }
};
