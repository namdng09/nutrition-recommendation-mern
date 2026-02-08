import type { Request, Response } from 'express';

import { ApiResponse } from '~/shared/utils';
import { parseQuery } from '~/shared/utils/query-parser';

import { ScheduleService } from './schedule-service';

export const ScheduleController = {
  createSchedule: async (req: Request, res: Response) => {
    const data = req.body;
    const userId = req.user!._id.toString();
    const userName = req.user!.name;

    const result = await ScheduleService.createSchedule(userId, userName, data);

    res.status(201).json(ApiResponse.success('Tạo lịch ăn thành công', result));
  },

  viewSchedules: async (req: Request, res: Response) => {
    const parsed = parseQuery(req.query);
    const userId = req.user!._id.toString();
    const role = req.user?.role;

    const result = await ScheduleService.viewSchedules(userId, role, parsed);

    res
      .status(200)
      .json(ApiResponse.success('Lấy danh sách lịch ăn thành công', result));
  },

  viewScheduleDetail: async (req: Request, res: Response) => {
    const id = req.params.id;
    const userId = req.user!._id.toString();
    const role = req.user?.role;

    const result = await ScheduleService.viewScheduleDetail(id, userId, role);

    res
      .status(200)
      .json(ApiResponse.success('Lấy thông tin lịch ăn thành công', result));
  },

  updateSchedule: async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = req.body;
    const userId = req.user!._id.toString();
    const role = req.user?.role;

    const result = await ScheduleService.updateSchedule(id, userId, role, data);

    res
      .status(200)
      .json(ApiResponse.success('Cập nhật lịch ăn thành công', result));
  },

  updateScheduleMeals: async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = req.body;
    const userId = req.user!._id.toString();

    const result = await ScheduleService.updateScheduleMeals(id, userId, data);

    res
      .status(200)
      .json(ApiResponse.success('Cập nhật bữa ăn thành công', result));
  },

  updateScheduleDishStatus: async (req: Request, res: Response) => {
    const id = req.params.id;
    const dishId = req.params.dishId;
    const mealType = req.params.mealType;
    const data = req.body;
    const userId = req.user!._id.toString();

    const result = await ScheduleService.updateScheduleDishStatus(
      id,
      userId,
      mealType,
      dishId,
      data
    );

    res
      .status(200)
      .json(
        ApiResponse.success('Cập nhật trạng thái món ăn thành công', result)
      );
  },

  deleteSchedule: async (req: Request, res: Response) => {
    const id = req.params.id;
    const userId = req.user!._id.toString();
    const role = req.user?.role;

    await ScheduleService.deleteSchedule(id, userId, role);

    res.status(200).json(ApiResponse.success('Xóa lịch ăn thành công'));
  },

  removeScheduleDish: async (req: Request, res: Response) => {
    const id = req.params.id;
    const dishId = req.params.dishId;
    const mealType = req.params.mealType;
    const userId = req.user!._id.toString();

    const result = await ScheduleService.removeScheduleDish(
      id,
      userId,
      mealType,
      dishId
    );

    res
      .status(200)
      .json(ApiResponse.success('Xóa món ăn khỏi bữa thành công', result));
  },

  clearScheduleMealDishes: async (req: Request, res: Response) => {
    const id = req.params.id;
    const mealType = req.params.mealType;
    const userId = req.user!._id.toString();

    const result = await ScheduleService.clearScheduleMealDishes(
      id,
      userId,
      mealType
    );

    res
      .status(200)
      .json(
        ApiResponse.success('Xóa tất cả món ăn trong bữa thành công', result)
      );
  }
};
