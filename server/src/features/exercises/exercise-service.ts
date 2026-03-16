import type { QueryOptions } from '@quarks/mongoose-query-parser';
import createHttpError from 'http-errors';
import type { HydratedDocument, PaginateResult } from 'mongoose';

import { ExerciseModel } from '~/shared/database/models';
import type { Exercise } from '~/shared/database/models/exercise-model';
import {
  buildPaginateOptions,
  deleteExerciseTutorial,
  uploadExerciseTutorial,
  validateObjectId
} from '~/shared/utils';

import type {
  CreateExerciseRequest,
  UpdateExerciseRequest
} from './exercise-dto';

export const ExerciseService = {
  createExercise: async (
    data: CreateExerciseRequest,
    tutorial?: Express.Multer.File
  ) => {
    const existingExercise = await ExerciseModel.findOne({ name: data.name });

    if (existingExercise) {
      throw createHttpError(409, 'Bài tập với tên này đã tồn tại');
    }

    const newExercise = await ExerciseModel.create(data);

    if (tutorial) {
      await replaceExerciseTutorial(newExercise, tutorial);
    }

    return newExercise;
  },

  viewExercises: async (
    parsed: QueryOptions
  ): Promise<PaginateResult<Exercise>> => {
    const { filter } = parsed;
    const options = buildPaginateOptions(parsed);

    const result = await ExerciseModel.paginate(filter, options);

    return result;
  },

  viewExerciseDetail: async (id: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID bài tập không hợp lệ');
    }

    const exercise = await ExerciseModel.findById(id);

    if (!exercise) {
      throw createHttpError(404, 'Không tìm thấy bài tập');
    }

    return exercise;
  },

  updateExercise: async (
    id: string,
    data: UpdateExerciseRequest,
    tutorial?: Express.Multer.File
  ) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID bài tập không hợp lệ');
    }

    if (data.name) {
      const existingExercise = await ExerciseModel.findOne({
        name: data.name,
        _id: { $ne: id }
      });

      if (existingExercise) {
        throw createHttpError(409, 'Bài tập với tên này đã tồn tại');
      }
    }

    const updatedExercise = await ExerciseModel.findByIdAndUpdate(id, data, {
      new: true
    });

    if (!updatedExercise) {
      throw createHttpError(404, 'Không tìm thấy bài tập');
    }

    if (tutorial) {
      await replaceExerciseTutorial(updatedExercise, tutorial);
    }

    return updatedExercise;
  },

  deleteExercise: async (id: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID bài tập không hợp lệ');
    }

    const deletedExercise = await ExerciseModel.findByIdAndDelete(id);

    if (!deletedExercise) {
      throw createHttpError(404, 'Không tìm thấy bài tập');
    }

    return deletedExercise;
  }
};

async function saveExerciseTutorial(
  exercise: HydratedDocument<Exercise>,
  file: Express.Multer.File
) {
  const uploadResult = await uploadExerciseTutorial(
    file.buffer,
    exercise._id.toString()
  );
  if (uploadResult.success && uploadResult.data) {
    exercise.tutorial = uploadResult.data.secure_url;
    await exercise.save();
  } else {
    throw createHttpError(500, 'Không thể tải lên ảnh hướng dẫn bài tập');
  }
}

async function replaceExerciseTutorial(
  exercise: HydratedDocument<Exercise>,
  file: Express.Multer.File
) {
  await deleteExerciseTutorial(exercise._id.toString());
  await saveExerciseTutorial(exercise, file);
}
