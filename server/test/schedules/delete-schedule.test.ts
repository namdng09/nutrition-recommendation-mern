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

describe('ScheduleService.deleteSchedule', () => {
  let userId: string;
  let adminId: string;
  let scheduleId: string;
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

    // Create test schedule
    const schedule = await ScheduleModel.create({
      user: { _id: userId, name: userName },
      date: new Date('2026-02-15'),
      dayOfWeek: DAY_OF_WEEK.MONDAY,
      meals: [{ mealType: 'Breakfast', dishes: [] }]
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

  // Branch - Happy case - user deletes own schedule
  it('should delete schedule successfully', async () => {
    await ScheduleService.deleteSchedule(scheduleId, userId, ROLE.USER);

    const deletedSchedule = await ScheduleModel.findById(scheduleId);
    expect(deletedSchedule).toBeNull();
  });

  // Branch - Admin can delete any schedule
  it('should allow admin to delete any schedule', async () => {
    await ScheduleService.deleteSchedule(scheduleId, adminId, ROLE.ADMIN);

    const deletedSchedule = await ScheduleModel.findById(scheduleId);
    expect(deletedSchedule).toBeNull();
  });

  // Branch - User can't delete other user's schedule
  it('should throw error when user tries to delete other user schedule', async () => {
    const otherUserId = new mongoose.Types.ObjectId().toString();

    await expect(
      ScheduleService.deleteSchedule(scheduleId, otherUserId, ROLE.USER)
    ).rejects.toThrow('Bạn không có quyền xóa lịch ăn này');
  });

  // Branch - Invalid schedule ID
  it('should throw error when schedule ID is invalid', async () => {
    await expect(
      ScheduleService.deleteSchedule('invalid-id', userId, ROLE.USER)
    ).rejects.toThrow('Định dạng ID lịch ăn không hợp lệ');
  });

  // Branch - Non-existent schedule
  it('should throw error when schedule does not exist', async () => {
    const nonExistentScheduleId = new mongoose.Types.ObjectId().toString();

    await expect(
      ScheduleService.deleteSchedule(nonExistentScheduleId, userId, ROLE.USER)
    ).rejects.toThrow('Không tìm thấy lịch ăn');
  });
});
