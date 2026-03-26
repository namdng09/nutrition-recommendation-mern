import createHttpError from 'http-errors';

import { agent, agentConfig } from '~/shared/config/ai-agent';
import { ragConfig } from '~/shared/config/rag';
import { DAY_OF_WEEK } from '~/shared/constants/day-of-week';
import { DISH_CATEGORY } from '~/shared/constants/dish-category';
import { EXERCISE_DIFFICULTY } from '~/shared/constants/exercise-difficulty';
import { EXERCISE_TYPE } from '~/shared/constants/exercise-type';
import { MEAL_SIZE } from '~/shared/constants/meal-size';
import { MEAL_TYPE } from '~/shared/constants/meal-type';
import { NUTRITION_FOCUS } from '~/shared/constants/nutrition-focus';
import { USER_TARGET } from '~/shared/constants/user-target';
import {
  WORKOUT_COUNTER_TYPE,
  WORKOUT_DISTANCE_UNIT
} from '~/shared/constants/workout-counter-type';
import {
  DishModel,
  ExerciseModel,
  ScheduleModel,
  UserModel
} from '~/shared/database/models';
import { createRagVectorStore } from '~/shared/utils';

import type {
  AskAgentRequest,
  AskAgentResponse,
  DailyMealRecommendationResponse,
  DailyWorkoutRecommendationResponse,
  RecommendDailyMealsRequest,
  RecommendDailyWorkoutRequest
} from './ai-dto';
import {
  aiMealRecommendationSchema,
  aiWorkoutRecommendationSchema
} from './ai-dto';
import type {
  IDishCatalogPromptInput,
  IExerciseCatalogPromptInput,
  IInputGenerateMeal,
  IInputGenerateWorkout
} from './ai-type';
import exerciseRecommendationPrompt, {
  EXERCISE_RECOMMENDATION_PROMPT_CONFIG
} from './exercise-recommendation-prompt';
import mealRecommendationPrompt, {
  MEAL_RECOMMENDATION_PROMPT_CONFIG
} from './meal-recommendation-prompt';

type NutritionItem = {
  label?: string | null;
  value?: number | null;
  unit?: string | null;
};

type DishNutrition = {
  nutrients?: NutritionItem[] | null;
  minerals?: NutritionItem[] | null;
  vitamins?: NutritionItem[] | null;
} | null;

type DishCandidate = {
  _id: string;
  name: string;
  image?: string;
  servings?: number;
  nutrition?: DishNutrition;
  categories: string[];
  nutritionFocus: string[];
  tags: string[];
  preparationTime?: number;
  cookTime?: number;
  ingredients: Array<{
    ingredientId?: string;
    allergens: string[];
  }>;
};

type MealSlot = {
  mealType: string;
  mealSettingName: string;
  dishCount: number;
  preferredTypes: string[];
  mealSize?: string;
  cookingPreference?: string;
  availableTime?: string;
  complexity?: string;
  dishCategories: string[];
};

type UserProfileForRecommendation = {
  _id: string;
  name: string;
  gender?: string;
  dob?: Date;
  height?: number;
  bodyfat?: string;
  diet?: string;
  nutritionTarget?: {
    caloriesTarget?: number;
    macros?: {
      carbs?: { min?: number; max?: number };
      protein?: { min?: number; max?: number };
      fat?: { min?: number; max?: number };
    };
  } | null;
  mealSettings: Array<{
    name?: string;
    mealSize?: string;
    preferredTypes?: string[];
    cookingPreference?: string;
    availableTime?: string;
    complexity?: string;
    dishCategories?: string[];
  }>;
  favoriteDishes: string[];
  blockDishes: string[];
  blockIngredients: string[];
  weightRecord: Array<{ weight?: number; date?: Date }>;
  goal?: {
    target?: string;
    weightGoal?: number;
    targetWeightChange?: number;
  } | null;
  allergens: string[];
  activityLevel?: string;
  medicalHistory: string[];
};

type ExerciseCandidate = {
  _id: string;
  name: string;
  tutorial?: string;
  difficulty: string;
  type: string;
  logType: string;
  muscles: string[];
  equipments: string[];
};

type MealContextSummary = {
  totalCalories?: number;
  meals: Array<{
    mealType: string;
    dishes: string[];
    calories?: number;
  }>;
};

type DishRetrievalMode = 'direct_mongodb' | 'rag_vector_search';

type DishRetrievalResult = {
  dishes: DishCandidate[];
  mode: DishRetrievalMode;
  ragMatchedDishIds?: number;
};

type RecentMealDishContext = {
  lookbackDays: number;
  dishCounts: Map<string, number>;
  recentDishNames: string[];
  distinctDishCount: number;
  totalDishPicks: number;
};

type MealRankingContext = {
  targetDate: Date;
  recentDishCounts: Map<string, number>;
};

type RagDishDocument = {
  metadata?: {
    sourceType?: string;
    sourceId?: string;
    metadata?: {
      sourceType?: string;
      sourceId?: string;
    };
  };
};

type RagDishVectorStore = {
  similaritySearch: (
    query: string,
    k: number,
    filter?: Record<string, unknown>
  ) => Promise<RagDishDocument[]>;
};

const DEFAULT_MEAL_TYPE_ORDER = [
  MEAL_TYPE.BREAKFAST,
  MEAL_TYPE.LUNCH,
  MEAL_TYPE.DINNER,
  MEAL_TYPE.SNACK
];

const AVAILABLE_TIME_LIMITS: Record<string, number> = {
  'Không có thời gian (<5 phút)': 5,
  'Ít thời gian (<15 phút)': 15,
  'Có thời gian (<30 phút)': 30,
  'Nhiều thời gian (<60 phút)': 60,
  'Rất nhiều thời gian (<90 phút)': 90
};

const DISH_COUNT_BY_MEAL_SIZE: Record<string, number> = {
  [MEAL_SIZE.TINY]: 1,
  [MEAL_SIZE.SMALL]: 1,
  [MEAL_SIZE.NORMAL]: 2,
  [MEAL_SIZE.BIG]: 2,
  [MEAL_SIZE.HUGE]: 3
};

const MEAL_TYPE_CATEGORY_HINTS: Record<string, string[]> = {
  [MEAL_TYPE.BREAKFAST]: [DISH_CATEGORY.BREAKFAST, DISH_CATEGORY.SNACK],
  [MEAL_TYPE.LUNCH]: [
    DISH_CATEGORY.MAIN_COURSE,
    DISH_CATEGORY.SIDE_DISH,
    DISH_CATEGORY.SOUP,
    DISH_CATEGORY.SALAD
  ],
  [MEAL_TYPE.DINNER]: [
    DISH_CATEGORY.MAIN_COURSE,
    DISH_CATEGORY.SIDE_DISH,
    DISH_CATEGORY.SOUP,
    DISH_CATEGORY.SALAD
  ],
  [MEAL_TYPE.SNACK]: [DISH_CATEGORY.SNACK, DISH_CATEGORY.BEVERAGE],
  [MEAL_TYPE.DESSERT]: [DISH_CATEGORY.DESSERT]
};

