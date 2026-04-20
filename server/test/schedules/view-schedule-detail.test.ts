import { afterEach, describe, expect, it, vi } from 'vitest';

import { ScheduleService } from '~/features/schedules/schedule-service';
import { DAY_OF_WEEK } from '~/shared/constants/day-of-week';
import { MEAL_TYPE } from '~/shared/constants/meal-type';
import { ROLE } from '~/shared/constants/role';
import { DishModel, ScheduleModel } from '~/shared/database/models';

vi.mock('~/shared/database/models', () => ({
  ScheduleModel: {
    findById: vi.fn()
  },
  DishModel: {
    find: vi.fn()
  }
}));

const mockFindScheduleById = vi.mocked(ScheduleModel.findById);
const mockFindDish = vi.mocked(DishModel.find);

const VALID_USER_ID = '507f1f77bcf86cd799439011';
const VALID_ADMIN_ID = '507f1f77bcf86cd799439012';
const VALID_SCHEDULE_ID = '507f1f77bcf86cd799439013';
const VALID_DISH_ID = '507f1f77bcf86cd799439014';

describe('ScheduleService.viewScheduleDetail', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return schedule detail with nutrition for user', async () => {
    const scheduleDoc = {
      _id: VALID_SCHEDULE_ID,
      user: { _id: { toString: () => VALID_USER_ID } },
      meals: [
        {
          mealType: MEAL_TYPE.BREAKFAST,
          dishes: [
            {
              dishId: { toString: () => VALID_DISH_ID },
              name: 'Bun bo',
              servings: 1
            }
          ]
        }
      ],
      date: new Date('2026-02-15'),
      dayOfWeek: DAY_OF_WEEK.MONDAY,
      toObject: vi.fn()
    };
    scheduleDoc.toObject.mockReturnValue({
      _id: VALID_SCHEDULE_ID,
      user: { _id: VALID_USER_ID },
      meals: scheduleDoc.meals,
      date: scheduleDoc.date,
      dayOfWeek: scheduleDoc.dayOfWeek
    });

    const query = {
      select: vi.fn(),
      lean: vi.fn()
    };
    query.select.mockReturnValue(query as any);
    query.lean.mockResolvedValue([
      {
        _id: { toString: () => VALID_DISH_ID },
        servings: 1,
        nutrition: {
          nutrients: [{ label: 'Calories', value: 300, unit: 'kcal' }],
          minerals: [],
          vitamins: []
        }
      }
    ] as any);

    mockFindScheduleById.mockResolvedValue(scheduleDoc as any);
    mockFindDish.mockReturnValue(query as any);

    const detail = await ScheduleService.viewScheduleDetail(
      VALID_SCHEDULE_ID,
      VALID_USER_ID,
      ROLE.USER
    );
    const detailWithNutrition = detail as typeof detail & {
      totalNutrition?: {
        nutrients?: Array<{ value?: number }>;
      };
    };

    expect(detail._id).toBe(VALID_SCHEDULE_ID);
    expect(detail.meals.length).toBe(1);
    expect(detailWithNutrition.totalNutrition?.nutrients?.[0]?.value).toBe(300);
  });

  it('should aggregate nutrition and handle mixed dish edge cases', async () => {
    const oid = (id: string) => ({ toString: () => id });
    const dishB = '507f1f77bcf86cd799439015';

    const scheduleDoc = {
      _id: VALID_SCHEDULE_ID,
      user: { _id: oid(VALID_USER_ID) },
      meals: [
        {
          mealType: MEAL_TYPE.BREAKFAST,
          dishes: [
            { dishId: oid(VALID_DISH_ID), servings: 1 },
            { dishId: oid(dishB), servings: Number.NaN },
            { servings: 1 }
          ]
        },
        { mealType: MEAL_TYPE.LUNCH }
      ],
      toObject: vi.fn()
    };

    scheduleDoc.toObject.mockReturnValue({
      _id: VALID_SCHEDULE_ID,
      user: { _id: VALID_USER_ID },
      meals: scheduleDoc.meals
    });

    const query = {
      select: vi.fn(),
      lean: vi.fn()
    };
    query.select.mockReturnValue(query as any);
    query.lean.mockResolvedValue([
      {
        _id: oid(VALID_DISH_ID),
        servings: 1,
        nutrition: {
          nutrients: [
            { label: 'Calories', value: 100, unit: 'kcal' },
            { label: 'Protein', value: null, unit: 'g' }
          ],
          minerals: [],
          vitamins: []
        }
      },
      {
        _id: oid(dishB),
        servings: 1,
        nutrition: {
          nutrients: [{ label: 'Calories', value: 50, unit: null }],
          minerals: [],
          vitamins: []
        }
      }
    ] as any);

    mockFindScheduleById.mockResolvedValue(scheduleDoc as any);
    mockFindDish.mockReturnValue(query as any);

    const detail = await ScheduleService.viewScheduleDetail(
      VALID_SCHEDULE_ID,
      VALID_USER_ID,
      ROLE.USER
    );
    const detailWithNutrition = detail as typeof detail & {
      totalNutrition?: {
        nutrients?: Array<{ label?: string; value?: number; unit?: string }>;
      };
    };

    expect(detail.meals.length).toBe(2);
    expect(detailWithNutrition.totalNutrition?.nutrients?.length).toBe(1);
    expect(detailWithNutrition.totalNutrition?.nutrients?.[0]).toMatchObject({
      label: 'Calories',
      unit: 'kcal',
      value: 100
    });
  });

  it('should allow admin to view any schedule', async () => {
    const scheduleDoc = {
      user: { _id: { toString: () => VALID_USER_ID } },
      meals: [],
      toObject: vi.fn().mockReturnValue({ meals: [] })
    };
    mockFindScheduleById.mockResolvedValue(scheduleDoc as any);

    const detail = await ScheduleService.viewScheduleDetail(
      VALID_SCHEDULE_ID,
      VALID_ADMIN_ID,
      ROLE.ADMIN
    );

    expect(detail).toBeDefined();
  });

  it('should throw error when user tries to view other user schedule', async () => {
    mockFindScheduleById.mockResolvedValue({
      user: { _id: { toString: () => VALID_USER_ID } }
    } as any);

    await expect(
      ScheduleService.viewScheduleDetail(
        VALID_SCHEDULE_ID,
        VALID_ADMIN_ID,
        ROLE.USER
      )
    ).rejects.toMatchObject({
      status: 403,
      message: 'Bạn không có quyền xem lịch ăn này'
    });
  });

  it('should throw error when schedule ID is invalid', async () => {
    await expect(
      ScheduleService.viewScheduleDetail('invalid-id', VALID_USER_ID, ROLE.USER)
    ).rejects.toMatchObject({
      status: 400,
      message: 'Định dạng ID lịch ăn không hợp lệ'
    });
  });

  it('should throw error when schedule does not exist', async () => {
    mockFindScheduleById.mockResolvedValue(null);

    await expect(
      ScheduleService.viewScheduleDetail(
        VALID_SCHEDULE_ID,
        VALID_USER_ID,
        ROLE.USER
      )
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy lịch ăn'
    });
  });
});
