/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Coffee, User, Menu as MenuIcon, Heart, Star, Send, ArrowLeft, FlaskConical, Plus, Trash2, Check } from 'lucide-react';
// import { generateKitschImage, chatWithMinako } from './lib/gemini';
import { CafeState, Dessert, Character, FeedItem, ShopItem } from './types';

const SHOP_ITEMS: ShopItem[] = [
  { id: 's1', name: 'Strawberry', price: 100, icon: '🍓', type: 'ingredient' },
  { id: 's2', name: 'Peach', price: 150, icon: '🍑', type: 'ingredient' },
  { id: 's3', name: 'Cherry', price: 120, icon: '🍒', type: 'ingredient' },
  { id: 's4', name: 'Blueberry', price: 110, icon: '🫐', type: 'ingredient' },
  { id: 'd1', name: 'Stickers', price: 200, icon: '🎀', type: 'decoration' },
  { id: 'd2', name: 'Glitter', price: 500, icon: '✨', type: 'decoration' },
  { id: 'd3', name: 'Rose', price: 800, icon: '🌹', type: 'decoration' },
];

const FLAVOR_COLORS: Record<string, string> = {
  'Strawberry': '#ff4d6d',
  'Blueberry': '#4361ee',
  'Peach': '#ffb4a2',
  'Cherry': '#c9184a',
  'Lemon': '#fee440',
  'Melon': '#9ef01a',
  'Mint': '#b7e4c7',
};

const CREAM_OPTIONS = [
  { id: 'white', name: 'White', color: '#ffffff', icon: '🍦' },
  { id: 'strawberry', name: 'Strawberry', color: '#ffc8dd', icon: '🍓🍦' },
  { id: 'grape', name: 'Grape', color: '#cdb4db', icon: '🍇🍦' },
  { id: 'mint', name: 'Mint', color: '#bde0fe', icon: '🌿🍦' },
];

const HeartBurst = () => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [1, 2, 0], opacity: [0, 1, 0] }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-[1000] pointer-events-none flex items-center justify-center opacity-30"
    >
      <Heart size={400} className="text-kitsch-pink fill-kitsch-pink blur-md" />
    </motion.div>
  );
};

