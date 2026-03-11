export const ACHIEVEMENT_CATEGORY = {
  FULL_CIRCLE: 'full_circle',
  DIVERSE_PALATE: 'diverse_palate',
  SOCIAL: 'social',
  TARGET: 'target',
  GROCERY: 'grocery'
} as const;

export type AchievementCategory =
  (typeof ACHIEVEMENT_CATEGORY)[keyof typeof ACHIEVEMENT_CATEGORY];

export type AchievementDefinition = {
  key: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
};

export const ACHIEVEMENTS = {
  // Full Circle — Ecosystem Mastery
  THE_PLANNER: {
    key: 'THE_PLANNER',
    name: 'The Planner',
    description:
      'Successfully complete 5 "Full Cycles" (Schedule → Grocery → Complete).',
    category: ACHIEVEMENT_CATEGORY.FULL_CIRCLE,
    icon: ''
  },
  THE_DISCIPLINED: {
    key: 'THE_DISCIPLINED',
    name: 'The Disciplined',
    description: 'Successfully complete 20 "Full Cycles".',
    category: ACHIEVEMENT_CATEGORY.FULL_CIRCLE,
    icon: ''
  },
  LIFESTYLE_ARCHITECT: {
    key: 'LIFESTYLE_ARCHITECT',
    name: 'Lifestyle Architect',
    description: 'Successfully complete 50 "Full Cycles".',
    category: ACHIEVEMENT_CATEGORY.FULL_CIRCLE,
    icon: ''
  },

  // Diverse Palate — Nutritional Exploration
  INGREDIENT_EXPLORER: {
    key: 'INGREDIENT_EXPLORER',
    name: 'Ingredient Explorer',
    description: 'Use 20 unique ingredients across all logged meals.',
    category: ACHIEVEMENT_CATEGORY.DIVERSE_PALATE,
    icon: ''
  },
  VARIETY_SEEKER: {
    key: 'VARIETY_SEEKER',
    name: 'Variety Seeker',
    description:
      'Log meals from 5 different dish categories (e.g., Vegan, Keto).',
    category: ACHIEVEMENT_CATEGORY.DIVERSE_PALATE,
    icon: ''
  },
  NUTRITIONAL_POLYMATH: {
    key: 'NUTRITIONAL_POLYMATH',
    name: 'Nutritional Polymath',
    description: 'Use 50 unique ingredients across all logged meals.',
    category: ACHIEVEMENT_CATEGORY.DIVERSE_PALATE,
    icon: ''
  },

  // Social Catalyst — Community Influence
  SPARK_OF_INTEREST: {
    key: 'SPARK_OF_INTEREST',
    name: 'Spark of Interest',
    description: 'Your posts receive a total of 50 likes.',
    category: ACHIEVEMENT_CATEGORY.SOCIAL,
    icon: ''
  },
  HELPFUL_PEER: {
    key: 'HELPFUL_PEER',
    name: 'Helpful Peer',
    description: "Your comments on others' posts receive a total of 10 likes.",
    category: ACHIEVEMENT_CATEGORY.SOCIAL,
    icon: ''
  },
  COMMUNITY_BEACON: {
    key: 'COMMUNITY_BEACON',
    name: 'Community Beacon',
    description: 'Your posts receive a total of 200 likes and 50 comments.',
    category: ACHIEVEMENT_CATEGORY.SOCIAL,
    icon: ''
  },

  // Target Specialist — Goal Adherence
  ON_THE_MARK: {
    key: 'ON_THE_MARK',
    name: 'On the Mark',
    description: 'Hit your target macro/calorie range for 7 total days.',
    category: ACHIEVEMENT_CATEGORY.TARGET,
    icon: ''
  },
  PHASE_MASTER: {
    key: 'PHASE_MASTER',
    name: 'Phase Master',
    description: 'Hit your target macro/calorie range for 30 total days.',
    category: ACHIEVEMENT_CATEGORY.TARGET,
    icon: ''
  },
  UNYIELDING_PROGRESS: {
    key: 'UNYIELDING_PROGRESS',
    name: 'Unyielding Progress',
    description: 'Maintain a 14-day streak of hitting your nutrition target.',
    category: ACHIEVEMENT_CATEGORY.TARGET,
    icon: ''
  },

  // Grocery Guru — Kitchen Efficiency
  KITCHEN_MANAGER: {
    key: 'KITCHEN_MANAGER',
    name: 'Kitchen Manager',
    description: 'Successfully clear/complete 10 full grocery lists.',
    category: ACHIEVEMENT_CATEGORY.GROCERY,
    icon: ''
  },
  BULK_ORGANIZER: {
    key: 'BULK_ORGANIZER',
    name: 'Bulk Organizer',
    description:
      'Add and check off a total of 100 items in the grocery module.',
    category: ACHIEVEMENT_CATEGORY.GROCERY,
    icon: ''
  }
} as const satisfies Record<string, AchievementDefinition>;
