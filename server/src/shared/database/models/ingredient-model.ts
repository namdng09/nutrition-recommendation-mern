import mongoose, {
  InferSchemaType,
  type PaginateModel,
  Schema
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { ALLERGEN } from '~/shared/constants/allergen';
import { INGREDIENT_CATEGORY } from '~/shared/constants/ingredient-category';
import { NUTRITION_MINERAL } from '~/shared/constants/nutrition-minerals';
import { NUTRIENTS } from '~/shared/constants/nutrition-nutrients';
import { NUTRITION_VITAMIN } from '~/shared/constants/nutrition-vitamin';
import { UNIT } from '~/shared/constants/unit';

export const nutritionSchema = new Schema(
  {
    nutrients: [
      {
        label: { type: String, enum: Object.values(NUTRIENTS) },
        value: { type: Number, min: 0 },
        unit: { type: String, enum: Object.values(UNIT), required: true }
      }
    ],
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
      amount: { type: Number, default: 100, required: true },
      unit: { type: String, default: UNIT.GRAM, required: true }
    },
    allergens: [{ type: String, enum: Object.values(ALLERGEN) }],
    nutrition: { type: nutritionSchema },
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
