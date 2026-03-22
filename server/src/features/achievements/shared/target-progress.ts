import { NUTRIENTS } from '~/shared/constants/nutrition-nutrients';
import { DishModel, ScheduleModel, UserModel } from '~/shared/database/models';

type Totals = {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
};

type DailyDishEntry = {
  dishId: string;
  servings: number;
};

export async function getTargetProgress(userId: string): Promise<{
  totalHitDays: number;
  maxStreak: number;
}> {
  // Step 1: load user target.
  const user = await UserModel.findById(userId, 'nutritionTarget').lean();
  const { caloriesTarget, macros } = user?.nutritionTarget ?? {};
  if (!caloriesTarget || !macros) return { totalHitDays: 0, maxStreak: 0 };

  // Step 2: group all eaten dishes by date.
  const schedules = await ScheduleModel.find({ 'user._id': userId }).lean();
  const dailyEntriesByDate = new Map<string, DailyDishEntry[]>();

  for (const schedule of schedules) {
    const dateKey = schedule.date.toISOString().split('T')[0];

    for (const meal of schedule.meals ?? []) {
      for (const dish of meal.dishes ?? []) {
        if (!dish.isEaten || !dish.dishId) continue;

        const entries = dailyEntriesByDate.get(dateKey) ?? [];
        entries.push({
          dishId: dish.dishId.toString(),
          servings: dish.servings ?? 1
        });
        dailyEntriesByDate.set(dateKey, entries);
      }
    }
  }

  if (!dailyEntriesByDate.size) return { totalHitDays: 0, maxStreak: 0 };

  // Step 3: collect unique dish ids and query dish nutrition once.
  const dishIdSet = new Set<string>();
  for (const entries of dailyEntriesByDate.values()) {
    for (const entry of entries) {
      dishIdSet.add(entry.dishId);
    }
  }

  const allDishIds = [...dishIdSet];

  const dishes = await DishModel.find({ _id: { $in: allDishIds } })
    .select('nutrition servings')
    .lean();

  const dishById = new Map<string, (typeof dishes)[number]>();
  for (const dish of dishes) {
    dishById.set(dish._id.toString(), dish);
  }

  // Step 4: for each day, sum nutrients and check if targets are hit.
  const targetHitDateKeys: string[] = [];

  for (const [dateKey, entries] of dailyEntriesByDate) {
    const totals: Totals = { calories: 0, carbs: 0, protein: 0, fat: 0 };

    for (const entry of entries) {
      const dish = dishById.get(entry.dishId);
      if (!dish?.nutrition) continue;

      const dishServingBase = dish.servings ?? 1;
      if (dishServingBase <= 0) continue;

      const scale = entry.servings / dishServingBase;
      for (const nutrient of dish.nutrition.nutrients ?? []) {
        if (!nutrient.label) continue;

        const nutrientValue = (nutrient.value ?? 0) * scale;

        switch (nutrient.label) {
          case NUTRIENTS.NANG_LUONG:
            totals.calories += nutrientValue;
            break;
          case NUTRIENTS.TINH_BOT:
            totals.carbs += nutrientValue;
            break;
          case NUTRIENTS.PROTEIN:
            totals.protein += nutrientValue;
            break;
          case NUTRIENTS.CHAT_BEO:
            totals.fat += nutrientValue;
            break;
          default:
            break;
        }
      }
    }

    const isCaloriesMatched =
      totals.calories >= caloriesTarget * 0.8 &&
      totals.calories <= caloriesTarget * 1.2;
    const isCarbsMatched =
      totals.carbs >= macros.carbs.min && totals.carbs <= macros.carbs.max;
    const isProteinMatched =
      totals.protein >= macros.protein.min &&
      totals.protein <= macros.protein.max;
    const isFatMatched =
      totals.fat >= macros.fat.min && totals.fat <= macros.fat.max;

    if (
      isCaloriesMatched &&
      isCarbsMatched &&
      isProteinMatched &&
      isFatMatched
    ) {
      targetHitDateKeys.push(dateKey);
    }
  }

  // Step 5: calculate max consecutive hit streak.
  const sortedKeys = [...targetHitDateKeys].sort();
  let maxStreak = 0;
  let currentStreak = 0;
  let previousDateKey = '';

  for (const key of sortedKeys) {
    if (!previousDateKey) {
      currentStreak = 1;
    } else {
      const diffDays = Math.round(
        (new Date(key).getTime() - new Date(previousDateKey).getTime()) /
          86_400_000
      );
      currentStreak = diffDays === 1 ? currentStreak + 1 : 1;
    }

    if (currentStreak > maxStreak) {
      maxStreak = currentStreak;
    }

    previousDateKey = key;
  }

  return { totalHitDays: targetHitDateKeys.length, maxStreak };
}
