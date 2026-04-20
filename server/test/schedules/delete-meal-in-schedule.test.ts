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

describe('UC55 - Delete meal in schedule', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should remove selected meal successfully', async () => {
    const scheduleDoc = {
      user: { _id: { toString: () => VALID_USER_ID } },
      meals: [
        {
          mealType: MEAL_TYPE.BREAKFAST,
          dishes: [{ name: 'Dish 1' }, { name: 'Dish 2' }]
        },
        {
          mealType: MEAL_TYPE.LUNCH,
          dishes: [{ name: 'Dish Lunch 1' }]
        }
      ],
      save: vi.fn()
    };

    mockFindScheduleById.mockResolvedValue(scheduleDoc as any);

    const updated = await ScheduleService.removeScheduleMeal(
      VALID_SCHEDULE_ID,
      VALID_USER_ID,
      MEAL_TYPE.BREAKFAST
    );

    expect(
      updated.meals.find(m => m.mealType === MEAL_TYPE.BREAKFAST)
    ).toBeUndefined();
    expect(
      updated.meals.find(m => m.mealType === MEAL_TYPE.LUNCH)?.dishes
    ).toHaveLength(1);
    expect(updated.meals).toHaveLength(1);
    expect(scheduleDoc.save).toHaveBeenCalledOnce();
  });

  it('should throw 400 when schedule id is invalid', async () => {
    await expect(
      ScheduleService.removeScheduleMeal(
        'invalid-id',
        VALID_USER_ID,
        MEAL_TYPE.BREAKFAST
      )
    ).rejects.toMatchObject({
      status: 400,
      message: 'Định dạng ID lịch ăn không hợp lệ'
    });
  });

  it('should throw 404 when schedule not found', async () => {
    mockFindScheduleById.mockResolvedValue(null);

    await expect(
      ScheduleService.removeScheduleMeal(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        MEAL_TYPE.BREAKFAST
      )
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy lịch ăn'
    });
  });

  it('should throw 403 when user removes meal from another user schedule', async () => {
    mockFindScheduleById.mockResolvedValue({
      user: { _id: { toString: () => '507f1f77bcf86cd799439099' } },
      meals: []
    } as any);

    await expect(
      ScheduleService.removeScheduleMeal(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        MEAL_TYPE.BREAKFAST
      )
    ).rejects.toMatchObject({
      status: 403,
      message: 'Bạn không có quyền cập nhật lịch ăn này'
    });
  });

  it('should throw 404 when meal does not exist in schedule', async () => {
    mockFindScheduleById.mockResolvedValue({
      user: { _id: { toString: () => VALID_USER_ID } },
      meals: [{ mealType: MEAL_TYPE.DINNER, dishes: [] }]
    } as any);

    await expect(
      ScheduleService.removeScheduleMeal(
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
