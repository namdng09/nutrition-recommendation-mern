import createHttpError from 'http-errors';

import { AiService } from '~/features/ai/ai-service';
import {
  AiEvaluationTestCaseModel,
  AiMetricModel
} from '~/shared/database/models';

import type {
  CreateTestCaseRequest,
  ListMetricsQuery,
  RunEvaluationRequest
} from './ai-evaluation-dto';
import { SemanticValidator } from './validators/semantic-validator';

const semanticValidator = new SemanticValidator();

const toDateFilter = (query: ListMetricsQuery) => {
  const hasStart = Boolean(query.startDate);
  const hasEnd = Boolean(query.endDate);

  if (!hasStart && !hasEnd) return null;

  const createdAt: Record<string, Date> = {};

  if (hasStart) {
    const startStr = query.startDate as string;
    const start =
      startStr.length === 10
        ? new Date(`${startStr}T00:00:00+07:00`)
        : new Date(startStr);
    if (!Number.isNaN(start.getTime())) {
      createdAt.$gte = start;
    }
  }

  if (hasEnd) {
    const endStr = query.endDate as string;
    const end =
      endStr.length === 10
        ? new Date(`${endStr}T23:59:59.999+07:00`)
        : new Date(endStr);
    if (!Number.isNaN(end.getTime())) {
      createdAt.$lte = end;
    }
  }

  return Object.keys(createdAt).length > 0 ? createdAt : null;
};

