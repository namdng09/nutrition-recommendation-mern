import { DishModel, ScheduleModel } from '~/shared/database/models';

export async function getDiverseCounts(userId: string): Promise<{
  ingredientCount: number;
  categoryCount: number;
}> {
  const schedules = await ScheduleModel.find({ 'user._id': userId }).lean();

  const eatenDishIds = new Set<string>();
  for (const schedule of schedules) {
    for (const meal of schedule.meals ?? []) {
      for (const dish of meal.dishes ?? []) {
        if (dish.isEaten && dish.dishId) {
          eatenDishIds.add(dish.dishId.toString());
        }
      }
    }
  }

  if (eatenDishIds.size === 0) {
    return { ingredientCount: 0, categoryCount: 0 };
  }

  const dishes = await DishModel.find({ _id: { $in: [...eatenDishIds] } })
    .select('categories ingredients')
    .lean();

  const ingredientIds = new Set<string>();
  const categoryIds = new Set<string>();

  for (const dish of dishes) {
    for (const ingredient of dish.ingredients ?? []) {
      if (ingredient.ingredientId) {
        ingredientIds.add(ingredient.ingredientId.toString());
      }
    }

    for (const category of dish.categories ?? []) {
      if (category) {
        categoryIds.add(category);
      }
    }
  }

  const ingredientCount = ingredientIds.size;
  const categoryCount = categoryIds.size;

  return { ingredientCount, categoryCount };
}
