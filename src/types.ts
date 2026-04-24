export interface Dessert {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: string;
  tags: string[];
  likes: number;
  comments: { user: string; text: string }[];
}

export interface Ingredient {
  name: string;
  type: 'fruit' | 'flower' | 'topping';
  growthTime: number; // in seconds
  lastHarvested?: number;
}

export interface Quest {
  id: string;
  title: string;
  goal: number;
  current: number;
  reward: number;
  isCompleted: boolean;
}

export interface Character {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
}

export interface FeedItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: string;
  likes: number;
  comments: { user: string; text: string }[];
  background: string;
  author: string;
}

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  icon: string;
  type: 'ingredient' | 'decoration' | 'sticker';
}

export interface CafeState {
  currentView: 'opening' | 'login' | 'cafe' | 'menu' | 'profile' | 'drinkLab' | 'garden' | 'delivery' | 'feed' | 'gallery';
  selectedDessert: Dessert | null;
  menuItems: Dessert[];
  feedItems: FeedItem[];
  gallery: Dessert[];
  coins: number;
  inventory: Record<string, number>;
  userName: string;
  hasEntered: boolean;
  level: number;
  exp: number;
  affection: number;
  cafeImage: string;
  settings: {
    musicVolume: number;
    fontSize: 'sm' | 'md' | 'lg';
    sfxEnabled: boolean;
  };
  quests: Quest[];
}
