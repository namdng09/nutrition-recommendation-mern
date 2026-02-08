import type { QueryOptions } from '@quarks/mongoose-query-parser';
import createHttpError from 'http-errors';

import { UNIT } from '~/shared/constants/unit';
import { DishModel, IngredientModel } from '~/shared/database/models';
import type { Dish } from '~/shared/database/models/dish-model';
import {
  buildPaginateOptions,
  deleteImage,
  type PaginateResponse,
  uploadImage,
  validateObjectId
} from '~/shared/utils';

import { CreateDishRequest, UpdateDishRequest } from './dish-dto';

const nutrientKeys = [
  'calories',
  'carbs',
  'fat',
  'protein',
  'fiber',
  'sodium',
  'cholesterol'
] as const;

type NutrientKey = (typeof nutrientKeys)[number];
type NutrientValue = { value: number; unit: string };
type NutrientsTotal = Record<NutrientKey, NutrientValue>;
type NutritionItem = { label: string; value: number; unit: string };
type NutrientsInput = Partial<
  Record<NutrientKey, { value?: number | null; unit?: string | null } | null>
> | null;
type NutritionItemsInput = Array<{
  label?: string | null;
  value?: number | null;
  unit?: string | null;
} | null> | null;
type DetailNutritionTotal = {
  nutrients: NutrientsTotal;
  minerals: NutritionItem[];
  vitamins: NutritionItem[];
  sugars: NutritionItem[];
  fats: NutritionItem[];
  fattyAcids: NutritionItem[];
  aminoAcids: NutritionItem[];
};

const createEmptyNutrientsTotal = (): NutrientsTotal => ({
  calories: { value: 0, unit: UNIT.KILOCALORIE },
  carbs: { value: 0, unit: UNIT.GRAM },
  fat: { value: 0, unit: UNIT.GRAM },
  protein: { value: 0, unit: UNIT.GRAM },
  fiber: { value: 0, unit: UNIT.GRAM },
  sodium: { value: 0, unit: UNIT.GRAM },
  cholesterol: { value: 0, unit: UNIT.GRAM }
});

const createEmptyDetailNutritionTotal = (): DetailNutritionTotal => ({
  nutrients: createEmptyNutrientsTotal(),
  minerals: [],
  vitamins: [],
  sugars: [],
  fats: [],
  fattyAcids: [],
  aminoAcids: []
});

const addNutrientsTotal = (
  total: NutrientsTotal,
  nutrients?: NutrientsInput
) => {
  if (!nutrients) return;
  for (const key of nutrientKeys) {
    const item = nutrients[key];
    if (!item) continue;
    const value = typeof item.value === 'number' ? item.value : 0;
    const unit = typeof item.unit === 'string' ? item.unit : undefined;
    const current = total[key];
    if (unit && current.unit !== unit) {
      if (current.value !== 0) {
        throw createHttpError(
          400,
          `Đơn vị dinh dưỡng không đồng nhất cho ${key}`
        );
      }
      current.unit = unit;
    }
    current.value += value;
  }
};

const addNutritionItemsTotal = (
  target: Map<string, NutritionItem>,
  items?: NutritionItemsInput
) => {
  if (!items || items.length === 0) return;
  for (const item of items) {
    const label = item?.label ?? undefined;
    const unit = item?.unit ?? undefined;
    if (!label || !unit) continue;
    const value = typeof item?.value === 'number' ? item.value : 0;
    const key = `${label}|${unit}`;
    const current = target.get(key);
    if (current) {
      current.value += value;
    } else {
      target.set(key, {
        label,
        unit,
        value
      });
    }
  }
};

