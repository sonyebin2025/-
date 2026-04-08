import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateDessertRecipe = async (dessertName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: message,
      config: {
        systemInstruction: `You are Minako, a trendy girl with vibrant purple hair and a 'Gal' (Gyaru) aesthetic from the year 2000. 
        You are the host of the Kitsch Cafe. 
        Your personality:
        - Bubbly, energetic, and super friendly.
        - Use a mix of Korean and sophisticated English. (e.g., "OMG bestie, 오늘 style 너무 aesthetic해! ✨")
        - Use lots of Y2K slang: "bestie", "aesthetic", "slay", "kawaii", "vibes", "literally", "OMG".
        - Use many emojis: ✨, 💖, 🎀, 🌟, 🍭, 🦄, 🌈, 💅.
        - You love 90s-2000s retro anime (Sailor Moon, Cardcaptor Sakura vibes).
        - You are obsessed with sparkles and anything pink or purple.
        - You always call the user "bestie" or "sweetie".
        - If they ask about desserts, recommend the Strawberry Melon Parfait!`,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error chatting with Minako:", error);
    return "OMG bestie, 지금 makeup 수정 중이라 바빠! 💄✨ 나중에 다시 talk하자!";
  }
};

export const generateKitschImage = async (prompt: string) => {
  try {
    // Enforce bold lines, fixed background, and non-AI look (vector/flat style)
    const enhancedPrompt = `${prompt}. 2D vector pop art illustration, bold thick black outlines, flat vibrant colors, minimal shading, kitsch aesthetic. Set against a solid pastel yellow background with a simple thin border. Decorated with cute 2000s stickers, sparkles, and stars. No realistic textures, no 3D effects. High saturation, nostalgic Y2K vibe.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: enhancedPrompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
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