export default function App() {
  const [viewTransition, setViewTransition] = useState(false);
  const [state, setState] = useState<CafeState>({
    currentView: 'splash',
    selectedDessert: null,
    menuItems: [],
    feedItems: [],
    gallery: [],
    coins: 5000,
    inventory: {
      'Strawberry': 3,
      'Blueberry': 3,
      'Peach': 3,
      'Cherry': 3,
      'Rose': 2,
      'Lemon': 3,
      'Melon': 3,
      'Mint': 5,
      'Cream': 10,
      'Stickers': 20,
      'Glitter': 5,
    },
    userName: "",
    hasEntered: false,
    level: 1,
    exp: 0,
    affection: 0,
    cafeImage: "https://picsum.photos/seed/cafe/1200/800",
    settings: {
      musicVolume: 50,
      fontSize: 'md',
      sfxEnabled: true,
    },
    quests: [
      { id: '1', title: '오늘 좋아요 10개 받기', goal: 10, current: 0, reward: 1000, isCompleted: false },
      { id: '2', title: '음료 3개 제작하기', goal: 3, current: 0, reward: 500, isCompleted: false },
    ],
  });

  const [particles, setParticles] = useState<{ id: number, x: number, y: number }[]>([]);
  
  const addParticle = (e: React.MouseEvent) => {
    const newParticle = { id: Date.now(), x: e.clientX, y: e.clientY };
    setParticles(prev => [...prev, newParticle]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 500);
  };

  const [character, setCharacter] = useState<Character>({
    name: "Minako",
    role: "Cafe Host & Gal Icon",
    bio: "Living my best life in 2000! ✨ Love sparkles, purple hair, and the cutest desserts in town. Besties welcome! 💖",
    imageUrl: "https://picsum.photos/seed/minako/800/800", // Fallback
  });

  const [cafeImage, setCafeImage] = useState<string>("https://picsum.photos/seed/cafe/1200/800");
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'minako', text: string }[]>([]);

  // Drink Lab Step State
  const [labStep, setLabStep] = useState<'flavor' | 'cream' | 'deco' | 'finish'>('flavor');
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [selectedCream, setSelectedCream] = useState<string | null>(null);
  const [decorations, setDecorations] = useState<{ id: string, type: string, x: number, y: number }[]>([]);
  const [newDrinkName, setNewDrinkName] = useState("");
  const [newDrinkPrice, setNewDrinkPrice] = useState("3500");
  const [mixedDrink, setMixedDrink] = useState<string | null>(null);
  const [isMixing, setIsMixing] = useState(false);
  const [ingredients, setIngredients] = useState<string[]>([]);

  // Garden State
  const [gardenSlots, setGardenSlots] = useState<{ name: string, plantedAt: number | null, growthTime: number }[]>([
    { name: 'Strawberry', plantedAt: null, growthTime: 60 },
    { name: 'Blueberry', plantedAt: null, growthTime: 120 },
    { name: 'Peach', plantedAt: null, growthTime: 300 },
    { name: 'Cherry', plantedAt: null, growthTime: 180 },
    { name: 'Rose', plantedAt: null, growthTime: 28800 }, // 8 hours
    { name: 'Lemon', plantedAt: null, growthTime: 240 },
    { name: 'Melon', plantedAt: null, growthTime: 600 },
    { name: 'Mint', plantedAt: null, growthTime: 90 },
  ]);

  const [selectedDeco, setSelectedDeco] = useState<string | null>(null);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [guestbook, setGuestbook] = useState<{ id: number, text: string, user: string }[]>([]);
  const [newPostIt, setNewPostIt] = useState("");
  const [isUnboxing, setIsUnboxing] = useState(false);
  const [showSNSPopup, setShowSNSPopup] = useState(false);
  const [selectedFeedBg, setSelectedFeedBg] = useState('mint');
  const [phoneApp, setPhoneApp] = useState<'main' | 'music' | 'settings' | 'likes'>('main');

  const [activeMusic, setActiveMusic] = useState('Lo-fi Kitsch');
  const [totalLikes, setTotalLikes] = useState(0);
  const [phoneMessage, setPhoneMessage] = useState<string | null>(null);
  const [isPunching, setIsPunching] = useState(false);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('kikocafe_save');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(prev => ({ ...prev, ...parsed, currentView: 'opening' }));
      } catch (e) {
        console.error("Save load failed", e);
      }
    }
  }, []);

  useEffect(() => {
    if (state.hasEntered) {
      localStorage.setItem('kikocafe_save', JSON.stringify(state));
    }
  }, [state]);

  useEffect(() => {
    const likes = state.feedItems.reduce((acc, item) => acc + item.likes, 0);
    setTotalLikes(likes);
  }, [state.feedItems]);

  const handlePunchIn = () => {
    if (!state.userName.trim()) return;
    setIsPunching(true);
    // Visual "SFX"
    setPhoneMessage("CLACK-CHUNG! ⚙️");
    setTimeout(() => {
      changeView('cafe');
      setState(prev => ({ ...prev, hasEntered: true }));
      setIsPunching(false);
      setPhoneMessage(null);
    }, 1500);
  };

  useEffect(() => {
    handleGenerateInitial();
  }, []);

  const handleAddPostIt = () => {
    if (!newPostIt) return;
    setGuestbook(prev => [{ id: Date.now(), text: newPostIt, user: state.userName || 'Guest' }, ...prev]);
    setNewPostIt("");
  };

  const handleUnbox = () => {
    setIsUnboxing(true);
    setTimeout(() => {
      const items = ['Flour', 'Stickers', 'Glitter', 'Rose'];
      const randomItem = items[Math.floor(Math.random() * items.length)];
      setState(prev => ({
        ...prev,
        inventory: { ...prev.inventory, [randomItem]: (prev.inventory[randomItem] || 0) + 1 }
      }));
      setIsUnboxing(false);
      alert(`📦 Unboxed: ${randomItem}! ✨`);
    }, 2000);
  };

  const prompts = {
    character: "A high-quality character design in a 90s-2000s retro anime and 'Gal' aesthetic. A cute girl with vibrant purple hair in pigtails, wearing a pink off-shoulder sweater and a chunky pastel chain necklace. She has big, sparkly eyes with star-shaped highlights and 'kitschy' makeup. The art style is a mix of cel-shaded anime and sparkly glitter textures. Background is a pastel pink heart-patterned wallpaper with sparkling stars. High saturation, nostalgic Y2K vibe, aesthetic and trendy.",
    cafe: "A cozy and kitsch cafe interior design for a mobile game. The scene features a retro-pink counter, heart-shaped chairs, and a display case filled with glittering desserts. On the table, there's a vintage chunky pink monitor and a retro camera. The lighting is soft and dreamy with a 'lo-fi' filter. The art style is highly detailed 2D illustration with a nostalgic 2000s tech aesthetic. Sparkling particles and pastel colors everywhere. Summer beach view visible through the window, anime style."
  };

  const handleGenerateInitial = async () => {
    // Only generate if we don't have images yet
    if (character.imageUrl && cafeImage !== "https://images.unsplash.com/photo-1554118811-1e0d58224f24") {
      return;
    }

    setIsGenerating(true);
    try {
      const charImg = await generateKitschImage(prompts.character);
      if (charImg) setCharacter(prev => ({ ...prev, imageUrl: charImg }));
      
      const cafeImg = await generateKitschImage(prompts.cafe);
      if (cafeImg) setCafeImage(cafeImg);
    } catch (e) {
      console.error("Initial generation failed", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    const userMsg = chatMessage;
    setChatMessage("");
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    
    // Affection logic
    const positiveWords = ['love', 'like', 'bestie', 'cute', 'slay', 'pretty', 'good'];
    const hasPositive = positiveWords.some(word => userMsg.toLowerCase().includes(word));
    
    if (hasPositive) {
      setState(prev => ({ ...prev, affection: Math.min(prev.affection + 5, 100) }));
    }

    const response = await chatWithMinako(userMsg);
    setChatHistory(prev => [...prev, { role: 'minako', text: response || "✨💖✨" }]);
  };

  const handleChangeCafeStyle = async () => {
    if (state.coins < 2000) {
      alert("카페 스타일을 바꾸려면 2000 코인이 필요해! ✨");
      return;
    }
    
    setIsGenerating(true);
    try {
      const newImg = await generateKitschImage(prompts.cafe + " vibrant, different furniture layout, sparkle effects");
      if (newImg) {
        setCafeImage(newImg);
        setState(prev => ({ ...prev, coins: prev.coins - 2000 }));
        alert("카페 분위기가 확 달라졌어! 너무 slay해... ✨💅");
      }
    } catch (e) {
      alert("스타일 변경에 실패했어! 다시 시도해줘 ✨");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddIngredient = (ing: string) => {
    if (ingredients.length < 3) {
      setIngredients(prev => [...prev, ing]);
    }
  };

  const handleMixDrink = async () => {
    if (selectedFlavors.length === 0) {
      alert("맛을 하나 이상 선택해줘! ✨");
      return;
    }
    
    // Check inventory for all selected flavors
    const missingFlavors = selectedFlavors.filter(f => (state.inventory[f] || 0) <= 0);
    if (missingFlavors.length > 0) {
      alert(`${missingFlavors.join(', ')}가 부족해! 가든에서 더 따와야 해 ✨`);
      return;
    }

    setIsMixing(true);
    console.log("Mixing drink with flavors:", selectedFlavors);
    
    // Consume flavors
    const newInventory = { ...state.inventory };
    selectedFlavors.forEach(f => {
      newInventory[f] = (newInventory[f] || 1) - 1;
    });

    setState(prev => ({
      ...prev,
      inventory: newInventory
    }));

    const drinkName = newDrinkName || `${selectedFlavors[0]} Sparkle`;
    const prompt = `${drinkName} layered drink in a cute glass with colors: ${selectedFlavors.map(f => FLAVOR_COLORS[f]).join(', ')}. ${selectedCream ? `With ${selectedCream} whipped cream on top.` : ''} Decorated with ${decorations.map(d => d.type).join(', ')}. Kitsch aesthetic, high quality.`;
    
    try {
      console.log("Requesting image with prompt:", prompt);
      const img = await generateKitschImage(prompt);
      if (!img) {
        console.error("Image generation returned null");
        alert("음료 이미지 생성에 실패했어! 😢 미나코가 다시 준비할 수 있게 다시 시도해줘 ✨");
        return;
      }
      console.log("Image generation successful");
      setMixedDrink(img);
      setLabStep('finish');
    } catch (error) {
      console.error("Drink generation failed root cause:", error);
      alert("음료를 만드는 중에 문제가 생겼어! 다시 시도해볼까? ✨");
    } finally {
      setIsMixing(false);
    }
  };

  const handleAddToMenu = (postToFeed: boolean) => {
    if (!mixedDrink) {
      alert("생성된 음료 이미지가 없어! 😢 음료를 먼저 완성해줘 ✨");
      return;
    }
    const newDessert: Dessert = {
      id: Date.now().toString(),
      name: newDrinkName || "Unnamed Drink",
      description: `${selectedFlavors.join(' & ')}를 베이스로 만든 힐링 드링크! ✨`,
      imageUrl: mixedDrink,
      price: `¥${newDrinkPrice}`,
      tags: ['#kikocafe', '#Healing', ...selectedFlavors.map(f => `#${f}`)],
      likes: 0,
      comments: [],
    };

    if (postToFeed) {
      setShowSNSPopup(true);
    } else {
      setState(prev => ({
        ...prev,
        menuItems: [...prev.menuItems, newDessert],
        gallery: [...prev.gallery, newDessert],
        coins: prev.coins + 1500,
        exp: prev.exp + 50,
      }));
      changeView('gallery');
      resetDrinkLab();
    }
  };

  const handlePostToFeed = () => {
    if (!mixedDrink) {
      alert("게시할 음료 이미지가 없어! 😢");
      return;
    }
    const newFeedItem: FeedItem = {
      id: Date.now().toString(),
      name: newDrinkName || "Unnamed Drink",
      description: `${selectedFlavors.join(' & ')}를 베이스로 만든 힐링 드링크! ✨`,
      imageUrl: mixedDrink,
      price: `¥${newDrinkPrice}`,
      likes: Math.floor(Math.random() * 50) + 10,
      comments: [
        { user: "Bestie_99", text: "Omg so kitsch! 💖" },
        { user: "Gal_Lover", text: "Slayyy! ✨" }
      ],
      background: selectedFeedBg,
      author: state.userName || "kikocafe"
    };

    setState(prev => ({
      ...prev,
      feedItems: [newFeedItem, ...prev.feedItems],
      gallery: [{
        id: newFeedItem.id,
        name: newFeedItem.name,
        description: newFeedItem.description,
        imageUrl: newFeedItem.imageUrl,
        price: newFeedItem.price,
        tags: [],
        likes: newFeedItem.likes,
        comments: newFeedItem.comments
      }, ...prev.gallery],
      coins: prev.coins + 2500,
      exp: prev.exp + 100,
    }));
    setShowSNSPopup(false);
    changeView('feed');
    resetDrinkLab();
  };

  const resetDrinkLab = () => {
    setLabStep('flavor');
    setSelectedFlavors([]);
    setSelectedCream(null);
    setDecorations([]);
    setMixedDrink(null);
    setNewDrinkName("");
    setNewDrinkPrice("3500");
  };

  const handlePlant = (index: number) => {
    const slot = gardenSlots[index];
    if (slot.plantedAt !== null) return;
    
    const newSlots = [...gardenSlots];
    newSlots[index].plantedAt = Date.now();
    setGardenSlots(newSlots);
  };

  const handleBuy = (item: ShopItem) => {
    if (state.coins >= item.price) {
      // ASMR Visual Cue
      const asmrText = document.createElement('div');
      asmrText.innerText = `🛍️ 띵동! (Bought ${item.name})`;
      asmrText.className = "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-black text-kitsch-blue z-[300] animate-bounce";
      document.body.appendChild(asmrText);
      setTimeout(() => asmrText.remove(), 1000);

      setState(prev => ({
        ...prev,
        coins: prev.coins - item.price,
        inventory: { ...prev.inventory, [item.name]: (prev.inventory[item.name] || 0) + 1 }
      }));
    } else {
      alert("돈이 부족해! 가든에서 재료를 팔거나 퀘스트를 깨봐 ✨");
    }
  };
  const handleHarvest = (index: number) => {
    const slot = gardenSlots[index];
    if (!slot.plantedAt) return;
    
    const elapsed = (Date.now() - slot.plantedAt) / 1000;
    if (elapsed < slot.growthTime) {
      const remaining = Math.ceil(slot.growthTime - elapsed);
      alert(`${remaining}초 더 기다려야 해! 힐링하며 기다리자... ✨`);
      return;
    }

    // ASMR Visual Cue
    const asmrText = document.createElement('div');
    asmrText.innerText = "✂️ 톡! (Harvested)";
    asmrText.className = "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-black text-kitsch-pink z-[300] animate-bounce";
    document.body.appendChild(asmrText);
    setTimeout(() => asmrText.remove(), 1000);

    setState(prev => ({
      ...prev,
      inventory: { ...prev.inventory, [slot.name]: (prev.inventory[slot.name] || 0) + 1 }
    }));
    
    const newSlots = [...gardenSlots];
    newSlots[index].plantedAt = null;
    setGardenSlots(newSlots);
  };

  const changeView = (view: CafeState['currentView']) => {
    setViewTransition(true);
    setTimeout(() => {
      setState(prev => ({ ...prev, currentView: view }));
      setViewTransition(false);
    }, 400);
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden bg-kitsch-bg font-sans selection:bg-kitsch-pink selection:text-white"
      onClick={addParticle}
    >
      {viewTransition && <HeartBurst />}
      
      {/* Global AI Generation Overlay */}
      <AnimatePresence>
        {(isMixing || (isGenerating && state.currentView !== 'opening')) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-kitsch-bg/90 backdrop-blur-md flex flex-col items-center justify-center space-y-8"
          >
            <div className="relative">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-40 h-40 border-8 border-kitsch-pink/20 rounded-full border-t-kitsch-pink"
              />
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center text-6xl"
              >
                ✨
              </motion.div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-kitsch-pink italic uppercase tracking-tighter">AI Magic Happening...</h2>
              <p className="text-kitsch-blue font-bold animate-pulse">
                미나코 베스티가 정성껏 만들고 있어! 조금만 기다려줘... 💖✨<br/>
                <span className="text-[10px] opacity-70 uppercase tracking-widest">(보통 10~20초 정도 걸려!)</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Star Particles */}
      {particles.map(p => (
        <div 
          key={p.id} 
          className="star-particle" 
          style={{ left: p.x - 10, top: p.y - 10 }}
        >
          <Star size={20} className="text-kitsch-yellow fill-kitsch-yellow" />
        </div>
      ))}

      {/* SNS Post Popup */}
      <AnimatePresence>
        {showSNSPopup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card p-8 max-w-md w-full space-y-6 text-center"
            >
              <h3 className="text-2xl font-black text-kitsch-pink italic uppercase">Feed에 게시하시겠습니까? ✨</h3>
              <p className="text-sm font-bold text-gray-500">배경지를 선택하고 팔로워들에게 자랑해봐!</p>
              
              <div className="grid grid-cols-3 gap-3">
                {['mint', 'pink', 'yellow'].map(bg => (
                  <button 
                    key={bg}
                    onClick={() => setSelectedFeedBg(bg)}
                    className={`aspect-square rounded-2xl border-4 transition-all ${selectedFeedBg === bg ? 'border-kitsch-pink scale-105' : 'border-white'}`}
                    style={{ backgroundColor: bg === 'mint' ? '#e0f7fa' : bg === 'pink' ? '#fff0f3' : '#fff9c4' }}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowSNSPopup(false)} className="flex-1 py-3 bg-gray-100 text-gray-400 font-bold rounded-full">취소</button>
                <button onClick={handlePostToFeed} className="flex-1 kitsch-button text-sm">게시하기 ✨</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isPhoneOpen && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none"
          >
            <div className="w-full max-w-sm h-[80vh] bg-kitsch-pink rounded-t-[3rem] p-4 shadow-2xl border-t-8 border-white pointer-events-auto relative">
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/40 rounded-full" />
              
              <div className="mt-8 bg-white/90 rounded-[2rem] h-full overflow-hidden flex flex-col relative border-4 border-white shadow-inner">
                <AnimatePresence mode="wait">
                  {phoneMessage && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-kitsch-pink/40 backdrop-blur-sm"
                    >
                      <div className="glass-card p-6 text-center shadow-2xl border-4 border-white animate-bounce">
                        <p className="text-xl font-black text-kitsch-pink italic uppercase leading-tight">
                          {phoneMessage}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="p-6 bg-gradient-to-b from-kitsch-pink/10 to-transparent flex flex-col h-full">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      {phoneApp !== 'main' && (
                        <button onClick={() => setPhoneApp('main')} className="text-kitsch-pink"><ArrowLeft size={20} /></button>
                      )}
                      <div className="flex flex-col">
                        <h3 className="text-xl font-black text-kitsch-pink italic uppercase">
                          {phoneApp === 'main' ? 'Sparkle Gram' : phoneApp.toUpperCase()}
                        </h3>
                        <span className="text-[10px] font-black text-kitsch-purple uppercase tracking-widest">Level: {state.level}</span>
                      </div>
                    </div>
                    <button onClick={() => { setIsPhoneOpen(false); setPhoneApp('main'); }} className="text-gray-400 bg-gray-100 p-1 rounded-full"><Plus className="rotate-45" size={16} /></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto">
                    {phoneApp === 'main' && (
                      <div className="space-y-8">
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { icon: '📸', label: 'Feed', action: () => { setState(prev => ({ ...prev, currentView: 'feed' })); setIsPhoneOpen(false); } },
                            { icon: '💬', label: 'Chat', action: () => { setState(prev => ({ ...prev, currentView: 'profile' })); setIsPhoneOpen(false); } },
                            { icon: '🛍️', label: 'Shop', action: () => { setState(prev => ({ ...prev, currentView: 'delivery' })); setIsPhoneOpen(false); } },
                            { icon: '🎵', label: 'Music', action: () => setPhoneApp('music') },
                            { icon: '💖', label: 'Likes', action: () => setPhoneApp('likes') },
                            { icon: '⚙️', label: 'Settings', action: () => setPhoneApp('settings') },
                          ].map(app => (
                            <button 
                              key={app.label} 
                              onClick={app.action}
                              className="flex flex-col items-center gap-1 group"
                            >
                              <motion.div 
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl border-2 border-gray-100 group-hover:border-kitsch-pink/30 transition-colors"
                              >
                                {app.icon}
                              </motion.div>
                              <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{app.label}</span>
                            </button>
                          ))}
                        </div>

                        <div className="space-y-4 pt-4">
                          <p className="text-[10px] font-bold text-gray-400 uppercase text-center border-t border-gray-100 pt-4">Recent Activity</p>
                          {state.feedItems.slice(0, 3).map((item, i) => (
                            <div key={item.id} className="flex gap-3 items-center p-3 bg-gray-50 rounded-2xl border border-white">
                              <div className="w-10 h-10 bg-kitsch-purple/20 rounded-xl flex items-center justify-center overflow-hidden">
                                <img src={item.imageUrl} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-gray-700">{item.name}</p>
                                <p className="text-[10px] text-gray-400 font-bold">{item.likes} Besties loved this! ✨</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {phoneApp === 'music' && (
                      <div className="space-y-6 flex flex-col items-center py-4">
                        <div className="w-40 h-40 bg-kitsch-purple/10 rounded-full flex items-center justify-center relative overflow-hidden">
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="w-full h-full border-8 border-dashed border-kitsch-purple opacity-30"
                          />
                          <div className="absolute inset-0 flex items-center justify-center text-6xl">🎵</div>
                        </div>
                        <div className="text-center space-y-2">
                          <p className="font-black text-kitsch-purple uppercase tracking-widest">{activeMusic}</p>
                          <p className="text-xs text-gray-400 font-bold">Now Playing...</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 w-full">
                          {['Lo-fi Kitsch', 'City Pop 80s', 'Bubblegum Pop', 'Mellow Dream'].map(track => (
                            <button 
                              key={track}
                              onClick={() => {
                                setActiveMusic(track);
                                setPhoneMessage(`${track} Playing! 🎧`);
                                setTimeout(() => setPhoneMessage(null), 2000);
                              }}
                              className={`p-3 rounded-xl border-2 font-bold text-[10px] transition-all ${activeMusic === track ? 'bg-kitsch-purple text-white border-white shadow-md' : 'bg-white text-kitsch-purple border-kitsch-purple/10'}`}
                            >
                              {track}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {phoneApp === 'likes' && (
                      <div className="space-y-6 py-4">
                        <div className="bg-gradient-to-r from-kitsch-pink to-kitsch-purple p-8 rounded-[2rem] text-white text-center shadow-lg">
                          <p className="text-xs font-black uppercase tracking-widest opacity-80">Total Hearts</p>
                          <p className="text-6xl font-black italic drop-shadow-md">{totalLikes}</p>
                          <p className="text-[10px] font-black uppercase mt-2 tracking-widest">You are a Kitsch Star! ✨</p>
                        </div>
                        <div className="space-y-3">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recent Appreciation</p>
                          {state.feedItems.map(item => (
                            <div key={item.id} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-2xl">
                              <span className="text-xs font-bold text-gray-700 truncate max-w-[150px]">{item.name}</span>
                              <div className="flex items-center gap-1">
                                <Heart size={12} className="text-kitsch-pink fill-kitsch-pink" />
                                <span className="text-xs font-black text-kitsch-pink">{item.likes}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {phoneApp === 'settings' && (
                      <div className="space-y-6 py-4">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Sound Volume</label>
                          <input 
                            type="range" 
                            min="0" max="100" 
                            value={state.settings.musicVolume}
                            onChange={(e) => setState(prev => ({ ...prev, settings: { ...prev.settings, musicVolume: parseInt(e.target.value) } }))}
                            className="w-full accent-kitsch-pink" 
                          />
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">UI Scale / Font Size</label>
                          <div className="grid grid-cols-3 gap-2">
                            {['sm', 'md', 'lg'].map(size => (
                              <button 
                                key={size}
                                onClick={() => setState(prev => ({ ...prev, settings: { ...prev.settings, fontSize: size as any } }))}
                                className={`py-2 rounded-xl border-2 font-black text-xs uppercase ${state.settings.fontSize === size ? 'bg-kitsch-pink text-white border-white shadow-md' : 'bg-white text-kitsch-pink border-kitsch-pink/10'}`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                          <span className="text-xs font-black text-gray-700 uppercase tracking-widest">SFX Toggle</span>
                          <button 
                            onClick={() => setState(prev => ({ ...prev, settings: { ...prev.settings, sfxEnabled: !prev.settings.sfxEnabled } }))}
                            className={`w-12 h-6 rounded-full transition-colors relative ${state.settings.sfxEnabled ? 'bg-kitsch-blue' : 'bg-gray-200'}`}
                          >
                            <motion.div 
                              animate={{ x: state.settings.sfxEnabled ? 24 : 4 }}
                              className="w-4 h-4 bg-white rounded-full absolute top-1"
                            />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Rail - Only show if entered */}
      {/* Quest Notification Bar */}
      {state.hasEntered && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[40] w-full max-w-xl px-4"
        >
          <div className="glass-card p-3 flex items-center justify-between border-kitsch-blue/50 bg-kitsch-blue/10 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-kitsch-yellow rounded-full flex items-center justify-center text-xl shadow-sm border-2 border-white">📜</div>
              <div>
                <p className="text-[10px] font-black text-kitsch-blue uppercase tracking-widest leading-none mb-1">Active Quest</p>
                <p className="text-xs font-bold text-gray-700">{state.quests[0].title}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden border border-white">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(state.quests[0].current / state.quests[0].goal) * 100}%` }}
                  className="h-full bg-kitsch-pink"
                />
              </div>
              <span className="text-[10px] font-black text-kitsch-pink">{state.quests[0].current}/{state.quests[0].goal}</span>
            </div>
          </div>
        </motion.div>
      )}

      {state.hasEntered && (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-card px-6 py-3 flex items-center gap-8 shadow-2xl">
          <button 
            onClick={() => changeView('cafe')}
            className={`flex flex-col items-center gap-1 transition-all ${state.currentView === 'cafe' ? 'text-kitsch-pink scale-110' : 'text-gray-400 hover:text-kitsch-pink'}`}
          >
            <Coffee size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Cafe</span>
          </button>
          <button 
            onClick={() => changeView('garden')}
            className={`flex flex-col items-center gap-1 transition-all ${state.currentView === 'garden' ? 'text-kitsch-pink scale-110' : 'text-gray-400 hover:text-kitsch-pink'}`}
          >
            <Heart size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Garden</span>
          </button>
          <button 
            onClick={() => setIsPhoneOpen(true)}
            className="w-14 h-14 bg-kitsch-pink text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all border-4 border-white -mt-8"
          >
            <Plus size={32} />
          </button>
          <button 
            onClick={() => changeView('drinkLab')}
            className={`flex flex-col items-center gap-1 transition-all ${state.currentView === 'drinkLab' ? 'text-kitsch-pink scale-110' : 'text-gray-400 hover:text-kitsch-pink'}`}
          >
            <FlaskConical size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Lab</span>
          </button>
          <button 
            onClick={() => changeView('gallery')}
            className={`flex flex-col items-center gap-1 transition-all ${state.currentView === 'gallery' ? 'text-kitsch-pink scale-110' : 'text-gray-400 hover:text-kitsch-pink'}`}
          >
            <Star size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Book</span>
          </button>
          <button 
            onClick={() => changeView('feed')}
            className={`flex flex-col items-center gap-1 transition-all ${state.currentView === 'feed' ? 'text-kitsch-pink scale-110' : 'text-gray-400 hover:text-kitsch-pink'}`}
          >
            <Sparkles size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Feed</span>
          </button>
        </nav>
      )}

      {/* HUD: Level & Coins */}
      {state.hasEntered && (
        <div className="fixed top-6 left-6 right-6 z-50 flex justify-between items-start pointer-events-none">
          <div className="glass-card px-4 py-2 flex items-center gap-3 border-2 border-white shadow-lg pointer-events-auto">
            <div className="w-10 h-10 bg-kitsch-pink rounded-full flex items-center justify-center text-white font-black italic border-2 border-white shadow-sm">K</div>
            <div>
              <p className="text-xs font-black text-gray-800 italic uppercase leading-none">{state.userName || 'kikocafe'}</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-kitsch-pink" style={{ width: `${(state.exp % 100)}%` }} />
                </div>
                <span className="text-[8px] font-black text-kitsch-pink">LV.{state.level}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pointer-events-auto">
            <div className="glass-card px-4 py-2 flex items-center gap-2 border-2 border-white shadow-lg">
              <span className="text-xl">💰</span>
              <span className="font-black text-kitsch-pink">{state.coins.toLocaleString()}</span>
            </div>
            <button 
              onClick={() => setState(prev => ({ ...prev, currentView: 'delivery' }))}
              className="glass-card w-12 h-12 flex items-center justify-center border-2 border-white shadow-lg hover:scale-110 transition-all text-xl"
            >
              🛍️
            </button>
          </div>
        </div>
      )}

      {/* Quest Notification Bar */}
      {state.hasEntered && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-full max-w-xs pointer-events-none">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-card px-4 py-2 flex items-center justify-between border-kitsch-blue/30 pointer-events-auto bg-kitsch-blue text-white shadow-lg"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest">Quest: {state.quests[0].title}</span>
            </div>
            <span className="text-[10px] font-bold">{state.quests[0].current}/{state.quests[0].goal}</span>
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto pt-12 pb-32 px-6 relative z-10">
        <AnimatePresence mode="wait">
          {state.currentView === 'splash' && (
            <motion.div 
              key="splash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
              className="fixed inset-0 z-[200] bg-kitsch-pink flex flex-col items-center justify-center p-6 overflow-hidden"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, #f472b6 25%, transparent 25%), 
                  linear-gradient(-45deg, #f472b6 25%, transparent 25%), 
                  linear-gradient(45deg, transparent 75%, #f472b6 75%), 
                  linear-gradient(-45deg, transparent 75%, #f472b6 75%)
                `,
                backgroundSize: '40px 40px',
                backgroundColor: '#fb923c10' // Slight tint
              }}
            >
              {/* Floating Decoration Background */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: Math.random() * 100 + '%', y: Math.random() * 100 + '%' }}
                    animate={{ 
                      y: [null, '-100vh'],
                      rotate: [0, 360] 
                    }}
                    transition={{ 
                      duration: 10 + Math.random() * 20, 
                      repeat: Infinity, 
                      ease: "linear" 
                    }}
                    className="absolute text-4xl"
                    style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                  >
                    {['🌸', '✨', '🍒', '🎀', '🍭'][i % 5]}
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12 }}
                className="relative z-10 p-12 bg-white rounded-[3rem] shadow-[0_20px_0_#db2777] border-8 border-kitsch-yellow flex flex-col items-center space-y-8"
              >
                <div className="relative">
                  <div className="absolute -top-16 -left-16 w-32 h-32 bg-kitsch-blue rounded-full flex items-center justify-center text-white font-black italic -rotate-12 border-4 border-white shadow-lg text-xl uppercase tracking-tighter">
                    NEW! <br/> 2000s
                  </div>
                  
                  <h1 className="text-7xl md:text-9xl font-black text-kitsch-pink italic tracking-tighter leading-none text-center drop-shadow-sm">
                    KIKO<br/>
                    <span className="text-kitsch-purple">CAFE</span>
                  </h1>
                  
                  <div className="mt-4 flex justify-center gap-2">
                    {[1,2,3,4,5].map(i => <Star key={i} size={24} className="text-kitsch-yellow fill-kitsch-yellow" />)}
                  </div>
                </div>

                <div className="w-full h-1 bg-gray-100 rounded-full" />

                <button 
                  onClick={() => changeView('opening')}
                  className="kitsch-button px-20 py-8 text-4xl active:scale-95 shadow-[0_10px_0_#be185d]"
                >
                  START! ✨
                </button>

                <div className="text-center space-y-1">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest italic">Warning: Extremely Aesthetic</p>
                  <p className="text-[10px] font-bold text-kitsch-blue uppercase">© 2024 MINAKO BESTIE CORP</p>
                </div>
              </motion.div>

              {/* Barcode Deco */}
              <div className="absolute bottom-10 right-10 bg-white p-2 rounded-md shadow-sm border border-gray-200 rotate-3">
                <div className="w-20 h-8 flex gap-0.5">
                  {[...Array(15)].map((_, i) => (
                    <div key={i} className="bg-black h-full" style={{ width: Math.random() > 0.5 ? '2px' : '4px' }} />
                  ))}
                </div>
                <p className="text-[8px] font-mono mt-1">2000-0220-MINAKO</p>
              </div>
            </motion.div>
          )}

          {state.currentView === 'opening' && (
            <motion.div 
              key="opening"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-kitsch-bg/95 flex flex-col items-center justify-center p-6 backdrop-blur-sm"
            >
              <div className="timecard-machine max-w-sm w-full">
                <div className="timecard-slot" />
                
                <AnimatePresence mode="wait">
                  {!isPunching ? (
                    <motion.div 
                      key="card-in"
                      initial={{ y: 200 }}
                      animate={{ y: 0 }}
                      exit={{ y: -500 }}
                      transition={{ type: "spring", damping: 15 }}
                      className="timecard"
                    >
                      <div className="space-y-6 text-center">
                        <div className="border-b-4 border-orange-200 pb-4">
                          <h2 className="text-3xl font-black text-gray-400 italic uppercase">Time Card</h2>
                          <p className="text-[10px] font-bold text-gray-400 tracking-widest leading-none">KIKO CAFE STAFF PORTAL</p>
                        </div>
                        
                        <div className="space-y-4">
                          <label className="block text-xs font-black text-orange-400 uppercase italic">Employee Name</label>
                          <input 
                            type="text" 
                            placeholder="Enter Name..."
                            value={state.userName}
                            onChange={(e) => setState(prev => ({ ...prev, userName: e.target.value }))}
                            className="w-full bg-transparent border-b-4 border-orange-200 text-center font-black text-kitsch-purple text-2xl focus:outline-none focus:border-kitsch-pink transition-colors h-12"
                          />
                        </div>

                        <button 
                          onClick={handlePunchIn}
                          disabled={!state.userName.trim()}
                          className="w-full py-5 bg-orange-200 text-orange-700 font-black rounded-xl border-b-8 border-orange-300 active:border-b-0 active:translate-y-2 transition-all uppercase italic disabled:opacity-50 text-xl"
                        >
                          Punch In ⚡
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="punching"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="h-64 flex flex-col items-center justify-center text-white space-y-4"
                    >
                      <motion.div 
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 0.2 }}
                        className="text-6xl"
                      >
                        ⚒️
                      </motion.div>
                      <p className="text-2xl font-black italic uppercase tracking-tighter animate-pulse">CLACK-CHUNG!</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="mt-12 text-center">
                <h1 className="text-7xl font-black text-kitsch-pink italic drop-shadow-xl select-none leading-none">
                  KIKO <br/> <span className="text-kitsch-purple">CAFE</span>
                </h1>
                <p className="text-kitsch-blue font-bold tracking-widest uppercase mt-4 text-xs">Est. 2000 ✨ Virtual Healing DIY Game</p>
              </div>
            </motion.div>
          )}

          {state.currentView === 'cafe' && (
            <motion.div 
              key="cafe"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <header className="text-center mb-12">
                <h1 className="text-6xl md:text-8xl font-black text-kitsch-pink drop-shadow-[0_4px_0_rgba(219,39,119,0.3)] mb-2 italic">
                  KIKO <span className="text-kitsch-purple">CAFE</span>
                </h1>
                <p className="text-kitsch-blue font-bold tracking-tighter uppercase">Welcome back, {state.userName}! ✨</p>
              </header>

              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-kitsch-pink via-kitsch-purple to-kitsch-blue rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative glass-card overflow-hidden aspect-video md:aspect-[21/9]">
                  <img 
                    src={cafeImage} 
                    alt="Cafe Interior" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-1">Main Lounge</h2>
                      <p className="text-white/80 text-sm font-medium">Cozy, kitsch, and perfectly aesthetic.</p>
                    </div>
                    <button 
                      onClick={handleChangeCafeStyle}
                      disabled={isGenerating}
                      className="kitsch-button flex items-center gap-2 text-sm bg-kitsch-blue border-kitsch-blue"
                    >
                      {isGenerating ? 'Changing... ✨' : 'Style Change (2000) 🛍️'}
                    </button>
                    <button 
                      onClick={() => setState(prev => ({ ...prev, currentView: 'drinkLab' }))}
                      className="kitsch-button flex items-center gap-2 text-sm"
                    >
                      Go to Drink Lab 🧪
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-8 space-y-6 relative overflow-hidden">
                  <h3 className="text-2xl font-black text-kitsch-purple italic uppercase">Guestbook</h3>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newPostIt}
                      onChange={(e) => setNewPostIt(e.target.value)}
                      placeholder="Leave a message..."
                      className="flex-1 bg-white/50 px-4 py-2 rounded-xl text-xs font-bold focus:outline-none"
                    />
                    <button onClick={handleAddPostIt} className="kitsch-button py-2 px-4 text-xs">Post</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2">
                    {guestbook.map(post => (
                      <motion.div 
                        key={post.id}
                        initial={{ rotate: Math.random() * 10 - 5, scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="bg-yellow-100 p-3 shadow-md border border-yellow-200 text-[10px] font-bold text-gray-600 relative"
                      >
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-kitsch-pink/40 rounded-full" />
                        <p className="italic">"{post.text}"</p>
                        <p className="text-right text-[8px] mt-2 text-kitsch-pink">- {post.user}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-8 space-y-4 relative overflow-hidden">
                  <h3 className="text-2xl font-bold text-kitsch-purple flex items-center gap-2">
                    <Heart className="fill-kitsch-purple" /> Today's Mood
                  </h3>
                  <p className="text-gray-600 leading-relaxed font-medium">
                    Welcome to kikocafe! <br/>
                    <span className="text-kitsch-pink">Bestie, 오늘 분위기 너무 slay하지 않아? ✨</span> <br/>
                    우리는 하루 종일 반짝임과 nostalgia를 서빙하고 있어. 하트 의자에 앉아서 같이 vibe를 즐겨보자! 🌈💖
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {state.currentView === 'garden' && (
            <motion.div 
              key="garden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-4xl font-black text-kitsch-pink italic uppercase">kiko Garden</h2>
                <div className="glass-card px-4 py-2 text-xs font-bold text-kitsch-pink">
                  Level: {state.level}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {gardenSlots.map((slot, i) => {
                  const isGrowing = slot.plantedAt !== null;
                  const elapsed = isGrowing ? (Date.now() - slot.plantedAt!) / 1000 : 0;
                  const progress = isGrowing ? Math.min(elapsed / slot.growthTime, 1) : 0;
                  const isReady = progress >= 1;
                  
                  // Stage determination
                  let stageIcon = '🕳️'; // Empty
                  if (isGrowing) {
                    if (progress < 0.3) stageIcon = '🌱'; // Seedling
                    else if (progress < 0.7) stageIcon = '🌿'; // Growing
                    else if (progress < 1.0) stageIcon = '🌸'; // Flower
                    else {
                      // Ready icons
                      const icons: Record<string, string> = {
                        'Strawberry': '🍓', 'Blueberry': '🫐', 'Peach': '🍑', 'Cherry': '🍒', 
                        'Rose': '🌹', 'Lemon': '🍋', 'Melon': '🍈', 'Mint': '🌿'
                      };
                      stageIcon = icons[slot.name] || '🎁';
                    }
                  }

                  return (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.05, rotate: isReady ? [0, -5, 5, 0] : 0 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => isReady ? handleHarvest(i) : handlePlant(i)}
                      className={`glass-card aspect-square flex flex-col items-center justify-center gap-2 group relative overflow-hidden ${isReady ? 'border-kitsch-yellow border-4 shadow-[0_0_20px_rgba(255,215,0,0.4)]' : ''}`}
                    >
                      <AnimatePresence mode="wait">
                        <motion.div 
                          key={stageIcon}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          className={`text-5xl ${isGrowing && !isReady ? 'grayscale-[0.5]' : 'group-hover:animate-bounce'}`}
                        >
                          {stageIcon}
                        </motion.div>
                      </AnimatePresence>
                      
                      <span className="text-[10px] font-black text-kitsch-pink uppercase tracking-widest">
                        {isReady ? 'Harvest! ✨' : isGrowing ? `${Math.ceil(slot.growthTime - elapsed)}s` : `Plant ${slot.name}`}
                      </span>

                      {isGrowing && !isReady && (
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-100 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress * 100}%` }}
                            className="h-full bg-kitsch-blue"
                          />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <div className="glass-card p-6 border-kitsch-blue/20">
                <h3 className="text-sm font-black text-kitsch-blue uppercase mb-4">내 보관함 (Inventory)</h3>
                <div className="flex flex-wrap gap-4">
                  {Object.entries(state.inventory).map(([name, count]) => (
                    <div key={name} className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full border border-white/80">
                      <span className="text-xs font-bold text-gray-600">{name}:</span>
                      <span className="text-xs font-black text-kitsch-pink">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {state.currentView === 'drinkLab' && (
            <motion.div 
              key="drinkLab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-4xl font-black text-kitsch-blue italic uppercase">Drink Lab</h2>
                <div className="glass-card px-4 py-2 text-xs font-bold text-kitsch-blue">Step: {labStep}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card p-8 space-y-6 border-4 border-white shadow-xl">
                  {labStep === 'flavor' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                      <h3 className="text-xl font-black text-kitsch-blue uppercase flex items-center gap-2">
                        <Coffee className="w-5 h-5" /> 1. 베이스 맛 선택 (최대 3개)
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {['Strawberry', 'Blueberry', 'Peach', 'Cherry', 'Lemon', 'Melon', 'Mint'].map(flavor => {
                          const count = state.inventory[flavor] || 0;
                          const isSelected = selectedFlavors.includes(flavor);
                          return (
                            <button 
                              key={flavor}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedFlavors(prev => prev.filter(f => f !== flavor));
                                } else if (selectedFlavors.length < 3) {
                                  setSelectedFlavors(prev => [...prev, flavor]);
                                }
                              }}
                              className={`p-4 rounded-2xl border-2 font-bold transition-all flex flex-col items-center gap-1 relative overflow-hidden group ${
                                isSelected 
                                  ? 'bg-kitsch-blue text-white border-white scale-105 shadow-lg' 
                                  : count > 0 
                                    ? 'bg-white/60 border-kitsch-blue/20 text-kitsch-blue hover:border-kitsch-blue hover:bg-white' 
                                    : 'bg-gray-100 border-gray-200 text-gray-400 opacity-70'
                              }`}
                            >
                              <span className="text-lg">{flavor}</span>
                              <span className={`text-[9px] font-black uppercase tracking-tighter ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                                {count > 0 ? `Stock: ${count}` : 'Out of Stock'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <button 
                        disabled={selectedFlavors.length === 0}
                        onClick={() => setLabStep('cream')}
                        className="kitsch-button w-full mt-4 disabled:opacity-50"
                      >
                        다음 단계로 ✨
                      </button>
                    </div>
                  )}

                  {labStep === 'cream' && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-black text-kitsch-blue uppercase">2. 휘핑 크림 선택</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {CREAM_OPTIONS.map(cream => (
                          <button 
                            key={cream.id}
                            onClick={() => { setSelectedCream(cream.name); setLabStep('deco'); }}
                            className={`p-4 rounded-2xl border-2 font-bold transition-all flex flex-col items-center gap-2 ${
                              selectedCream === cream.name ? 'bg-kitsch-pink text-white border-white' : 'bg-white/50 border-kitsch-pink/20 text-kitsch-pink'
                            }`}
                          >
                            <span className="text-2xl">{cream.icon}</span>
                            <span className="text-xs">{cream.name}</span>
                          </button>
                        ))}
                        <button 
                          onClick={() => { setSelectedCream(null); setLabStep('deco'); }}
                          className="col-span-2 p-4 bg-white/50 rounded-2xl border border-gray-200 font-bold text-gray-400"
                        >
                          No Cream
                        </button>
                      </div>
                    </div>
                  )}

                  {labStep === 'deco' && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-black text-kitsch-blue uppercase">3. 데코레이션 (배치할 항목 선택!)</h3>
                      <p className="text-[10px] font-bold text-gray-400">컵을 클릭해서 재료를 원하는 곳에 배치해봐! ✨</p>
                      <div className="grid grid-cols-4 gap-2">
                        {['Stickers', 'Glitter', 'Rose', 'Cherry', 'Mint'].map(deco => {
                          const count = state.inventory[deco] || 0;
                          return (
                            <button 
                              key={deco}
                              disabled={count === 0}
                              onClick={() => {
                                setSelectedDeco(deco);
                              }}
                              className={`p-3 rounded-xl border font-bold text-[10px] transition-all flex flex-col items-center gap-1 ${
                                selectedDeco === deco 
                                  ? 'bg-kitsch-blue text-white border-white scale-105 shadow-md' 
                                  : count > 0 
                                    ? 'bg-white/50 border-kitsch-purple/20 text-kitsch-purple hover:bg-white' 
                                    : 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed opacity-50'
                              }`}
                            >
                              <span className="text-xl">
                                {deco === 'Rose' ? '🌹' : deco === 'Cherry' ? '🍒' : deco === 'Mint' ? '🌿' : deco === 'Stickers' ? '🎀' : '✨'}
                              </span>
                              <span>{count}</span>
                            </button>
                          );
                        })}
                      </div>
                      <button 
                        onClick={handleMixDrink}
                        disabled={isMixing}
                        className="kitsch-button w-full mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isMixing ? '마법을 거는 중... ✨' : '음료 완성하기! ✨'}
                      </button>
                    </div>
                  )}

                  {labStep === 'finish' && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-black text-kitsch-blue uppercase">4. 이름 & 가격 정하기</h3>
                      <input 
                        type="text" 
                        placeholder="음료 이름..."
                        value={newDrinkName}
                        onChange={(e) => setNewDrinkName(e.target.value)}
                        className="w-full p-4 bg-white/50 rounded-2xl border border-kitsch-blue/20 font-black text-center text-kitsch-blue"
                      />
                      <input 
                        type="number" 
                        value={newDrinkPrice}
                        onChange={(e) => setNewDrinkPrice(e.target.value)}
                        className="w-full p-4 bg-white/50 rounded-2xl border border-kitsch-blue/20 font-black text-center text-kitsch-blue"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleAddToMenu(false)} className="flex-1 kitsch-button text-xs">메뉴에 올리기</button>
                        <button onClick={() => handleAddToMenu(true)} className="flex-1 kitsch-button bg-kitsch-purple border-purple-600 text-xs">피드에 게시하기</button>
                      </div>
                    </div>
                  )}
                </div>

                <div 
                  className="glass-card p-8 flex flex-col items-center justify-center relative min-h-[450px] bg-[#e0f7fa] border-8 border-white shadow-2xl overflow-hidden cursor-crosshair rounded-[3rem]"
                  onClick={(e) => {
                    if (labStep === 'deco' && selectedDeco) {
                      const count = state.inventory[selectedDeco] || 0;
                      if (count > 0) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = ((e.clientX - rect.left) / rect.width) * 100;
                        const y = ((e.clientY - rect.top) / rect.height) * 100;
                        setDecorations(prev => [...prev, { id: Date.now().toString(), type: selectedDeco, x, y }]);
                        setState(prev => ({
                          ...prev,
                          inventory: { ...prev.inventory, [selectedDeco]: count - 1 }
                        }));
                      } else {
                        alert(`${selectedDeco}가 부족해! 샵에서 사거나 가든에서 따와야 해 ✨`);
                      }
                    }
                  }}
                >
                  {/* Custom Background: Mint with Dots */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '20px 20px' }} />
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 yellow-floor opacity-50" />
                  
                  {mixedDrink ? (
                    <motion.img 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      src={mixedDrink} 
                      className="w-64 h-64 object-contain relative z-10" 
                    />
                  ) : (
                    <div className="relative w-48 h-64 border-4 border-white/60 rounded-t-full rounded-b-2xl bg-white/20 flex flex-col items-center justify-end pb-8">
                      {selectedCream && (
                        <div 
                          className="absolute -top-8 w-32 h-16 rounded-full shadow-sm z-10" 
                          style={{ backgroundColor: CREAM_OPTIONS.find(c => c.name === selectedCream)?.color || '#fff' }}
                        />
                      )}
                      <div className="w-full h-full relative flex flex-col-reverse overflow-hidden rounded-b-xl rounded-t-full">
                        {selectedFlavors.map((flavor, idx) => (
                          <div 
                            key={idx} 
                            className="w-full" 
                            style={{ 
                              height: '33.33%', 
                              backgroundColor: FLAVOR_COLORS[flavor] || '#fff',
                              opacity: 0.8
                            }} 
                          />
                        ))}
                      </div>
                      {decorations.map(d => (
                        <motion.div 
                          key={d.id} 
                          drag
                          dragElastic={0.1}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          whileDrag={{ scale: 1.2, zIndex: 100 }}
                          className="absolute text-4xl z-20 cursor-grab active:cursor-grabbing" 
                          style={{ left: `${d.x}%`, top: `${d.y}%`, transform: 'translate(-50%, -50%)' }}
                        >
                          {d.type === 'Rose' ? '🌹' : d.type === 'Cherry' ? '🍒' : d.type === 'Mint' ? '🌿' : d.type === 'Stickers' ? '🎀' : '✨'}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {state.currentView === 'gallery' && (
            <motion.div 
              key="gallery"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-5xl font-black text-kitsch-pink italic uppercase tracking-tighter drop-shadow-sm">Drink Collection</h2>
                <div className="inline-block glass-card px-6 py-2 border-kitsch-blue/30 overflow-hidden">
                  <p className="text-xs font-black text-kitsch-blue uppercase animate-pulse">Total Masterpieces: {state.gallery.length} ✨</p>
                </div>
              </div>

              {state.gallery.length === 0 ? (
                <div className="glass-card p-20 text-center space-y-4 border-dashed border-4 border-kitsch-pink/30">
                  <div className="text-6xl animate-bounce">📔</div>
                  <p className="text-gray-400 font-bold italic">우리의 드링크 일기가 비어있어! <br/> 실험실에서 첫 번째 보석을 만들어보자 ✨</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {state.gallery.map((item, i) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="group"
                    >
                      <DessertCard {...item} prompt="" />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {state.currentView === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-4xl font-black text-kitsch-purple italic uppercase">Minako Chat</h2>
                <div className="glass-card px-4 py-2 text-xs font-bold text-kitsch-purple">Bestie Level: {state.level}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-6">
                  <div className="glass-card overflow-hidden aspect-square relative group border-4 border-white shadow-2xl">
                    <img 
                      src={character.imageUrl} 
                      alt={character.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-[10px] font-black text-kitsch-pink border-2 border-kitsch-pink flex items-center gap-1 shadow-sm">
                      <Heart size={12} className="fill-kitsch-pink" /> {state.affection}%
                    </div>
                  </div>
                  <div className="glass-card p-6">
                    <h2 className="text-2xl font-bold text-kitsch-pink mb-1">{character.name}</h2>
                    <p className="text-xs font-bold text-kitsch-purple uppercase tracking-widest mb-4">{character.role}</p>
                    <p className="text-sm text-gray-600 italic font-bold leading-relaxed">"{character.bio}"</p>
                  </div>
                </div>

                <div className="md:col-span-2 flex flex-col h-[500px]">
                  <div className="glass-card flex-1 p-6 overflow-y-auto space-y-4 mb-4 bg-white/30">
                    {chatHistory.map((msg, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm font-bold shadow-sm ${
                          msg.role === 'user' 
                            ? 'bg-kitsch-blue text-white rounded-tr-none' 
                            : 'bg-white text-kitsch-purple border border-kitsch-purple/20 rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="glass-card p-2 flex gap-2">
                    <input 
                      type="text" 
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Minako와 talk 해봐, bestie..."
                      className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none font-bold"
                    />
                    <button 
                      onClick={handleSendMessage}
                      className="w-10 h-10 bg-kitsch-pink text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-md"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {state.currentView === 'feed' && (
            <motion.div 
              key="feed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-4xl font-black text-kitsch-pink italic uppercase">SNS Feed</h2>
                <div className="glass-card px-4 py-2 text-xs font-bold text-kitsch-pink">Followers: {state.exp * 2}</div>
              </div>

              <div className="max-w-md mx-auto space-y-8">
                {state.feedItems.length === 0 ? (
                  <div className="glass-card p-12 text-center space-y-4 bg-white/20">
                    <p className="text-4xl">📸</p>
                    <p className="text-sm font-bold text-gray-400 italic">아직 게시물이 없어! 음료를 만들고 첫 피드를 올려봐 ✨</p>
                  </div>
                ) : (
                  state.feedItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="glass-card overflow-hidden border-4 border-white shadow-2xl"
                      style={{ backgroundColor: item.background === 'mint' ? '#e0f7fa' : item.background === 'pink' ? '#fff0f3' : '#fff9c4' }}
                    >
                      <div className="p-4 flex items-center gap-3 border-b border-white/40">
                        <div className="w-10 h-10 bg-kitsch-pink rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white font-black italic">K</div>
                        <div>
                          <p className="text-sm font-black text-gray-800 italic uppercase">{item.author}</p>
                          <p className="text-[10px] font-bold text-kitsch-pink uppercase tracking-widest">kikocafe owner</p>
                        </div>
                      </div>
                      <div className="aspect-square relative group">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Heart size={48} className="text-white fill-white animate-pulse" />
                        </div>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex gap-4">
                            <button className="text-kitsch-pink hover:scale-110 transition-all"><Heart size={24} className="fill-kitsch-pink" /></button>
                            <button className="text-gray-400 hover:scale-110 transition-all"><Send size={24} /></button>
                          </div>
                          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{item.likes} Likes</span>
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-800 italic uppercase">{item.name}</p>
                          <p className="text-xs text-gray-500 font-medium mt-1">{item.description}</p>
                        </div>
                        <div className="space-y-2 pt-4 border-t border-white/40">
                          {item.comments.map((c, i) => (
                            <p key={i} className="text-[10px] font-bold text-gray-600">
                              <span className="text-kitsch-purple mr-2">{c.user}</span> {c.text}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {state.currentView === 'delivery' && (
            <motion.div 
              key="delivery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-4xl font-black text-kitsch-blue italic uppercase">Kitsch Shop</h2>
                <div className="glass-card px-4 py-2 text-xs font-bold text-kitsch-blue">Wallet: 💰 {state.coins}</div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {SHOP_ITEMS.map(item => (
                  <motion.div 
                    key={item.id}
                    whileHover={{ y: -5 }}
                    className="glass-card p-6 flex flex-col items-center text-center space-y-4 border-4 border-white"
                  >
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl shadow-inner border-2 border-gray-50">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-800 uppercase italic">{item.name}</h3>
                      <p className="text-[10px] font-bold text-kitsch-blue uppercase tracking-widest">{item.type}</p>
                    </div>
                    <button 
                      onClick={() => handleBuy(item)}
                      className="kitsch-button w-full text-xs py-2"
                    >
                      Buy 💰 {item.price}
                    </button>
                  </motion.div>
                ))}
              </div>

              <div className="glass-card p-8 bg-white/40">
                <h3 className="text-xl font-black text-kitsch-purple uppercase mb-4">My Inventory</h3>
                <div className="flex flex-wrap gap-4">
                  {Object.entries(state.inventory).map(([name, count]) => (
                    <div key={name} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border-2 border-kitsch-purple/20 shadow-sm">
                      <span className="font-bold text-gray-700">{name}</span>
                      <span className="w-6 h-6 bg-kitsch-purple text-white rounded-full flex items-center justify-center text-[10px] font-black">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Decorative Stickers */}
      <div className="fixed top-20 left-10 w-24 h-24 opacity-20 pointer-events-none animate-float">
        <Heart className="w-full h-full text-kitsch-pink fill-kitsch-pink" />
      </div>
      <div className="fixed bottom-40 right-10 w-16 h-16 opacity-20 pointer-events-none animate-float [animation-delay:1s]">
        <Star className="w-full h-full text-kitsch-yellow fill-kitsch-yellow" />
      </div>
    </div>
  );
}

interface DessertCardProps {
  name: string;
  price: string;
  description: string;
  imageUrl: string;
  prompt: string;
  key?: any;
}

function DessertCard({ name, price, description, imageUrl, prompt }: DessertCardProps) {
  const [currentImage, setCurrentImage] = useState(imageUrl);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const newImg = await generateKitschImage(prompt);
    if (newImg) setCurrentImage(newImg);
    setIsGenerating(false);
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-card overflow-hidden flex flex-col border-4 border-white shadow-xl"
    >
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={currentImage} 
          alt={name} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black text-kitsch-pink shadow-sm border border-kitsch-pink/20">
          {price}
        </div>
        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-kitsch-purple shadow-lg hover:scale-110 active:scale-90 transition-all border border-kitsch-purple/20"
        >
          <Sparkles size={20} className={isGenerating ? 'animate-spin' : ''} />
        </button>
      </div>
      <div className="p-6 space-y-2 bg-white/40">
        <h3 className="text-xl font-black text-kitsch-pink italic uppercase tracking-tight">{name}</h3>
        <p className="text-xs text-gray-500 leading-relaxed font-bold italic">"{description}"</p>
      </div>
    </motion.div>
  );
}
