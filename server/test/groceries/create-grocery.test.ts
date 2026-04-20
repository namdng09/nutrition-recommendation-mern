import { afterEach, describe, expect, it, vi } from 'vitest';

import { createGroceryRequestSchema } from '~/features/groceries/grocery-dto';
import { GroceryService } from '~/features/groceries/grocery-service';
import {
  DishModel,
  GroceryModel,
  ScheduleModel
} from '~/shared/database/models';

vi.mock('~/shared/database/models', () => ({
  GroceryModel: {
    create: vi.fn()
  },
  ScheduleModel: {
    find: vi.fn()
  },
  DishModel: {
    find: vi.fn()
  },
  IngredientModel: {
    find: vi.fn()
  }
}));

const mockCreate = vi.mocked(GroceryModel.create);
const mockScheduleFind = vi.mocked(ScheduleModel.find);
const mockDishFind = vi.mocked(DishModel.find);

const userId = 'user123';
const userName = 'Nguyen Van A';

const validData = {
  name: 'Danh sach tuan 1'
};

describe('GroceryService.createGrocery (UC28)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when grocery name is missing', () => {
      const result = createGroceryRequestSchema.safeParse({});

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Tên danh sách mua sắm không hợp lệ'
      );
    });

    it('should fail when grocery name is too short', () => {
      const result = createGroceryRequestSchema.safeParse({ name: 'A' });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Tên danh sách mua sắm phải có ít nhất 2 ký tự'
      );
    });

    it('should throw when date is invalid', () => {
      expect(() =>
        createGroceryRequestSchema.safeParse({
          ...validData,
          date: ['invalid-date']
        })
      ).toThrow('Ngày không hợp lệ');
    });
  });

  describe('business logic', () => {
    it('should create grocery successfully', async () => {
      const mockGrocery = {
        _id: { toString: () => 'grocery-1' },
        ...validData,
        user: { _id: userId, name: userName },
        ingredients: []
      };

      mockCreate.mockResolvedValue(mockGrocery as any);

      const result = await GroceryService.createGrocery(
        userId,
        userName,
        validData
      );

      expect(result).toEqual(mockGrocery);
    });

    it('should build ingredients from many selected dates', async () => {
      const dates = [new Date('2026-01-01')];
      const mockSchedules = [
        {
          meals: [
            {
              dishes: [{ dishId: { toString: () => 'dish-1' } }]
            }
          ]
        }
      ];

      mockScheduleFind.mockReturnValue({
        select: vi.fn().mockResolvedValue(mockSchedules)
      } as any);

      mockDishFind.mockReturnValue({
        select: vi.fn().mockResolvedValue([
          {
            ingredients: [
              {
                ingredientId: { toString: () => 'ing-1' },
                name: 'Ca chua',
                image: 'ca-chua.jpg'
              },
              {
                ingredientId: { toString: () => 'ing-2' },
                name: 'Thit bo',
                image: 'thit-bo.jpg'
              }
            ]
          }
        ])
      } as any);

      mockCreate.mockResolvedValue({
        _id: { toString: () => 'grocery-2' },
        name: 'Danh sach theo lich',
        user: { _id: userId, name: userName },
        ingredients: [
          {
            ingredientId: 'ing-1',
            name: 'Ca chua',
            image: 'ca-chua.jpg',
            isPurchased: false
          },
          {
            ingredientId: 'ing-2',
            name: 'Thit bo',
            image: 'thit-bo.jpg',
            isPurchased: false
          }
        ]
      } as any);

      const result = await GroceryService.createGrocery(userId, userName, {
        name: 'Danh sach theo lich',
        date: dates
      });

      expect(mockScheduleFind).toHaveBeenCalled();
      expect(mockDishFind).toHaveBeenCalled();
      expect(result.ingredients).toHaveLength(2);
    });
  });
});
