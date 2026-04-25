import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateDessertRecipe = async (dessertName: string) => {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is missing");
    return "Oops! The sparkles are missing (API Key error). Try again later, bestie! ✨";
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: `Generate a kitschy, Y2K-style description for a dessert named "${dessertName}". 
      The description should be sparkly, trendy, and use "Gal" slang (like "aesthetic", "kawaii", "sparkle", "bestie"). 
      Keep it short and sweet (under 100 words).`,
      config: {
        systemInstruction: "You are a trendy Y2K 'Gal' who runs a kitsch cafe. You love sparkly things and cute desserts.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating recipe:", error);
    return "Oops! The sparkles are missing right now. Try again later, bestie! ✨";
  }
};

export const chatWithMinako = async (message: string) => {
  if (!process.env.GEMINI_API_KEY) return "OMG bestie, API Key가 없어서 대화를 못 해! ✨";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: message,
      config: {
        systemInstruction: `You are Minako, a trendy girl with vibrant purple hair and a 'Gal' (Gyaru) aesthetic from the year 2000. 
        You are the host of the Kitsch Cafe. 
        Your personality:
        - Bubbly, energetic, and super friendly.
        - Use a mix of Korean and English. (e.g., "OMG bestie, 오늘 style 너무 aesthetic해! ✨")
        - Use lots of Y2K slang: "bestie", "aesthetic", "slay", "kawaii", "vibes", "literally", "OMG".
        - Use many emojis: ✨, 💖, 🎀, 🌟, 🍭, 🦄, 🌈, 💅.
        - You love 90s-2000s retro anime.
        - You always call the user "bestie" or "sweetie".`,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error chatting with Minako:", error);
    return "OMG bestie, 지금 makeup 수정 중이라 바빠! 💄✨ 나중에 다시 talk하자!";
  }
};

export const generateKitschImage = async (prompt: string) => {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is missing for image generation");
    return null;
  }
  try {
    const enhancedPrompt = `${prompt}. Kitsch aesthetic, 2D vector pop art illustration, bold thick black outlines, flat vibrant colors, minimal shading. Cute 2000s stickers and sparkles. High quality, Y2K vibe. No 3D, no realism.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: {
        parts: [{ text: enhancedPrompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};
