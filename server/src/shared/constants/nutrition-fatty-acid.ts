export const NUTRITION_FATTY_ACID = {
  TOTAL_OMEGA_3: 'Total omega 3',
  TOTAL_OMEGA_6: 'Total omega 6',
  ALPHA_LINOLENIC_ACID_ALA: 'Alpha Linolenic Acid (ALA)',
  DOCOSAHEXAENOIC_ACID_DHA: 'Docosahexaenoic Acid (DHA)',
  EICOSAPENTAENOIC_ACID_EPA: 'Eicosapentaenoic Acid (EPA)',
  DOCOSAPENTAENOIC_ACID_DPA: 'Docosapentaenoic Acid (DPA)'
} as const;

export type NutritionFattyAcid =
  (typeof NUTRITION_FATTY_ACID)[keyof typeof NUTRITION_FATTY_ACID];
