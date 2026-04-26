import mongoose, { InferSchemaType, Schema } from 'mongoose';

const aiEvaluationTestCaseSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    endpoint: {
      type: String,
      enum: ['ask_agent', 'recommend_daily_meals', 'recommend_daily_workout'],
      default: 'ask_agent'
    },
    category: {
      type: String,
      enum: ['happy_path', 'edge_case', 'constraint_test', 'error_case'],
      default: 'happy_path'
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    enabled: { type: Boolean, default: true },
    input: {
      prompt: { type: String, required: true },
      context: {
        goal: { type: String, required: true },
        diet: { type: String, required: true },
        calories: { type: Number, required: true },
        allergies: { type: [String], default: [] },
        preset: { type: String }
      }
    },
    expected: {
      isCorrect: { type: Boolean, default: true },
      classification: {
        type: String,
        enum: ['positive', 'negative'],
        default: 'positive'
      },
      exact: { type: String, trim: true },
      mustInclude: {
        type: [String],
        default: undefined
      },
      regex: { type: String, trim: true },
      notes: { type: String, default: '' }
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

aiEvaluationTestCaseSchema.index({ endpoint: 1, enabled: 1, createdAt: -1 });

export type AiEvaluationTestCase = InferSchemaType<
  typeof aiEvaluationTestCaseSchema
>;

export const AiEvaluationTestCaseModel = mongoose.model(
  'AiEvaluationTestCase',
  aiEvaluationTestCaseSchema
);
