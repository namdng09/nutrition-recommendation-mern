import mongoose, { InferSchemaType, Schema } from 'mongoose';

// One user can have multiple auth accounts
// For local authentication, provider will be 'local' and providerId will be the user's email
const authSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
    localPassword: { type: String },
    verifyAt: { type: Date, required: true },
    lastResetPasswordToken: { type: String }
  },
  {
    timestamps: true
  }
);

authSchema.index({ provider: 1, providerId: 1 }, { unique: true });

export type Auth = InferSchemaType<typeof authSchema>;

export const AuthModel = mongoose.model<Auth>('Auth', authSchema);
