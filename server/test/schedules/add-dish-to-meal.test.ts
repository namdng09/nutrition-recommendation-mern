import { afterEach, describe, expect, it, vi } from 'vitest';

import { updateScheduleMealsRequestSchema } from '~/features/schedules/schedule-dto';
import { ScheduleService } from '~/features/schedules/schedule-service';
import { MEAL_TYPE } from '~/shared/constants/meal-type';
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
const mockFindDishes = vi.mocked(DishModel.find);

const VALID_SCHEDULE_ID = '507f1f77bcf86cd799439013';
const VALID_USER_ID = '507f1f77bcf86cd799439011';
const VALID_DISH_ID = '507f1f77bcf86cd799439014';

const createDishesArray = (items: any[] = []) => {
  const arr = [...items] as any[];
  (arr as any).create = (payload: any) => payload;
  return arr as any;
};

const createMealsArray = (
  items: Array<{ mealType: string; dishes?: any[]; notes?: string }>
) => {
  const arr = items.map(item => ({
    ...item,
    dishes: createDishesArray(item.dishes ?? [])
  })) as any[];
  (arr as any).create = (payload: any) => ({
    ...payload,
    dishes: createDishesArray(payload.dishes ?? [])
  });
  return arr as any;
};

describe('UC50 - Add dish to meal', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fail when servings is negative', async () => {
    const result = updateScheduleMealsRequestSchema.safeParse({
      meals: [
        {
          mealType: MEAL_TYPE.BREAKFAST,
          dishes: [{ dishId: VALID_DISH_ID, servings: -1 }]
        }
      ]
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      'Số khẩu phần phải lớn hơn hoặc bằng 0'
    );
  });

  it('should throw 400 when schedule id is invalid', async () => {
    await expect(
      ScheduleService.updateScheduleMeals('invalid-id', VALID_USER_ID, {
        meals: [
          {
            mealType: MEAL_TYPE.BREAKFAST,
            dishes: [{ dishId: VALID_DISH_ID, servings: 2 }]
          }
        ]
      } as any)
    ).rejects.toMatchObject({
      status: 400,
      message: 'Định dạng ID lịch ăn không hợp lệ'
    });
  });

  it('should throw 404 when schedule does not exist', async () => {
    mockFindScheduleById.mockResolvedValue(null);

    await expect(
      ScheduleService.updateScheduleMeals(VALID_SCHEDULE_ID, VALID_USER_ID, {
        meals: [
          {
            mealType: MEAL_TYPE.BREAKFAST,
            dishes: [{ dishId: VALID_DISH_ID, servings: 2 }]
          }
        ]
      } as any)
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy lịch ăn'
    });
  });

  it('should throw 400 when dishId is invalid', async () => {
    const scheduleDoc = {
      user: { _id: { toString: () => VALID_USER_ID } },
      meals: createMealsArray([{ mealType: MEAL_TYPE.BREAKFAST, dishes: [] }])
    };
    const query = {
      select: vi.fn(),
      lean: vi.fn()
    };
    query.select.mockReturnValue(query as any);
    query.lean.mockResolvedValue([]);

    mockFindScheduleById.mockResolvedValue(scheduleDoc as any);
    mockFindDishes.mockReturnValue(query as any);

    await expect(
      ScheduleService.updateScheduleMeals(VALID_SCHEDULE_ID, VALID_USER_ID, {
        meals: [
          {
            mealType: MEAL_TYPE.BREAKFAST,
            dishes: [{ dishId: 'invalid-dish-id', servings: 1 }]
          }
        ]
      } as any)
    ).rejects.toMatchObject({
      status: 400,
      message: 'Định dạng ID món ăn không hợp lệ'
    });
  });

  it('should throw 404 when dish does not exist', async () => {
    const scheduleDoc = {
      user: { _id: { toString: () => VALID_USER_ID } },
      meals: createMealsArray([{ mealType: MEAL_TYPE.BREAKFAST, dishes: [] }])
    };
    const query = {
      select: vi.fn(),
      lean: vi.fn()
    };
    query.select.mockReturnValue(query as any);
    query.lean.mockResolvedValue([]);

    mockFindScheduleById.mockResolvedValue(scheduleDoc as any);
    mockFindDishes.mockReturnValue(query as any);

    await expect(
      ScheduleService.updateScheduleMeals(VALID_SCHEDULE_ID, VALID_USER_ID, {
        meals: [
          {
            mealType: MEAL_TYPE.BREAKFAST,
            dishes: [{ dishId: VALID_DISH_ID, servings: 1 }]
          }
        ]
      } as any)
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy món ăn'
    });
  });

  it('should throw 403 when adding private dish from another user', async () => {
    const scheduleDoc = {
      user: { _id: { toString: () => VALID_USER_ID } },
      meals: createMealsArray([{ mealType: MEAL_TYPE.BREAKFAST, dishes: [] }])
    };
    const query = {
      select: vi.fn(),
      lean: vi.fn()
    };
    query.select.mockReturnValue(query as any);
    query.lean.mockResolvedValue([
      {
        _id: { toString: () => VALID_DISH_ID },
        isPublic: false,
        user: { _id: { toString: () => '507f1f77bcf86cd799439088' } }
      }
    ] as any);

    mockFindScheduleById.mockResolvedValue(scheduleDoc as any);
    mockFindDishes.mockReturnValue(query as any);

    await expect(
      ScheduleService.updateScheduleMeals(VALID_SCHEDULE_ID, VALID_USER_ID, {
        meals: [
          {
            mealType: MEAL_TYPE.BREAKFAST,
            dishes: [{ dishId: VALID_DISH_ID, servings: 1 }]
          }
        ]
      } as any)
    ).rejects.toMatchObject({
      status: 403,
      message: 'Bạn không có quyền sử dụng món ăn riêng tư của người khác'
    });
  });

  it('should add dish with default isEaten false and recalculate energy', async () => {
    const scheduleDoc = {
      user: { _id: { toString: () => VALID_USER_ID } },
      meals: createMealsArray([{ mealType: MEAL_TYPE.BREAKFAST, dishes: [] }]),
      save: vi.fn()
    };
    const query = {
      select: vi.fn(),
      lean: vi.fn()
    };
    query.select.mockReturnValue(query as any);
    query.lean.mockResolvedValue([
      {
        _id: { toString: () => VALID_DISH_ID },
        name: 'Chicken Salad',
        image: 'chicken.jpg',
        servings: 1,
        isPublic: true,
        nutrition: {
          nutrients: [{ value: 250 }]
        }
      }
    ] as any);

    mockFindScheduleById.mockResolvedValue(scheduleDoc as any);
    mockFindDishes.mockReturnValue(query as any);

    const updated = await ScheduleService.updateScheduleMeals(
      VALID_SCHEDULE_ID,
      VALID_USER_ID,
      {
        meals: [
          {
            mealType: MEAL_TYPE.BREAKFAST,
            dishes: [{ dishId: VALID_DISH_ID, servings: 2 }]
          }
        ]
      } as any
    );

    expect(updated.meals[0].dishes.length).toBe(1);
    expect(updated.meals[0].dishes[0].isEaten).toBe(false);
    expect(updated.meals[0].dishes[0].energy).toBe(500);
    expect(scheduleDoc.save).toHaveBeenCalledOnce();
  });

  it('should increase servings when adding same dish in same meal', async () => {
    const scheduleDoc = {
      user: { _id: { toString: () => VALID_USER_ID } },
      meals: createMealsArray([
        {
          mealType: MEAL_TYPE.BREAKFAST,
          dishes: [
            {
              dishId: { toString: () => VALID_DISH_ID },
              servings: 1,
              isEaten: false,
              energy: 250
            }
          ]
        }
      ]),
      save: vi.fn()
    };
    const query = {
      select: vi.fn(),
      lean: vi.fn()
    };
    query.select.mockReturnValue(query as any);
    query.lean.mockResolvedValue([
      {
        _id: { toString: () => VALID_DISH_ID },
        name: 'Chicken Salad',
        image: 'chicken.jpg',
        servings: 1,
        isPublic: true,
        nutrition: {
          nutrients: [{ value: 250 }]
        }
      }
    ] as any);

    mockFindScheduleById.mockResolvedValue(scheduleDoc as any);
    mockFindDishes.mockReturnValue(query as any);

    const updated = await ScheduleService.updateScheduleMeals(
      VALID_SCHEDULE_ID,
      VALID_USER_ID,
      {
        meals: [
          {
            mealType: MEAL_TYPE.BREAKFAST,
            dishes: [{ dishId: VALID_DISH_ID, servings: 3 }]
          }
        ]
      } as any
    );

    expect(updated.meals[0].dishes.length).toBe(1);
    expect(updated.meals[0].dishes[0].servings).toBe(3);
    expect(updated.meals[0].dishes[0].energy).toBe(750);
  });
});
