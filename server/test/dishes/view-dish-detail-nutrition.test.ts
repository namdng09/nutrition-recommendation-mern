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

import { DishService } from '~/features/dishes/dish-service';
import { DISH_CATEGORY } from '~/shared/constants/dish-category';
import { UNIT } from '~/shared/constants/unit';
import { DishModel, IngredientModel } from '~/shared/database/models';

describe('DishService.viewDishDetailNutrition', () => {
  let dishId: string;
  let userId: string;
  let ingredientIds: string[] = [];

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_URI || 'mongodb://localhost:27017/test'
      );
    }
    userId = new mongoose.Types.ObjectId().toString();
  });

  beforeEach(async () => {
    await DishModel.deleteMany({});
    await IngredientModel.deleteMany({});

    // Create test ingredients with nutrition data
    const ingredients = await IngredientModel.create([
      {
        user: { _id: userId, name: 'Test User' },
        name: 'Thịt bò',
        description: 'Thịt bò Úc',
        image: 'beef.jpg',
        unit: UNIT.GRAM,
        nutrition: {
          nutrients: {
            calories: { value: 250, unit: UNIT.KILOCALORIE },
            carbs: { value: 0, unit: UNIT.GRAM },
            fat: { value: 15, unit: UNIT.GRAM },
            protein: { value: 26, unit: UNIT.GRAM },
            fiber: { value: 0, unit: UNIT.GRAM },
            sodium: { value: 72, unit: UNIT.MILLIGRAM },
            cholesterol: { value: 90, unit: UNIT.MILLIGRAM }
          },
          minerals: [
            { name: 'Iron', value: 2.6, unit: UNIT.MILLIGRAM },
            { name: 'Zinc', value: 5.5, unit: UNIT.MILLIGRAM }
          ],
          vitamins: [{ name: 'Vitamin B12', value: 2.4, unit: UNIT.MICROGRAM }],
          sugars: [],
          fats: [],
          fattyAcids: [],
          aminoAcids: []
        },
        allergens: [],
        isActive: true,
        isPublic: true,
        baseUnit: { amount: 100, unit: UNIT.GRAM },
        units: [{ value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
      },
      {
        user: { _id: userId, name: 'Test User' },
        name: 'Bánh phở',
        description: 'Bánh phở tươi',
        image: 'pho-noodles.jpg',
        unit: UNIT.GRAM,
        nutrition: {
          nutrients: {
            calories: { value: 109, unit: UNIT.KILOCALORIE },
            carbs: { value: 24, unit: UNIT.GRAM },
            fat: { value: 0.2, unit: UNIT.GRAM },
            protein: { value: 1.8, unit: UNIT.GRAM },
            fiber: { value: 1, unit: UNIT.GRAM },
            sodium: { value: 3, unit: UNIT.MILLIGRAM },
            cholesterol: { value: 0, unit: UNIT.MILLIGRAM }
          },
          minerals: [{ name: 'Iron', value: 1.2, unit: UNIT.MILLIGRAM }],
          vitamins: [],
          sugars: [],
          fats: [],
          fattyAcids: [],
          aminoAcids: []
        },
        allergens: [],
        isActive: true,
        isPublic: true,
        baseUnit: { amount: 100, unit: UNIT.GRAM },
        units: [{ value: 300, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
      }
    ]);

    ingredientIds = ingredients.map(ing => ing._id.toString());

    // Create test dish with ingredients
    const dish = await DishModel.create({
      user: { _id: userId, name: 'Test User' },
      name: 'Phở bò',
      description: 'Phở bò truyền thống Hà Nội',
      categories: [DISH_CATEGORY.MAIN_COURSE, DISH_CATEGORY.SOUP],
      ingredients: [
        {
          ingredientId: new mongoose.Types.ObjectId(ingredientIds[0]),
          name: 'Thịt bò',
          description: 'Thịt bò Úc',
          image: 'beef.jpg',
          nutrients: {
            calories: { value: 250, unit: UNIT.KILOCALORIE },
            carbs: { value: 0, unit: UNIT.GRAM },
            fat: { value: 15, unit: UNIT.GRAM },
            protein: { value: 26, unit: UNIT.GRAM },
            fiber: { value: 0, unit: UNIT.GRAM },
            sodium: { value: 72, unit: UNIT.MILLIGRAM },
            cholesterol: { value: 90, unit: UNIT.MILLIGRAM }
          },
          allergens: [],
          baseUnit: { amount: 100, unit: UNIT.GRAM },
          units: [{ value: 200, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        },
        {
          ingredientId: new mongoose.Types.ObjectId(ingredientIds[1]),
          name: 'Bánh phở',
          description: 'Bánh phở tươi',
          image: 'pho-noodles.jpg',
          nutrients: {
            calories: { value: 109, unit: UNIT.KILOCALORIE },
            carbs: { value: 24, unit: UNIT.GRAM },
            fat: { value: 0.2, unit: UNIT.GRAM },
            protein: { value: 1.8, unit: UNIT.GRAM },
            fiber: { value: 1, unit: UNIT.GRAM },
            sodium: { value: 3, unit: UNIT.MILLIGRAM },
            cholesterol: { value: 0, unit: UNIT.MILLIGRAM }
          },
          allergens: [],
          baseUnit: { amount: 100, unit: UNIT.GRAM },
          units: [{ value: 300, quantity: 1, unit: UNIT.GRAM, isDefault: true }]
        }
      ],
      instructions: [
        { step: 1, description: 'Luộc xương bò' },
        { step: 2, description: 'Nấu nước dùng' }
      ],
      image: 'pho-bo.jpg',
      isActive: true,
      isPublic: true,
      preparationTime: 30,
      cookTime: 120,
      servings: 2,
      tags: ['phở', 'bò']
    });

    dishId = dish._id.toString();
  });

  afterEach(async () => {
    await DishModel.deleteMany({});
    await IngredientModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Branch - Happy case
  it('should get nutrition detail successfully', async () => {
    const nutrition = await DishService.viewDishDetailNutrition(dishId);

    expect(nutrition).toBeDefined();
    expect(nutrition).toHaveProperty('nutrients');
    expect(nutrition.nutrients).toHaveProperty('calories');
    expect(nutrition.nutrients).toHaveProperty('carbs');
    expect(nutrition.nutrients).toHaveProperty('protein');
    expect(nutrition.nutrients).toHaveProperty('fat');
    expect(nutrition.nutrients).toHaveProperty('sodium');
    expect(nutrition.nutrients).toHaveProperty('cholesterol');
    expect(nutrition).toHaveProperty('minerals');
    expect(nutrition).toHaveProperty('vitamins');
  });

  //Branch - Happy case
  it('should calculate nutrition values successfully', async () => {
    const nutrition = await DishService.viewDishDetailNutrition(dishId);

    expect(nutrition.nutrients.calories.value).toBe(250 + 109); // 359
    expect(nutrition.nutrients.carbs.value).toBe(0 + 24); // 24
    expect(nutrition.nutrients.protein.value).toBe(26 + 1.8); // 27.8
    expect(nutrition.nutrients.fat.value).toBe(15 + 0.2); // 15.2
    expect(nutrition.nutrients.sodium.value).toBe(72 + 3); // 75
    expect(nutrition.nutrients.cholesterol.value).toBe(90 + 0); // 90
  });

  // Branch - Invalid ID format
  it('should throw error when id format is invalid', async () => {
    await expect(
      DishService.viewDishDetailNutrition('invalid-id')
    ).rejects.toThrow('Định dạng ID món ăn không hợp lệ');
  });

  // Branch - Dish not found
  it('should throw error when dish does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();

    await expect(
      DishService.viewDishDetailNutrition(nonExistentId)
    ).rejects.toThrow('Không tìm thấy món ăn');
  });

  // Branch - Ingredient not found
  it('should throw error when ingredient does not exist', async () => {
    // Create a dish with an non-existent ingredient
    const fakeIngredientId = new mongoose.Types.ObjectId();
    const dishWithMissingIngredient = await DishModel.create({
      user: { _id: userId, name: 'Test User' },
      name: 'Dish with Missing Ingredient',
      categories: [DISH_CATEGORY.MAIN_COURSE],
      ingredients: [
        {
          ingredientId: fakeIngredientId,
          name: 'Non-existent Ingredient',
          baseUnit: { amount: 100, unit: UNIT.GRAM }
        }
      ],
      instructions: [{ step: 1, description: 'Do something' }],
      image: 'dish.jpg',
      isActive: true,
      isPublic: true,
      preparationTime: 10,
      cookTime: 20,
      servings: 1,
      tags: ['test']
    });

    await expect(
      DishService.viewDishDetailNutrition(
        dishWithMissingIngredient._id.toString()
      )
    ).rejects.toThrow('Một hoặc nhiều nguyên liệu không tồn tại');
  });
});
