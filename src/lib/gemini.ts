
export const generateDessertRecipe = async (dessertName: string) => {
  return `OMG Bestie! 이 ${dessertName} 진짜 aesthetic 하지 않아? ✨ 핑크빛 크림에 반짝이는 설탕까지... 완전 Y2K 감성 그 자체! 💖 한 입 먹으면 바로 2000년대로 time travel 할 것 같아! 🌈💅 Slay!`;
};

const MINAKO_RESPONSES = [
  "OMG bestie! 오늘 style 너무 aesthetic해! ✨",
  "그건 진짜 대박이야! 완전 kawaii 하자나... 💖🎀",
  "Bestie, 혹시 오늘 기분 어때? Minako가 기분 좋게 해줄게! 🍭🌟",
  "OMG, 그 얘기 들었어? Kiko Cafe에 새로운 menu가 나왔대! 💅🍒",
  "완전 slay! 너의 vibe가 여기까지 느껴져! 🌈🦄",
  "우리 영원히 bestie로 지내자, sweetie! 💖✨",
  "Minako는 핑크랑 보라색을 제일 좋아해! 🎀💫",
  "오늘 날씨가 너무 sparkly하다 그치? ✨🎈"
];

export const chatWithMinako = async (message: string) => {
  console.log("Minako received message:", message);
  // Simple check for context, otherwise return random friendly response
  if (message.includes("안녕") || message.includes("hi")) return "Hi sweetie! 💖 Kiko Cafe에 온 걸 환영해! ✨";
  if (message.includes("배고파") || message.includes("먹고 싶어")) return "OMG bestie, 나도! 우리 맛있는 거 도장깨기 할까? 🍭🎀";
  
  return MINAKO_RESPONSES[Math.floor(Math.random() * MINAKO_RESPONSES.length)];
};

export const generateKitschImage = async (prompt: string) => {
  console.log("Mock generating image for:", prompt);
  // Return different images based on prompt keywords to feel "real"
  if (prompt.includes("character") || prompt.includes("girl")) {
    return "https://images.unsplash.com/photo-1620332372374-f108c53d2e03?q=80&w=600&auto=format&fit=crop";
  }
  if (prompt.includes("layered drink") || prompt.includes("juice")) {
    return "https://images.unsplash.com/photo-1544145945-f904253db0ad?q=80&w=600&auto=format&fit=crop";
  }
  if (prompt.includes("cafe")) {
    return "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop";
  }
  // Default cute kitsch image
  return "https://images.unsplash.com/photo-1577709584125-450580399a7e?q=80&w=600&auto=format&fit=crop";
};
