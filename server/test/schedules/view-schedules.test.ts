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

describe('ScheduleService.viewSchedules', () => {
  let userId: string;
  let adminId: string;
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

    // Create test users
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
          name: 'Breakfast',
          mealSize: MEAL_SIZE.NORMAL,
          availableTime: AVAILABLE_TIME.SOME_TIME,
          cookingPreference: COOKING_PREFERENCE.CAN_COOK,
          complexity: MEAL_COMPLEXITY.SIMPLE
        }
      ]
    });
    adminId = admin._id.toString();

    // Create test schedules for user
    for (let i = 0; i < 3; i++) {
      await ScheduleModel.create({
        user: { _id: userId, name: userName },
        date: new Date(`2026-02-${15 + i}`),
        dayOfWeek: DAY_OF_WEEK.MONDAY,
        meals: [{ mealType: 'Breakfast', dishes: [] }]
      });
    }

    // Create schedule for other user
    const otherUserId = new mongoose.Types.ObjectId().toString();
    await ScheduleModel.create({
      user: { _id: otherUserId, name: 'Other User' },
      date: new Date('2026-02-20'),
      dayOfWeek: DAY_OF_WEEK.FRIDAY,
      meals: [{ mealType: 'Breakfast', dishes: [] }]
    });
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

  // Branch - User viewing own schedules
  it('should return only user own schedules when not admin', async () => {
    const parsed = {
      sort: { date: 1 } as any,
      limit: 10,
      page: 1
    } as any;

    const result = await ScheduleService.viewSchedules(
      userId,
      ROLE.USER,
      parsed
    );

    expect(result).toBeDefined();
    expect(result.docs).toBeDefined();
    expect(result.docs.length).toBe(3);
    expect(result.docs[0].user?._id.toString()).toBe(userId);
  });

  // Branch - Admin viewing all schedules
  it('should return all schedules when admin requests all', async () => {
    const parsed = {
      sort: { date: 1 } as any,
      limit: 100,
      page: 1
    } as any;

    const result = await ScheduleService.viewSchedules(
      adminId,
      ROLE.ADMIN,
      parsed
    );

    expect(result).toBeDefined();
    expect(result.docs).toBeDefined();
    expect(result.docs.length).toBe(4);
  });

  // Branch - Invalid user ID
  it('should throw error when user ID is invalid', async () => {
    const parsed = {
      sort: { date: 1 } as any,
      limit: 10,
      page: 1
    } as any;

    await expect(
      ScheduleService.viewSchedules('invalid-id', ROLE.USER, parsed)
    ).rejects.toThrow('Định dạng ID người dùng không hợp lệ');
  });
});
