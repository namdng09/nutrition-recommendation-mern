import { GroceryModel } from '~/shared/database/models';

export async function getGroceryStats(userId: string): Promise<{
  completedCount: number;
  totalPurchased: number;
}> {
  const groceries = await GroceryModel.find({ 'user._id': userId }).lean();

  let completedCount = 0;
  let totalPurchased = 0;

  for (const grocery of groceries) {
    const ingredients = grocery.ingredients ?? [];
    if (ingredients.length === 0) continue;

    let isAllPurchased = true;

    for (const ingredient of ingredients) {
      if (ingredient.isPurchased) {
        totalPurchased += 1;
      } else {
        isAllPurchased = false;
      }
    }

    if (isAllPurchased) {
      completedCount += 1;
    }
  }

  return { completedCount, totalPurchased };
}