export const DishService = {
  createDish: async (
    userId: string,
    userName: string,
    data: CreateDishRequest,
    image?: Express.Multer.File
  ) => {
    // Validate and fetch ingredient details
    const ingredientDetails = await Promise.all(
      data.ingredients.map(async ing => {
        if (!validateObjectId(ing.ingredientId)) {
          throw createHttpError(
            400,
            `ID nguyên liệu không hợp lệ: ${ing.ingredientId}`
          );
        }

        const ingredient = await IngredientModel.findById(ing.ingredientId);
        if (!ingredient) {
          throw createHttpError(
            404,
            `Không tìm thấy nguyên liệu với ID: ${ing.ingredientId}`
          );
        }

        return {
          ingredientId: ingredient._id,
          name: ingredient.name,
          image: ingredient.image || '',
          description: ingredient.description,
          nutrients: ingredient.nutrition?.nutrients,
          allergens: ingredient.allergens,
          baseUnit: ingredient.baseUnit,
          units: ing.units
        };
      })
    );

    const newDish = await DishModel.create({
      user: {
        _id: userId,
        name: userName
      },
      name: data.name,
      description: data.description,
      categories: data.categories,
      ingredients: ingredientDetails,
      instructions: data.instructions,
      preparationTime: data.preparationTime,
      cookTime: data.cookTime,
      servings: data.servings || 1,
      tags: data.tags,
      isActive: data.isActive ?? true,
      isPublic: data.isPublic ?? false
    });

    if (!newDish) {
      throw createHttpError(500, 'Tạo món ăn thất bại');
    }

    if (image) {
      const uploadResult = await uploadImage(
        image.buffer,
        newDish._id.toString()
      );
      if (uploadResult.success && uploadResult.data) {
        newDish.image = uploadResult.data.secure_url;
        await newDish.save();
      } else {
        throw createHttpError(500, 'Tải ảnh lên thất bại');
      }
    }

    return newDish;
  },

  viewDishes: async (parsed: QueryOptions): Promise<PaginateResponse<Dish>> => {
    const { filter } = parsed;
    const options = buildPaginateOptions(parsed);

    const result = await DishModel.paginate(filter, options);

    return result as unknown as PaginateResponse<Dish>;
  },

  viewDishDetail: async (id: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID món ăn không hợp lệ');
    }

    const dish = await DishModel.findById(id);

    if (!dish) {
      throw createHttpError(404, 'Không tìm thấy món ăn');
    }

    return dish;
  },

  viewDishDetailNutrition: async (id: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID món ăn không hợp lệ');
    }

    const dish = await DishModel.findById(id);

    if (!dish) {
      throw createHttpError(404, 'Không tìm thấy món ăn');
    }

    const ingredientIds = dish.ingredients
      ?.map(ingredient => ingredient.ingredientId)
      .filter(Boolean);

    if (!ingredientIds || ingredientIds.length === 0) {
      return createEmptyDetailNutritionTotal();
    }

    const ingredients = await IngredientModel.find({
      _id: { $in: ingredientIds }
    });

    if (ingredients.length !== ingredientIds.length) {
      throw createHttpError(404, 'Một hoặc nhiều nguyên liệu không tồn tại');
    }

    const total = createEmptyDetailNutritionTotal();
    const mineralsMap = new Map<string, NutritionItem>();
    const vitaminsMap = new Map<string, NutritionItem>();
    const sugarsMap = new Map<string, NutritionItem>();
    const fatsMap = new Map<string, NutritionItem>();
    const fattyAcidsMap = new Map<string, NutritionItem>();
    const aminoAcidsMap = new Map<string, NutritionItem>();

    for (const ingredient of ingredients) {
      const nutrition = ingredient.nutrition;
      addNutrientsTotal(total.nutrients, nutrition?.nutrients);
      addNutritionItemsTotal(mineralsMap, nutrition?.minerals);
      addNutritionItemsTotal(vitaminsMap, nutrition?.vitamins);
      addNutritionItemsTotal(sugarsMap, nutrition?.sugars);
      addNutritionItemsTotal(fatsMap, nutrition?.fats);
      addNutritionItemsTotal(fattyAcidsMap, nutrition?.fattyAcids);
      addNutritionItemsTotal(aminoAcidsMap, nutrition?.aminoAcids);
    }

    total.minerals = Array.from(mineralsMap.values());
    total.vitamins = Array.from(vitaminsMap.values());
    total.sugars = Array.from(sugarsMap.values());
    total.fats = Array.from(fatsMap.values());
    total.fattyAcids = Array.from(fattyAcidsMap.values());
    total.aminoAcids = Array.from(aminoAcidsMap.values());

    return total;
  },

  updateDish: async (
    id: string,
    userId: string,
    data: UpdateDishRequest,
    image?: Express.Multer.File
  ) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID món ăn không hợp lệ');
    }

    const existingDish = await DishModel.findById(id);
    if (!existingDish) {
      throw createHttpError(404, 'Không tìm thấy món ăn');
    }

    // Check ownership - only owner can update
    if (existingDish.user?._id.toString() !== userId) {
      throw createHttpError(403, 'Bạn không có quyền cập nhật món ăn này');
    }

    const updateData: any = { ...data };

    // If ingredients are updated, fetch their details
    if (data.ingredients) {
      const ingredientDetails = await Promise.all(
        data.ingredients.map(async ing => {
          if (!validateObjectId(ing.ingredientId)) {
            throw createHttpError(
              400,
              `ID nguyên liệu không hợp lệ: ${ing.ingredientId}`
            );
          }

          const ingredient = await IngredientModel.findById(ing.ingredientId);
          if (!ingredient) {
            throw createHttpError(
              404,
              `Không tìm thấy nguyên liệu với ID: ${ing.ingredientId}`
            );
          }

          return {
            ingredientId: ingredient._id,
            name: ingredient.name,
            image: ingredient.image || '',
            description: ingredient.description,
            nutrients: ingredient.nutrition?.nutrients,
            allergens: ingredient.allergens,
            baseUnit: ingredient.baseUnit,
            units: ing.units
          };
        })
      );
      updateData.ingredients = ingredientDetails;
    }

    const updatedDish = await DishModel.findByIdAndUpdate(id, updateData, {
      new: true
    });

    if (!updatedDish) {
      throw createHttpError(404, 'Không tìm thấy món ăn');
    }

    if (image) {
      await deleteImage(updatedDish._id.toString());

      const uploadResult = await uploadImage(
        image.buffer,
        updatedDish._id.toString()
      );
      if (uploadResult.success && uploadResult.data) {
        updatedDish.image = uploadResult.data.secure_url;
        await updatedDish.save();
      } else {
        throw createHttpError(500, 'Tải ảnh lên thất bại');
      }
    }

    return updatedDish;
  },

  deleteDish: async (id: string, userId: string, userRole: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID món ăn không hợp lệ');
    }

    const dish = await DishModel.findById(id);
    if (!dish) {
      throw createHttpError(404, 'Không tìm thấy món ăn');
    }

    // Check ownership or role-based permission
    const isOwner = dish.user?._id.toString() === userId;
    const isAdmin = userRole === ROLE.ADMIN;

    // Admin can delete any dish, users can delete their own dishes
    if (!isOwner && !isAdmin) {
      throw createHttpError(403, 'Bạn không có quyền xóa món ăn này');
    }

    const deletedDish = await DishModel.findByIdAndDelete(id);

    if (!deletedDish) {
      throw createHttpError(404, 'Không tìm thấy món ăn');
    }

    if (deletedDish.image) {
      await deleteImage(deletedDish._id.toString());
    }

    return deletedDish;
  }
};
