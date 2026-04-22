export interface ValidationContext {
  userProfile: {
    allergies: string[];
    diet: string;
    calorieTarget: number;
    goal: string;
  };
  mealSlots: Array<{
    mealType: string;
    calorieTarget: number;
  }>;
  dishCatalog: Array<{
    dishId: string;
    allergens: string[];
    calories: number;
  }>;
}

export interface ValidationRule {
  id: string;
  name: string;
  weight: number;
  check: (
    output: Record<string, unknown>,
    context: ValidationContext
  ) => Promise<ValidationResult>;
}

export interface ValidationResult {
  weight: number;
  score: number;
  message: string;
  details?: Record<string, unknown>;
}

export interface ValidationReport {
  overallScore: number;
  checks: ValidationResult[];
}
