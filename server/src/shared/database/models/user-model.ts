import mongoose, {
  InferSchemaType,
  type PaginateModel,
  Schema
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { GENDER } from '~/shared/constants/gender';
import { ROLE } from '~/shared/constants/role';

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
