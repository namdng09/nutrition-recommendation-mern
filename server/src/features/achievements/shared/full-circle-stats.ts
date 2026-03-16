import { GroceryModel, ScheduleModel } from '~/shared/database/models';

type FullCircleStats = {
  completedCircleDays: number;
};

function toDateKey(value: Date): string {
  return value.toISOString().split('T')[0];
}

function isScheduleCompleted(schedule: any): boolean {
  let dishCount = 0;

  for (const meal of schedule.meals ?? []) {
    for (const dish of meal.dishes ?? []) {
      dishCount += 1;
      if (!dish.isEaten) {
        return false;
      }
    }
  }

  return dishCount > 0;
}

function isGroceryCompleted(grocery: any): boolean {
  const ingredients = grocery.ingredients ?? [];
  if (ingredients.length === 0) {
    return false;
  }

  for (const ingredient of ingredients) {
    if (!ingredient.isPurchased) {
      return false;
    }
  }

  return true;
}

export async function getFullCircleStats(
  userId: string
): Promise<FullCircleStats> {
  const schedules = await ScheduleModel.find({ 'user._id': userId })
    .select('date meals.dishes.isEaten')
    .lean();

  const scheduleCompletedDateKeys = new Set<string>();
  for (const schedule of schedules) {
    if (!schedule.date) continue;
    if (!isScheduleCompleted(schedule)) continue;

    scheduleCompletedDateKeys.add(toDateKey(schedule.date));
  }

  if (scheduleCompletedDateKeys.size === 0) {
    return { completedCircleDays: 0 };
  }

  const groceries = await GroceryModel.find({ 'user._id': userId })
    .select('date ingredients.isPurchased')
    .lean();

  const groceryCompletedDateKeys = new Set<string>();
  for (const grocery of groceries) {
    if (!isGroceryCompleted(grocery)) continue;

    for (const groceryDate of grocery.date ?? []) {
      if (!groceryDate) continue;

      groceryCompletedDateKeys.add(toDateKey(groceryDate));
    }
  }

  let completedCircleDays = 0;
  for (const dateKey of scheduleCompletedDateKeys) {
    if (groceryCompletedDateKeys.has(dateKey)) {
      completedCircleDays += 1;
    }
  }

  return { completedCircleDays };
}
