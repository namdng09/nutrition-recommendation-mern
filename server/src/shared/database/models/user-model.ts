import mongoose, {
  InferSchemaType,
  type PaginateModel,
  Schema
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { BODYFAT } from '~/shared/constants/bodyfat';
import { DIET } from '~/shared/constants/diet';
import { GENDER } from '~/shared/constants/gender';
import { ROLE } from '~/shared/constants/role';
import { TARGET } from '~/shared/constants/target';

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    avatar: { type: String, default: '' },
    gender: { type: String, enum: Object.values(GENDER) },
    role: {
      type: String,
      enum: Object.values(ROLE),
      required: true,
      default: ROLE.USER
    },
    dob: { type: Date },
    height: { type: Number },
    bodyfat: { type: String, enum: Object.values(BODYFAT) },
    diet: { type: String, enum: Object.values(DIET) },
    favouriteDishes: [{ type: Schema.Types.ObjectId, ref: 'Dish' }],
    favouriteIngredients: [{ type: Schema.Types.ObjectId, ref: 'Ingredient' }],
    blockFoods: [
      {
        ingredientId: { type: Schema.Types.ObjectId, ref: 'Ingredient' },
        name: { type: String }
      }
    ],
    weightRecord: [
      {
        weight: { type: Number },
        date: { type: Date }
      }
    ],
    goal: {
      target: { type: String, enum: Object.values(TARGET) },
      weightGoal: { type: Number },
      targetWeightChange: { type: Number }
    },
    setting: { type: Map, of: Schema.Types.Mixed, default: {} },
    aiConfig: { type: Map, of: Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

userSchema.plugin(mongoosePaginate);

export type User = InferSchemaType<typeof userSchema>;

export const UserModel = mongoose.model(
  'User',
  userSchema
) as PaginateModel<User>;
