export interface DishCatalogItem {
  dishId: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  categories: string[];
  allergens: string[];
}

export interface MealSlot {
  mealType: string;
  dishCount: number;
  availableTime?: string;
}

export interface UserProfile {
  age: number;
  gender: string;
  weight: number;
  height: number;
}

export interface MealPreset {
  name: string;
  goal: string;
  diet: string;
  calories: number;
  allergies: string[];
  userProfile: UserProfile;
  dishCatalog: DishCatalogItem[];
  mealSlots: MealSlot[];
}

export const MealPresetKey = {
  KETO_WEIGHT_LOSS: 'keto_weight_loss',
  BALANCED_MAINTAIN: 'balanced_maintain',
  HIGH_PROTEIN_MUSCLE: 'high_protein_muscle',
  LOW_CALORIE: 'low_calorie',
  HIGH_CALORIE: 'high_calorie',
  VEGAN: 'vegan',
  LOW_CARB: 'low_carb'
} as const;

export type MealPresetKey = (typeof MealPresetKey)[keyof typeof MealPresetKey];

export const mealPresets: Record<MealPresetKey, MealPreset> = {
  keto_weight_loss: {
    name: 'Keto Weight Loss',
    goal: 'Giảm cân',
    diet: 'Keto',
    calories: 1800,
    allergies: [],
    userProfile: { age: 30, gender: 'male', weight: 75, height: 175 },
    dishCatalog: [
      {
        dishId: 'dish-001',
        name: 'Ức gà áp chảo',
        calories: 350,
        protein: 45,
        carbs: 8,
        fat: 15,
        categories: ['main-course'],
        allergens: []
      },
      {
        dishId: 'dish-002',
        name: 'Cá hồi áp chảo',
        calories: 450,
        protein: 40,
        carbs: 5,
        fat: 30,
        categories: ['main-course'],
        allergens: ['fish']
      },
      {
        dishId: 'dish-003',
        name: 'Trứng ốp la',
        calories: 380,
        protein: 25,
        carbs: 3,
        fat: 30,
        categories: ['breakfast'],
        allergens: ['eggs']
      }
    ],
    mealSlots: [
      { mealType: 'BREAKFAST', dishCount: 2 },
      { mealType: 'LUNCH', dishCount: 2 },
      { mealType: 'DINNER', dishCount: 2 }
    ]
  },
  balanced_maintain: {
    name: 'Balanced Maintain',
    goal: 'Duy trì cân nặng',
    diet: 'Cân bằng',
    calories: 2000,
    allergies: [],
    userProfile: { age: 28, gender: 'female', weight: 55, height: 162 },
    dishCatalog: [
      {
        dishId: 'dish-101',
        name: 'Cơm gạo lứt ức gà',
        calories: 450,
        protein: 35,
        carbs: 50,
        fat: 12,
        categories: ['main-course'],
        allergens: []
      },
      {
        dishId: 'dish-102',
        name: 'Cá basa kho',
        calories: 380,
        protein: 28,
        carbs: 35,
        fat: 15,
        categories: ['main-course'],
        allergens: ['fish']
      },
      {
        dishId: 'dish-103',
        name: 'Phở gà',
        calories: 420,
        protein: 30,
        carbs: 55,
        fat: 10,
        categories: ['soup'],
        allergens: []
      }
    ],
    mealSlots: [
      { mealType: 'BREAKFAST', dishCount: 2 },
      { mealType: 'LUNCH', dishCount: 2 },
      { mealType: 'DINNER', dishCount: 2 }
    ]
  },
  high_protein_muscle: {
    name: 'High Protein Muscle',
    goal: 'Tăng cơ',
    diet: 'High protein',
    calories: 2500,
    allergies: [],
    userProfile: { age: 25, gender: 'male', weight: 70, height: 175 },
    dishCatalog: [
      {
        dishId: 'dish-201',
        name: 'Ức gà nướng',
        calories: 520,
        protein: 55,
        carbs: 25,
        fat: 18,
        categories: ['main-course'],
        allergens: []
      },
      {
        dishId: 'dish-202',
        name: 'Bò lúc lắc',
        calories: 580,
        protein: 48,
        carbs: 35,
        fat: 28,
        categories: ['main-course'],
        allergens: []
      },
      {
        dishId: 'dish-203',
        name: 'Cá ngừ áp chảo',
        calories: 450,
        protein: 50,
        carbs: 15,
        fat: 20,
        categories: ['main-course'],
        allergens: ['fish']
      }
    ],
    mealSlots: [
      { mealType: 'BREAKFAST', dishCount: 2 },
      { mealType: 'LUNCH', dishCount: 2 },
      { mealType: 'DINNER', dishCount: 2 }
    ]
  },
  low_calorie: {
    name: 'Low Calorie',
    goal: 'Giảm cân',
    diet: 'Low calorie',
    calories: 1200,
    allergies: [],
    userProfile: { age: 35, gender: 'female', weight: 65, height: 160 },
    dishCatalog: [
      {
        dishId: 'dish-301',
        name: 'Salad rau xanh ức gà',
        calories: 180,
        protein: 25,
        carbs: 8,
        fat: 6,
        categories: ['salad'],
        allergens: []
      },
      {
        dishId: 'dish-302',
        name: 'Canh bí đao',
        calories: 120,
        protein: 15,
        carbs: 12,
        fat: 4,
        categories: ['soup'],
        allergens: []
      },
      {
        dishId: 'dish-303',
        name: 'Sinh tố rau chân vịt',
        calories: 180,
        protein: 8,
        carbs: 25,
        fat: 6,
        categories: ['beverage'],
        allergens: []
      }
    ],
    mealSlots: [
      { mealType: 'BREAKFAST', dishCount: 1 },
      { mealType: 'LUNCH', dishCount: 2 },
      { mealType: 'DINNER', dishCount: 1 }
    ]
  },
  high_calorie: {
    name: 'High Calorie',
    goal: 'Tăng cân',
    diet: 'High calorie',
    calories: 3000,
    allergies: [],
    userProfile: { age: 22, gender: 'male', weight: 55, height: 170 },
    dishCatalog: [
      {
        dishId: 'dish-401',
        name: 'Cơm sườn bì chả',
        calories: 680,
        protein: 35,
        carbs: 75,
        fat: 28,
        categories: ['main-course'],
        allergens: []
      },
      {
        dishId: 'dish-402',
        name: 'Mì quảng tôm thịt',
        calories: 580,
        protein: 28,
        carbs: 65,
        fat: 22,
        categories: ['main-course'],
        allergens: ['shellfish']
      },
      {
        dishId: 'dish-403',
        name: 'Chè thập cẩm',
        calories: 420,
        protein: 8,
        carbs: 85,
        fat: 12,
        categories: ['dessert'],
        allergens: ['dairy']
      }
    ],
    mealSlots: [
      { mealType: 'BREAKFAST', dishCount: 2 },
      { mealType: 'LUNCH', dishCount: 2 },
      { mealType: 'DINNER', dishCount: 2 }
    ]
  },
  vegan: {
    name: 'Vegan',
    goal: 'Duy trì sức khỏe',
    diet: 'Vegan',
    calories: 2000,
    allergies: [],
    userProfile: { age: 29, gender: 'female', weight: 54, height: 160 },
    dishCatalog: [
      {
        dishId: 'dish-501',
        name: 'Cơm gạo lứt đậu hũ',
        calories: 420,
        protein: 18,
        carbs: 55,
        fat: 14,
        categories: ['main-course'],
        allergens: ['soy']
      },
      {
        dishId: 'dish-502',
        name: 'Mì quảng chay',
        calories: 380,
        protein: 12,
        carbs: 60,
        fat: 10,
        categories: ['main-course'],
        allergens: []
      },
      {
        dishId: 'dish-503',
        name: 'Salad đậu gà',
        calories: 320,
        protein: 15,
        carbs: 40,
        fat: 12,
        categories: ['salad'],
        allergens: []
      }
    ],
    mealSlots: [
      { mealType: 'BREAKFAST', dishCount: 2 },
      { mealType: 'LUNCH', dishCount: 2 },
      { mealType: 'DINNER', dishCount: 2 }
    ]
  },
  low_carb: {
    name: 'Low Carb',
    goal: 'Giảm cân',
    diet: 'Low carb',
    calories: 1800,
    allergies: [],
    userProfile: { age: 40, gender: 'male', weight: 80, height: 175 },
    dishCatalog: [
      {
        dishId: 'dish-601',
        name: 'Thịt heo quay',
        calories: 480,
        protein: 35,
        carbs: 8,
        fat: 35,
        categories: ['main-course'],
        allergens: []
      },
      {
        dishId: 'dish-602',
        name: 'Tôm càng nướng',
        calories: 380,
        protein: 42,
        carbs: 6,
        fat: 20,
        categories: ['main-course'],
        allergens: ['shellfish']
      },
      {
        dishId: 'dish-603',
        name: 'Rau lang xào',
        calories: 120,
        protein: 4,
        carbs: 18,
        fat: 4,
        categories: ['side-dish'],
        allergens: []
      }
    ],
    mealSlots: [
      { mealType: 'BREAKFAST', dishCount: 2 },
      { mealType: 'LUNCH', dishCount: 2 },
      { mealType: 'DINNER', dishCount: 2 }
    ]
  }
};

export const MealPresetOptions = Object.entries(mealPresets).map(
  ([key, value]) => ({
    value: key,
    label: value.name
  })
);
