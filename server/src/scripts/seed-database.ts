import dotenv from 'dotenv';
import mongoose, { type Types } from 'mongoose';

import { connectDB } from '~/shared/config/database';
import { ACTIVITY_LEVEL } from '~/shared/constants/activity-level';
import { ALLERGEN } from '~/shared/constants/allergen';
import { AVAILABLE_TIME } from '~/shared/constants/available-time';
import { BODYFAT } from '~/shared/constants/bodyfat';
import { COOKING_PREFERENCE } from '~/shared/constants/cooking-preference';
import { DAY_OF_WEEK } from '~/shared/constants/day-of-week';
import { DIET } from '~/shared/constants/diet';
import { DISH_CATEGORY } from '~/shared/constants/dish-category';
import { EXERCISE_DIFFICULTY } from '~/shared/constants/exercise-difficulty';
import {
  EXERCISE_EQUIPMENT_BY_NAME,
  EXERCISE_EQUIPMENT_NAMES
} from '~/shared/constants/exercise-equipments';
import {
  EXERCISE_MUSCLE_BY_NAME,
  EXERCISE_MUSCLE_NAMES
} from '~/shared/constants/exercise-muscles';
import { EXERCISE_TYPE } from '~/shared/constants/exercise-type';
import { FEEDBACK_TYPE } from '~/shared/constants/feedback-type';
import { GENDER } from '~/shared/constants/gender';
import { INGREDIENT_CATEGORY } from '~/shared/constants/ingredient-category';
import { MEAL_COMPLEXITY } from '~/shared/constants/meal-complexity';
import { MEAL_SIZE } from '~/shared/constants/meal-size';
import { MEAL_TYPE } from '~/shared/constants/meal-type';
import { MEMBERSHIP_LEVEL } from '~/shared/constants/membership-level';
import { NUTRITION_FOCUS } from '~/shared/constants/nutrition-focus';
import { NUTRITION_MINERAL } from '~/shared/constants/nutrition-minerals';
import { NUTRIENTS } from '~/shared/constants/nutrition-nutrients';
import { NUTRITION_VITAMIN } from '~/shared/constants/nutrition-vitamin';
import { POST_CATEGORY } from '~/shared/constants/post-category';
import { ROLE } from '~/shared/constants/role';
import { UNIT } from '~/shared/constants/unit';
import { USER_TARGET } from '~/shared/constants/user-target';
import {
  WORKOUT_COUNTER_TYPE,
  WORKOUT_DISTANCE_UNIT
} from '~/shared/constants/workout-counter-type';
import {
  AuthModel,
  CollectionModel,
  DishModel,
  ExerciseModel,
  FeedbackModel,
  GroceryModel,
  IngredientModel,
  PaymentModel,
  PostModel,
  ScheduleModel,
  UserModel
} from '~/shared/database/models';
import { hashPassword } from '~/shared/utils/bcrypt';

dotenv.config();

const SEED_CONFIG = {
  users: 24,
  ingredients: 50,
  exercises: 18,
  dishes: 36,
  posts: 24,
  collections: 10,
  schedulesPerUser: 2,
  groceries: 18,
  feedbacks: 20,
  payments: 12
} as const;

