export const DEMO_COMPANIES = [
  { id:'demo1', name:'Noir & Ember',   owner:'Marco Reyes',  email:'marco@noirembar.ph',  cuisines:['Steakhouse'],         desc:'Premium steakhouse and fine dining.' },
  { id:'demo2', name:'Sakura Omakase', owner:'Yuki Tanaka',  email:'yuki@sakura.ph',      cuisines:['Japanese'],           desc:'Authentic Japanese omakase experience.' },
  { id:'demo3', name:'Verde Kitchen',  owner:'Ana Santos',   email:'ana@verde.ph',        cuisines:['Healthy'],            desc:'Fresh and vibrant healthy bowls.' },
  { id:'demo4', name:'La Dolce Vita',  owner:'Luca Ferraro', email:'luca@ladolce.ph',     cuisines:['Italian'],            desc:'Authentic Italian pasta and desserts.' },
  { id:'demo5', name:'Bistro 88',      owner:'Paolo Cruz',   email:'paolo@bistro88.ph',   cuisines:['Fast Food','Desserts'],desc:'Modern bistro with comfort classics.' },
];

export const DEMO_ITEMS = [
  { id:'di1',  companyId:'demo1', companyName:'Noir & Ember',   name:'Wagyu Beef Tenderloin',       price:2850, category:'Mains',    emoji:'🥩', desc:'A5 Wagyu, truffle jus, pomme purée.',    tags:['popular'], rating:5.0, orders:128, createdAt:1 },
  { id:'di2',  companyId:'demo1', companyName:'Noir & Ember',   name:'Grand Seafood Platter',       price:3200, category:'Seafood',  emoji:'🦞', desc:'Half lobster, king prawns, oysters.',    tags:['new'],     rating:4.9, orders:96,  createdAt:2 },
  { id:'di3',  companyId:'demo1', companyName:'Noir & Ember',   name:'Burrata & Heirloom Tomato',   price:620,  category:'Starters', emoji:'🥗', desc:'Fresh burrata, heirloom tomatoes.',      tags:[],          rating:4.5, orders:44,  createdAt:3 },
  { id:'di4',  companyId:'demo1', companyName:'Noir & Ember',   name:'Chocolate Lava Cake',         price:420,  category:'Desserts', emoji:'🍮', desc:'Valrhona dark chocolate, molten center.',tags:['popular'], rating:4.9, orders:341, createdAt:4 },
  { id:'di5',  companyId:'demo2', companyName:'Sakura Omakase', name:'Signature Omakase Roll',      price:1100, category:'Mains',    emoji:'🍣', desc:"Chef's rotating weekly creation.",        tags:['popular','new'], rating:4.9, orders:214, createdAt:5 },
  { id:'di6',  companyId:'demo2', companyName:'Sakura Omakase', name:'Miso-Glazed Sea Bass',        price:1850, category:'Seafood',  emoji:'🐟', desc:'Chilean sea bass, dashi broth.',         tags:['new'],     rating:4.8, orders:73,  createdAt:6 },
  { id:'di7',  companyId:'demo3', companyName:'Verde Kitchen',  name:'Beetroot & Goat Cheese',      price:580,  category:'Starters', emoji:'🥗', desc:'Roasted golden beetroot, walnuts.',      tags:['veg'],     rating:4.6, orders:52,  createdAt:7 },
  { id:'di8',  companyId:'demo3', companyName:'Verde Kitchen',  name:'Mango Panna Cotta',           price:360,  category:'Desserts', emoji:'🍮', desc:'Silky coconut panna cotta, mango.',      tags:['new','veg'],rating:4.6,orders:38,  createdAt:8 },
  { id:'di9',  companyId:'demo4', companyName:'La Dolce Vita',  name:'Truffle Wild Mushroom Pasta', price:980,  category:'Pasta',    emoji:'🍝', desc:'Hand-rolled pappardelle, black truffle.',tags:['veg'],     rating:4.7, orders:87,  createdAt:9 },
  { id:'di10', companyId:'demo4', companyName:'La Dolce Vita',  name:'Lobster Mac & Cheese',        price:1200, category:'Pasta',    emoji:'🍝', desc:'Butter-poached lobster in five-cheese.', tags:['popular'], rating:4.8, orders:99,  createdAt:10 },
  { id:'di11', companyId:'demo5', companyName:'Bistro 88',      name:'Wagyu Beef Sliders',          price:680,  category:'Starters', emoji:'🍔', desc:'Mini brioche buns, truffle aioli.',      tags:['popular'], rating:4.9, orders:189, createdAt:11 },
  { id:'di12', companyId:'demo5', companyName:'Bistro 88',      name:'Noir Signature Cocktail',     price:480,  category:'Drinks',   emoji:'🥂', desc:'Aged bourbon, black cherry, smoked.',    tags:[],          rating:4.8, orders:77,  createdAt:12 },
];

export const CUISINES = ['Italian','Japanese','Steakhouse','Fast Food','Desserts','Healthy','Filipino','Asian'];
export const CUISINE_EMOJIS = { Italian:'🍕', Japanese:'🍣', Steakhouse:'🥩', 'Fast Food':'🍔', Desserts:'🍮', Healthy:'🥗', Filipino:'🥘', Asian:'🍜' };
export const CATEGORIES = ['Starters','Mains','Seafood','Pasta','Desserts','Drinks'];
export const CAT_EMOJI  = { Starters:'🥗', Mains:'🍽', Seafood:'🦞', Pasta:'🍝', Desserts:'🍮', Drinks:'🥂' };
