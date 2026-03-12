import type { Request, Response } from 'express';

import { ApiResponse } from '~/shared/utils';
import { parseQuery } from '~/shared/utils/query-parser';

import { ActivityService } from './activity-service';

export const ActivityController = {
  createActivity: async (req: Request, res: Response) => {
    const data = req.body;
    const tutorial = req.file;

    const result = await ActivityService.createActivity(data, tutorial);

    res
      .status(201)
      .json(ApiResponse.success('Tạo hoạt động thành công', result));
  },

  viewActivities: async (req: Request, res: Response) => {
    const parsed = parseQuery(req.query);

    const result = await ActivityService.viewActivities(parsed);

    res
      .status(200)
      .json(ApiResponse.success('Lấy danh sách hoạt động thành công', result));
  },

  viewActivityDetail: async (req: Request, res: Response) => {
    const id = req.params.id;

    const result = await ActivityService.viewActivityDetail(id);

    res
      .status(200)
      .json(ApiResponse.success('Lấy thông tin hoạt động thành công', result));
  },

  updateActivity: async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = req.body;
    const tutorial = req.file;

    const result = await ActivityService.updateActivity(id, data, tutorial);

    res
      .status(200)
      .json(ApiResponse.success('Cập nhật hoạt động thành công', result));
  },

  deleteActivity: async (req: Request, res: Response) => {
    const id = req.params.id;

    await ActivityService.deleteActivity(id);

    res.status(200).json(ApiResponse.success('Xóa hoạt động thành công'));
  }
};
