import mongoose, {
  InferSchemaType,
  type PaginateModel,
  Schema
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { FEEDBACK_TYPE } from '~/shared/constants/feedback-type';
import { ROLE } from '~/shared/constants/role';

const feedbackSchema = new Schema(
  {
    user: {
      _id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true },
      role: { type: String, enum: Object.values(ROLE), required: true }
    },
    type: {
      type: String,
      enum: Object.values(FEEDBACK_TYPE),
      required: true
    },
    content: { type: String, required: true }
  },
  {
    timestamps: true
  }
);

feedbackSchema.plugin(mongoosePaginate);

feedbackSchema.index({ 'user._id': 1, createdAt: -1 });
feedbackSchema.index({ type: 1, createdAt: -1 });
feedbackSchema.index({ createdAt: -1 });

export type Feedback = InferSchemaType<typeof feedbackSchema>;

export const FeedbackModel = mongoose.model(
  'Feedback',
  feedbackSchema
) as PaginateModel<Feedback>;