const DAY_VALUES = Object.values(DAY_OF_WEEK);
const GENDER_VALUES = Object.values(GENDER);
const ACTIVITY_LEVEL_VALUES = Object.values(ACTIVITY_LEVEL);
const BODYFAT_VALUES = Object.values(BODYFAT);
const DIET_VALUES = Object.values(DIET);
const AVAILABLE_TIME_VALUES = Object.values(AVAILABLE_TIME);
const COOKING_PREFERENCE_VALUES = Object.values(COOKING_PREFERENCE);
const MEAL_COMPLEXITY_VALUES = Object.values(MEAL_COMPLEXITY);
const MEAL_SIZE_VALUES = Object.values(MEAL_SIZE);
const MEAL_TYPE_VALUES = Object.values(MEAL_TYPE);
const DISH_CATEGORY_VALUES = Object.values(DISH_CATEGORY);
const NUTRITION_FOCUS_VALUES = Object.values(NUTRITION_FOCUS);
const NUTRIENT_VALUES = Object.values(NUTRIENTS);
const NUTRITION_MINERAL_VALUES = Object.values(NUTRITION_MINERAL);
const NUTRITION_VITAMIN_VALUES = Object.values(NUTRITION_VITAMIN);
const EXERCISE_DIFFICULTY_VALUES = Object.values(EXERCISE_DIFFICULTY);
const EXERCISE_TYPE_VALUES = Object.values(EXERCISE_TYPE);
const WORKOUT_LOG_TYPE_VALUES = Object.values(WORKOUT_COUNTER_TYPE);
const POST_CATEGORY_VALUES = Object.values(POST_CATEGORY);
const FEEDBACK_TYPE_VALUES = Object.values(FEEDBACK_TYPE);
const INGREDIENT_CATEGORY_VALUES = Object.values(INGREDIENT_CATEGORY);
const ALLERGEN_VALUES = Object.values(ALLERGEN);
const MEMBERSHIP_VALUES = Object.values(MEMBERSHIP_LEVEL);
const USER_TARGET_VALUES = Object.values(USER_TARGET);

const INGREDIENT_BASE_NAMES = [
  'Chicken Breast',
  'Broccoli',
  'Carrot',
  'Brown Rice',
  'Spinach',
  'Tofu',
  'Salmon',
  'Greek Yogurt',
  'Tomato',
  'Sweet Potato',
  'Avocado',
  'Egg',
  'Lentil',
  'Almond',
  'Oat',
  'Mushroom',
  'Bell Pepper',
  'Cucumber',
  'Apple',
  'Banana'
] as const;

const DISH_ADJECTIVES = [
  'Balanced',
  'Lean',
  'Power',
  'Fresh',
  'Active',
  'Fit',
  'Smart',
  'Vital',
  'Strong',
  'Daily'
] as const;

const DISH_NOUNS = [
  'Bowl',
  'Plate',
  'Salad',
  'Soup',
  'Meal',
  'Wrap',
  'Stir Fry',
  'Mix',
  'Combo',
  'Set'
] as const;

const EXERCISE_BASE_NAMES = [
  'Push Up',
  'Squat',
  'Plank',
  'Lunge',
  'Mountain Climber',
  'Deadlift',
  'Bench Press',
  'Row',
  'Burpee',
  'Jumping Jack'
] as const;

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pickOne = <T>(arr: T[]): T => arr[randomInt(0, arr.length - 1)] as T;

const pickMany = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.max(1, Math.min(count, arr.length)));
};

const energyFromIngredientCount = (count: number) => 180 + count * 35;

const datePlusDays = (base: Date, days: number) => {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
};

const resolveDayOfWeek = (date: Date) => {
  const jsDay = date.getDay();
  if (jsDay === 0) return DAY_OF_WEEK.SUNDAY;
  return DAY_VALUES[jsDay - 1] ?? DAY_OF_WEEK.MONDAY;
};

const buildNutritionProfile = () => ({
  nutrients: [
    {
      label: NUTRIENTS.NANG_LUONG,
      value: randomInt(80, 420),
      unit: UNIT.KILOCALORIE
    },
    {
      label: NUTRIENTS.PROTEIN,
      value: randomInt(4, 35),
      unit: UNIT.GRAM
    },
    {
      label: NUTRIENTS.CHAT_BEO,
      value: randomInt(1, 20),
      unit: UNIT.GRAM
    },
    {
      label: NUTRIENTS.TINH_BOT,
      value: randomInt(5, 45),
      unit: UNIT.GRAM
    },
    {
      label: pickOne(NUTRIENT_VALUES),
      value: randomInt(1, 15),
      unit: UNIT.GRAM
    }
  ],
  minerals: pickMany(NUTRITION_MINERAL_VALUES, 3).map(label => ({
    label,
    value: randomInt(1, 300),
    unit: UNIT.MILLIGRAM
  })),
  vitamins: pickMany(NUTRITION_VITAMIN_VALUES, 3).map(label => ({
    label,
    value: randomInt(10, 800),
    unit: UNIT.MICROGRAM
  }))
});

