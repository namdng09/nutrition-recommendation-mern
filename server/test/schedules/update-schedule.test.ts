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

describe('ScheduleService.updateSchedule', () => {
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

  // Branch - Happy case - user updates own schedule
  it('should update schedule successfully with valid data', async () => {
    const updateData = {
      date: new Date('2026-02-16'),
      dayOfWeek: DAY_OF_WEEK.TUESDAY,
      notes: 'Updated notes'
    };

    const updatedSchedule = await ScheduleService.updateSchedule(
      scheduleId,
      userId,
      ROLE.USER,
      updateData as any
    );

    expect(updatedSchedule).toBeDefined();
    expect(updatedSchedule._id.toString()).toBe(scheduleId);
    expect(updatedSchedule.date).toEqual(new Date('2026-02-16'));
    expect(updatedSchedule.dayOfWeek).toBe(DAY_OF_WEEK.TUESDAY);
    expect(updatedSchedule.notes).toBe('Updated notes');
  });

  // Branch - Admin can update any schedule
  it('should allow admin to update any schedule', async () => {
    const updateData = {
      notes: 'Admin updated notes'
    };

    const updatedSchedule = await ScheduleService.updateSchedule(
      scheduleId,
      adminId,
      ROLE.ADMIN,
      updateData as any
    );

    expect(updatedSchedule).toBeDefined();
    expect(updatedSchedule.notes).toBe('Admin updated notes');
  });

  // Branch - User can't update other user's schedule
  it('should throw error when user tries to update other user schedule', async () => {
    const otherUserId = new mongoose.Types.ObjectId().toString();
    const updateData = {
      notes: 'Updated notes'
    };

    await expect(
      ScheduleService.updateSchedule(
        scheduleId,
        otherUserId,
        ROLE.USER,
        updateData as any
      )
    ).rejects.toThrow('Bạn không có quyền cập nhật lịch ăn này');
  });

  // Branch - Invalid schedule ID
  it('should throw error when schedule ID is invalid', async () => {
    const updateData = {
      notes: 'Updated notes'
    };

    await expect(
      ScheduleService.updateSchedule(
        'invalid-id',
        userId,
        ROLE.USER,
        updateData as any
      )
    ).rejects.toThrow('Định dạng ID lịch ăn không hợp lệ');
  });

  // Branch - Non-existent schedule
  it('should throw error when schedule does not exist', async () => {
    const nonExistentScheduleId = new mongoose.Types.ObjectId().toString();
    const updateData = {
      notes: 'Updated notes'
    };

    await expect(
      ScheduleService.updateSchedule(
        nonExistentScheduleId,
        userId,
        ROLE.USER,
        updateData as any
      )
    ).rejects.toThrow('Không tìm thấy lịch ăn');
  });

  // Branch - Invalid date value
  it('should throw error when date is invalid', async () => {
    const updateData = {
      date: 'invalid-date',
      dayOfWeek: DAY_OF_WEEK.TUESDAY
    };

    await expect(
      ScheduleService.updateSchedule(
        scheduleId,
        userId,
        ROLE.USER,
        updateData as any
      )
    ).rejects.toThrow('Định dạng ngày không hợp lệ');
  });
});
