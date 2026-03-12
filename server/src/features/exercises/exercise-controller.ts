import type { Request, Response } from 'express';

import { ApiResponse } from '~/shared/utils';
import { parseQuery } from '~/shared/utils/query-parser';

import { ExerciseService } from './exercise-service';

export const ExerciseController = {
  createExercise: async (req: Request, res: Response) => {
    const data = req.body;
    const tutorial = req.file;

    const result = await ExerciseService.createExercise(data, tutorial);

    res.status(201).json(ApiResponse.success('Tạo bài tập thành công', result));
  },

  viewExercises: async (req: Request, res: Response) => {
    const parsed = parseQuery(req.query);

    const result = await ExerciseService.viewExercises(parsed);

    res
      .status(200)
      .json(ApiResponse.success('Lấy danh sách bài tập thành công', result));
  },

  viewExerciseDetail: async (req: Request, res: Response) => {
    const id = req.params.id;

    const result = await ExerciseService.viewExerciseDetail(id);

    res
      .status(200)
      .json(ApiResponse.success('Lấy thông tin bài tập thành công', result));
  },

  updateExercise: async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = req.body;
    const tutorial = req.file;

    const result = await ExerciseService.updateExercise(id, data, tutorial);

    res
      .status(200)
      .json(ApiResponse.success('Cập nhật bài tập thành công', result));
  },

  deleteExercise: async (req: Request, res: Response) => {
    const id = req.params.id;

    await ExerciseService.deleteExercise(id);

    res.status(200).json(ApiResponse.success('Xóa bài tập thành công'));
  }
};
