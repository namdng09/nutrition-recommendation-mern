import mongoose, { InferSchemaType, Schema } from 'mongoose';

const unitSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    symbol: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ['mass', 'volume', 'other'],
      required: true
    },
    baseUnit: { type: Boolean, default: false },
    conversionFactor: { type: Number, required: true },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

export type Unit = InferSchemaType<typeof unitSchema>;

export const UnitModel = mongoose.model<Unit>('Unit', unitSchema);
