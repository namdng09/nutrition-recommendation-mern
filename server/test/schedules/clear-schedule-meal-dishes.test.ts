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
import { MEAL_COMPLEXITY } from '~/shared/constants/meal-complexity';
import { MEAL_SIZE } from '~/shared/constants/meal-size';
import { MEAL_TYPE } from '~/shared/constants/meal-type';
import { ROLE } from '~/shared/constants/role';
import { ScheduleModel, UserModel } from '~/shared/database/models';

describe('ScheduleService.clearScheduleMealDishes', () => {
  let userId: string;
  let scheduleId: string;
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

    // Create test schedule with multiple dishes
    const schedule = await ScheduleModel.create({
      user: { _id: userId, name: userName },
      date: new Date('2026-02-15'),
      dayOfWeek: DAY_OF_WEEK.MONDAY,
      meals: [
        {
          mealType: MEAL_TYPE.BREAKFAST,
          dishes: [
            {
              dishId: new mongoose.Types.ObjectId(),
              name: 'Bò nướng',
              image: 'image.jpg',
              calories: 375,
              servings: 1,
              isEaten: false
            },
            {
              dishId: new mongoose.Types.ObjectId(),
              name: 'Cơm',
              image: 'rice.jpg',
              calories: 200,
              servings: 1,
              isEaten: false
            },
            {
              dishId: new mongoose.Types.ObjectId(),
              name: 'Rau xanh',
              image: 'vege.jpg',
              calories: 50,
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
  });

  afterAll(async () => {
    // Close connection
    await mongoose.connection.close();
  });

  // Branch - Happy case - clear all dishes from meal
  it('should clear all dishes from meal successfully', async () => {
    const updated = await ScheduleService.clearScheduleMealDishes(
      scheduleId,
      userId,
      MEAL_TYPE.BREAKFAST
    );

    expect(updated).toBeDefined();
    expect(updated.meals[0].dishes).toBeDefined();
    expect(updated.meals[0].dishes.length).toBe(0);
  });

  // Branch - Invalid schedule ID
  it('should throw error when schedule ID is invalid', async () => {
    await expect(
      ScheduleService.clearScheduleMealDishes(
        'invalid-id',
        userId,
        MEAL_TYPE.BREAKFAST
      )
    ).rejects.toThrow('Định dạng ID lịch ăn không hợp lệ');
  });

  // Branch - Non-existent schedule
  it('should throw error when schedule does not exist', async () => {
    const nonExistentScheduleId = new mongoose.Types.ObjectId().toString();

    await expect(
      ScheduleService.clearScheduleMealDishes(
        nonExistentScheduleId,
        userId,
        MEAL_TYPE.BREAKFAST
      )
    ).rejects.toThrow('Không tìm thấy lịch ăn');
  });

  // Branch - User can't update other user's schedule
  it('should throw error when user tries to clear other user schedule', async () => {
    const otherUserId = new mongoose.Types.ObjectId().toString();

    await expect(
      ScheduleService.clearScheduleMealDishes(
        scheduleId,
        otherUserId,
        MEAL_TYPE.BREAKFAST
      )
    ).rejects.toThrow('Bạn không có quyền cập nhật lịch ăn này');
  });

  // Branch - Meal not found
  it('should throw error when meal does not exist in schedule', async () => {
    await expect(
      ScheduleService.clearScheduleMealDishes(
        scheduleId,
        userId,
        MEAL_TYPE.LUNCH
      )
    ).rejects.toThrow('Không tìm thấy bữa ăn');
  });
});