const createUsers = async () => {
  const usersPayload = Array.from({ length: SEED_CONFIG.users }, (_, index) => {
    const now = new Date();
    const membershipLevel = pickOne(MEMBERSHIP_VALUES);
    const membershipExpiresAt =
      membershipLevel === MEMBERSHIP_LEVEL.VIP
        ? datePlusDays(now, randomInt(30, 365))
        : datePlusDays(now, randomInt(-30, 30));

    const dailyLimit = randomInt(150, 350);
    const currentTokens = randomInt(0, dailyLimit);
    const aiQuotaResetAt = datePlusDays(now, 1);
    aiQuotaResetAt.setHours(0, 0, 0, 0);

    const role =
      index < 2 ? ROLE.ADMIN : index < 8 ? ROLE.NUTRITIONIST : ROLE.USER;

    const userDoc: Record<string, unknown> = {
      email: `seed.user.${index + 1}@example.local`,
      name: `Seed User ${index + 1}`,
      avatar: `https://api.dicebear.com/9.x/initials/svg?seed=user-${index + 1}`,
      gender: pickOne(GENDER_VALUES),
      role,
      dob: datePlusDays(
        new Date('1994-01-01T00:00:00.000Z'),
        randomInt(0, 7000)
      ),
      membershipLevel,
      membershipExpiresAt,
      aiTokens: currentTokens,
      aiDailyTokenLimit: dailyLimit,
      aiQuotaResetAt,
      height: randomInt(150, 190),
      bodyfat: pickOne(BODYFAT_VALUES),
      diet: pickOne(DIET_VALUES),
      nutritionTarget: {
        caloriesTarget: randomInt(1600, 2800),
        macros: {
          carbs: { min: 90, max: 220 },
          protein: { min: 70, max: 160 },
          fat: { min: 40, max: 90 }
        },
        recommendationMeta: {
          source: 'seed-script',
          version: 'v1'
        }
      },
      mealSettings: [
        {
          name: 'Plan sang',
          mealSize: pickOne(MEAL_SIZE_VALUES),
          preferredTypes: pickMany(
            MEAL_TYPE_VALUES.filter(type => type !== MEAL_TYPE.ALL),
            2
          ),
          cookingPreference: pickOne(COOKING_PREFERENCE_VALUES),
          availableTime: pickOne(AVAILABLE_TIME_VALUES),
          complexity: pickOne(MEAL_COMPLEXITY_VALUES),
          dishCategories: pickMany(DISH_CATEGORY_VALUES, 2),
          ruleOverrides: {
            avoidFriedFood: Math.random() > 0.5
          }
        }
      ],
      favoriteDishes: [],
      favoriteIngredients: [],
      favoriteCollections: [],
      blockDishes: [],
      blockIngredients: [],
      weightRecord: [
        {
          weight: randomInt(50, 85),
          date: datePlusDays(now, -14)
        },
        {
          weight: randomInt(50, 85),
          date: datePlusDays(now, -1)
        }
      ],
      hasOnboarded: true,
      isActive: true,
      allergens: pickMany(ALLERGEN_VALUES, randomInt(1, 2)),
      activityLevel: pickOne(ACTIVITY_LEVEL_VALUES),
      medicalHistory: ['none'],
      achievements: [
        {
          key: 'onboarding_completed',
          unlockedAt: datePlusDays(now, -7)
        }
      ],
      setting: {
        locale: 'vi-VN',
        notifications: true
      },
      aiConfig: {
        preferredStyle: 'balanced'
      },
      goal: {
        target: pickOne(USER_TARGET_VALUES),
        weightGoal: randomInt(52, 82),
        targetWeightChange: randomInt(0, 4)
      }
    };

    if (role === ROLE.NUTRITIONIST) {
      userDoc.certificate = {
        fileUrl: `https://files.example.local/cert-${index + 1}.pdf`,
        publicId: `seed-cert-${index + 1}`,
        name: `Nutrition Certificate ${index + 1}`,
        showCertificate: true
      };
      userDoc.nutritionistProfile = {
        workplace: `Health Center ${index + 1}`,
        graduatedUniversity: `Nutrition University ${index + 1}`,
        professionalBio: 'Experienced in personalized meal planning.'
      };
    }

    return userDoc;
  });

  const users = await UserModel.insertMany(usersPayload, { ordered: true });
  return users;
};

