export const NUTRITION_AMINO_ACID = {
  ALANINE: 'Alanine',
  ARGININE: 'Arginine',
  ASPARTIC_ACID: 'Aspartic acid',
  CYSTINE: 'Cystine',
  GLUTAMIC_ACID: 'Glutamic acid',
  GLYCINE: 'Glycine',
  HISTIDINE: 'Histidine',
  HYDROXYPROLINE: 'Hydroxyproline',
  ISOLEUCINE: 'Isoleucine',
  LEUCINE: 'Leucine',
  LYSINE: 'Lysine',
  METHIONINE: 'Methionine',
  PHENYLALANINE: 'Phenylalanine',
  PROLINE: 'Proline',
  SERINE: 'Serine',
  THREONINE: 'Threonine',
  TRYPTOPHAN: 'Tryptophan',
  TYROSINE: 'Tyrosine',
  VALINE: 'Valine'
} as const;

export type NutritionAminoAcid =
  (typeof NUTRITION_AMINO_ACID)[keyof typeof NUTRITION_AMINO_ACID];
