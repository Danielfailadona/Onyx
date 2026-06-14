export const CUISINES = [
  'Italian', 'Japanese', 'Steakhouse', 'Fast Food',
  'Desserts', 'Healthy', 'Filipino', 'Asian',
];

export const CUISINE_EMOJIS: Record<string, string> = {
  Italian: '🍝',
  Japanese: '🍣',
  Steakhouse: '🥩',
  'Fast Food': '🍔',
  Desserts: '🍰',
  Healthy: '🥗',
  Filipino: '🍲',
  Asian: '🥟',
};

export const CATEGORIES = [
  'Starters', 'Mains', 'Seafood', 'Pasta', 'Desserts', 'Drinks',
];

export const CAT_EMOJI: Record<string, string> = {
  Starters: '🥗',
  Mains: '🍖',
  Seafood: '🦐',
  Pasta: '🍝',
  Desserts: '🍰',
  Drinks: '🍸',
};

export interface Company {
  id: string;
  name: string;
  owner: string;
  email: string;
  cuisines: string[];
  description: string;
  isDemo?: boolean;
  rating?: number;
  itemCount?: number;
}

export interface MenuItem {
  id: string;
  company: string;
  companyName: string;
  name: string;
  price: number;
  category: string;
  emoji: string;
  description: string;
  tags: string[];
  rating: number;
  isDemo?: boolean;
}

export const DEMO_COMPANIES: Company[] = [
  { id: 'demo1', name: 'Noir & Ember', owner: 'Marco Reyes', email: 'marco@noir.com', cuisines: ['Steakhouse'], description: 'Premium steakhouse and fine dining. Where every cut tells a story of craftsmanship and passion.', rating: 4.8, itemCount: 4 },
  { id: 'demo2', name: 'Sakura Omakase', owner: 'Yuki Tanaka', email: 'yuki@sakura.com', cuisines: ['Japanese'], description: 'Authentic Japanese omakase experience. Traditional flavors reimagined with modern precision.', rating: 4.9, itemCount: 2 },
  { id: 'demo3', name: 'Verde Kitchen', owner: 'Ana Santos', email: 'ana@verde.com', cuisines: ['Healthy'], description: 'Fresh and vibrant healthy bowls. Nourishing meals crafted from the finest local produce.', rating: 4.6, itemCount: 2 },
  { id: 'demo4', name: 'La Dolce Vita', owner: 'Luca Ferraro', email: 'luca@dolce.com', cuisines: ['Italian'], description: 'Authentic Italian pasta and desserts. A taste of tradition in every bite.', rating: 4.7, itemCount: 2 },
  { id: 'demo5', name: 'Bistro 88', owner: 'Paolo Cruz', email: 'paolo@bistro88.com', cuisines: ['Fast Food', 'Desserts'], description: 'Modern bistro with comfort classics. Where familiar flavors meet contemporary flair.', rating: 4.5, itemCount: 2 },
];

export const DEMO_ITEMS: MenuItem[] = [
  { id: 'd1', company: 'demo1', companyName: 'Noir & Ember', name: 'Wagyu Beef Tenderloin', price: 2850, category: 'Mains', emoji: '🥩', description: 'Prime 8oz wagyu, truffle mash, seasonal vegetables, red wine jus.', tags: ['popular'], rating: 4.9 },
  { id: 'd2', company: 'demo1', companyName: 'Noir & Ember', name: 'Grand Seafood Platter', price: 3200, category: 'Seafood', emoji: '🦐', description: 'Fresh oysters, lobster tail, prawns, crab claws, dipping sauces.', tags: ['new'], rating: 4.7 },
  { id: 'd3', company: 'demo1', companyName: 'Noir & Ember', name: 'Burrata & Heirloom Tomato', price: 620, category: 'Starters', emoji: '🧀', description: 'Creamy burrata, heirloom tomatoes, basil, aged balsamic.', tags: [], rating: 4.5 },
  { id: 'd4', company: 'demo1', companyName: 'Noir & Ember', name: 'Chocolate Lava Cake', price: 420, category: 'Desserts', emoji: '🍫', description: 'Warm dark chocolate cake, vanilla bean ice cream, gold leaf.', tags: ['popular'], rating: 4.8 },
  { id: 'd5', company: 'demo2', companyName: 'Sakura Omakase', name: 'Signature Omakase Roll', price: 1100, category: 'Starters', emoji: '🍣', description: 'Premium tuna, salmon, yellowtail, avocado, chef special sauce.', tags: ['popular', 'new'], rating: 5.0 },
  { id: 'd6', company: 'demo2', companyName: 'Sakura Omakase', name: 'Miso-Glazed Sea Bass', price: 1850, category: 'Mains', emoji: '🐟', description: 'Miso-marinated sea bass, bok choy, sesame rice, yuzu dressing.', tags: ['new'], rating: 4.8 },
  { id: 'd7', company: 'demo3', companyName: 'Verde Kitchen', name: 'Beetroot & Goat Cheese', price: 580, category: 'Starters', emoji: '🥗', description: 'Roasted beetroot, goat cheese mousse, candied walnuts, herb oil.', tags: ['veg'], rating: 4.5 },
  { id: 'd8', company: 'demo3', companyName: 'Verde Kitchen', name: 'Mango Panna Cotta', price: 360, category: 'Desserts', emoji: '🥭', description: 'Silky panna cotta, fresh mango coulis, coconut tuile.', tags: ['new', 'veg'], rating: 4.6 },
  { id: 'd9', company: 'demo4', companyName: 'La Dolce Vita', name: 'Truffle Wild Mushroom Pasta', price: 980, category: 'Pasta', emoji: '🍝', description: 'Handmade fettuccine, wild mushrooms, truffle cream, parmesan.', tags: ['veg'], rating: 4.7 },
  { id: 'd10', company: 'demo4', companyName: 'La Dolce Vita', name: 'Lobster Mac & Cheese', price: 1200, category: 'Pasta', emoji: '🦞', description: 'Lobster, three-cheese blend, cavatappi, herb breadcrumb.', tags: ['popular'], rating: 4.8 },
  { id: 'd11', company: 'demo5', companyName: 'Bistro 88', name: 'Wagyu Beef Sliders', price: 680, category: 'Starters', emoji: '🍔', description: 'Mini wagyu patties, caramelized onions, aged cheddar, brioche buns.', tags: ['popular'], rating: 4.6 },
  { id: 'd12', company: 'demo5', companyName: 'Bistro 88', name: 'Noir Signature Cocktail', price: 480, category: 'Drinks', emoji: '🍸', description: 'Vodka, blackberry liqueur, fresh lime, mint, soda.', tags: [], rating: 4.4 },
];
