import { registerDishCreatedHandler } from './dish-created-handler';
import { registerLoginStreakHandler } from './login-streak-handler';
import { registerMealEatenHandler } from './meal-eaten-handler';
import { registerScheduleCreatedHandler } from './schedule-created-handler';

export function registerAllAchievementHandlers() {
  registerLoginStreakHandler();
  registerDishCreatedHandler();
  registerMealEatenHandler();
  registerScheduleCreatedHandler();
}
