import mongoose from 'mongoose';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it
} from 'vitest';

import { ScheduleService } from '~/features/schedules/schedule-service';
import { AVAILABLE_TIME } from '~/shared/constants/available-time';
import { COOKING_PREFERENCE } from '~/shared/constants/cooking-preference';
import { DAY_OF_WEEK } from '~/shared/constants/day-of-week';
import { INGREDIENT_CATEGORY } from '~/shared/constants/ingredient-category';
import { MEAL_COMPLEXITY } from '~/shared/constants/meal-complexity';
import { MEAL_SIZE } from '~/shared/constants/meal-size';
import { MEAL_TYPE } from '~/shared/constants/meal-type';
import { ROLE } from '~/shared/constants/role';
import { UNIT } from '~/shared/constants/unit';
import {
  DishModel,
  IngredientModel,
  ScheduleModel,
  UserModel
} from '~/shared/database/models';

describe('ScheduleService.updateScheduleMeals', () => {
  let userId: string;
  let scheduleId: string;
  let dishId: string;
  const userName = 'Test User';

  beforeAll(async () => {
    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_URI || 'mongodb://localhost:27017/test'
      );
    }
  });

  beforeEach(async () => {
    // Clean up database before each test
    await ScheduleModel.deleteMany({});
    await UserModel.deleteMany({});
    await DishModel.deleteMany({});
    await IngredientModel.deleteMany({});

    // Create test user
    const user = await UserModel.create({
      email: 'testuser@example.com',
      name: userName,
      password: 'hashedPassword',
      role: ROLE.USER,
      mealSettings: [
        {
          name: MEAL_TYPE.BREAKFAST,
          mealSize: MEAL_SIZE.NORMAL,
          availableTime: AVAILABLE_TIME.SOME_TIME,
          cookingPreference: COOKING_PREFERENCE.CAN_COOK,
          complexity: MEAL_COMPLEXITY.SIMPLE
        }
      ]
    });
    userId = user._id.toString();

    // Create test ingredient
    const ingredient = await IngredientModel.create({
      name: 'Thịt bò',
      categories: [INGREDIENT_CATEGORY.MEAT],
      baseUnit: { amount: 100, unit: UNIT.GRAM },
      nutrition: {
        nutrients: {
          calories: { value: 250, unit: UNIT.KILOCALORIE },
          carbs: { value: 0, unit: UNIT.GRAM },
          fat: { value: 17, unit: UNIT.GRAM },
          protein: { value: 26, unit: UNIT.GRAM },
          fiber: { value: 0, unit: UNIT.GRAM },
          sodium: { value: 75, unit: UNIT.GRAM },
          cholesterol: { value: 95, unit: UNIT.GRAM }
        }
      }
    });

    // Create test dish
    const dish = await DishModel.create({
      user: { _id: userId, name: userName },
      name: 'Bò nướng',
      ingredients: [
        {
          ingredientId: ingredient._id,
          name: 'Thịt bò',
          baseUnit: { amount: 100, unit: UNIT.GRAM },
          units: [{ value: 150, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ]
    });
    dishId = dish._id.toString();

    // Create test schedule
    const schedule = await ScheduleModel.create({
      user: { _id: userId, name: userName },
      date: new Date('2026-02-15'),
      dayOfWeek: DAY_OF_WEEK.MONDAY,
      meals: [
        {
          mealType: MEAL_TYPE.BREAKFAST,
          dishes: []
        }
      ]
    });
    scheduleId = schedule._id.toString();
  });

  afterEach(async () => {
    // Clean up after each test
    await ScheduleModel.deleteMany({});
    await UserModel.deleteMany({});
    await DishModel.deleteMany({});
    await IngredientModel.deleteMany({});
  });

  afterAll(async () => {
    // Close connection
    await mongoose.connection.close();
  });

  // Branch - Happy case - add dish to meal
  it('should add dish to meal successfully', async () => {
    const updateData = {
      meals: [
        {
          mealType: MEAL_TYPE.BREAKFAST,
          dishes: [{ dishId, servings: 1, isEaten: false }]
        }
      ]
    };

    const updated = await ScheduleService.updateScheduleMeals(
      scheduleId,
      userId,
      updateData as any
    );

    expect(updated).toBeDefined();
    expect(updated.meals[0].dishes).toBeDefined();
    expect(updated.meals[0].dishes.length).toBe(1);
    expect(updated.meals[0].dishes[0].name).toBe('Bò nướng');
  });

  // Branch - Update existing dish
  it('should update existing dish in meal', async () => {
    const updateData = {
      meals: [
        {
          mealType: MEAL_TYPE.BREAKFAST,
          dishes: [{ dishId, servings: 2, isEaten: true }]
        }
      ]
    };

    const updated = await ScheduleService.updateScheduleMeals(
      scheduleId,
      userId,
      updateData as any
    );

    expect(updated).toBeDefined();
    expect(updated.meals[0].dishes[0].servings).toBe(2);
    expect(updated.meals[0].dishes[0].isEaten).toBe(true);
  });

  // Branch - Invalid schedule ID
  it('should throw error when schedule ID is invalid', async () => {
    const updateData = {
      meals: [
        {
          mealType: MEAL_TYPE.BREAKFAST,
          dishes: []
        }
      ]
    };

    await expect(
      ScheduleService.updateScheduleMeals(
        'invalid-id',
        userId,
        updateData as any
      )
    ).rejects.toThrow('Định dạng ID lịch ăn không hợp lệ');
  });

  // Branch - Non-existent schedule
  it('should throw error when schedule does not exist', async () => {
    const nonExistentScheduleId = new mongoose.Types.ObjectId().toString();
    const updateData = {
      meals: [
        {
          mealType: MEAL_TYPE.BREAKFAST,
          dishes: []
        }
      ]
    };

    await expect(
      ScheduleService.updateScheduleMeals(
        nonExistentScheduleId,
        userId,
        updateData as any
      )
    ).rejects.toThrow('Không tìm thấy lịch ăn');
  });

  // Branch - User can't update other user's schedule
  it('should throw error when user tries to update other user schedule', async () => {
    const otherUserId = new mongoose.Types.ObjectId().toString();
    const updateData = {
      meals: [
        {
          mealType: MEAL_TYPE.BREAKFAST,
          dishes: []
        }
      ]
    };

    await expect(
      ScheduleService.updateScheduleMeals(
        scheduleId,
        otherUserId,
        updateData as any
      )
    ).rejects.toThrow('Bạn không có quyền cập nhật lịch ăn này');
  });

  // Branch - Invalid meal type
  it('should throw error when meal type is invalid', async () => {
    const updateData = {
      meals: [
        {
          mealType: 'invalid-meal',
          dishes: []
        }
      ]
    };

    await expect(
      ScheduleService.updateScheduleMeals(scheduleId, userId, updateData as any)
    ).rejects.toThrow('Loại bữa ăn không hợp lệ');
  });

  // Branch - Non-existent dish
  it('should throw error when dish does not exist', async () => {
    const nonExistentDishId = new mongoose.Types.ObjectId().toString();
    const updateData = {
      meals: [
        {
          mealType: MEAL_TYPE.BREAKFAST,
          dishes: [
            {
              dishId: nonExistentDishId,
              servings: 1
            }
          ]
        }
      ]
    };

    await expect(
      ScheduleService.updateScheduleMeals(scheduleId, userId, updateData as any)
    ).rejects.toThrow('Không tìm thấy món ăn');
  });

  // Branch - Invalid dishId format
  it('should throw error when dishId format is invalid', async () => {
    const updateData = {
      meals: [
        {
          mealType: MEAL_TYPE.BREAKFAST,
          dishes: [
            {
              dishId: 'invalid-id-format',
              servings: 1
            }
          ]
        }
      ]
    };

    await expect(
      ScheduleService.updateScheduleMeals(scheduleId, userId, updateData as any)
    ).rejects.toThrow('Định dạng ID món ăn không hợp lệ');
  });
});