const EXERCISE_COUNT_BY_ACTIVITY: Record<string, number> = {
  'Công việc bàn giấy, vận động nhẹ': 4,
  'Hoạt động nhẹ, tập luyện 3-4 lần/tuần': 5,
  'Hoạt động hằng ngày, tập luyện thường xuyên': 6,
  'Rất năng động': 7,
  'Cực kỳ năng động': 8
};

const DIFFICULTY_ORDER = [
  EXERCISE_DIFFICULTY.BEGINNER,
  EXERCISE_DIFFICULTY.INTERMEDIATE,
  EXERCISE_DIFFICULTY.ADVANCED
];

const TARGET_DIFFICULTY_BY_ACTIVITY: Record<string, string> = {
  'Công việc bàn giấy, vận động nhẹ': EXERCISE_DIFFICULTY.BEGINNER,
  'Hoạt động nhẹ, tập luyện 3-4 lần/tuần': EXERCISE_DIFFICULTY.BEGINNER,
  'Hoạt động hằng ngày, tập luyện thường xuyên':
    EXERCISE_DIFFICULTY.INTERMEDIATE,
  'Rất năng động': EXERCISE_DIFFICULTY.ADVANCED,
  'Cực kỳ năng động': EXERCISE_DIFFICULTY.ADVANCED
};

const MUSCLE_GOAL_TYPES = new Set<string>([
  EXERCISE_TYPE.STRENGTH,
  EXERCISE_TYPE.POWER,
  EXERCISE_TYPE.OLYMPIC,
  EXERCISE_TYPE.EXPLOSIVE
]);

const FAT_LOSS_TYPES = new Set<string>([
  EXERCISE_TYPE.DYNAMIC,
  EXERCISE_TYPE.POWER,
  EXERCISE_TYPE.EXPLOSIVE
]);

const RECOVERY_TYPES = new Set<string>([
  EXERCISE_TYPE.MOBILITY,
  EXERCISE_TYPE.STRETCHING,
  EXERCISE_TYPE.YOGA
]);

const MEAL_HISTORY_LOOKBACK_DAYS = 7;

const dayOfWeekByIndex: Record<number, string> = {
  0: DAY_OF_WEEK.SUNDAY,
  1: DAY_OF_WEEK.MONDAY,
  2: DAY_OF_WEEK.TUESDAY,
  3: DAY_OF_WEEK.WEDNESDAY,
  4: DAY_OF_WEEK.THURSDAY,
  5: DAY_OF_WEEK.FRIDAY,
  6: DAY_OF_WEEK.SATURDAY
};

export const AiService = {
  askAgent: async (payload: AskAgentRequest): Promise<AskAgentResponse> => {
    const { message } = payload;

    const result = await agent.invoke({
      messages: [{ role: 'user', content: message }]
    });

    const lastMessage = result.messages?.[result.messages.length - 1];
    const response = normalizeContent(lastMessage?.content);

    return {
      provider: agentConfig.provider,
      model: agentConfig.model,
      response
    };
  },

  recommendDailyMeals: async (
    userId: string,
    payload: RecommendDailyMealsRequest
  ): Promise<DailyMealRecommendationResponse> => {
    const user = await getUserProfileForRecommendation(userId);

    const targetDate = payload.date;
    const dayOfWeek = getDayOfWeek(targetDate);
    const mealSlots = buildMealSlots(user.mealSettings);
    const recentMealContext = await getRecentMealDishContext(
      userId,
      targetDate,
      MEAL_HISTORY_LOOKBACK_DAYS
    );
    const dishRetrieval = await getCandidateDishes(user, mealSlots);
    const candidateDishes = dishRetrieval.dishes;
    console.log(
      `[RAG] Meal retrieval mode=${dishRetrieval.mode}, ragMatchedDishIds=${dishRetrieval.ragMatchedDishIds ?? 'N/A'}, candidateDishesAfterHardFilters=${candidateDishes.length}, recentDistinctDishes(${recentMealContext.lookbackDays}d)=${recentMealContext.distinctDishCount}`
    );

    if (!candidateDishes.length) {
      throw createHttpError(
        404,
        'Không có món ăn phù hợp với hồ sơ người dùng hiện tại'
      );
    }

    const dishesById = new Map(candidateDishes.map(dish => [dish._id, dish]));
    const candidatesByMealType = new Map<string, DishCandidate[]>();
    mealSlots.forEach(slot => {
      candidatesByMealType.set(
        slot.mealType,
        pickCandidatesForMeal(slot, candidateDishes, user, {
          targetDate,
          recentDishCounts: recentMealContext.dishCounts
        })
      );
    });

    const dishCatalog = buildPromptCatalog(
      mealSlots,
      candidatesByMealType,
      dishesById
    );

    const inputForPrompt = buildPromptInput(user);
    const retrievalSummary = buildRetrievalSummary(
      candidateDishes.length,
      mealSlots,
      candidatesByMealType,
      dishRetrieval.mode,
      dishRetrieval.ragMatchedDishIds,
      recentMealContext
    );
    const prompt = mealRecommendationPrompt(inputForPrompt, {
      dateISO: targetDate.toISOString(),
      dayOfWeek,
      mealSlots,
      dishCatalog,
      retrievalSummary
    });

    const aiText = await invokeAi(prompt);
    const aiSelection = parseAiSelection(aiText);

    const meals = materializeMeals({
      mealSlots,
      aiSelection,
      dishesById,
      candidatesByMealType
    });

    return {
      date: targetDate.toISOString(),
      dayOfWeek,
      meals
    };
  },

  recommendDailyWorkout: async (
    userId: string,
    payload: RecommendDailyWorkoutRequest
  ): Promise<DailyWorkoutRecommendationResponse> => {
    const user = await getUserProfileForRecommendation(userId);

    const targetDate = payload.date;
    const dayOfWeek = getDayOfWeek(targetDate);

    const candidateExercises = await getCandidateExercises();
    if (!candidateExercises.length) {
      throw createHttpError(404, 'Không có bài tập phù hợp trong hệ thống');
    }

    const rankedExercises = rankCandidateExercises(candidateExercises, user);
    const recentExerciseIds = await getRecentWorkoutExerciseIds(
      userId,
      targetDate,
      7
    );
    const diversifiedExercises = diversifyExercisesByRecency(
      rankedExercises,
      recentExerciseIds
    );
    const targetExerciseCount = resolveTargetExerciseCount(
      payload.maxExercises,
      user.activityLevel,
      diversifiedExercises.length
    );

    const exerciseCatalog = buildExerciseCatalog(diversifiedExercises);
    const inputForPrompt = buildWorkoutPromptInput(user);
    const mealContext = await getMealContextForDate(userId, targetDate);
    const retrievalSummary = buildWorkoutRetrievalSummary(
      candidateExercises.length,
      targetExerciseCount,
      mealContext
    );

    const prompt = exerciseRecommendationPrompt(inputForPrompt, {
      dateISO: targetDate.toISOString(),
      dayOfWeek,
      targetExerciseCount,
      exerciseCatalog,
      retrievalSummary
    });

    const aiText = await invokeAi(prompt);
    const aiSelection = parseAiWorkoutSelection(aiText);

    const selectedExercises = materializeExercises({
      aiSelection,
      rankedExercises: diversifiedExercises,
      targetExerciseCount
    });

    const workout = buildWorkoutEntries(selectedExercises);

    const schedule = await upsertScheduleWorkout({
      user,
      date: targetDate,
      dayOfWeek,
      workout
    });

    const scheduleObj = schedule.toObject();

    const sanitizedWorkout: DailyWorkoutRecommendationResponse['workout'] = [];

    (scheduleObj.workout ?? []).forEach(item => {
      const exerciseId = item.exerciseId?.toString();
      if (!exerciseId) return;

      sanitizedWorkout.push({
        exerciseId,
        exerciseName: item.exerciseName,
        exerciseType: item.exerciseType,
        exerciseTutorial: item.exerciseTutorial ?? '',
        logType: item.logType,
        distanceTarget: item.distanceTarget
          ? {
              value: item.distanceTarget.value,
              unit: item.distanceTarget.unit
            }
          : undefined,
        weightAndRepsTarget: item.weightAndRepsTarget
          ? {
              reps: item.weightAndRepsTarget.reps,
              sets: item.weightAndRepsTarget.sets,
              weight:
                typeof item.weightAndRepsTarget.weight === 'number'
                  ? item.weightAndRepsTarget.weight
                  : undefined
            }
          : undefined,
        durationTarget: item.durationTarget
          ? { seconds: item.durationTarget.seconds }
          : undefined,
        isCompleted: item.isCompleted ?? false
      });
    });

    return {
      scheduleId: scheduleObj._id.toString(),
      date: scheduleObj.date.toISOString(),
      dayOfWeek: scheduleObj.dayOfWeek,
      workout: sanitizedWorkout
    };
  }
};

