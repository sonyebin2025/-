export interface Dessert {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: string;
  tags: string[];
}

export interface Character {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  style: string;
}

export interface CafeState {
  currentView: 'cafe' | 'menu' | 'profile' | 'drinkLab';
  selectedDessert: Dessert | null;
  menuItems: Dessert[];
}
