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

describe('ScheduleService.viewScheduleDetail', () => {
  let userId: string;
  let adminId: string;
  let scheduleId: string;
  let dishId: string;
  const userName = 'Test User';
  const adminName = 'Admin User';

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

    // Create test users
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

    const admin = await UserModel.create({
      email: 'admin@example.com',
      name: adminName,
      password: 'hashedPassword',
      role: ROLE.ADMIN,
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
    adminId = admin._id.toString();

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

    // Create test schedule with dish
    const schedule = await ScheduleModel.create({
      user: { _id: userId, name: userName },
      date: new Date('2026-02-15'),
      dayOfWeek: DAY_OF_WEEK.MONDAY,
      meals: [
        {
          mealType: MEAL_TYPE.BREAKFAST,
          dishes: [
            {
              dishId: dish._id,
              name: 'Bò nướng',
              image: 'image.jpg',
              calories: 375,
              servings: 1,
              isEaten: false
            }
          ]
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

  // Branch - Happy case - user views own schedule
  it('should return schedule detail with nutrition for user', async () => {
    const detail = await ScheduleService.viewScheduleDetail(
      scheduleId,
      userId,
      ROLE.USER
    );

    expect(detail).toBeDefined();
    expect(detail._id).toBeDefined();
    expect(detail.meals).toBeDefined();
    expect(detail.meals.length).toBe(1);
    expect(detail.meals[0].dishes).toBeDefined();
  });

  // Branch - Admin views any schedule
  it('should allow admin to view any schedule', async () => {
    const detail = await ScheduleService.viewScheduleDetail(
      scheduleId,
      adminId,
      ROLE.ADMIN
    );

    expect(detail).toBeDefined();
    expect(detail._id).toBeDefined();
  });

  // Branch - User can't view other user's schedule
  it('should throw error when user tries to view other user schedule', async () => {
    const otherUserId = new mongoose.Types.ObjectId().toString();

    await expect(
      ScheduleService.viewScheduleDetail(scheduleId, otherUserId, ROLE.USER)
    ).rejects.toThrow('Bạn không có quyền xem lịch ăn này');
  });

  // Branch - Invalid schedule ID
  it('should throw error when schedule ID is invalid', async () => {
    await expect(
      ScheduleService.viewScheduleDetail('invalid-id', userId, ROLE.USER)
    ).rejects.toThrow('Định dạng ID lịch ăn không hợp lệ');
  });

  // Branch - Non-existent schedule
  it('should throw error when schedule does not exist', async () => {
    const nonExistentScheduleId = new mongoose.Types.ObjectId().toString();

    await expect(
      ScheduleService.viewScheduleDetail(
        nonExistentScheduleId,
        userId,
        ROLE.USER
      )
    ).rejects.toThrow('Không tìm thấy lịch ăn');
  });
});
