import mongoose, { InferSchemaType, Schema } from 'mongoose';

const aiMetricSchema = new Schema(
  {
    sourceType: {
      type: String,
      enum: ['evaluation', 'production'],
      required: true
    },
    endpoint: {
      type: String,
      enum: ['ask_agent', 'recommend_daily_meals', 'recommend_daily_workout'],
      required: true
    },
    requestId: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['success', 'failed'],
      required: true
    },
    isCorrect: { type: Boolean },
    classification: {
      type: String,
      enum: ['positive', 'negative']
    },
    ruleScore: { type: Number, min: 0, max: 100 },
    semanticScore: { type: Number, min: 0, max: 100 },
    accuracyScore: { type: Number, min: 0, max: 100 },
    latencyMs: { type: Number, min: 0, default: 0 },
    inputTokens: { type: Number, min: 0, default: 0 },
    outputTokens: { type: Number, min: 0, default: 0 },
    totalTokens: { type: Number, min: 0, default: 0 },
    estimatedCostUsd: { type: Number, min: 0, default: 0 },
    errorMessage: { type: String },
    testCaseId: { type: Schema.Types.ObjectId, ref: 'AiEvaluationTestCase' },
    testCaseName: { type: String },
    prompt: { type: String },
    response: { type: String },
    expected: { type: Schema.Types.Mixed },
    evaluation: {
      hasExpectation: { type: Boolean, default: false },
      matched: { type: Boolean, default: false },
      passedChecks: { type: Number, min: 0, default: 0 },
      totalChecks: { type: Number, min: 0, default: 0 },
      passThreshold: { type: Number, min: 0, max: 100, default: 90 }
    },
    meta: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

aiMetricSchema.index({ createdAt: -1 });
aiMetricSchema.index({ sourceType: 1, createdAt: -1 });
aiMetricSchema.index({ endpoint: 1, createdAt: -1 });
aiMetricSchema.index({ status: 1, createdAt: -1 });

export type AiMetric = InferSchemaType<typeof aiMetricSchema>;

export const AiMetricModel = mongoose.model('AiMetric', aiMetricSchema);
