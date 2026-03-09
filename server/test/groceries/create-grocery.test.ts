import { afterEach, describe, expect, it, vi } from 'vitest';

import { createGroceryRequestSchema } from '~/features/groceries/grocery-dto';
import { GroceryService } from '~/features/groceries/grocery-service';
import {
  DishModel,
  GroceryModel,
  ScheduleModel
} from '~/shared/database/models';
import { validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  GroceryModel: { create: vi.fn() },
  ScheduleModel: { find: vi.fn() },
  DishModel: { find: vi.fn() },
  IngredientModel: { find: vi.fn() }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return { ...actual, validateObjectId: vi.fn() };
});

const mockCreate = vi.mocked(GroceryModel.create);
const mockScheduleFind = vi.mocked(ScheduleModel.find);
const mockDishFind = vi.mocked(DishModel.find);
const mockValidateObjectId = vi.mocked(validateObjectId);

const USER_ID = 'user123';
const USER_NAME = 'Nguyen Van A';
const validData = { name: 'Danh sách tuần 1' };

describe('GroceryService.createGrocery', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    // Tests DTO schema directly — no service, no DB involved

    it('should fail when name is missing', () => {
      const result = createGroceryRequestSchema.safeParse({});

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Tên danh sách mua sắm không hợp lệ'
      );
    });

    it('should fail when name is not a string', () => {
      const result = createGroceryRequestSchema.safeParse({ name: 1234 });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Tên danh sách mua sắm không hợp lệ'
      );
    });

    it('should fail when name is too short', () => {
      const result = createGroceryRequestSchema.safeParse({ name: 'A' });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Tên danh sách mua sắm phải có ít nhất 2 ký tự'
      );
    });
  });

  describe('business logic', () => {
    it('should throw 400 when userId is invalid', async () => {
      mockValidateObjectId.mockReturnValue(false);

      await expect(
        GroceryService.createGrocery('invalid-id', USER_NAME, validData)
      ).rejects.toMatchObject({
        status: 400,
        message: 'Định dạng ID người dùng không hợp lệ'
      });
    });

    it('should create grocery successfully', async () => {
      mockValidateObjectId.mockReturnValue(true);
      const mockGrocery = {
        _id: { toString: () => 'grocery123' },
        ...validData,
        user: { _id: USER_ID, name: USER_NAME },
        ingredients: []
      };
      mockCreate.mockResolvedValue(mockGrocery as any);

      const result = await GroceryService.createGrocery(
        USER_ID,
        USER_NAME,
        validData
      );

      expect(result).toEqual(mockGrocery);
      expect(mockScheduleFind).not.toHaveBeenCalled();
    });

    it('should build ingredients from dates when schedules have dishes', async () => {
      mockValidateObjectId.mockReturnValue(true);
      const mockSchedule = {
        meals: [
          {
            dishes: [{ dishId: { toString: () => 'dish1' } }]
          }
        ]
      };
      mockScheduleFind.mockReturnValue({
        select: vi.fn().mockResolvedValue([mockSchedule])
      } as any);
      const mockDish = {
        ingredients: [
          {
            ingredientId: { toString: () => 'ing1' },
            name: 'Cà chua',
            image: 'https://example.com/img.jpg'
          }
        ]
      };
      mockDishFind.mockReturnValue({
        select: vi.fn().mockResolvedValue([mockDish])
      } as any);
      const mockGrocery = {
        _id: { toString: () => 'grocery123' },
        name: 'Danh sách theo ngày',
        user: { _id: USER_ID, name: USER_NAME },
        ingredients: [{ ingredientId: 'ing1', name: 'Cà chua' }]
      };
      mockCreate.mockResolvedValue(mockGrocery as any);

      const result = await GroceryService.createGrocery(USER_ID, USER_NAME, {
        name: 'Danh sách theo ngày',
        date: [new Date()]
      });

      expect(mockScheduleFind).toHaveBeenCalled();
      expect(mockDishFind).toHaveBeenCalled();
      expect(result.ingredients).toHaveLength(1);
      expect(result.ingredients[0].name).toBe('Cà chua');
    });
  });

  describe('system', () => {
    it('should throw 500 when grocery creation fails', async () => {
      mockValidateObjectId.mockReturnValue(true);
      mockCreate.mockResolvedValue(null as any);

      await expect(
        GroceryService.createGrocery(USER_ID, USER_NAME, validData)
      ).rejects.toMatchObject({
        status: 500,
        message: 'Tạo danh sách mua sắm thất bại'
      });
    });
  });
});
