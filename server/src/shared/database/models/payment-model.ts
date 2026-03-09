import mongoose, {
  InferSchemaType,
  type PaginateModel,
  Schema
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { MEMBERSHIP_LEVEL } from '~/shared/constants/membership-level';
import { PAYMENT_STATUS } from '~/shared/constants/payment-status';

const paymentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    orderCode: { type: Number, required: true, unique: true },
    amount: { type: Number, required: true },
    returnUrl: { type: String },
    cancelUrl: { type: String },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING
    },
    checkoutUrl: { type: String, required: true },
    paymentLinkId: { type: String },
    targetMembership: { type: String, enum: Object.values(MEMBERSHIP_LEVEL) },
    completedAt: { type: Date },
    cancellationReason: { type: String }
  },
  { timestamps: true }
);

paymentSchema.plugin(mongoosePaginate);

paymentSchema.index({ user: 1 });

export type Payment = InferSchemaType<typeof paymentSchema>;

export const PaymentModel = mongoose.model(
  'Payment',
  paymentSchema
) as PaginateModel<Payment>;
