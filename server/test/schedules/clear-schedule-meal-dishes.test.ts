import { afterEach, describe, expect, it, vi } from 'vitest';

import { ScheduleService } from '~/features/schedules/schedule-service';
import { MEAL_TYPE } from '~/shared/constants/meal-type';
import { ScheduleModel } from '~/shared/database/models';

vi.mock('~/shared/database/models', () => ({
  ScheduleModel: {
    findById: vi.fn()
  }
}));

const mockFindScheduleById = vi.mocked(ScheduleModel.findById);

const VALID_SCHEDULE_ID = '507f1f77bcf86cd799439013';
const VALID_USER_ID = '507f1f77bcf86cd799439011';

describe('ScheduleService.clearScheduleMealDishes', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should clear all dishes from meal successfully', async () => {
    const scheduleDoc = {
      user: { _id: { toString: () => VALID_USER_ID } },
      meals: [
        {
          mealType: MEAL_TYPE.BREAKFAST,
          dishes: [{ name: 'Dish 1' }, { name: 'Dish 2' }, { name: 'Dish 3' }]
        }
      ],
      save: vi.fn()
    };
    mockFindScheduleById.mockResolvedValue(scheduleDoc as any);

    const updated = await ScheduleService.clearScheduleMealDishes(
      VALID_SCHEDULE_ID,
      VALID_USER_ID,
      MEAL_TYPE.BREAKFAST
    );

    expect(updated.meals[0].dishes.length).toBe(0);
    expect(scheduleDoc.save).toHaveBeenCalledOnce();
  });

  it('should throw error when schedule ID is invalid', async () => {
    await expect(
      ScheduleService.clearScheduleMealDishes(
        'invalid-id',
        VALID_USER_ID,
        MEAL_TYPE.BREAKFAST
      )
    ).rejects.toMatchObject({
      status: 400,
      message: 'Định dạng ID lịch ăn không hợp lệ'
    });
  });

  it('should throw error when schedule does not exist', async () => {
    mockFindScheduleById.mockResolvedValue(null);

    await expect(
      ScheduleService.clearScheduleMealDishes(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        MEAL_TYPE.BREAKFAST
      )
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy lịch ăn'
    });
  });

  it('should throw error when user clears another user schedule', async () => {
    mockFindScheduleById.mockResolvedValue({
      user: { _id: { toString: () => '507f1f77bcf86cd799439099' } },
      meals: []
    } as any);

    await expect(
      ScheduleService.clearScheduleMealDishes(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        MEAL_TYPE.BREAKFAST
      )
    ).rejects.toMatchObject({
      status: 403,
      message: 'Bạn không có quyền cập nhật lịch ăn này'
    });
  });

  it('should throw error when meal does not exist', async () => {
    mockFindScheduleById.mockResolvedValue({
      user: { _id: { toString: () => VALID_USER_ID } },
      meals: []
    } as any);

    await expect(
      ScheduleService.clearScheduleMealDishes(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        MEAL_TYPE.BREAKFAST
      )
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy bữa ăn'
    });
  });
});
