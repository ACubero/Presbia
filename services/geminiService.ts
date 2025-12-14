import { GoogleGenAI } from "@google/genai";

// Using Gemini 2.5 Flash as it is highly performant for multimodal tasks
const MODEL_NAME = 'gemini-2.5-flash';

export const extractTextFromImage = async (base64Image: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Falta la clave API. Por favor verifica tu configuración.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    // Clean base64 string if it contains metadata prefix
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: "Extrae todo el texto legible de esta imagen. Devuelve solo el texto plano, preservando los saltos de línea. No añadas formato markdown ni explicaciones."
          }
        ]
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No se encontró texto en la respuesta.");
    }
    return text;

  } catch (error: any) {
    console.error("Gemini Vision Error:", error);
    // Return the actual error message from the API to help with debugging
    const message = error instanceof Error ? error.message : "Error desconocido";
    throw new Error(`Error de Gemini API: ${message}`);
  }
};