const getUserProfileForRecommendation = async (
  userId: string
): Promise<UserProfileForRecommendation> => {
  const user = await UserModel.findById(userId).lean();

  if (!user) {
    throw createHttpError(404, 'Không tìm thấy người dùng');
  }

  if (!user.isActive) {
    throw createHttpError(403, 'Tài khoản người dùng đang bị vô hiệu hóa');
  }

  return {
    _id: user._id.toString(),
    name: user.name,
    gender: user.gender ?? undefined,
    dob: user.dob ?? undefined,
    height: user.height ?? undefined,
    bodyfat: user.bodyfat ?? undefined,
    diet: user.diet ?? undefined,
    nutritionTarget: toNutritionTarget(user.nutritionTarget),
    mealSettings: (user.mealSettings ?? []).map(setting => ({
      name: setting.name,
      mealSize: setting.mealSize,
      preferredTypes: [...(setting.preferredTypes ?? [])],
      cookingPreference: setting.cookingPreference,
      availableTime: setting.availableTime,
      complexity: setting.complexity,
      dishCategories: [...(setting.dishCategories ?? [])]
    })),
    favoriteDishes: (user.favoriteDishes ?? []).map(id => id.toString()),
    blockDishes: (user.blockDishes ?? []).map(id => id.toString()),
    blockIngredients: (user.blockIngredients ?? []).map(id => id.toString()),
    weightRecord: (user.weightRecord ?? []).map(item => ({
      weight: item.weight ?? undefined,
      date: item.date ?? undefined
    })),
    goal: toGoal(user.goal),
    allergens: [...(user.allergens ?? [])],
    activityLevel: user.activityLevel ?? undefined,
    medicalHistory: [...(user.medicalHistory ?? [])]
  };
};

const toMacroRange = (
  range:
    | {
        min?: number | null;
        max?: number | null;
      }
    | null
    | undefined
) => {
  if (!range) return undefined;

  return {
    min: range.min ?? undefined,
    max: range.max ?? undefined
  };
};

const toNutritionTarget = (
  nutritionTarget:
    | {
        caloriesTarget?: number | null;
        macros?: {
          carbs?: { min?: number | null; max?: number | null } | null;
          protein?: { min?: number | null; max?: number | null } | null;
          fat?: { min?: number | null; max?: number | null } | null;
        } | null;
      }
    | null
    | undefined
) => {
  if (!nutritionTarget) return null;

  return {
    caloriesTarget: nutritionTarget.caloriesTarget ?? undefined,
    macros: nutritionTarget.macros
      ? {
          carbs: toMacroRange(nutritionTarget.macros.carbs),
          protein: toMacroRange(nutritionTarget.macros.protein),
          fat: toMacroRange(nutritionTarget.macros.fat)
        }
      : undefined
  };
};

const toGoal = (
  goal:
    | {
        target?: string | null;
        weightGoal?: number | null;
        targetWeightChange?: number | null;
      }
    | null
    | undefined
) => {
  if (!goal) return null;

  return {
    target: goal.target ?? undefined,
    weightGoal: goal.weightGoal ?? undefined,
    targetWeightChange: goal.targetWeightChange ?? undefined
  };
};

const mapDishCandidate = (dish: any): DishCandidate => ({
  _id: dish._id.toString(),
  name: dish.name,
  image: dish.image ?? undefined,
  servings: dish.servings ?? 1,
  nutrition: dish.nutrition ?? null,
  categories: [...(dish.categories ?? [])],
  nutritionFocus: [...(dish.nutritionFocus ?? [])],
  tags: [...(dish.tags ?? [])],
  preparationTime: dish.preparationTime ?? undefined,
  cookTime: dish.cookTime ?? undefined,
  ingredients: (dish.ingredients ?? []).map((ingredient: any) => ({
    ingredientId: ingredient.ingredientId?.toString(),
    allergens: [...(ingredient.allergens ?? [])]
  }))
});

const applyDishHardFilters = (
  dishes: DishCandidate[],
  user: UserProfileForRecommendation
) => {
  const blockedDishSet = new Set(user.blockDishes);
  const blockedIngredientSet = new Set(user.blockIngredients);
  const allergenSet = new Set(user.allergens);

  return dishes
    .filter(dish => !blockedDishSet.has(dish._id))
    .filter(
      dish =>
        !dish.ingredients.some(ingredient =>
          ingredient.ingredientId
            ? blockedIngredientSet.has(ingredient.ingredientId)
            : false
        )
    )
    .filter(
      dish =>
        !dish.ingredients.some(ingredient =>
          ingredient.allergens.some(allergen => allergenSet.has(allergen))
        )
    );
};

const orderDishesByRagPriority = (
  dishes: DishCandidate[],
  ragDishIds: string[]
) => {
  if (!ragDishIds.length) return dishes;
  const rank = new Map(ragDishIds.map((id, index) => [id, index]));
  return [...dishes].sort(
    (left, right) =>
      (rank.get(left._id) ?? Number.MAX_SAFE_INTEGER) -
      (rank.get(right._id) ?? Number.MAX_SAFE_INTEGER)
  );
};

