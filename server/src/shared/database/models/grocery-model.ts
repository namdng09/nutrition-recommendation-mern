import mongoose, {
  InferSchemaType,
  type PaginateModel,
  Schema
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { GROCERY_STATUS } from '~/shared/constants/grocery-status';
import { UNIT } from '~/shared/constants/unit';

const grocerySchema = new Schema(
  {
    user: {
      _id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true }
    },
    name: { type: String, required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(GROCERY_STATUS),
      default: GROCERY_STATUS.ACTIVE
    },
    ingredients: [
      {
        ingredientId: { type: Schema.Types.ObjectId, ref: 'Ingredient' },
        name: { type: String, required: true },
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
        quantity: { type: Number, required: true },
        isPurchased: { type: Boolean, default: false },
        notes: { type: String }
      }
    ],
    notes: { type: String }
  },
  {
    timestamps: true
  }
);

grocerySchema.plugin(mongoosePaginate);

grocerySchema.index({ 'user._id': 1, status: 1 });
grocerySchema.index({ 'user._id': 1, date: -1 });

export type Grocery = InferSchemaType<typeof grocerySchema>;

export const GroceryModel = mongoose.model(
  'Grocery',
  grocerySchema
) as PaginateModel<Grocery>;