const createAuthAccounts = async (
  users: Array<{ _id: Types.ObjectId; email: string }>
) => {
  const sharedPasswordHash = await hashPassword('SeedPassword123!');
  const authPayload = users.map(user => ({
    user: user._id,
    provider: 'local',
    providerId: user.email,
    localPassword: sharedPasswordHash,
    verifyAt: new Date()
  }));

  const auths = await AuthModel.insertMany(authPayload, { ordered: true });
  return auths;
};

const createIngredients = async () => {
  const ingredientPayload = Array.from(
    { length: SEED_CONFIG.ingredients },
    (_, index) => ({
      name: `${INGREDIENT_BASE_NAMES[index % INGREDIENT_BASE_NAMES.length]} ${index + 1}`,
      image: `https://picsum.photos/seed/ingredient-${index + 1}/400/300`,
      description: `Seed ingredient ${index + 1} used for dish relationship modeling.`,
      categories: pickMany(INGREDIENT_CATEGORY_VALUES, randomInt(1, 2)),
      allergens: pickMany(ALLERGEN_VALUES, randomInt(1, 2)),
      baseUnit: {
        amount: 100,
        unit: UNIT.GRAM
      },
      nutrition: buildNutritionProfile(),
      isActive: true
    })
  );

  const ingredients = await IngredientModel.insertMany(ingredientPayload, {
    ordered: true
  });
  return ingredients;
};

const createExercises = async () => {
  const exercisePayload = Array.from(
    { length: SEED_CONFIG.exercises },
    (_, index) => {
      const muscleName = pickOne(EXERCISE_MUSCLE_NAMES);
      const equipmentName = pickOne(EXERCISE_EQUIPMENT_NAMES);

      return {
        name: `${EXERCISE_BASE_NAMES[index % EXERCISE_BASE_NAMES.length]} ${index + 1}`,
        tutorial: `https://example.local/exercises/${index + 1}`,
        instructions: 'Warm up, control movement, and keep steady breathing.',
        difficulty: pickOne(EXERCISE_DIFFICULTY_VALUES),
        type: pickOne(EXERCISE_TYPE_VALUES),
        logType: pickOne(WORKOUT_LOG_TYPE_VALUES),
        muscles: [
          {
            name: muscleName,
            image: EXERCISE_MUSCLE_BY_NAME[muscleName]?.image ?? ''
          }
        ],
        equipments: [
          {
            name: equipmentName,
            image: EXERCISE_EQUIPMENT_BY_NAME[equipmentName]?.image ?? ''
          }
        ],
        isActive: true
      };
    }
  );

  const exercises = await ExerciseModel.insertMany(exercisePayload, {
    ordered: true
  });
  return exercises;
};