const getCandidateDishesFromMongo = async (
  user: UserProfileForRecommendation,
  preferredDishIds?: string[]
): Promise<DishCandidate[]> => {
  const query: Record<string, unknown> = {
    isActive: true,
    isPublic: true
  };

  if (preferredDishIds?.length) {
    query._id = { $in: preferredDishIds };
  }

  const dishes = await DishModel.find(query)
    .select(
      'name image servings nutrition categories nutritionFocus tags preparationTime cookTime ingredients'
    )
    .lean();

  const mapped = dishes.map(mapDishCandidate);
  const filtered = applyDishHardFilters(mapped, user);

  return preferredDishIds?.length
    ? orderDishesByRagPriority(filtered, preferredDishIds)
    : filtered;
};

const toDishRagGoalHints = (target?: string) => {
  if (target === USER_TARGET.BUILD_MUSCLE) {
    return [NUTRITION_FOCUS.HIGH_PROTEIN];
  }
  if (target === USER_TARGET.LOSE_FAT) {
    return [NUTRITION_FOCUS.LOW_FAT, NUTRITION_FOCUS.LOW_CARB];
  }
  return [];
};

const buildDishRagQuery = (
  user: UserProfileForRecommendation,
  slot: MealSlot
) => {
  const categoryHints = slot.dishCategories.length
    ? slot.dishCategories
    : (MEAL_TYPE_CATEGORY_HINTS[slot.mealType] ?? []);
  const goalHints = toDishRagGoalHints(user.goal?.target);

  return [
    `Meal type: ${slot.mealType}`,
    `Preferred categories: ${
      categoryHints.length ? categoryHints.join(', ') : 'N/A'
    }`,
    `Preferred types: ${
      slot.preferredTypes.length ? slot.preferredTypes.join(', ') : 'N/A'
    }`,
    `Goal: ${user.goal?.target ?? 'N/A'}`,
    `Diet: ${user.diet ?? 'N/A'}`,
    `Nutrition hints: ${goalHints.length ? goalHints.join(', ') : 'N/A'}`,
    `Available time: ${slot.availableTime ?? 'N/A'}`,
    `Cooking preference: ${slot.cookingPreference ?? 'N/A'}`,
    `Complexity: ${slot.complexity ?? 'N/A'}`,
    `Allergens to avoid: ${
      user.allergens.length ? user.allergens.join(', ') : 'N/A'
    }`
  ].join('\n');
};

const extractDishSourceId = (document: RagDishDocument) => {
  const metadata = document.metadata;
  if (
    metadata?.sourceType === 'dish' &&
    typeof metadata.sourceId === 'string'
  ) {
    return metadata.sourceId;
  }

  if (
    metadata?.metadata?.sourceType === 'dish' &&
    typeof metadata.metadata.sourceId === 'string'
  ) {
    return metadata.metadata.sourceId;
  }

  return undefined;
};

const findDishIdsByRag = async (
  user: UserProfileForRecommendation,
  mealSlots: MealSlot[]
) => {
  if (!mealSlots.length) return [];

  const vectorStore = createRagVectorStore() as RagDishVectorStore;
  const filter = {
    'metadata.sourceType': 'dish',
    'metadata.isPublic': true
  };
  const perSlotTopK = Math.max(25, Math.min(80, ragConfig.defaultTopK * 8));
  const seen = new Set<string>();
  const rankedDishIds: string[] = [];

  for (const slot of mealSlots) {
    const query = buildDishRagQuery(user, slot);
    const docs = await vectorStore.similaritySearch(query, perSlotTopK, filter);

    docs.forEach(doc => {
      const sourceId = extractDishSourceId(doc);
      if (sourceId && !seen.has(sourceId)) {
        seen.add(sourceId);
        rankedDishIds.push(sourceId);
      }
    });
  }

  return rankedDishIds;
};

