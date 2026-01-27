export const ALLERGEN = {
  // Common Food Allergens (FDA Top 9)
  MILK: 'milk',
  EGGS: 'eggs',
  FISH: 'fish',
  SHELLFISH: 'shellfish',
  TREE_NUTS: 'tree_nuts',
  PEANUTS: 'peanuts',
  WHEAT: 'wheat',
  SOYBEANS: 'soybeans',
  SESAME: 'sesame',
  
  // EU Allergens
  MUSTARD: 'mustard',
  CELERY: 'celery',
  LUPIN: 'lupin',
  MOLLUSCS: 'molluscs',
  SULFITES: 'sulfites',
  
  // Gluten-related
  GLUTEN: 'gluten',
  BARLEY: 'barley',
  RYE: 'rye',
  
  // Specific Shellfish & Seafood
  SHRIMP: 'shrimp',
  CRAB: 'crab',
  LOBSTER: 'lobster',
  SQUID: 'squid',
  OYSTER: 'oyster',
  CLAM: 'clam',
  
  // Specific Tree Nuts
  ALMOND: 'almond',
  CASHEW: 'cashew',
  WALNUT: 'walnut',
  PECAN: 'pecan',
  PISTACHIO: 'pistachio',
  HAZELNUT: 'hazelnut',
  MACADAMIA: 'macadamia',
  BRAZIL_NUT: 'brazil_nut',
  
  // Fruits
  KIWI: 'kiwi',
  BANANA: 'banana',
  AVOCADO: 'avocado',
  STRAWBERRY: 'strawberry',
  PEACH: 'peach',
  MANGO: 'mango',
  
  // Other Common Allergens
  LACTOSE: 'lactose',
  CORN: 'corn',
  COCONUT: 'coconut',
  GARLIC: 'garlic',
  ONION: 'onion',
  TOMATO: 'tomato',
  CHOCOLATE: 'chocolate',
  COFFEE: 'coffee'
} as const;

export type Allergen = (typeof ALLERGEN)[keyof typeof ALLERGEN];
