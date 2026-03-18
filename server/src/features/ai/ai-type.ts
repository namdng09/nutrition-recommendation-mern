export interface IInputGenerateMeal {
  gender?: string;
  age?: number;
  height?: number;
  weight?: number;
  targetWeight?: number;
  fitnessGoal?: string;
  diet?: string;
  activityLevel?: string;
  bodyfat?: string;
  allergens?: string[];
  medicalHistory?: string[];
  caloriesTarget?: number;
  macroTargets?: {
    carbs?: { min?: number; max?: number };
    protein?: { min?: number; max?: number };
    fat?: { min?: number; max?: number };
  };
}

export interface IInputGenerateWorkout {
  gender?: string;
  age?: number;
  height?: number;
  weight?: number;
  targetWeight?: number;
  fitnessGoal?: string;
  activityLevel?: string;
  bodyfat?: string;
  medicalHistory?: string[];
}

export interface IMealSlotPromptInput {
  mealType: string;
  mealSettingName: string;
  dishCount: number;
  preferredTypes: string[];
  mealSize?: string;
  cookingPreference?: string;
  availableTime?: string;
  complexity?: string;
  dishCategories: string[];
}

export interface IDishCatalogPromptInput {
  id: string;
  name: string;
  categories: string[];
  nutritionFocus: string[];
  tags: string[];
  totalTimeMinutes: number;
  defaultServings: number;
  blockedByAllergen: boolean;
  nutrients: Array<{
    label: string;
    unit: string;
    value: number;
  }>;
  suggestedMealTypes: string[];
}

export interface IExerciseCatalogPromptInput {
  id: string;
  name: string;
  difficulty: string;
  type: string;
  logType: string;
  muscles: string[];
  equipments: string[];
}