const getCandidateDishes = async (
  user: UserProfileForRecommendation,
  mealSlots: MealSlot[]
): Promise<DishRetrievalResult> => {
  if (!ragConfig.enabled) {
    return {
      dishes: await getCandidateDishesFromMongo(user),
      mode: 'direct_mongodb'
    };
  }

  try {
    const ragDishIds = await findDishIdsByRag(user, mealSlots);

    if (!ragDishIds.length) {
      return {
        dishes: await getCandidateDishesFromMongo(user),
        mode: 'direct_mongodb',
        ragMatchedDishIds: 0
      };
    }

    const ragScopedCandidates = await getCandidateDishesFromMongo(
      user,
      ragDishIds
    );

    if (!ragScopedCandidates.length) {
      return {
        dishes: await getCandidateDishesFromMongo(user),
        mode: 'direct_mongodb',
        ragMatchedDishIds: ragDishIds.length
      };
    }

    return {
      dishes: ragScopedCandidates,
      mode: 'rag_vector_search',
      ragMatchedDishIds: ragDishIds.length
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(
      `[RAG] Meal retrieval fallback to direct MongoDB filtering. Reason: ${reason}`
    );
    return {
      dishes: await getCandidateDishesFromMongo(user),
      mode: 'direct_mongodb'
    };
  }
};

const getCandidateExercises = async (): Promise<ExerciseCandidate[]> => {
  const exercises = await ExerciseModel.find({ isActive: true })
    .select('name tutorial difficulty type logType muscles equipments')
    .lean();

  return exercises.map(exercise => ({
    _id: exercise._id.toString(),
    name: exercise.name,
    tutorial: exercise.tutorial ?? '',
    difficulty: exercise.difficulty,
    type: exercise.type,
    logType: exercise.logType,
    muscles: (exercise.muscles ?? []).map(muscle => muscle.name),
    equipments: (exercise.equipments ?? []).map(equipment => equipment.name)
  }));
};

const getDayOfWeek = (date: Date): string =>
  dayOfWeekByIndex[date.getUTCDay()] ?? DAY_OF_WEEK.MONDAY;

const buildMealSlots = (
  mealSettings: UserProfileForRecommendation['mealSettings']
): MealSlot[] => {
  if (!mealSettings.length) {
    return DEFAULT_MEAL_TYPE_ORDER.map(mealType => ({
      mealType,
      mealSettingName: mealType,
      dishCount: 2,
      preferredTypes: [mealType],
      dishCategories: []
    }));
  }

  return mealSettings.map((setting, index) => {
    const preferredTypes = (setting.preferredTypes ?? []).filter(
      type => type !== MEAL_TYPE.ALL
    );
    const mealType = resolveMealType(setting.name, preferredTypes, index);
    const dishCount = toDishCount(setting.mealSize);

    return {
      mealType,
      mealSettingName: setting.name ?? mealType,
      dishCount,
      preferredTypes,
      mealSize: setting.mealSize,
      cookingPreference: setting.cookingPreference,
      availableTime: setting.availableTime,
      complexity: setting.complexity,
      dishCategories: setting.dishCategories ?? []
    };
  });
};

const resolveMealType = (
  name: string | undefined,
  preferredTypes: string[],
  index: number
) => {
  if (preferredTypes.length > 0) {
    return preferredTypes[0];
  }

  const mealTypeValues = Object.values(MEAL_TYPE);
  if (
    name &&
    mealTypeValues.includes(name as (typeof MEAL_TYPE)[keyof typeof MEAL_TYPE])
  ) {
    return name;
  }

  return DEFAULT_MEAL_TYPE_ORDER[index % DEFAULT_MEAL_TYPE_ORDER.length];
};

const toDishCount = (mealSize?: string) => {
  if (!mealSize) return 2;

  return DISH_COUNT_BY_MEAL_SIZE[mealSize] ?? 2;
};

const getDishTotalTime = (dish: DishCandidate) =>
  (dish.preparationTime ?? 0) + (dish.cookTime ?? 0);

const dateKey = (date: Date) => date.toISOString().slice(0, 10);

const stableHash = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

const getDateDishJitter = (dishId: string, targetDate: Date) => {
  const hash = stableHash(`${dateKey(targetDate)}:${dishId}`);
  return (hash % 1000) / 1000 - 0.5;
};

const filterByMealTypeHint = (mealType: string, dishes: DishCandidate[]) => {
  const hints = MEAL_TYPE_CATEGORY_HINTS[mealType] ?? [];
  if (!hints.length) return dishes;

  const matched = dishes.filter(dish =>
    dish.categories.some(category => hints.includes(category))
  );

  return matched.length > 0 ? matched : dishes;
};

const pickCandidatesForMeal = (
  slot: MealSlot,
  candidateDishes: DishCandidate[],
  user: UserProfileForRecommendation,
  rankingContext: MealRankingContext
) => {
  let scoped = candidateDishes;

  if (slot.dishCategories.length > 0) {
    const byCategories = scoped.filter(dish =>
      dish.categories.some(category => slot.dishCategories.includes(category))
    );
    if (byCategories.length > 0) {
      scoped = byCategories;
    }
  }

  if (
    slot.availableTime &&
    AVAILABLE_TIME_LIMITS[slot.availableTime] !== undefined
  ) {
    const maxMinutes = AVAILABLE_TIME_LIMITS[slot.availableTime];
    const byTime = scoped.filter(dish => getDishTotalTime(dish) <= maxMinutes);
    if (byTime.length > 0) {
      scoped = byTime;
    }
  }

  scoped = filterByMealTypeHint(slot.mealType, scoped);

  const favoriteSet = new Set(user.favoriteDishes);

  return [...scoped].sort(
    (left, right) =>
      scoreDishForMeal(right, slot, user, favoriteSet, rankingContext) -
      scoreDishForMeal(left, slot, user, favoriteSet, rankingContext)
  );
};

const scoreDishForMeal = (
  dish: DishCandidate,
  slot: MealSlot,
  user: UserProfileForRecommendation,
  favoriteSet: Set<string>,
  rankingContext: MealRankingContext
) => {
  let score = 0;

  if (favoriteSet.has(dish._id)) {
    score += 20;
  }

  if (
    slot.dishCategories.some(category => dish.categories.includes(category))
  ) {
    score += 8;
  }

  if (dish.nutritionFocus.includes(NUTRITION_FOCUS.HIGH_PROTEIN)) {
    score += user.goal?.target === USER_TARGET.BUILD_MUSCLE ? 8 : 2;
  }

  if (
    dish.nutritionFocus.includes(NUTRITION_FOCUS.LOW_FAT) ||
    dish.nutritionFocus.includes(NUTRITION_FOCUS.LOW_CARB)
  ) {
    score += user.goal?.target === USER_TARGET.LOSE_FAT ? 8 : 2;
  }

  if (
    slot.availableTime &&
    AVAILABLE_TIME_LIMITS[slot.availableTime] !== undefined
  ) {
    const timeLimit = AVAILABLE_TIME_LIMITS[slot.availableTime];
    if (getDishTotalTime(dish) <= timeLimit) {
      score += 4;
    }
  }

  if (slot.mealType === MEAL_TYPE.BREAKFAST) {
    if (dish.categories.includes(DISH_CATEGORY.BREAKFAST)) {
      score += 6;
    }
  }

  const recentCount = rankingContext.recentDishCounts.get(dish._id) ?? 0;
  if (recentCount > 0) {
    score -= Math.min(18, recentCount * 6);
  }

  score += getDateDishJitter(dish._id, rankingContext.targetDate);

  return score;
};

const resolveTargetDifficulty = (activityLevel?: string) => {
  if (!activityLevel) return undefined;
  return TARGET_DIFFICULTY_BY_ACTIVITY[activityLevel];
};

const difficultyDistance = (value: string, target: string) => {
  const currentIndex = DIFFICULTY_ORDER.indexOf(value as any);
  const targetIndex = DIFFICULTY_ORDER.indexOf(target as any);
  if (currentIndex === -1 || targetIndex === -1) return 2;
  return Math.abs(currentIndex - targetIndex);
};

const scoreExerciseForUser = (
  exercise: ExerciseCandidate,
  user: UserProfileForRecommendation
) => {
  let score = 0;

  const targetDifficulty = resolveTargetDifficulty(user.activityLevel);
  if (targetDifficulty) {
    const distance = difficultyDistance(exercise.difficulty, targetDifficulty);
    if (distance === 0) score += 8;
    if (distance === 1) score += 4;
  }

  if (user.goal?.target === USER_TARGET.BUILD_MUSCLE) {
    if (MUSCLE_GOAL_TYPES.has(exercise.type)) score += 6;
  }

  if (user.goal?.target === USER_TARGET.LOSE_FAT) {
    if (FAT_LOSS_TYPES.has(exercise.type)) score += 6;
  }

  if (user.goal?.target === USER_TARGET.MAINTAIN_WEIGHT) {
    if (RECOVERY_TYPES.has(exercise.type)) score += 4;
  }

  if (RECOVERY_TYPES.has(exercise.type)) {
    score += 1;
  }

  return score;
};

const rankCandidateExercises = (
  exercises: ExerciseCandidate[],
  user: UserProfileForRecommendation
) =>
  [...exercises].sort(
    (left, right) =>
      scoreExerciseForUser(right, user) - scoreExerciseForUser(left, user)
  );

const buildPromptCatalog = (
  mealSlots: MealSlot[],
  candidatesByMealType: Map<string, DishCandidate[]>,
  dishesById: Map<string, DishCandidate>
): IDishCatalogPromptInput[] => {
  const catalogByDishId = new Map<string, IDishCatalogPromptInput>();
  const mealTypesByDishId = new Map<string, Set<string>>();

  mealSlots.forEach(slot => {
    const candidates = candidatesByMealType.get(slot.mealType) ?? [];
    candidates.slice(0, 30).forEach(dish => {
      if (!mealTypesByDishId.has(dish._id)) {
        mealTypesByDishId.set(dish._id, new Set());
      }
      mealTypesByDishId.get(dish._id)?.add(slot.mealType);
    });
  });

  for (const [dishId, mealTypes] of mealTypesByDishId.entries()) {
    const dish = dishesById.get(dishId);
    if (!dish) continue;

    catalogByDishId.set(dishId, {
      id: dishId,
      name: dish.name,
      categories: dish.categories,
      nutritionFocus: dish.nutritionFocus,
      tags: dish.tags,
      totalTimeMinutes: getDishTotalTime(dish),
      defaultServings: dish.servings ?? 1,
      blockedByAllergen: false,
      nutrients: (dish.nutrition?.nutrients ?? [])
        .filter(
          item =>
            typeof item.label === 'string' &&
            typeof item.unit === 'string' &&
            typeof item.value === 'number'
        )
        .map(item => ({
          label: item.label as string,
          unit: item.unit as string,
          value: item.value as number
        })),
      suggestedMealTypes: Array.from(mealTypes)
    });

    if (
      catalogByDishId.size >= MEAL_RECOMMENDATION_PROMPT_CONFIG.maxCatalogItems
    ) {
      break;
    }
  }

  return Array.from(catalogByDishId.values());
};

const buildExerciseCatalog = (
  exercises: ExerciseCandidate[]
): IExerciseCatalogPromptInput[] =>
  exercises
    .slice(0, EXERCISE_RECOMMENDATION_PROMPT_CONFIG.maxCatalogItems)
    .map(exercise => ({
      id: exercise._id,
      name: exercise.name,
      difficulty: exercise.difficulty,
      type: exercise.type,
      logType: exercise.logType,
      muscles: exercise.muscles,
      equipments: exercise.equipments
    }));

const getAge = (dob?: Date) => {
  if (!dob) return undefined;

  const now = new Date();
  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - dob.getUTCMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && now.getUTCDate() < dob.getUTCDate())
  ) {
    age -= 1;
  }

  return age >= 0 ? age : undefined;
};

