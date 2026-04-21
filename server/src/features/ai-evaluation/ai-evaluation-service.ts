import createHttpError from 'http-errors';

import { AiService } from '~/features/ai/ai-service';
import { agentConfig } from '~/shared/config/ai-agent';
import {
  AiEvaluationTestCaseModel,
  AiMetricModel
} from '~/shared/database/models';

import type {
  CreateTestCaseRequest,
  ListMetricsQuery,
  RunEvaluationRequest
} from './ai-evaluation-dto';

const toDateFilter = (query: ListMetricsQuery) => {
  const hasStart = Boolean(query.startDate);
  const hasEnd = Boolean(query.endDate);

  if (!hasStart && !hasEnd) return null;

  const createdAt: Record<string, Date> = {};

  if (hasStart) {
    const start = new Date(query.startDate as string);
    if (Number.isNaN(start.getTime())) {
      throw createHttpError(400, 'startDate không hợp lệ');
    }
    start.setHours(0, 0, 0, 0);
    createdAt.$gte = start;
  }

  if (hasEnd) {
    const end = new Date(query.endDate as string);
    if (Number.isNaN(end.getTime())) {
      throw createHttpError(400, 'endDate không hợp lệ');
    }
    end.setHours(23, 59, 59, 999);
    createdAt.$lte = end;
  }

  return createdAt;
};

const buildMetricFilter = (query: ListMetricsQuery) => {
  const filter: Record<string, unknown> = {};
  const source = query.source ?? 'both';

  if (source !== 'both') {
    filter.sourceType = source;
  }

  if (query.endpoint) {
    filter.endpoint = query.endpoint;
  }

  const createdAt = toDateFilter(query);
  if (createdAt) {
    filter.createdAt = createdAt;
  }

  return filter;
};

const safeAvg = (total: number, count: number) =>
  count > 0 ? total / count : 0;

const computeScore = (ruleScore: number, semanticScore: number) =>
  Math.round(ruleScore * 0.6 + semanticScore * 0.4);

const evaluateTestCaseResult = (response: string, expected?: any) => {
  const text = response.trim();
  const checks: boolean[] = [];

  if (expected?.exact) {
    checks.push(text === expected.exact.trim());
  }

  if (expected?.mustInclude?.length) {
    checks.push(
      expected.mustInclude.every((item: string) =>
        text.toLowerCase().includes(item.toLowerCase())
      )
    );
  }

  if (expected?.regex) {
    try {
      const pattern = new RegExp(expected.regex, 'i');
      checks.push(pattern.test(text));
    } catch {
      checks.push(false);
    }
  }

  const hasExpectation = checks.length > 0;
  const passedChecks = checks.filter(Boolean).length;
  const ruleScore = hasExpectation
    ? Math.round((passedChecks / checks.length) * 100)
    : 0;

  return {
    hasExpectation,
    passedChecks,
    totalChecks: checks.length,
    ruleScore,
    matched: hasExpectation && passedChecks === checks.length
  };
};

const extractJsonObject = (text: string): Record<string, unknown> | null => {
  const trimmed = text.trim();
  const candidates = [trimmed];

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    candidates.push(trimmed.slice(firstBrace, lastBrace + 1));
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      // noop
    }
  }

  return null;
};

const evaluateMealSemanticScore = (response: string) => {
  const parsed = extractJsonObject(response);
  if (!parsed) return 10;

  const meals = parsed.meals;
  if (!Array.isArray(meals) || meals.length === 0) return 20;

  let score = 40;

  const hasValidMealTypes = meals.every(
    meal =>
      meal && typeof (meal as Record<string, unknown>).mealType === 'string'
  );
  if (hasValidMealTypes) score += 20;

  const hasNonEmptyDishes = meals.every(meal => {
    if (!meal || typeof meal !== 'object') return false;
    const dishes = (meal as Record<string, unknown>).dishes;
    return Array.isArray(dishes) && dishes.length > 0;
  });
  if (hasNonEmptyDishes) score += 20;

  const servingsInRange = meals.every(meal => {
    if (!meal || typeof meal !== 'object') return false;
    const dishes = (meal as Record<string, unknown>).dishes;
    if (!Array.isArray(dishes) || dishes.length === 0) return false;

    return dishes.every(dish => {
      if (!dish || typeof dish !== 'object') return false;
      const servings = (dish as Record<string, unknown>).servings;
      return typeof servings === 'number' && servings >= 1 && servings <= 5;
    });
  });
  if (servingsInRange) score += 20;

  return score;
};