const createDishes = async (
  users: Array<{ _id: Types.ObjectId; name: string }>,
  ingredients: Array<{
    _id: Types.ObjectId;
    name: string;
    image?: string | null;
    description?: string | null;
    allergens?: string[];
  }>
) => {
  const dishPayload = Array.from({ length: SEED_CONFIG.dishes }, (_, index) => {
    const owner = pickOne(users);
    const selectedIngredients = pickMany(ingredients, randomInt(3, 5));

    return {
      user: {
        _id: owner._id,
        name: owner.name
      },
      name: `${pickOne([...DISH_ADJECTIVES])} ${pickOne([...DISH_NOUNS])} ${index + 1}`,
      description: 'Generated seed dish for Compass relationship modeling.',
      categories: pickMany(DISH_CATEGORY_VALUES, randomInt(1, 2)),
      ingredients: selectedIngredients.map(ingredient => ({
        ingredientId: ingredient._id,
        name: ingredient.name,
        image: ingredient.image,
        description: ingredient.description,
        allergens: ingredient.allergens ?? [],
        units: [
          {
            quantity: randomInt(40, 180),
            unit: UNIT.GRAM,
            isDefault: true
          },
          {
            quantity: randomInt(60, 240),
            unit: UNIT.MILLILITER,
            isDefault: false
          }
        ]
      })),
      instructions: [
        { step: 1, description: 'Prepare and wash all ingredients.' },
        { step: 2, description: 'Cook ingredients with medium heat.' },
        { step: 3, description: 'Serve and adjust seasoning to taste.' }
      ],
      image: `https://picsum.photos/seed/dish-${index + 1}/800/600`,
      nutrition: buildNutritionProfile(),
      isActive: true,
      isPublic: index % 2 === 0,
      preparationTime: randomInt(10, 25),
      cookTime: randomInt(10, 35),
      servings: randomInt(1, 4),
      tags: ['seed', 'compass', `dish-${index + 1}`],
      nutritionFocus: pickMany(NUTRITION_FOCUS_VALUES, randomInt(1, 2))
    };
  });

  const dishes = await DishModel.insertMany(dishPayload, { ordered: true });
  return dishes;
};

const createPosts = async (
  users: Array<{
    _id: Types.ObjectId;
    name: string;
    avatar?: string | null;
    role: string;
  }>
) => {
  const postPayload = Array.from({ length: SEED_CONFIG.posts }, (_, index) => {
    const author = pickOne(users);
    const likeUsers = pickMany(users, randomInt(3, 8));
    const comments = pickMany(users, randomInt(2, 4)).map(
      (commenter, commentIndex) => ({
        author: {
          _id: commenter._id,
          name: commenter.name,
          avatar: commenter.avatar ?? ''
        },
        content: `Seed comment ${commentIndex + 1} on post ${index + 1}.`,
        createdAt: new Date()
      })
    );

    return {
      author: {
        _id: author._id,
        name: author.name,
        avatar: author.avatar ?? '',
        role: author.role
      },
      title: `Seed Post ${index + 1}`,
      content:
        'This is a generated post used for relationship and indexing demos.',
      images: [`https://picsum.photos/seed/post-${index + 1}/900/500`],
      tags: ['seed', 'community', `post-${index + 1}`],
      likes: likeUsers.map(user => user._id),
      views: randomInt(100, 1500),
      comments,
      isPublished: true,
      publishedAt: datePlusDays(new Date(), -randomInt(1, 60)),
      category: pickOne(POST_CATEGORY_VALUES)
    };
  });

  const posts = await PostModel.insertMany(postPayload, { ordered: true });
  return posts;
};

const createCollections = async (
  users: Array<{ _id: Types.ObjectId; name: string }>,
  dishes: Array<{ _id: Types.ObjectId; name: string; image?: string | null }>
) => {
  const collectionPayload = Array.from(
    { length: SEED_CONFIG.collections },
    (_, index) => {
      const owner = pickOne(users);
      const items = pickMany(dishes, randomInt(4, 7));

      return {
        user: {
          _id: owner._id,
          name: owner.name
        },
        name: `Seed Collection ${index + 1}`,
        description: 'Generated collection for Compass schema relationships.',
        image: `https://picsum.photos/seed/collection-${index + 1}/700/400`,
        isPublic: index % 2 === 0,
        dishes: items.map(item => ({
          dishId: item._id,
          name: item.name,
          image: item.image,
          energy: randomInt(250, 700)
        })),
        tags: ['seed', 'collection']
      };
    }
  );

  const collections = await CollectionModel.insertMany(collectionPayload, {
    ordered: true
  });
  return collections;
};