const getLatestWeight = (
  weightRecord: Array<{ weight?: number; date?: Date }>
): number | undefined => {
  if (!weightRecord.length) return undefined;

  const sorted = [...weightRecord]
    .filter(
      item => typeof item.weight === 'number' && item.date instanceof Date
    )
    .sort((left, right) => right.date!.getTime() - left.date!.getTime());

  return sorted[0]?.weight;
};

const buildPromptInput = (
  user: UserProfileForRecommendation
): IInputGenerateMeal => ({
  gender: user.gender,
  age: getAge(user.dob),
  height: user.height,
  weight: getLatestWeight(user.weightRecord),
  targetWeight: user.goal?.weightGoal,
  fitnessGoal: user.goal?.target,
  diet: user.diet,
  activityLevel: user.activityLevel,
  bodyfat: user.bodyfat,
  allergens: user.allergens,
  medicalHistory: user.medicalHistory,
  caloriesTarget: user.nutritionTarget?.caloriesTarget,
  macroTargets: user.nutritionTarget?.macros
});

const buildWorkoutPromptInput = (
  user: UserProfileForRecommendation
): IInputGenerateWorkout => ({
  gender: user.gender,
  age: getAge(user.dob),
  height: user.height,
  weight: getLatestWeight(user.weightRecord),
  targetWeight: user.goal?.weightGoal,
  fitnessGoal: user.goal?.target,
  activityLevel: user.activityLevel,
  bodyfat: user.bodyfat,
  medicalHistory: user.medicalHistory
});

const buildRetrievalSummary = (
  totalCandidates: number,
  mealSlots: MealSlot[],
  candidatesByMealType: Map<string, DishCandidate[]>,
  mode: DishRetrievalMode,
  ragMatchedDishIds?: number,
  recentMealContext?: RecentMealDishContext
) => {
  const detail = mealSlots
    .map(slot => {
      const count = candidatesByMealType.get(slot.mealType)?.length ?? 0;
      return `- ${slot.mealType}: ${count} candidate dishes`;
    })
    .join('\n');

  const modeText =
    mode === 'rag_vector_search'
      ? 'Current retrieval mode: RAG vector search + hard filters.'
      : 'Current retrieval mode: direct MongoDB filtering (RAG disabled or fallback).';
  const ragCountText =
    typeof ragMatchedDishIds === 'number'
      ? `RAG matched dish IDs before hard filters: ${ragMatchedDishIds}.`
      : null;
  const recentContextText = recentMealContext
    ? `Recent history window: ${recentMealContext.lookbackDays} days; distinct dishes=${recentMealContext.distinctDishCount}; total dish picks=${recentMealContext.totalDishPicks}.`
    : null;
  const recentDishHintText =
    recentMealContext && recentMealContext.recentDishNames.length
      ? `Recently used dishes (de-prioritize): ${recentMealContext.recentDishNames.join(', ')}.`
      : null;

  return [
    modeText,
    ...(ragCountText ? [ragCountText] : []),
    ...(recentContextText ? [recentContextText] : []),
    ...(recentDishHintText ? [recentDishHintText] : []),
    `Total candidates after hard filters: ${totalCandidates}.`,
    'Per-meal candidates:',
    detail
  ].join('\n');
};

const calculateDishCalories = (dish: DishCandidate | null | undefined) => {
  if (!dish?.nutrition?.nutrients?.length) return 0;
  const energy = dish.nutrition.nutrients[0];
  if (!energy || typeof energy.value !== 'number') return 0;
  return energy.value;
};

const getMealContextForDate = async (
  userId: string,
  date: Date
): Promise<MealContextSummary | null> => {
  const schedule = await ScheduleModel.findOne({
    'user._id': userId,
    date
  }).lean();

  if (!schedule || !schedule.meals?.length) return null;

  const dishIds = new Set<string>();
  schedule.meals.forEach(meal => {
    meal.dishes?.forEach(dish => {
      const dishId = dish.dishId?.toString();
      if (dishId) dishIds.add(dishId);
    });
  });

  const dishes = dishIds.size
    ? await DishModel.find({ _id: { $in: Array.from(dishIds) } })
        .select('name nutrition')
        .lean()
    : [];

  const dishById = new Map(
    dishes.map(dish => [dish._id.toString(), dish as unknown as DishCandidate])
  );

  let totalCalories = 0;
  const meals = schedule.meals.map(meal => {
    let mealCalories = 0;
    const dishNames =
      meal.dishes?.map(dish => {
        const dishId = dish.dishId?.toString();
        const detail = dishId ? dishById.get(dishId) : undefined;
        const calories = calculateDishCalories(detail);
        mealCalories += calories;
        return detail?.name ?? dish.name ?? 'N/A';
      }) ?? [];

    totalCalories += mealCalories;

    return {
      mealType: meal.mealType,
      dishes: dishNames.filter(Boolean),
      calories: mealCalories > 0 ? Math.round(mealCalories) : undefined
    };
  });

  return {
    totalCalories: totalCalories > 0 ? Math.round(totalCalories) : undefined,
    meals
  };
};