const evaluateMealSemanticScoreWithLLM = async (
  prompt: string,
  response: string,
  expected: Record<string, unknown> | undefined
): Promise<number> => {
  const evalPrompt = `Bạn là một chuyên gia đánh giá chất lượng phản hồi AI.

Hãy đánh giá phản hồi AI dưới đây với thang điểm từ 0-100, dựa trên các tiêu chí:
1. **Độ chính xác** (40%): Phản hồi có đúng với yêu cầu không?
2. **Tính đầy đủ** (30%): Phản hồi có đầy đủ thông tin cần thiết không?
3. **Tính thực tế** (20%): Các giá trị (calo, khẩu phần) có hợp lý không?
4. **Cấu trúc** (10%): JSON output có đúng format không?

## Prompt gốc:
${prompt}

## Expected (nếu có):
${expected ? JSON.stringify(expected, null, 2) : 'Không có'}

## AI Response cần đánh giá:
${response}

## Yêu cầu:
- Chỉ trả về một số nguyên từ 0-100
- Không giải thích, không thêm text
- Ví dụ output hợp lệ: "75"

CRITICAL: Respond with ONLY the number. No JSON, no text, no explanation.`;

  try {
    const result = await AiService.runEvaluationPrompt(evalPrompt);
    const text = result.response.trim();
    const match = text.match(/^(\d+)/);
    if (match) {
      const score = parseInt(match[1], 10);
      return Math.min(100, Math.max(0, score));
    }
    return 50;
  } catch (error) {
    console.warn(
      '[LLM_JUDGE] Failed to evaluate:',
      error instanceof Error ? error.message : String(error)
    );
    return 50;
  }
};

const evaluateWorkoutSemanticScoreWithLLM = async (
  prompt: string,
  response: string,
  expected: Record<string, unknown> | undefined
): Promise<number> => {
  const evalPrompt = `Bạn là một chuyên gia đánh giá chất lượng phản hồi AI.

Hãy đánh giá phản hồi AI dưới đây với thang điểm từ 0-100, dựa trên các tiêu chí:
1. **Độ chính xác** (40%): Phản hồi có đúng với yêu cầu không?
2. **Tính đầy đủ** (30%): Phản hồi có đầy đủ thông tin cần thiết không?
3. **Tính thực tế** (20%): Bài tập, số rep/set có hợp lý không?
4. **Cấu trúc** (10%): JSON output có đúng format không?

## Prompt gốc:
${prompt}

## Expected (nếu có):
${expected ? JSON.stringify(expected, null, 2) : 'Không có'}

## AI Response cần đánh giá:
${response}

## Yêu cầu:
- Chỉ trả về một số nguyên từ 0-100
- Không giải thích, không thêm text
- Ví dụ output hợp lệ: "75"`;

  try {
    const result = await AiService.runEvaluationPrompt(evalPrompt);
    const text = result.response.trim();
    const match = text.match(/^(\d+)/);
    if (match) {
      const score = parseInt(match[1], 10);
      return Math.min(100, Math.max(0, score));
    }
    return 50;
  } catch (error) {
    console.warn(
      '[LLM_JUDGE] Failed to evaluate:',
      error instanceof Error ? error.message : String(error)
    );
    return 50;
  }
};

