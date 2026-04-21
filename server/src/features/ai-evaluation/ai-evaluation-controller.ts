import type { Request, Response } from 'express';

import { ApiResponse } from '~/shared/utils';

import type {
  CreateTestCaseRequest,
  ListMetricsQuery,
  RunEvaluationRequest
} from './ai-evaluation-dto';
import { AiEvaluationService } from './ai-evaluation-service';

export const AiEvaluationController = {
  getMetricsSummary: async (req: Request, res: Response) => {
    const result = await AiEvaluationService.getMetricsSummary(
      req.query as ListMetricsQuery
    );

    res
      .status(200)
      .json(ApiResponse.success('Lấy tổng quan AI metrics thành công', result));
  },

  getMetricsTrends: async (req: Request, res: Response) => {
    const result = await AiEvaluationService.getMetricsTrends(
      req.query as ListMetricsQuery
    );

    res
      .status(200)
      .json(ApiResponse.success('Lấy xu hướng AI metrics thành công', result));
  },

  getMetricsBySource: async (req: Request, res: Response) => {
    const result = await AiEvaluationService.getMetricsBySource(
      req.query as ListMetricsQuery
    );

    res
      .status(200)
      .json(ApiResponse.success('Lấy metrics theo nguồn thành công', result));
  },

  listTestCases: async (_req: Request, res: Response) => {
    const result = await AiEvaluationService.listTestCases();

    res
      .status(200)
      .json(ApiResponse.success('Lấy test cases thành công', result));
  },

  createTestCase: async (req: Request, res: Response) => {
    const result = await AiEvaluationService.createTestCase(
      req.user?._id?.toString(),
      req.body as CreateTestCaseRequest
    );

    res
      .status(201)
      .json(ApiResponse.success('Tạo test case thành công', result));
  },

  updateTestCase: async (req: Request, res: Response) => {
    const result = await AiEvaluationService.updateTestCase(
      req.params.id,
      req.body as Partial<CreateTestCaseRequest>
    );

    res
      .status(200)
      .json(ApiResponse.success('Cập nhật test case thành công', result));
  },

  deleteTestCase: async (req: Request, res: Response) => {
    const result = await AiEvaluationService.deleteTestCase(req.params.id);

    res
      .status(200)
      .json(ApiResponse.success('Xóa test case thành công', result));
  },

  runEvaluations: async (req: Request, res: Response) => {
    const result = await AiEvaluationService.runEvaluations(
      req.body as RunEvaluationRequest
    );

    res
      .status(200)
      .json(ApiResponse.success('Chạy đánh giá AI thành công', result));
  },

  listEvaluationResults: async (req: Request, res: Response) => {
    const result = await AiEvaluationService.listEvaluationResults(
      req.query as ListMetricsQuery
    );

    res
      .status(200)
      .json(ApiResponse.success('Lấy kết quả đánh giá thành công', result));
  },

  getEvaluationResultDetail: async (req: Request, res: Response) => {
    const result = await AiEvaluationService.getEvaluationResultDetail(
      req.params.metricId
    );

    res
      .status(200)
      .json(
        ApiResponse.success('Lấy chi tiết kết quả đánh giá thành công', result)
      );
  }
};
