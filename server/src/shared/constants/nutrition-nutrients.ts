export const NUTRIENTS = {
  NANG_LUONG: 'Năng lượng',
  NUOC: 'Nước',
  PROTEIN: 'Protein',
  CHAT_BEO: 'Chất béo',
  TINH_BOT: 'Tinh bột',
  CHAT_XO: 'Chất xơ',
  TRO: 'Tro',
  DUONG: 'Đường',
  CHOLESTEROL: 'Cholesterol',
  PHYTOSTEROL: 'Phytosterol'
} as const;

export type Nutrients = (typeof NUTRIENTS)[keyof typeof NUTRIENTS];
