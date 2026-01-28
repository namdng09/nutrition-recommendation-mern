import mongoose, {
  InferSchemaType,
  type PaginateModel,
  Schema
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { ALLERGEN } from '~/shared/constants/allergen';
import { INGREDIENT_CATEGORY } from '~/shared/constants/ingredient-category';
import { NUTRITION_AMINO_ACID } from '~/shared/constants/nutrition-amino-acid';
import { NUTRITION_FAT } from '~/shared/constants/nutrition-fat';
import { NUTRITION_FATTY_ACID } from '~/shared/constants/nutrition-fatty-acid';
import { NUTRITION_MINERAL } from '~/shared/constants/nutrition-minerals';
import { NUTRITION_SUGAR } from '~/shared/constants/nutrition-sugar';
import { NUTRITION_VITAMIN } from '~/shared/constants/nutrition-vitamin';
import { UNIT } from '~/shared/constants/unit';

export const nutrientSchema = new Schema(
  {
    calories: {
      value: { type: Number, required: true },
      unit: {
        type: String,
        enum: Object.values(UNIT),
        default: UNIT.KILOCALORIE,
        required: true
      }
    },
    carbs: {
      value: { type: Number, required: true },
      unit: { type: String, enum: Object.values(UNIT), required: true }
    },
    fat: {
      value: { type: Number, required: true },
      unit: { type: String, enum: Object.values(UNIT), required: true }
    },
    protein: {
      value: { type: Number, required: true },
      unit: { type: String, enum: Object.values(UNIT), required: true }
    },
    fiber: {
      value: { type: Number, required: true },
      unit: { type: String, enum: Object.values(UNIT), required: true }
    },
    sodium: {
      value: { type: Number, required: true },
      unit: { type: String, enum: Object.values(UNIT), required: true }
    },
    cholesterol: {
      value: { type: Number, required: true },
      unit: { type: String, enum: Object.values(UNIT), required: true }
    }
  },
  { _id: false }
);

export const detailNutritionSchema = new Schema(
  {
    nutrients: { type: nutrientSchema },
    minerals: [
      {
        label: { type: String, enum: Object.values(NUTRITION_MINERAL) },
        value: { type: Number, min: 0 },
        unit: { type: String, enum: Object.values(UNIT), required: true }
      }
    ],
    vitamins: [
      {
        label: { type: String, enum: Object.values(NUTRITION_VITAMIN) },
        value: { type: Number, min: 0 },
        unit: { type: String, enum: Object.values(UNIT), required: true }
      }
    ],
    sugars: [
      {
        label: { type: String, enum: Object.values(NUTRITION_SUGAR) },
        value: { type: Number, min: 0 },
        unit: { type: String, enum: Object.values(UNIT), required: true }
      }
    ],
    fats: [
      {
        label: { type: String, enum: Object.values(NUTRITION_FAT) },
        value: { type: Number, min: 0 },
        unit: { type: String, enum: Object.values(UNIT), required: true }
      }
    ],
    fattyAcids: [
      {
        label: { type: String, enum: Object.values(NUTRITION_FATTY_ACID) },
        value: { type: Number, min: 0 },
        unit: { type: String, enum: Object.values(UNIT), required: true }
      }
    ],
    aminoAcids: [
      {
        label: { type: String, enum: Object.values(NUTRITION_AMINO_ACID) },
        value: { type: Number, min: 0 },
        unit: { type: String, enum: Object.values(UNIT), required: true }
      }
    ]
  },
  { _id: false }
);

const ingredientSchema = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String },
    description: { type: String },
    categories: [{ type: String, enum: Object.values(INGREDIENT_CATEGORY) }],
    baseUnit: {
      amount: { type: Number, required: true },
      unit: { type: String, default: UNIT.GRAM, required: true }
    },
    units: [
      {
        value: { type: Number, required: true },
        unit: { type: String, required: true },
        isDefault: { type: Boolean, required: true }
      }
    ],
    allergens: [{ type: String, enum: Object.values(ALLERGEN) }],
    nutrition: { type: detailNutritionSchema },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

ingredientSchema.plugin(mongoosePaginate);

ingredientSchema.index({ name: 1, categories: 1 });
ingredientSchema.index({ allergens: 1 });

export type Ingredient = InferSchemaType<typeof ingredientSchema>;

export const IngredientModel = mongoose.model(
  'Ingredient',
  ingredientSchema
) as PaginateModel<Ingredient>;