const getRecentMealDishContext = async (
  userId: string,
  date: Date,
  lookbackDays: number
): Promise<RecentMealDishContext> => {
  const start = new Date(date);
  start.setDate(start.getDate() - Math.max(0, lookbackDays));

  const schedules = await ScheduleModel.find({
    'user._id': userId,
    date: { $gte: start, $lt: date }
  })
    .select('meals.dishes.dishId meals.dishes.name')
    .lean();

  const dishCounts = new Map<string, number>();
  const dishNames = new Map<string, string>();
  let totalDishPicks = 0;

  schedules.forEach(schedule => {
    schedule.meals?.forEach(meal => {
      meal.dishes?.forEach(dish => {
        const dishId = dish.dishId?.toString();
        if (!dishId) return;
        dishCounts.set(dishId, (dishCounts.get(dishId) ?? 0) + 1);
        if (!dishNames.has(dishId) && dish.name) {
          dishNames.set(dishId, dish.name);
        }
        totalDishPicks += 1;
      });
    });
  });

  const recentDishNames = Array.from(dishCounts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 12)
    .map(([dishId]) => dishNames.get(dishId) ?? dishId);

  return {
    lookbackDays: Math.max(0, lookbackDays),
    dishCounts,
    recentDishNames,
    distinctDishCount: dishCounts.size,
    totalDishPicks
  };
};

const getRecentWorkoutExerciseIds = async (
  userId: string,
  date: Date,
  lookbackDays: number
) => {
  const start = new Date(date);
  start.setDate(start.getDate() - Math.max(0, lookbackDays));

  const schedules = await ScheduleModel.find({
    'user._id': userId,
    date: { $gte: start, $lt: date }
  })
    .select('workout.exerciseId')
    .lean();

  const ids = new Set<string>();
  schedules.forEach(schedule => {
    schedule.workout?.forEach(item => {
      const id = item.exerciseId?.toString();
      if (id) ids.add(id);
    });
  });

  return ids;
};

const diversifyExercisesByRecency = (
  exercises: ExerciseCandidate[],
  recentIds: Set<string>
) => {
  if (!recentIds.size) return exercises;

  const fresh: ExerciseCandidate[] = [];
  const recent: ExerciseCandidate[] = [];

  exercises.forEach(exercise => {
    if (recentIds.has(exercise._id)) {
      recent.push(exercise);
    } else {
      fresh.push(exercise);
    }
  });

  return [...fresh, ...recent];
};

const buildWorkoutRetrievalSummary = (
  totalCandidates: number,
  targetExerciseCount: number,
  mealContext: MealContextSummary | null
) => {
  const mealLines = mealContext
    ? mealContext.meals
        .map(meal => {
          const dishText =
            meal.dishes.length > 0 ? meal.dishes.join(', ') : 'N/A';
          const caloriesText =
            typeof meal.calories === 'number'
              ? ` (~${meal.calories} kcal)`
              : '';
          return `- ${meal.mealType}: ${dishText}${caloriesText}`;
        })
        .join('\n')
    : 'N/A';

  const totalCaloriesText =
    mealContext?.totalCalories !== undefined
      ? `~${mealContext.totalCalories} kcal`
      : 'N/A';

  return [
    'Current retrieval mode: direct MongoDB filtering (RAG not enabled yet).',
    `Total exercise candidates: ${totalCandidates}.`,
    `Target exercise count: ${targetExerciseCount}.`,
    'Meals planned for this day:',
    mealLines,
    `Estimated total meal calories: ${totalCaloriesText}.`
  ].join('\n');
};

const invokeAi = async (prompt: string) => {
  const result = await agent.invoke({
    messages: [{ role: 'user', content: prompt }]
  });
  const lastMessage = result.messages?.[result.messages.length - 1];
  return normalizeContent(lastMessage?.content);
};

const parseAiSelection = (aiText: string) => {
  const parsedJson = extractJson(aiText);
  if (!parsedJson) {
    return null;
  }

  const parsed = aiMealRecommendationSchema.safeParse(parsedJson);
  if (!parsed.success) {
    return null;
  }

  return parsed.data;
};

const parseAiWorkoutSelection = (aiText: string) => {
  const parsedJson = extractJson(aiText);
  if (!parsedJson) {
    return null;
  }

  const parsed = aiWorkoutRecommendationSchema.safeParse(parsedJson);
  if (!parsed.success) {
    return null;
  }

  return parsed.data;
};

const extractJson = (value: string): unknown => {
  const cleaned = value
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```/i, '')
    .replace(/```$/i, '')
    .trim();

  const direct = tryParseJson(cleaned);
  if (direct !== null) return direct;

  const startIndex = cleaned.indexOf('[');
  const endIndex = cleaned.lastIndexOf(']');
  if (startIndex < 0 || endIndex < 0 || endIndex <= startIndex) {
    return null;
  }

  const extracted = cleaned.slice(startIndex, endIndex + 1);
  return tryParseJson(extracted);
};

const tryParseJson = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const materializeMeals = ({
  mealSlots,
  aiSelection,
  dishesById,
  candidatesByMealType
}: {
  mealSlots: MealSlot[];
  aiSelection: Array<{
    mealType: string;
    dishes: Array<{ dishId: string; servings?: number }>;
  }> | null;
  dishesById: Map<string, DishCandidate>;
  candidatesByMealType: Map<string, DishCandidate[]>;
}) => {
  const usedDishIds = new Set<string>();

  return mealSlots.map((slot, index) => {
    const aiMeal = pickAiMeal(aiSelection, slot.mealType, index);
    const dishCount = Math.min(
      slot.dishCount,
      MEAL_RECOMMENDATION_PROMPT_CONFIG.maxDishesPerMeal
    );
    const selectedDishRows: Array<{
      dishId: string;
      name: string;
      servings: number;
      image?: string;
      nutrition: DishNutrition;
    }> = [];
    const seenInMeal = new Set<string>();
    const deferredAiDuplicates: Array<{
      dish: DishCandidate;
      servings: number;
    }> = [];

    const addDishToMeal = (dish: DishCandidate, servings: number) => {
      if (selectedDishRows.length >= dishCount) return;
      if (seenInMeal.has(dish._id)) return;

      seenInMeal.add(dish._id);
      usedDishIds.add(dish._id);
      selectedDishRows.push(toDishResponse(dish, servings));
    };

    if (aiMeal) {
      const seenInAiMeal = new Set<string>();

      for (const item of aiMeal.dishes) {
        if (selectedDishRows.length >= dishCount) break;
        if (seenInAiMeal.has(item.dishId)) continue;
        seenInAiMeal.add(item.dishId);

        const dish = dishesById.get(item.dishId);
        if (!dish) continue;

        const servings = normalizeServings(item.servings, dish.servings);
        if (usedDishIds.has(item.dishId)) {
          deferredAiDuplicates.push({ dish, servings });
          continue;
        }

        addDishToMeal(dish, servings);
      }
    }

    if (selectedDishRows.length < dishCount) {
      const fallbackCandidates = candidatesByMealType.get(slot.mealType) ?? [];

      // Phase 1: prefer unused dishes to reduce same-day repetition.
      for (const dish of fallbackCandidates) {
        if (selectedDishRows.length >= dishCount) break;
        if (usedDishIds.has(dish._id)) continue;
        addDishToMeal(dish, normalizeServings(1, dish.servings));
      }

      // Phase 2: if still not enough dishes, allow AI duplicates.
      for (const item of deferredAiDuplicates) {
        if (selectedDishRows.length >= dishCount) break;
        addDishToMeal(item.dish, item.servings);
      }

      // Phase 3: final fallback allows repeats to satisfy dishCount.
      for (const dish of fallbackCandidates) {
        if (selectedDishRows.length >= dishCount) break;
        addDishToMeal(dish, normalizeServings(1, dish.servings));
      }
    }

    return {
      mealType: slot.mealType,
      dishes: selectedDishRows
    };
  });
};

