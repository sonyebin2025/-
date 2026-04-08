/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Coffee, User, Menu as MenuIcon, Heart, Star, Send, ArrowLeft, FlaskConical, Plus, Trash2, Check } from 'lucide-react';
import { generateKitschImage, chatWithMinako } from './lib/gemini';
import { CafeState, Dessert, Character } from './types';

export default function App() {
  const [state, setState] = useState<CafeState>({
    currentView: 'cafe',
    selectedDessert: null,
    menuItems: [],
  });

  const [character, setCharacter] = useState<Character>({
    name: "Minako",
    role: "Cafe Host & Gal Icon",
    bio: "Living my best life in 2000! ✨ Love sparkles, purple hair, and the cutest desserts in town. Besties welcome! 💖",
    imageUrl: "https://picsum.photos/seed/minako/800/800", // Fallback
    style: "90s-2000s Retro Anime Gal",
  });

  const [cafeImage, setCafeImage] = useState<string>("https://picsum.photos/seed/cafe/1200/800");
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'minako', text: string }[]>([]);

  // Drink Lab State
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [isMixing, setIsMixing] = useState(false);
  const [mixedDrink, setMixedDrink] = useState<string | null>(null);
  const [newDrinkPrice, setNewDrinkPrice] = useState("1000");
  const [newDrinkName, setNewDrinkName] = useState("");

  useEffect(() => {
    handleGenerateInitial();
  }, []);

  const prompts = {
    character: "A high-quality character design in a 90s-2000s retro anime and 'Gal' aesthetic. A cute girl with vibrant purple hair in pigtails, wearing a pink off-shoulder sweater and a chunky pastel chain necklace. She has big, sparkly eyes with star-shaped highlights and 'kitschy' makeup. The art style is a mix of cel-shaded anime and sparkly glitter textures. Background is a pastel pink heart-patterned wallpaper with sparkling stars. High saturation, nostalgic Y2K vibe, aesthetic and trendy.",
    cafe: "A cozy and kitsch cafe interior design for a mobile game. The scene features a retro-pink counter, heart-shaped chairs, and a display case filled with glittering desserts. On the table, there's a vintage chunky pink monitor and a retro camera. The lighting is soft and dreamy with a 'lo-fi' filter. The art style is highly detailed 2D illustration with a nostalgic 2000s tech aesthetic. Sparkling particles and pastel colors everywhere. Summer beach view visible through the window, anime style."
  };

  const handleGenerateInitial = async () => {
    setIsGenerating(true);
    const charImg = await generateKitschImage(prompts.character);
    if (charImg) setCharacter(prev => ({ ...prev, imageUrl: charImg }));
    
    const cafeImg = await generateKitschImage(prompts.cafe);
    if (cafeImg) setCafeImage(cafeImg);
    setIsGenerating(false);
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    const userMsg = chatMessage;
    setChatMessage("");
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    
    const response = await chatWithMinako(userMsg);
    setChatHistory(prev => [...prev, { role: 'minako', text: response || "✨💖✨" }]);
  };

  const handleAddIngredient = (ing: string) => {
    if (ingredients.length < 3) {
      setIngredients(prev => [...prev, ing]);
    }
  };

  const handleMixDrink = async () => {
    if (ingredients.length === 0) return;
    setIsMixing(true);
    const defaultName = ingredients.join(' ') + " Fizz";
    setNewDrinkName(defaultName);
    const prompt = `A single ${defaultName} drink in a cute glass. Vector art style, bold lines, flat colors.`;
    const img = await generateKitschImage(prompt);
    setMixedDrink(img);
    setIsMixing(false);
  };

  const handleAddToMenu = () => {
    if (!mixedDrink) return;
    const finalName = newDrinkName || (ingredients.join(' ') + " Fizz");
    const newDessert: Dessert = {
      id: Date.now().toString(),
      name: finalName,
      description: `${ingredients.join(', ')}를 믹스해서 만든 sparkly drink! ✨`,
      imageUrl: mixedDrink,
      price: `¥${newDrinkPrice}`,
      tags: ['#Custom', '#DrinkLab', ...ingredients.map(i => `#${i}`)],
    };

    setState(prev => ({
      ...prev,
      menuItems: [...prev.menuItems, newDessert],
      currentView: 'menu'
    }));
    resetDrinkLab();
  };

  const resetDrinkLab = () => {
    setIngredients([]);
    setMixedDrink(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-kitsch-bg font-sans selection:bg-kitsch-pink selection:text-white">
      {/* Animated Sparkle Background */}
      <div className="fixed inset-0 sparkle-bg opacity-30 pointer-events-none" />

      {/* Navigation Rail */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-card px-6 py-3 flex items-center gap-8">
        <button 
          onClick={() => setState(prev => ({ ...prev, currentView: 'cafe' }))}
          className={`flex flex-col items-center gap-1 transition-all ${state.currentView === 'cafe' ? 'text-kitsch-pink scale-110' : 'text-gray-400 hover:text-kitsch-pink'}`}
        >
          <Coffee size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Cafe</span>
        </button>
        <button 
          onClick={() => setState(prev => ({ ...prev, currentView: 'menu' }))}
          className={`flex flex-col items-center gap-1 transition-all ${state.currentView === 'menu' ? 'text-kitsch-pink scale-110' : 'text-gray-400 hover:text-kitsch-pink'}`}
        >
          <MenuIcon size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Menu</span>
        </button>
        <button 
          onClick={() => setState(prev => ({ ...prev, currentView: 'drinkLab' }))}
          className={`flex flex-col items-center gap-1 transition-all ${state.currentView === 'drinkLab' ? 'text-kitsch-pink scale-110' : 'text-gray-400 hover:text-kitsch-pink'}`}
        >
          <FlaskConical size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Drink Lab</span>
        </button>
        <button 
          onClick={() => setState(prev => ({ ...prev, currentView: 'profile' }))}
          className={`flex flex-col items-center gap-1 transition-all ${state.currentView === 'profile' ? 'text-kitsch-pink scale-110' : 'text-gray-400 hover:text-kitsch-pink'}`}
        >
          <User size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Minako</span>
        </button>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto pt-12 pb-32 px-6 relative z-10">
        <header className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1 bg-white/50 backdrop-blur-sm rounded-full border border-white/80 mb-4"
          >
            <Sparkles size={16} className="text-kitsch-purple animate-pulse" />
            <span className="text-xs font-bold text-kitsch-purple uppercase tracking-widest">Est. 2000 • Kitsch Cafe</span>
            <Sparkles size={16} className="text-kitsch-purple animate-pulse" />
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-black text-kitsch-pink drop-shadow-[0_4px_0_rgba(219,39,119,0.3)] mb-2 italic">
            KITSCH <span className="text-kitsch-purple">CAFE</span>
          </h1>
          <p className="text-kitsch-blue font-tech font-bold tracking-tighter uppercase">Retro Anime • Gal Aesthetic • Sparkly Vibes</p>
        </header>

        <AnimatePresence mode="wait">
          {state.currentView === 'cafe' && (
            <motion.div 
              key="cafe"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
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
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setState(prev => ({ ...prev, currentView: 'drinkLab' }))}
                        disabled={isGenerating}
                        className="kitsch-button flex items-center gap-2 text-sm"
                      >
                        {isGenerating ? "Sparkling..." : "Go to Drink Lab 🧪"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-8 space-y-4 relative overflow-hidden">
                  {/* Interactive Sticker */}
                  <motion.div 
                    drag
                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    className="absolute top-2 right-2 cursor-grab active:cursor-grabbing z-20"
                  >
                    <Heart size={32} className="text-kitsch-pink fill-kitsch-pink drop-shadow-lg" />
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-kitsch-purple flex items-center gap-2">
                    <Heart className="fill-kitsch-purple" /> Today's Mood
                  </h3>
                  <p className="text-gray-600 leading-relaxed font-medium">
                    Welcome to the most aesthetic spot in the digital world! <br/>
                    <span className="text-kitsch-pink">Bestie, 오늘 분위기 너무 slay하지 않아? ✨</span> <br/>
                    우리는 하루 종일 반짝임과 nostalgia를 서빙하고 있어. 하트 의자에 앉아서 같이 vibe를 즐겨보자! 🌈💖
                  </p>
                  <div className="flex gap-2">
                    {['#Y2K', '#GalStyle', '#RetroAnime', '#Kitsch'].map(tag => (
                      <span key={tag} className="text-[10px] font-bold px-2 py-1 bg-kitsch-bg rounded-md text-kitsch-blue border border-kitsch-blue/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="glass-card p-8 flex flex-col justify-center items-center text-center space-y-4 border-2 border-dashed border-kitsch-pink/30">
                  <div className="w-16 h-16 bg-kitsch-pink/10 rounded-full flex items-center justify-center text-kitsch-pink animate-float">
                    <Star size={32} className="fill-kitsch-pink" />
                  </div>
                  <h3 className="text-xl font-bold text-kitsch-pink uppercase tracking-tighter">Special Event</h3>
                  <p className="text-sm text-gray-500 italic font-bold">
                    "Melon Parfait Party" starts at 4PM! <br/>
                    <span className="text-kitsch-purple">늦지 마, bestie! 🍈💖</span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {state.currentView === 'menu' && (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <button 
                  onClick={() => setState(prev => ({ ...prev, currentView: 'cafe' }))}
                  className="flex items-center gap-2 text-kitsch-pink font-bold hover:translate-x-[-4px] transition-transform"
                >
                  <ArrowLeft size={20} /> Back to Lounge
                </button>
                <h2 className="text-2xl font-black text-kitsch-purple italic">SPARKLY MENU</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {state.menuItems.length === 0 ? (
                  <div className="md:col-span-2 glass-card p-12 flex flex-col items-center justify-center text-center space-y-6 border-2 border-dashed border-kitsch-pink/30">
                    <div className="w-20 h-20 bg-kitsch-pink/10 rounded-full flex items-center justify-center text-kitsch-pink">
                      <Plus size={40} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-kitsch-pink italic uppercase">Menu is Empty!</h3>
                      <p className="text-gray-500 font-bold mt-2">Drink Lab에서 나만의 메뉴를 만들어봐, bestie! ✨</p>
                    </div>
                    <button 
                      onClick={() => setState(prev => ({ ...prev, currentView: 'drinkLab' }))}
                      className="kitsch-button"
                    >
                      Go to Drink Lab 🧪
                    </button>
                  </div>
                ) : (
                  state.menuItems.map((item) => (
                    <DessertCard 
                      key={item.id}
                      name={item.name}
                      price={item.price}
                      description={item.description}
                      imageUrl={item.imageUrl}
                      prompt={`A single ${item.name} drink in a cute glass. Vector art style, bold lines, flat colors.`}
                    />
                  ))
                )}
                
                {state.menuItems.length > 0 && (
                  <div className="glass-card p-8 flex flex-col items-center justify-center border-2 border-dashed border-kitsch-purple/30 text-center">
                    <div className="text-kitsch-purple mb-4">
                      <Sparkles size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-kitsch-purple mb-2 uppercase">New Recipe?</h3>
                    <p className="text-sm text-gray-500 font-medium">Drink Lab에서 더 많은 메뉴를 만들어봐! ✨</p>
                    <button 
                      onClick={() => setState(prev => ({ ...prev, currentView: 'drinkLab' }))}
                      className="mt-4 text-kitsch-pink font-bold underline"
                    >
                      Add More 🧪
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {state.currentView === 'drinkLab' && (
            <motion.div 
              key="drinkLab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <button 
                  onClick={() => setState(prev => ({ ...prev, currentView: 'cafe' }))}
                  className="flex items-center gap-2 text-kitsch-pink font-bold hover:translate-x-[-4px] transition-transform"
                >
                  <ArrowLeft size={20} /> Back to Lounge
                </button>
                <h2 className="text-2xl font-black text-kitsch-blue italic">DRINK LAB 🧪</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card p-8 space-y-6">
                  <h3 className="text-xl font-bold text-kitsch-blue">Mix Your Vibes ✨</h3>
                  <p className="text-sm text-gray-500 font-medium">재료를 선택해서 나만의 sparkly drink를 만들어봐, bestie!</p>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {['Strawberry', 'Melon', 'Blueberry', 'Peach', 'Lemon', 'Glitter', 'Soda', 'Milk', 'Syrup', 'Cherry', 'Mint', 'Chocolate', 'Vanilla', 'Rose'].map(ing => (
                      <button 
                        key={ing}
                        onClick={() => handleAddIngredient(ing)}
                        disabled={ingredients.length >= 3 || isMixing}
                        className="p-3 bg-white/50 rounded-2xl border border-kitsch-blue/20 text-[10px] font-bold text-kitsch-blue hover:bg-kitsch-blue hover:text-white transition-all disabled:opacity-50"
                      >
                        {ing}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400 uppercase">Selected Ingredients ({ingredients.length}/3)</span>
                      <button onClick={() => setIngredients([])} className="text-kitsch-pink"><Trash2 size={16} /></button>
                    </div>
                    <div className="flex gap-2 min-h-[40px]">
                      {ingredients.map((ing, i) => (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          key={i} 
                          className="px-3 py-1 bg-kitsch-blue/10 text-kitsch-blue rounded-full text-xs font-bold border border-kitsch-blue/20"
                        >
                          {ing}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={handleMixDrink}
                    disabled={ingredients.length === 0 || isMixing}
                    className="w-full kitsch-button bg-kitsch-blue border-blue-600 flex items-center justify-center gap-2"
                  >
                    {isMixing ? "Mixing Magic..." : "Mix It Up! 🍹"}
                  </button>
                </div>

                <div className="glass-card p-8 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
                  {isMixing && (
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-20 flex items-center justify-center">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles size={48} className="text-kitsch-blue" />
                      </motion.div>
                    </div>
                  )}

                  {mixedDrink ? (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center space-y-6 w-full"
                    >
                      <div className="w-64 h-64 mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                        <img src={mixedDrink} alt="Mixed Drink" className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex flex-col items-center gap-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Drink Name</label>
                          <input 
                            type="text" 
                            value={newDrinkName}
                            onChange={(e) => setNewDrinkName(e.target.value)}
                            className="w-full bg-white/50 border border-kitsch-blue/20 rounded-xl px-4 py-2 text-center font-black text-kitsch-blue italic focus:outline-none focus:ring-2 focus:ring-kitsch-blue/50 text-xl"
                            placeholder="Enter drink name..."
                          />
                        </div>
                        
                        <div className="flex flex-col items-center gap-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Set Price (¥)</label>
                          <input 
                            type="number" 
                            value={newDrinkPrice}
                            onChange={(e) => setNewDrinkPrice(e.target.value)}
                            className="bg-white/50 border border-kitsch-blue/20 rounded-xl px-4 py-2 text-center font-bold text-kitsch-blue focus:outline-none focus:ring-2 focus:ring-kitsch-blue/50"
                          />
                        </div>

                        <div className="flex gap-2 justify-center">
                          <button 
                            onClick={handleAddToMenu}
                            className="kitsch-button bg-kitsch-purple border-purple-600 flex items-center gap-2 text-xs"
                          >
                            Add to Menu <Check size={16} />
                          </button>
                          <button 
                            onClick={resetDrinkLab}
                            className="px-4 py-2 bg-white/50 text-gray-400 font-bold rounded-full text-xs border border-gray-200"
                          >
                            Discard
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center space-y-4 text-gray-300">
                      <FlaskConical size={64} className="mx-auto opacity-20" />
                      <p className="text-sm font-bold italic">Mix ingredients to see the magic! ✨</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {state.currentView === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <button 
                  onClick={() => setState(prev => ({ ...prev, currentView: 'cafe' }))}
                  className="flex items-center gap-2 text-kitsch-pink font-bold hover:translate-x-[-4px] transition-transform"
                >
                  <ArrowLeft size={20} /> Back to Lounge
                </button>
                <h2 className="text-2xl font-black text-kitsch-pink italic">MINAKO'S WORLD</h2>
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
                    <div className="absolute inset-0 bg-gradient-to-t from-kitsch-purple/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="glass-card p-6 relative overflow-hidden">
                    <div className="absolute -top-2 -right-2 rotate-12">
                      <Star size={40} className="text-kitsch-yellow fill-kitsch-yellow opacity-40" />
                    </div>
                    <h2 className="text-2xl font-bold text-kitsch-pink mb-1">{character.name}</h2>
                    <p className="text-xs font-bold text-kitsch-purple uppercase tracking-widest mb-4">{character.role}</p>
                    <p className="text-sm text-gray-600 italic font-bold leading-relaxed">"{character.bio}"</p>
                  </div>
                </div>

                <div className="md:col-span-2 flex flex-col h-[600px]">
                  <div className="glass-card flex-1 p-6 overflow-y-auto space-y-4 mb-4 scrollbar-hide border-2 border-white/60">
                    {chatHistory.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-2">
                        <Heart size={48} className="opacity-20" />
                        <p className="text-sm font-bold italic">Minako에게 인사해봐! She's waiting for you! ✨</p>
                      </div>
                    )}
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
                  <div className="glass-card p-2 flex gap-2 border-2 border-white/60 shadow-lg">
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