const buildWorkoutTarget = (logType: string) => {
  if (logType === WORKOUT_COUNTER_TYPE.DISTANCE) {
    return {
      distanceTarget: {
        value: randomInt(1, 8),
        unit: pickOne(Object.values(WORKOUT_DISTANCE_UNIT))
      }
    };
  }

  if (logType === WORKOUT_COUNTER_TYPE.WEIGHT_AND_REPS) {
    return {
      weightAndRepsTarget: {
        weight: randomInt(5, 70),
        reps: randomInt(8, 15),
        sets: randomInt(2, 4)
      }
    };
  }

  return {
    durationTarget: {
      seconds: randomInt(120, 1800)
    }
  };
};

const createSchedules = async (
  users: Array<{ _id: Types.ObjectId; name: string }>,
  dishes: Array<{
    _id: Types.ObjectId;
    name: string;
    image?: string | null;
    ingredients: unknown[];
  }>,
  exercises: Array<{
    _id: Types.ObjectId;
    name: string;
    type: string;
    tutorial?: string | null;
    logType: string;
  }>
) => {
  const baseDate = new Date('2026-04-01T00:00:00.000Z');
  const schedulePayload: Array<Record<string, unknown>> = [];

  users.forEach((user, userIndex) => {
    for (let offset = 0; offset < SEED_CONFIG.schedulesPerUser; offset += 1) {
      const scheduleDate = datePlusDays(baseDate, userIndex * 3 + offset);
      const mealDishes = pickMany(dishes, randomInt(2, 4));
      const workoutExercises = pickMany(exercises, randomInt(1, 3));

      schedulePayload.push({
        user: {
          _id: user._id,
          name: user.name
        },
        date: scheduleDate,
        dayOfWeek: resolveDayOfWeek(scheduleDate),
        meals: [
          {
            mealType: 'Breakfast',
            notes: 'High protein first meal.',
            dishes: mealDishes.slice(0, 2).map(dish => ({
              dishId: dish._id,
              name: dish.name,
              energy: energyFromIngredientCount(dish.ingredients.length),
              servings: 1,
              image: dish.image,
              isEaten: Math.random() > 0.4
            }))
          },
          {
            mealType: 'Dinner',
            notes: 'Balanced carbs and protein.',
            dishes: mealDishes.slice(-2).map(dish => ({
              dishId: dish._id,
              name: dish.name,
              energy: energyFromIngredientCount(dish.ingredients.length),
              servings: 1,
              image: dish.image,
              isEaten: false
            }))
          }
        ],
        workout: workoutExercises.map(exercise => ({
          exerciseId: exercise._id,
          exerciseName: exercise.name,
          exerciseType: exercise.type,
          exerciseTutorial: exercise.tutorial ?? '',
          logType: exercise.logType,
          ...buildWorkoutTarget(exercise.logType),
          isCompleted: Math.random() > 0.5
        })),
        notes: 'Generated schedule document.'
      });
    }
  });

  const schedules = await ScheduleModel.insertMany(schedulePayload, {
    ordered: true
  });

  return schedules;
};

const createGroceries = async (
  users: Array<{ _id: Types.ObjectId; name: string }>,
  ingredients: Array<{
    _id: Types.ObjectId;
    name: string;
    image?: string | null;
  }>
) => {
  const groceryPayload = Array.from(
    { length: SEED_CONFIG.groceries },
    (_, index) => {
      const owner = pickOne(users);
      const pickedIngredients = pickMany(ingredients, randomInt(5, 8));

      return {
        user: {
          _id: owner._id,
          name: owner.name
        },
        name: `Seed Grocery ${index + 1}`,
        date: [new Date(), datePlusDays(new Date(), randomInt(1, 7))],
        ingredients: pickedIngredients.map(item => ({
          ingredientId: item._id,
          name: item.name,
          image: item.image,
          isPurchased: Math.random() > 0.5
        })),
        notes: 'Generated grocery list for schema relationship testing.'
      };
    }
  );

  const groceries = await GroceryModel.insertMany(groceryPayload, {
    ordered: true
  });
  return groceries;
};