export const AiEvaluationService = {
  getMetricsSummary: async (query: ListMetricsQuery) => {
    const filter = buildMetricFilter(query);
    const metrics = await AiMetricModel.find(filter).lean();

    const successful = metrics.filter(item => item.status === 'success');
    const accuracyItems = successful.filter(
      item =>
        typeof item.accuracyScore === 'number' &&
        (item.sourceType === 'evaluation' || item.endpoint !== 'ask_agent')
    );
    const correctItems = successful.filter(
      item =>
        typeof item.isCorrect === 'boolean' &&
        (item.sourceType === 'evaluation' || item.endpoint !== 'ask_agent')
    );

    const totalRequests = metrics.length;
    const successfulRequests = successful.length;
    const failedRequests = totalRequests - successfulRequests;

    const avgAccuracy = safeAvg(
      accuracyItems.reduce((sum, item) => sum + (item.accuracyScore ?? 0), 0),
      accuracyItems.length
    );
    const trueRate = safeAvg(
      correctItems.filter(item => item.isCorrect).length,
      correctItems.length
    );
    const avgLatencyMs = safeAvg(
      successful.reduce((sum, item) => sum + (item.latencyMs ?? 0), 0),
      successful.length
    );
    const totalCostUsd = metrics.reduce(
      (sum, item) => sum + (item.estimatedCostUsd ?? 0),
      0
    );
    const avgCostUsd = safeAvg(totalCostUsd, totalRequests);

    return {
      source: query.source ?? 'both',
      endpoint: query.endpoint ?? 'all',
      totalRequests,
      successfulRequests,
      failedRequests,
      accuracy: {
        avgScore: Number(avgAccuracy.toFixed(2)),
        trueRate: Number((trueRate * 100).toFixed(2))
      },
      latency: {
        avgMs: Number(avgLatencyMs.toFixed(2))
      },
      cost: {
        totalUsd: Number(totalCostUsd.toFixed(6)),
        avgUsd: Number(avgCostUsd.toFixed(6))
      },
      stability: {
        successRate:
          totalRequests > 0
            ? Number(((successfulRequests / totalRequests) * 100).toFixed(2))
            : 0
      },
      security: {
        piiDetected: metrics.filter(item => item.meta?.piiDetected === true)
          .length,
        injectionDetected: metrics.filter(
          item => item.meta?.promptInjectionDetected === true
        ).length
      }
    };
  },

  getMetricsTrends: async (query: ListMetricsQuery) => {
    const filter = buildMetricFilter(query);
    const granularity = query.granularity ?? 'day';

    const dateFormat = granularity === 'hour' ? '%Y-%m-%d %H:00' : '%Y-%m-%d';

    const result = await AiMetricModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            period: {
              $dateToString: { format: dateFormat, date: '$createdAt' }
            },
            sourceType: '$sourceType'
          },
          requests: { $sum: 1 },
          avgAccuracy: {
            $avg: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$sourceType', 'evaluation'] },
                    { $ne: ['$endpoint', 'ask_agent'] }
                  ]
                },
                '$accuracyScore',
                null
              ]
            }
          },
          avgLatency: { $avg: '$latencyMs' },
          totalCost: { $sum: '$estimatedCostUsd' }
        }
      },
      {
        $project: {
          _id: 0,
          period: '$_id.period',
          sourceType: '$_id.sourceType',
          requests: 1,
          avgAccuracy: { $ifNull: ['$avgAccuracy', 0] },
          avgLatency: { $ifNull: ['$avgLatency', 0] },
          totalCost: { $ifNull: ['$totalCost', 0] }
        }
      },
      { $sort: { period: 1 } }
    ]);

    return result;
  },

  getMetricsBySource: async (query: ListMetricsQuery) => {
    const filter = buildMetricFilter({ ...query, source: 'both' });
    const result = await AiMetricModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$sourceType',
          requests: { $sum: 1 },
          successCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'success'] }, 1, 0]
            }
          },
          avgAccuracy: {
            $avg: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$sourceType', 'evaluation'] },
                    { $ne: ['$endpoint', 'ask_agent'] }
                  ]
                },
                '$accuracyScore',
                null
              ]
            }
          },
          avgLatency: { $avg: '$latencyMs' },
          avgCost: { $avg: '$estimatedCostUsd' }
        }
      },
      {
        $project: {
          _id: 0,
          sourceType: '$_id',
          requests: 1,
          successCount: 1,
          successRate: {
            $cond: [
              { $gt: ['$requests', 0] },
              { $multiply: [{ $divide: ['$successCount', '$requests'] }, 100] },
              0
            ]
          },
          avgAccuracy: { $ifNull: ['$avgAccuracy', 0] },
          avgLatency: { $ifNull: ['$avgLatency', 0] },
          avgCost: { $ifNull: ['$avgCost', 0] }
        }
      }
    ]);

    return result;
  },

  listTestCases: async () => {
    return AiEvaluationTestCaseModel.find().sort({ createdAt: -1 }).lean();
  },

  createTestCase: async (
    userId: string | undefined,
    payload: CreateTestCaseRequest
  ) => {
    const created = await AiEvaluationTestCaseModel.create({
      ...payload,
      createdBy: userId
    });
    return created.toObject();
  },

  updateTestCase: async (
    id: string,
    payload: Partial<CreateTestCaseRequest>
  ) => {
    const updated = await AiEvaluationTestCaseModel.findByIdAndUpdate(
      id,
      payload,
      {
        new: true
      }
    ).lean();

    if (!updated) {
      throw createHttpError(404, 'Không tìm thấy test case');
    }

    return updated;
  },

  deleteTestCase: async (id: string) => {
    const deleted =
      await AiEvaluationTestCaseModel.findByIdAndDelete(id).lean();
    if (!deleted) {
      throw createHttpError(404, 'Không tìm thấy test case');
    }
    return deleted;
  },

  runEvaluations: async (payload: RunEvaluationRequest) => {
    const filter: Record<string, unknown> = { enabled: true };
    if (payload.testCaseIds?.length) {
      filter._id = { $in: payload.testCaseIds };
    }

    const testCases = await AiEvaluationTestCaseModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(payload.limit ?? 50)
      .lean();

    const startedAt = new Date();
    const results: Array<Record<string, unknown>> = [];

    const JSON_INSTRUCTION = `

CRITICAL INSTRUCTIONS:
1. You MUST respond with ONLY valid JSON
2. NO explanations, NO conversational text, NO markdown formatting
3. Start your response with { and end with }
4. If you cannot generate the exact format, return: {"error": "unable to generate"}
5. Do NOT ask for more information - generate the response based on available context

Example valid response:
{"meals":[{"mealType":"BREAKFAST","dishes":[{"dishId":"1","servings":1}]}]}

Now generate your JSON response:`;

    for (const testCase of testCases) {
      const start = Date.now();
      const rawPrompt = String(
        (testCase.input as Record<string, unknown>)?.prompt ??
          JSON.stringify(testCase.input)
      );
      const prompt = rawPrompt + JSON_INSTRUCTION;

      try {
        const aiResult = await AiService.runEvaluationPrompt(prompt);
        const evaluation = evaluateTestCaseResult(
          aiResult.response,
          testCase.expected
        );

        if (!evaluation.hasExpectation) {
          const errorMessage =
            'Test case thiếu expected.exact/mustInclude/regex nên không thể chấm điểm';

          const metric = await AiMetricModel.create({
            sourceType: 'evaluation',
            endpoint: testCase.endpoint,
            status: 'failed',
            accuracyScore: 0,
            latencyMs: Date.now() - start,
            inputTokens: aiResult.usage.inputTokens,
            outputTokens: aiResult.usage.outputTokens,
            totalTokens: aiResult.usage.totalTokens,
            estimatedCostUsd: aiResult.usage.totalTokens * 0.000002,
            errorMessage,
            testCaseId: testCase._id,
            testCaseName: testCase.name,
            prompt,
            response: aiResult.response,
            expected: testCase.expected,
            evaluation: {
              hasExpectation: false,
              matched: false,
              passedChecks: 0,
              totalChecks: 0,
              passThreshold: 70
            }
          });

          results.push({
            testCaseId: testCase._id.toString(),
            name: testCase.name,
            isCorrect: false,
            accuracyScore: 0,
            latencyMs: Date.now() - start,
            error: errorMessage
          });

          continue;
        }

        const isCorrect = evaluation.matched;
        let semanticScore: number;
        if (payload.enableLLMJudge) {
          const expectedObj = testCase.expected ?? undefined;
          if (testCase.endpoint === 'recommend_daily_meals') {
            semanticScore = await evaluateMealSemanticScoreWithLLM(
              prompt,
              aiResult.response,
              expectedObj
            );
          } else if (testCase.endpoint === 'recommend_daily_workout') {
            semanticScore = await evaluateWorkoutSemanticScoreWithLLM(
              prompt,
              aiResult.response,
              expectedObj
            );
          } else {
            semanticScore = evaluation.ruleScore;
          }
        } else {
          semanticScore =
            testCase.endpoint === 'recommend_daily_meals'
              ? evaluateMealSemanticScore(aiResult.response)
              : evaluation.ruleScore;
        }
        const accuracyScore = computeScore(evaluation.ruleScore, semanticScore);
        const isAccurate = accuracyScore >= 70;

        const metric = await AiMetricModel.create({
          sourceType: 'evaluation',
          endpoint: testCase.endpoint,
          status: 'success',
          isCorrect: isAccurate,
          classification: isAccurate ? 'positive' : 'negative',
          ruleScore: evaluation.ruleScore,
          semanticScore,
          accuracyScore,
          rulePassed: evaluation.passedChecks,
          ruleTotal: evaluation.totalChecks,
          latencyMs: Date.now() - start,
          inputTokens: aiResult.usage.inputTokens,
          outputTokens: aiResult.usage.outputTokens,
          totalTokens: aiResult.usage.totalTokens,
          estimatedCostUsd: aiResult.usage.totalTokens * 0.000002,
          testCaseId: testCase._id,
          testCaseName: testCase.name,
          prompt,
          response: aiResult.response,
          expected: testCase.expected,
          evaluation: {
            hasExpectation: evaluation.hasExpectation,
            matched: evaluation.matched,
            passedChecks: evaluation.passedChecks,
            totalChecks: evaluation.totalChecks,
            passThreshold: 70
          }
        });

        results.push({
          testCaseId: testCase._id.toString(),
          name: testCase.name,
          isCorrect: isAccurate,
          ruleScore: evaluation.ruleScore,
          semanticScore,
          accuracyScore,
          latencyMs: Date.now() - start
        });
      } catch (error) {
        await AiMetricModel.create({
          sourceType: 'evaluation',
          endpoint: testCase.endpoint,
          status: 'failed',
          accuracyScore: 0,
          latencyMs: Date.now() - start,
          errorMessage: error instanceof Error ? error.message : String(error),
          testCaseId: testCase._id,
          testCaseName: testCase.name,
          prompt,
          expected: testCase.expected,
          response: '',
          evaluation: {
            hasExpectation: true,
            matched: false,
            passedChecks: 0,
            totalChecks: 0,
            passThreshold: 70
          }
        });

        results.push({
          testCaseId: testCase._id.toString(),
          name: testCase.name,
          isCorrect: false,
          accuracyScore: 0,
          latencyMs: Date.now() - start,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    const successCount = results.filter(item => item.isCorrect === true).length;

    return {
      startedAt,
      finishedAt: new Date(),
      total: results.length,
      successCount,
      failedCount: results.length - successCount,
      averageAccuracy: Number(
        safeAvg(
          results.reduce(
            (sum, item) => sum + Number(item.accuracyScore ?? 0),
            0
          ),
          results.length
        ).toFixed(2)
      ),
      results
    };
  },

  listEvaluationResults: async (query: ListMetricsQuery) => {
    const filter = buildMetricFilter({ ...query, source: 'evaluation' });
    return AiMetricModel.find(filter).sort({ createdAt: -1 }).limit(200).lean();
  },

  getEvaluationResultDetail: async (metricId: string) => {
    const result = await AiMetricModel.findById(metricId).lean();

    if (!result) {
      throw createHttpError(404, 'Không tìm thấy chi tiết kết quả đánh giá');
    }

    return result;
  }
};
