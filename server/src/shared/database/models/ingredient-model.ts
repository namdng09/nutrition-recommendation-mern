import mongoose, {
  InferSchemaType,
  type PaginateModel,
  Schema
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { UNIT } from '~/shared/constants/unit';

const nutritionMacrosSchema = new Schema(
  {
    carbs: { type: Number },
    protein: { type: Number },
    fat: { type: Number },
    netCarbs: { type: Number },
    fiber: { type: Number }
  },
  { _id: false }
);

const nutritionMineralsSchema = new Schema(
  {
    sodium: { type: Number },
    calcium: { type: Number },
    iron: { type: Number },
    potassium: { type: Number },
    magnesium: { type: Number },
    phosphorus: { type: Number },
    zinc: { type: Number },
    selenium: { type: Number }
  },
  { _id: false }
);

const nutritionVitaminsSchema = new Schema(
  {
    vitaminA: { type: Number },
    vitaminD: { type: Number },
    vitaminC: { type: Number },
    vitaminE: { type: Number },
    vitaminK: { type: Number },
    vitaminB1: { type: Number },
    vitaminB2: { type: Number },
    vitaminB3: { type: Number },
    vitaminB5: { type: Number },
    vitaminB6: { type: Number },
    vitaminB9: { type: Number },
    vitaminB12: { type: Number }
  },
  { _id: false }
);

const nutritionCompoundsSchema = new Schema(
  {
    cholesterol: { type: Number },
    caffeine: { type: Number },
    choline: { type: Number },
    lycopene: { type: Number },
    betaCarotene: { type: Number }
  },
  { _id: false }
);

export const nutritionSchema = new Schema(
  {
    units: {
      calories: {
        type: String,
        enum: Object.values(UNIT),
        default: UNIT.KILOCALORIE
      },
      macronutrients: {
        type: String,
        enum: Object.values(UNIT),
        default: UNIT.GRAM
      },
      minerals: {
        type: String,
        enum: Object.values(UNIT),
        default: UNIT.MILLIGRAM
      },
      vitamins: {
        type: String,
        enum: Object.values(UNIT),
        default: UNIT.MICROGRAM
      },
      otherCompounds: {
        type: String,
        enum: Object.values(UNIT),
        default: UNIT.MILLIGRAM
      }
    },
    calories: { type: Number },
    macronutrients: { type: nutritionMacrosSchema },
    minerals: { type: nutritionMineralsSchema },
    vitamins: { type: nutritionVitaminsSchema },
    otherCompounds: { type: nutritionCompoundsSchema }
  },
  { _id: false }
);

const ingredientSchema = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    baseUnit: {
      value: { type: Number, required: true },
      unit: { type: String, default: UNIT.GRAM, required: true }
    },
    units: [
      {
        value: { type: Number, required: true },
        unit: { type: String, required: true }
      }
    ],
    nutrition: { type: nutritionSchema },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

ingredientSchema.plugin(mongoosePaginate);

ingredientSchema.index({ name: 1, category: 1 });
ingredientSchema.index({ allergens: 1 });

export type Ingredient = InferSchemaType<typeof ingredientSchema>;

export const IngredientModel = mongoose.model(
  'Ingredient',
  ingredientSchema
) as PaginateModel<Ingredient>;
