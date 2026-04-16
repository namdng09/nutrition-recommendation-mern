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
const VALID_DISH_ID = '507f1f77bcf86cd799439014';

describe('ScheduleService.updateScheduleDishStatus', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should update dish status successfully', async () => {
    const scheduleDoc = {
      user: { _id: { toString: () => VALID_USER_ID } },
      meals: [
        {
          mealType: MEAL_TYPE.BREAKFAST,
          dishes: [
            {
              dishId: { toString: () => VALID_DISH_ID },
              isEaten: false
            }
          ]
        }
      ],
      save: vi.fn()
    };
    mockFindScheduleById.mockResolvedValue(scheduleDoc as any);

    const updated = await ScheduleService.updateScheduleDishStatus(
      VALID_SCHEDULE_ID,
      VALID_USER_ID,
      MEAL_TYPE.BREAKFAST,
      VALID_DISH_ID,
      { isEaten: true } as any
    );

    expect(updated.meals[0].dishes[0].isEaten).toBe(true);
    expect(scheduleDoc.save).toHaveBeenCalledOnce();
  });

  it('should throw error when schedule ID is invalid', async () => {
    await expect(
      ScheduleService.updateScheduleDishStatus(
        'invalid-id',
        VALID_USER_ID,
        MEAL_TYPE.BREAKFAST,
        VALID_DISH_ID,
        { isEaten: true } as any
      )
    ).rejects.toMatchObject({
      status: 400,
      message: 'Định dạng ID lịch ăn không hợp lệ'
    });
  });

  it('should throw error when dish ID is invalid', async () => {
    await expect(
      ScheduleService.updateScheduleDishStatus(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        MEAL_TYPE.BREAKFAST,
        'invalid-id',
        { isEaten: true } as any
      )
    ).rejects.toMatchObject({
      status: 400,
      message: 'Định dạng ID món ăn không hợp lệ'
    });
  });

  it('should throw error when meal type is invalid', async () => {
    await expect(
      ScheduleService.updateScheduleDishStatus(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        'invalid-meal',
        VALID_DISH_ID,
        { isEaten: true } as any
      )
    ).rejects.toMatchObject({
      status: 400,
      message: 'Loại bữa ăn không hợp lệ'
    });
  });

  it('should throw error when schedule does not exist', async () => {
    mockFindScheduleById.mockResolvedValue(null);

    await expect(
      ScheduleService.updateScheduleDishStatus(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        MEAL_TYPE.BREAKFAST,
        VALID_DISH_ID,
        { isEaten: true } as any
      )
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy lịch ăn'
    });
  });

  it('should throw error when user updates another user schedule', async () => {
    mockFindScheduleById.mockResolvedValue({
      user: { _id: { toString: () => '507f1f77bcf86cd799439099' } },
      meals: []
    } as any);

    await expect(
      ScheduleService.updateScheduleDishStatus(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        MEAL_TYPE.BREAKFAST,
        VALID_DISH_ID,
        { isEaten: true } as any
      )
    ).rejects.toMatchObject({
      status: 403,
      message: 'Bạn không có quyền cập nhật lịch ăn này'
    });
  });

  it('should throw error when meal does not exist in schedule', async () => {
    mockFindScheduleById.mockResolvedValue({
      user: { _id: { toString: () => VALID_USER_ID } },
      meals: []
    } as any);

    await expect(
      ScheduleService.updateScheduleDishStatus(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        MEAL_TYPE.BREAKFAST,
        VALID_DISH_ID,
        { isEaten: true } as any
      )
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy bữa ăn'
    });
  });

  it('should throw error when dish does not exist in meal', async () => {
    mockFindScheduleById.mockResolvedValue({
      user: { _id: { toString: () => VALID_USER_ID } },
      meals: [{ mealType: MEAL_TYPE.BREAKFAST, dishes: [] }]
    } as any);

    await expect(
      ScheduleService.updateScheduleDishStatus(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        MEAL_TYPE.BREAKFAST,
        VALID_DISH_ID,
        { isEaten: true } as any
      )
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy món ăn trong bữa'
    });
  });
});
