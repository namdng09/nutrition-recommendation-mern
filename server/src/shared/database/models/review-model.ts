import mongoose, {
  InferSchemaType,
  type PaginateModel,
  Schema
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { REVIEW_STATUS } from '~/shared/constants/review-status';

const reviewSchema = new Schema(
  {
    dishId: { type: Schema.Types.ObjectId, ref: 'Dish', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    nutritionistId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: Object.values(REVIEW_STATUS),
      default: REVIEW_STATUS.DRAFT
    },
    rejectionReason: { type: String },
    submittedAt: { type: Date },
    pickedAt: { type: Date },
    reviewedAt: { type: Date },
    lastResubmittedAt: { type: Date },
    comments: [
      {
        author: {
          _id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          name: { type: String, required: true }
        },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

reviewSchema.plugin(mongoosePaginate);

reviewSchema.index({ dishId: 1, userId: 1 }, { unique: true });
reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ nutritionistId: 1, status: 1, pickedAt: -1 });
reviewSchema.index({ userId: 1, createdAt: -1 });
reviewSchema.index({ dishId: 1 });

export type Review = InferSchemaType<typeof reviewSchema>;

export const ReviewModel = mongoose.model(
  'Review',
  reviewSchema
) as PaginateModel<Review>;
