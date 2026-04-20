import { afterEach, describe, expect, it, vi } from 'vitest';

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
  items: Array<{ mealType: string; dishes?: any[] }>
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

describe('ScheduleService.updateScheduleMeals', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should add dish to meal successfully', async () => {
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
        name: 'Bo nuong',
        image: 'image.jpg',
        servings: 1,
        isPublic: true,
        nutrition: {
          nutrients: [{ value: 200 }]
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
            dishes: [{ dishId: VALID_DISH_ID, servings: 2, isEaten: true }]
          }
        ]
      } as any
    );

    expect(updated.meals[0].dishes.length).toBe(1);
    expect(updated.meals[0].dishes[0].energy).toBe(400);
    expect(updated.meals[0].dishes[0].isEaten).toBe(true);
    expect(scheduleDoc.save).toHaveBeenCalledOnce();
  });

  it('should update existing dish in meal', async () => {
    const scheduleDoc = {
      user: { _id: { toString: () => VALID_USER_ID } },
      meals: createMealsArray([
        {
          mealType: MEAL_TYPE.BREAKFAST,
          dishes: [
            {
              dishId: { toString: () => VALID_DISH_ID },
              name: 'Old dish',
              servings: 1,
              energy: 200,
              isEaten: false
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
        name: 'Bo nuong',
        image: 'image.jpg',
        servings: 1,
        isPublic: true,
        nutrition: {
          nutrients: [{ value: 300 }]
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
            dishes: [{ dishId: VALID_DISH_ID, servings: 1, isEaten: true }]
          }
        ]
      } as any
    );

    expect(updated.meals[0].dishes.length).toBe(1);
    expect(updated.meals[0].dishes[0].name).toBe('Bo nuong');
    expect(updated.meals[0].dishes[0].isEaten).toBe(true);
  });

  it('should throw error when schedule ID is invalid', async () => {
    await expect(
      ScheduleService.updateScheduleMeals('invalid-id', VALID_USER_ID, {
        meals: [{ mealType: MEAL_TYPE.BREAKFAST, dishes: [] }]
      } as any)
    ).rejects.toMatchObject({
      status: 400,
      message: 'Định dạng ID lịch ăn không hợp lệ'
    });
  });

  it('should throw error when schedule does not exist', async () => {
    mockFindScheduleById.mockResolvedValue(null);

    await expect(
      ScheduleService.updateScheduleMeals(VALID_SCHEDULE_ID, VALID_USER_ID, {
        meals: [{ mealType: MEAL_TYPE.BREAKFAST, dishes: [] }]
      } as any)
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy lịch ăn'
    });
  });

  it('should throw error when user tries to update other user schedule', async () => {
    mockFindScheduleById.mockResolvedValue({
      user: { _id: { toString: () => '507f1f77bcf86cd799439099' } },
      meals: createMealsArray([{ mealType: MEAL_TYPE.BREAKFAST, dishes: [] }])
    } as any);

    await expect(
      ScheduleService.updateScheduleMeals(VALID_SCHEDULE_ID, VALID_USER_ID, {
        meals: [{ mealType: MEAL_TYPE.BREAKFAST, dishes: [] }]
      } as any)
    ).rejects.toMatchObject({
      status: 403,
      message: 'Bạn không có quyền cập nhật lịch ăn này'
    });
  });

  it('should throw error when dish does not exist', async () => {
    const scheduleDoc = {
      user: { _id: { toString: () => VALID_USER_ID } },
      meals: createMealsArray([{ mealType: MEAL_TYPE.BREAKFAST, dishes: [] }])
    };
    const query = {
      select: vi.fn(),
      lean: vi.fn()
    };
    query.select.mockReturnValue(query as any);
    query.lean.mockResolvedValue([] as any);

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

  it('should throw error when dishId is missing', async () => {
    const scheduleDoc = {
      user: { _id: { toString: () => VALID_USER_ID } },
      meals: createMealsArray([{ mealType: MEAL_TYPE.BREAKFAST, dishes: [] }])
    };
    mockFindScheduleById.mockResolvedValue(scheduleDoc as any);

    await expect(
      ScheduleService.updateScheduleMeals(VALID_SCHEDULE_ID, VALID_USER_ID, {
        meals: [
          {
            mealType: MEAL_TYPE.BREAKFAST,
            dishes: [{ servings: 1 }]
          }
        ]
      } as any)
    ).rejects.toMatchObject({
      status: 400,
      message: 'ID món ăn là bắt buộc'
    });
  });

  it('should throw error when using private dish from other user', async () => {
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

  it('should throw error when dishId format is invalid', async () => {
    const scheduleDoc = {
      user: { _id: { toString: () => VALID_USER_ID } },
      meals: createMealsArray([{ mealType: MEAL_TYPE.BREAKFAST, dishes: [] }])
    };
    mockFindScheduleById.mockResolvedValue(scheduleDoc as any);

    await expect(
      ScheduleService.updateScheduleMeals(VALID_SCHEDULE_ID, VALID_USER_ID, {
        meals: [
          {
            mealType: MEAL_TYPE.BREAKFAST,
            dishes: [{ dishId: 'invalid-id-format', servings: 1 }]
          }
        ]
      } as any)
    ).rejects.toMatchObject({
      status: 400,
      message: 'Định dạng ID món ăn không hợp lệ'
    });
  });
});
