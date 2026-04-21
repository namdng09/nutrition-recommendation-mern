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
  type: 'hard' | 'soft';
  weight?: number;
  check: (
    output: Record<string, unknown>,
    context: ValidationContext
  ) => Promise<ValidationResult>;
}

export interface ValidationResult {
  type: 'hard' | 'soft';
  weight?: number;
  passed: boolean;
  score: number;
  message: string;
  details?: Record<string, unknown>;
}

export interface ValidationReport {
  overall_score: number;
  hard_checks: ValidationResult[];
  soft_checks: ValidationResult[];
  passed: boolean;
}