const createFeedbacks = async (
  users: Array<{ _id: Types.ObjectId; name: string; role: string }>
) => {
  const feedbackPayload = Array.from(
    { length: SEED_CONFIG.feedbacks },
    (_, index) => {
      const author = pickOne(users);

      return {
        user: {
          _id: author._id,
          name: author.name,
          role: author.role
        },
        type: pickOne(FEEDBACK_TYPE_VALUES),
        content: `Seed feedback ${index + 1} for moderation and analytics demos.`
      };
    }
  );

  const feedbacks = await FeedbackModel.insertMany(feedbackPayload, {
    ordered: true
  });
  return feedbacks;
};

const createPayments = async (users: Array<{ _id: Types.ObjectId }>) => {
  const startOrderCode = 26041000;
  const paymentPayload = Array.from(
    { length: SEED_CONFIG.payments },
    (_, index) => ({
      user: pickOne(users)._id,
      orderCode: startOrderCode + index,
      amount: randomInt(149000, 699000),
      returnUrl: 'https://example.local/payment/success',
      cancelUrl: 'https://example.local/payment/cancel',
      checkoutUrl: `https://pay.example.local/checkout/${startOrderCode + index}`,
      paymentLinkId: `seed-payment-link-${index + 1}`,
      targetMembership: MEMBERSHIP_LEVEL.VIP,
      completedAt:
        Math.random() > 0.5
          ? datePlusDays(new Date(), -randomInt(1, 30))
          : undefined
    })
  );

  const payments = await PaymentModel.insertMany(paymentPayload, {
    ordered: true
  });
  return payments;
};

const resetCollections = async () => {
  await AuthModel.deleteMany({});
  await PaymentModel.deleteMany({});
  await FeedbackModel.deleteMany({});
  await GroceryModel.deleteMany({});
  await ScheduleModel.deleteMany({});
  await CollectionModel.deleteMany({});
  await PostModel.deleteMany({});
  await DishModel.deleteMany({});
  await ExerciseModel.deleteMany({});
  await IngredientModel.deleteMany({});
  await UserModel.deleteMany({});
};

const run = async () => {
  try {
    await connectDB();
    console.log('[seed] Connected. Clearing collections...');
    await resetCollections();

    console.log('[seed] Creating ingredients and exercises...');
    const [ingredients, exercises] = await Promise.all([
      createIngredients(),
      createExercises()
    ]);

    console.log('[seed] Creating users and auth accounts...');
    const users = await createUsers();
    const auths = await createAuthAccounts(users);

    console.log('[seed] Creating dishes, posts, and collections...');
    const dishes = await createDishes(users, ingredients);
    const posts = await createPosts(users);
    const collections = await createCollections(users, dishes);

    console.log(
      '[seed] Creating schedules, groceries, feedback, and payments...'
    );
    const schedules = await createSchedules(users, dishes, exercises);
    const groceries = await createGroceries(users, ingredients);
    const feedbacks = await createFeedbacks(users);
    const payments = await createPayments(users);

    console.log('[seed] Completed successfully.');
    console.table({
      users: users.length,
      auths: auths.length,
      ingredients: ingredients.length,
      exercises: exercises.length,
      dishes: dishes.length,
      posts: posts.length,
      collections: collections.length,
      schedules: schedules.length,
      groceries: groceries.length,
      feedbacks: feedbacks.length,
      payments: payments.length
    });
    console.log(
      '[seed] Default login password for local auth users: SeedPassword123!'
    );
  } finally {
    await mongoose.disconnect();
  }
};

run().catch(error => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[seed] Failed: ${message}`);
  process.exit(1);
});
