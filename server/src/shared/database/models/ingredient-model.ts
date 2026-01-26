import mongoose, {
  InferSchemaType,
  type PaginateModel,
  Schema
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const ingredientSchema = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    baseWeight: {
      value: { type: Number, required: true },
      unit: { type: String, default: 'g' }
    },
    units: [
      {
        unit: { type: Number, required: true },
        quantity: { type: Number, required: true }
      }
    ],
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number },
    fat: { type: Number },
    fiber: { type: Number },
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
