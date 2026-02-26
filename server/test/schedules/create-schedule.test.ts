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
import { ROLE } from '~/shared/constants/role';
import { ScheduleModel, UserModel } from '~/shared/database/models';

describe('ScheduleService.createSchedule', () => {
  let userId: string;
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
          name: 'Breakfast',
          mealSize: MEAL_SIZE.NORMAL,
          availableTime: AVAILABLE_TIME.SOME_TIME,
          cookingPreference: COOKING_PREFERENCE.CAN_COOK,
          complexity: MEAL_COMPLEXITY.SIMPLE
        },
        {
          name: 'Lunch',
          mealSize: MEAL_SIZE.NORMAL,
          availableTime: AVAILABLE_TIME.SOME_TIME,
          cookingPreference: COOKING_PREFERENCE.CAN_COOK,
          complexity: MEAL_COMPLEXITY.SIMPLE
        },
        {
          name: 'Dinner',
          mealSize: MEAL_SIZE.NORMAL,
          availableTime: AVAILABLE_TIME.MORE_TIME,
          cookingPreference: COOKING_PREFERENCE.CAN_COOK,
          complexity: MEAL_COMPLEXITY.MODERATE
        }
      ]
    });
    userId = user._id.toString();
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

  // Branch - Happy case
  it('should create schedule successfully', async () => {
    const scheduleData = {
      date: new Date('2026-02-15'),
      dayOfWeek: DAY_OF_WEEK.MONDAY
    };

    const schedule = await ScheduleService.createSchedule(
      userId,
      userName,
      scheduleData as any
    );

    expect(schedule).toBeDefined();
    expect(schedule._id).toBeDefined();
    expect(schedule.user?._id.toString()).toBe(userId);
    expect(schedule.user?.name).toBe(userName);
    expect(schedule.date).toEqual(new Date('2026-02-15'));
    expect(schedule.dayOfWeek).toBe(DAY_OF_WEEK.MONDAY);
    expect(schedule.meals).toBeDefined();
    expect(schedule.meals.length).toBe(3);
  });

  // Branch - Invalid date
  it('should throw error when date is invalid', async () => {
    const scheduleData = {
      date: 'invalid-date',
      dayOfWeek: DAY_OF_WEEK.MONDAY
    };

    await expect(
      ScheduleService.createSchedule(userId, userName, scheduleData as any)
    ).rejects.toThrow('Định dạng ngày không hợp lệ');
  });

  // Branch - Missing required field
  it('should throw error when date is missing', async () => {
    const scheduleData = {
      dayOfWeek: DAY_OF_WEEK.MONDAY
    };

    await expect(
      ScheduleService.createSchedule(userId, userName, scheduleData as any)
    ).rejects.toThrow('Định dạng ngày không hợp lệ');
  });

  // Branch - Invalid user ID
  it('should throw error when userId is invalid', async () => {
    const scheduleData = {
      date: new Date('2026-02-15'),
      dayOfWeek: DAY_OF_WEEK.MONDAY
    };

    await expect(
      ScheduleService.createSchedule(
        'invalid-id',
        userName,
        scheduleData as any
      )
    ).rejects.toThrow('Định dạng ID người dùng không hợp lệ');
  });

  // Branch - User not found
  it('should throw error when user does not exist', async () => {
    const scheduleData = {
      date: new Date('2026-02-15'),
      dayOfWeek: DAY_OF_WEEK.MONDAY
    };

    const nonExistentUserId = new mongoose.Types.ObjectId().toString();

    await expect(
      ScheduleService.createSchedule(
        nonExistentUserId,
        userName,
        scheduleData as any
      )
    ).rejects.toThrow('Không tìm thấy người dùng');
  });
});
