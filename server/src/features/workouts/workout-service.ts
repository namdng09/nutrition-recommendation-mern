import type { QueryOptions } from '@quarks/mongoose-query-parser';
import createHttpError from 'http-errors';
import type { PaginateResult } from 'mongoose';

import { ROLE } from '~/shared/constants/role';
import { ExerciseModel } from '~/shared/database/models/exercise-model';
import type { Workout } from '~/shared/database/models/workout-model';
import { WorkoutModel } from '~/shared/database/models/workout-model';
import { buildPaginateOptions, validateObjectId } from '~/shared/utils';

import type { CreateWorkoutRequest, UpdateWorkoutRequest } from './workout-dto';

export const WorkoutService = {
  createWorkout: async (
    userId: string,
    userName: string,
    data: CreateWorkoutRequest
  ) => {
    const existingWorkout = await WorkoutModel.findOne({
      'user._id': userId,
      name: data.name
    });

    if (existingWorkout) {
      throw createHttpError(409, 'Workout với tên này đã tồn tại');
    }

    const exercises = await resolveWorkoutExercises(data.exercises);

    const newWorkout = await WorkoutModel.create({
      user: {
        _id: userId,
        name: userName
      },
      name: data.name,
      description: data.description,
      exercises,
      isActive: data.isActive ?? true
    });

    return newWorkout;
  },

  viewWorkouts: async (
    parsed: QueryOptions
  ): Promise<PaginateResult<Workout>> => {
    const { filter } = parsed;
    const options = buildPaginateOptions(parsed);

    const result = await WorkoutModel.paginate(filter, options);

    return result;
  },

  viewWorkoutDetail: async (id: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID workout không hợp lệ');
    }

    const workout = await WorkoutModel.findById(id);

    if (!workout) {
      throw createHttpError(404, 'Không tìm thấy workout');
    }

    return workout;
  },

  updateWorkout: async (
    id: string,
    userId: string,
    userRole: string,
    data: UpdateWorkoutRequest
  ) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID workout không hợp lệ');
    }

    const workout = await WorkoutModel.findById(id);

    if (!workout) {
      throw createHttpError(404, 'Không tìm thấy workout');
    }

    const isOwner = workout.user?._id.toString() === userId;
    const isAdmin = userRole === ROLE.ADMIN;

    if (!isOwner && !isAdmin) {
      throw createHttpError(403, 'Bạn không có quyền cập nhật workout này');
    }

    if (data.name) {
      const duplicate = await WorkoutModel.findOne({
        'user._id': workout.user?._id,
        name: data.name,
        _id: { $ne: id }
      });

      if (duplicate) {
        throw createHttpError(409, 'Workout với tên này đã tồn tại');
      }
    }

    const { exercises, ...rest } = data;
    const updatePayload: Record<string, unknown> = { ...rest };

    if (typeof exercises !== 'undefined') {
      updatePayload.exercises = await resolveWorkoutExercises(exercises);
    }

    const updatedWorkout = await WorkoutModel.findByIdAndUpdate(
      id,
      updatePayload,
      {
        new: true
      }
    );

    if (!updatedWorkout) {
      throw createHttpError(404, 'Không tìm thấy workout');
    }

    return updatedWorkout;
  },

  deleteWorkout: async (id: string, userId: string, userRole: string) => {
    if (!validateObjectId(id)) {
      throw createHttpError(400, 'Định dạng ID workout không hợp lệ');
    }

    const workout = await WorkoutModel.findById(id);

    if (!workout) {
      throw createHttpError(404, 'Không tìm thấy workout');
    }

    const isOwner = workout.user?._id.toString() === userId;
    const isAdmin = userRole === ROLE.ADMIN;

    if (!isOwner && !isAdmin) {
      throw createHttpError(403, 'Bạn không có quyền xóa workout này');
    }

    await workout.deleteOne();

    return workout;
  }
};

async function resolveWorkoutExercises(
  items: CreateWorkoutRequest['exercises']
) {
  return Promise.all(
    items.map(async (item, index) => {
      if (!validateObjectId(item.exerciseId)) {
        throw createHttpError(
          400,
          `Định dạng ID bài tập không hợp lệ: ${item.exerciseId}`
        );
      }

      const exercise = await ExerciseModel.findById(item.exerciseId);

      if (!exercise) {
        throw createHttpError(
          404,
          `Không tìm thấy bài tập với ID: ${item.exerciseId}`
        );
      }

      return {
        exerciseId: exercise._id,
        exerciseName: exercise.name,
        exerciseType: exercise.type,
        exerciseTutorial: exercise.tutorial ?? '',
        counterType: item.counterType,
        distanceTarget: item.distanceTarget,
        weightAndRepsTarget: item.weightAndRepsTarget,
        durationTarget: item.durationTarget,
        note: item.note,
        order: item.order ?? index + 1
      };
    })
  );
}