const resolveTargetExerciseCount = (
  requestedCount: number | undefined,
  activityLevel: string | undefined,
  totalCandidates: number
) => {
  const base =
    typeof requestedCount === 'number'
      ? requestedCount
      : (EXERCISE_COUNT_BY_ACTIVITY[activityLevel ?? ''] ?? 5);

  const normalized = Math.max(1, Math.min(12, base));
  return Math.min(normalized, Math.max(1, totalCandidates));
};

const materializeExercises = ({
  aiSelection,
  rankedExercises,
  targetExerciseCount
}: {
  aiSelection: Array<{ exerciseId: string }> | null;
  rankedExercises: ExerciseCandidate[];
  targetExerciseCount: number;
}) => {
  const byId = new Map(rankedExercises.map(item => [item._id, item]));
  const selected: ExerciseCandidate[] = [];
  const used = new Set<string>();

  if (aiSelection?.length) {
    for (const item of aiSelection) {
      if (selected.length >= targetExerciseCount) break;
      const exercise = byId.get(item.exerciseId);
      if (!exercise) continue;
      if (used.has(exercise._id)) continue;
      used.add(exercise._id);
      selected.push(exercise);
    }
  }

  for (const exercise of rankedExercises) {
    if (selected.length >= targetExerciseCount) break;
    if (used.has(exercise._id)) continue;
    used.add(exercise._id);
    selected.push(exercise);
  }

  return selected;
};

const defaultDistanceTarget = (difficulty: string) => {
  if (difficulty === EXERCISE_DIFFICULTY.ADVANCED) {
    return { value: 3, unit: WORKOUT_DISTANCE_UNIT.KILOMETER };
  }
  if (difficulty === EXERCISE_DIFFICULTY.INTERMEDIATE) {
    return { value: 2, unit: WORKOUT_DISTANCE_UNIT.KILOMETER };
  }
  return { value: 1, unit: WORKOUT_DISTANCE_UNIT.KILOMETER };
};

const defaultDurationTarget = (difficulty: string) => {
  if (difficulty === EXERCISE_DIFFICULTY.ADVANCED) return { seconds: 1200 };
  if (difficulty === EXERCISE_DIFFICULTY.INTERMEDIATE) return { seconds: 900 };
  return { seconds: 600 };
};

const defaultWeightAndRepsTarget = (difficulty: string) => {
  if (difficulty === EXERCISE_DIFFICULTY.ADVANCED) {
    return { reps: 8, sets: 4 };
  }
  if (difficulty === EXERCISE_DIFFICULTY.INTERMEDIATE) {
    return { reps: 10, sets: 4 };
  }
  return { reps: 10, sets: 3 };
};

const buildWorkoutEntries = (exercises: ExerciseCandidate[]) =>
  exercises.map(exercise => {
    const logType = exercise.logType;

    return {
      exerciseId: exercise._id,
      exerciseName: exercise.name,
      exerciseType: exercise.type,
      exerciseTutorial: exercise.tutorial ?? '',
      logType,
      distanceTarget:
        logType === WORKOUT_COUNTER_TYPE.DISTANCE
          ? defaultDistanceTarget(exercise.difficulty)
          : undefined,
      weightAndRepsTarget:
        logType === WORKOUT_COUNTER_TYPE.WEIGHT_AND_REPS
          ? defaultWeightAndRepsTarget(exercise.difficulty)
          : undefined,
      durationTarget:
        logType === WORKOUT_COUNTER_TYPE.DURATION
          ? defaultDurationTarget(exercise.difficulty)
          : undefined,
      isCompleted: false
    };
  });

const pickAiMeal = (
  aiSelection: Array<{
    mealType: string;
    dishes: Array<{ dishId: string; servings?: number }>;
  }> | null,
  mealType: string,
  index: number
) => {
  if (!aiSelection?.length) return null;

  const byIndex = aiSelection[index];
  if (byIndex && byIndex.mealType === mealType) {
    return byIndex;
  }

  return aiSelection.find(meal => meal.mealType === mealType) ?? null;
};

const normalizeServings = (
  requestedServings: number | undefined,
  defaultServings: number | undefined
) => {
  const fallback = defaultServings && defaultServings > 0 ? defaultServings : 1;
  const raw = requestedServings ?? fallback;
  const normalized = Number.isFinite(raw) ? Math.round(raw) : 1;

  return Math.max(
    MEAL_RECOMMENDATION_PROMPT_CONFIG.minServings,
    Math.min(MEAL_RECOMMENDATION_PROMPT_CONFIG.maxServings, normalized)
  );
};

const normalizeNutrition = (nutrition?: DishNutrition): DishNutrition => ({
  nutrients: nutrition?.nutrients ?? [],
  minerals: nutrition?.minerals ?? [],
  vitamins: nutrition?.vitamins ?? []
});

const toDishResponse = (dish: DishCandidate, servings: number) => ({
  dishId: dish._id,
  name: dish.name,
  servings,
  image: dish.image,
  nutrition: normalizeNutrition(dish.nutrition)
});

const upsertScheduleWorkout = async ({
  user,
  date,
  dayOfWeek,
  workout
}: {
  user: UserProfileForRecommendation;
  date: Date;
  dayOfWeek: string;
  workout: Array<{
    exerciseId: string;
    exerciseName: string;
    exerciseType: string;
    exerciseTutorial: string;
    logType: string;
    distanceTarget?: { value: number; unit: string };
    weightAndRepsTarget?: {
      weight?: number | null;
      reps: number;
      sets?: number;
    };
    durationTarget?: { seconds: number };
    isCompleted: boolean;
  }>;
}) => {
  const existing = await ScheduleModel.findOne({
    'user._id': user._id,
    date
  });

  if (existing) {
    existing.workout = workout as any;
    await existing.save();
    return existing;
  }

  const meals = user.mealSettings.map(setting => ({
    mealType: setting.name ?? MEAL_TYPE.BREAKFAST,
    dishes: []
  }));

  return ScheduleModel.create({
    user: {
      _id: user._id,
      name: user.name
    },
    date,
    dayOfWeek,
    meals,
    workout
  });
};

const normalizeContent = (content: unknown): string => {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    const textParts = content
      .map(part => {
        if (typeof part === 'string') {
          return part;
        }
        if (part && typeof part === 'object' && 'text' in part) {
          return String((part as { text?: unknown }).text ?? '');
        }
        return '';
      })
      .filter(Boolean);
    if (textParts.length > 0) {
      return textParts.join(' ');
    }
  }

  if (content == null) {
    return '';
  }

  return String(content);
};