const buildMetricFilter = (query: ListMetricsQuery) => {
  const filter: Record<string, unknown> = {};
  const source = query.sourceType ?? 'both';

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
  const isErrorResponse =
    text.includes('"error"') && text.includes('unable to generate');
  const isNegative = expected?.classification === 'negative';

  if (isNegative) {
    return {
      hasExpectation: true,
      passedChecks: isErrorResponse ? 1 : 0,
      totalChecks: 1,
      ruleScore: isErrorResponse ? 100 : 0,
      matched: isErrorResponse,
      isErrorResponse
    };
  }

  if (isErrorResponse) {
    return {
      hasExpectation: true,
      passedChecks: 0,
      totalChecks: 1,
      ruleScore: 0,
      matched: false,
      isErrorResponse: true
    };
  }

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
    matched: hasExpectation && passedChecks === checks.length,
    isErrorResponse: false
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
      sourceType: query.sourceType ?? 'both',
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
              $dateToString: {
                format: dateFormat,
                date: '$createdAt',
                timezone: '+07:00'
              }
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
    const filter = buildMetricFilter({ ...query, sourceType: 'both' });
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

          await AiMetricModel.create({
            sourceType: 'evaluation',
            endpoint: testCase.endpoint,
            status: 'failed',
            classification: testCase.expected?.classification,
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
              passThreshold: 90
            }
          });

          results.push({
            testCaseId: testCase._id.toString(),
            name: testCase.name,
            endpoint: testCase.endpoint,
            status: 'failed',
            isCorrect: false,
            accuracyScore: 0,
            ruleScore: 0,
            semanticScore: 0,
            latencyMs: Date.now() - start,
            inputTokens: aiResult.usage.inputTokens,
            outputTokens: aiResult.usage.outputTokens,
            totalTokens: aiResult.usage.totalTokens,
            estimatedCostUsd: aiResult.usage.totalTokens * 0.000002,
            error: errorMessage
          });

          continue;
        }

        const isNegative = testCase.expected?.classification === 'negative';
        let semanticScore: number;
        if (isNegative) {
          semanticScore = 100;
        } else if (testCase.endpoint === 'recommend_daily_meals') {
          const input = testCase.input as Record<string, unknown>;
          const ctx = input?.context as Record<string, unknown> | undefined;
          const context = {
            goal: String(ctx?.goal ?? 'maintain weight'),
            diet: String(ctx?.diet ?? 'balanced'),
            calories: Number(ctx?.calories ?? 2000),
            allergies: Array.isArray(ctx?.allergies)
              ? ctx.allergies.map(String)
              : [],
            mealPlanJson: aiResult.response
          };
          const semanticResult = await semanticValidator.evaluate(context);
          semanticScore = semanticResult.overallScore;
        } else {
          semanticScore = evaluation.ruleScore;
        }
        const accuracyScore = computeScore(evaluation.ruleScore, semanticScore);
        const isAccurate = accuracyScore >= 90;

        await AiMetricModel.create({
          sourceType: 'evaluation',
          endpoint: testCase.endpoint,
          status: 'success',
          isCorrect: isAccurate,
          classification: testCase.expected?.classification,
          ruleScore: evaluation.ruleScore,
          semanticScore,
          accuracyScore,
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
            passThreshold: 90,
            isErrorResponse: evaluation.isErrorResponse ?? false
          }
        });

        results.push({
          testCaseId: testCase._id.toString(),
          name: testCase.name,
          endpoint: testCase.endpoint,
          status: 'success',
          isCorrect: isAccurate,
          ruleScore: evaluation.ruleScore,
          semanticScore,
          accuracyScore,
          latencyMs: Date.now() - start,
          inputTokens: aiResult.usage.inputTokens,
          outputTokens: aiResult.usage.outputTokens,
          totalTokens: aiResult.usage.totalTokens,
          estimatedCostUsd: aiResult.usage.totalTokens * 0.000002
        });
      } catch (error) {
        await AiMetricModel.create({
          sourceType: 'evaluation',
          endpoint: testCase.endpoint,
          status: 'failed',
          classification: testCase.expected?.classification,
          ruleScore: 0,
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
            passThreshold: 90
          }
        });

        results.push({
          testCaseId: testCase._id.toString(),
          name: testCase.name,
          endpoint: testCase.endpoint,
          status: 'failed',
          isCorrect: false,
          ruleScore: 0,
          semanticScore: 0,
          accuracyScore: 0,
          latencyMs: Date.now() - start,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          estimatedCostUsd: 0,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    const successCount = results.filter(item => item.isCorrect === true).length;
    const totalTokens = results.reduce(
      (sum, item) => sum + Number(item.totalTokens ?? 0),
      0
    );
    const totalLatency = results.reduce(
      (sum, item) => sum + Number(item.latencyMs ?? 0),
      0
    );
    const totalCost = results.reduce(
      (sum, item) => sum + Number(item.estimatedCostUsd ?? 0),
      0
    );
    const totalRequests = results.length;
    const successfulRequests = results.filter(
      item => item.status === 'success'
    ).length;
    const stability =
      totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;

    const successful = results.filter(item => item.status === 'success');
    const accuracyItems = successful.filter(
      item => typeof item.accuracyScore === 'number'
    );
    const correctItems = successful.filter(
      item => typeof item.isCorrect === 'boolean'
    );
    const avgAccuracy = safeAvg(
      accuracyItems.reduce(
        (sum, item) => sum + Number(item.accuracyScore ?? 0),
        0
      ),
      accuracyItems.length
    );
    const trueRate = safeAvg(
      correctItems.filter(item => item.isCorrect).length,
      correctItems.length
    );
    const avgLatencyMs = safeAvg(
      successful.reduce((sum, item) => sum + Number(item.latencyMs ?? 0), 0),
      successful.length
    );
    const avgCostUsd = safeAvg(totalCost, totalRequests);
    const endpoints = Array.from(new Set(testCases.map(item => item.endpoint)));
    const endpoint = endpoints.length === 1 ? endpoints[0] : 'all';

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
      averageLatencyMs:
        totalRequests > 0 ? Math.round(totalLatency / totalRequests) : 0,
      totalCostUsd: Number(totalCost.toFixed(6)),
      totalTokens,
      stability: Number(stability.toFixed(2)),
      summary: {
        sourceType: 'evaluation',
        endpoint,
        totalRequests,
        successfulRequests,
        failedRequests: totalRequests - successfulRequests,
        accuracy: {
          avgScore: Number(avgAccuracy.toFixed(2)),
          trueRate: Number((trueRate * 100).toFixed(2))
        },
        latency: {
          avgMs: Number(avgLatencyMs.toFixed(2))
        },
        cost: {
          totalUsd: Number(totalCost.toFixed(6)),
          avgUsd: Number(avgCostUsd.toFixed(6))
        },
        stability: {
          successRate: Number(stability.toFixed(2))
        },
        security: {
          piiDetected: 0,
          injectionDetected: 0
        }
      },
      results
    };
  },

  listEvaluationResults: async (query: ListMetricsQuery) => {
    const filter = buildMetricFilter({ ...query, sourceType: 'evaluation' });
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
