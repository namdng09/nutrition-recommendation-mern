import type { Request, Response } from 'express';

import { ApiResponse } from '~/shared/utils';
import { parseQuery } from '~/shared/utils/query-parser';

import { WorkoutService } from './workout-service';

export const WorkoutController = {
  createWorkout: async (req: Request, res: Response) => {
    const data = req.body;
    const userId = req.user!._id.toString();
    const userName = req.user!.name;

    const result = await WorkoutService.createWorkout(userId, userName, data);

    res.status(201).json(ApiResponse.success('Tạo workout thành công', result));
  },

  viewWorkouts: async (req: Request, res: Response) => {
    const parsed = parseQuery(req.query);

    const result = await WorkoutService.viewWorkouts(parsed);

    res
      .status(200)
      .json(ApiResponse.success('Lấy danh sách workout thành công', result));
  },

  viewWorkoutDetail: async (req: Request, res: Response) => {
    const id = req.params.id;

    const result = await WorkoutService.viewWorkoutDetail(id);

    res
      .status(200)
      .json(ApiResponse.success('Lấy thông tin workout thành công', result));
  },

  updateWorkout: async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = req.body;
    const userId = req.user!._id.toString();
    const userRole = req.user!.role;

    const result = await WorkoutService.updateWorkout(
      id,
      userId,
      userRole,
      data
    );

    res
      .status(200)
      .json(ApiResponse.success('Cập nhật workout thành công', result));
  },

  deleteWorkout: async (req: Request, res: Response) => {
    const id = req.params.id;
    const userId = req.user!._id.toString();
    const userRole = req.user!.role;

    await WorkoutService.deleteWorkout(id, userId, userRole);

    res.status(200).json(ApiResponse.success('Xóa workout thành công'));
  }
};
