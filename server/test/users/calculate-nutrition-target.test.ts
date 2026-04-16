import { describe, expect, it } from 'vitest';

import { UserService } from '~/features/users/user-service';
import { ACTIVITY_LEVEL } from '~/shared/constants/activity-level';
import { BODYFAT } from '~/shared/constants/bodyfat';
import { DIET } from '~/shared/constants/diet';
import { GENDER } from '~/shared/constants/gender';
import { USER_TARGET } from '~/shared/constants/user-target';

describe('UserService.calculateNutritionTarget (UC66/UC69)', () => {
  it('should calculate target and macros for valid inputs', async () => {
    const result = await UserService.calculateNutritionTarget({
      diet: DIET.ANYTHING,
      gender: GENDER.MALE,
      height: 175,
      weight: 70,
      age: 25,
      bodyfat: BODYFAT.MEDIUM,
      activityLevel: ACTIVITY_LEVEL.ACTIVE_DAILY_FREQUENT,
      goal: { target: USER_TARGET.MAINTAIN_WEIGHT }
    } as any);

    expect(result.caloriesTarget).toBeGreaterThan(0);
    expect(result.macros.carbs.min).toBeGreaterThanOrEqual(0);
  });

  it('should throw when dob and age are both missing', async () => {
    await expect(
      UserService.calculateNutritionTarget({
        diet: DIET.ANYTHING,
        gender: GENDER.MALE,
        height: 175,
        weight: 70,
        bodyfat: BODYFAT.MEDIUM,
        activityLevel: ACTIVITY_LEVEL.ACTIVE_DAILY_FREQUENT
      } as any)
    ).rejects.toHaveProperty('status');
  });

  it('should throw 400 when dob format is invalid', async () => {
    await expect(
      UserService.calculateNutritionTarget({
        diet: DIET.ANYTHING,
        gender: GENDER.MALE,
        height: 175,
        weight: 70,
        dob: 'not-a-date',
        bodyfat: BODYFAT.MEDIUM,
        activityLevel: ACTIVITY_LEVEL.ACTIVE_DAILY_FREQUENT
      } as any)
    ).rejects.toMatchObject({
      status: 400,
      message: 'Định dạng ngày sinh không hợp lệ'
    });
  });

  it('should throw 400 when activity level is invalid', async () => {
    await expect(
      UserService.calculateNutritionTarget({
        diet: DIET.ANYTHING,
        gender: GENDER.MALE,
        height: 175,
        weight: 70,
        age: 25,
        bodyfat: BODYFAT.MEDIUM,
        activityLevel: 'INVALID_ACTIVITY',
        goal: { target: USER_TARGET.MAINTAIN_WEIGHT }
      } as any)
    ).rejects.toMatchObject({
      status: 400,
      message: 'Mức hoạt động không hợp lệ'
    });
  });

  it('should apply lose fat adjustment when targetWeightChange is not provided', async () => {
    const result = await UserService.calculateNutritionTarget({
      diet: DIET.ANYTHING,
      gender: GENDER.MALE,
      height: 175,
      weight: 70,
      age: 25,
      bodyfat: BODYFAT.MEDIUM,
      activityLevel: ACTIVITY_LEVEL.ACTIVE_DAILY_FREQUENT,
      goal: { target: USER_TARGET.LOSE_FAT }
    } as any);

    expect(result.caloriesTarget).toBeGreaterThan(0);
  });

  it('should apply build muscle adjustment for non-binary gender branch', async () => {
    const result = await UserService.calculateNutritionTarget({
      diet: DIET.VEGAN,
      gender: GENDER.OTHER,
      height: 170,
      weight: 65,
      age: 28,
      bodyfat: BODYFAT.MEDIUM,
      activityLevel: ACTIVITY_LEVEL.DESK_JOB_LIGHT_EXERCISE,
      goal: { target: USER_TARGET.BUILD_MUSCLE }
    } as any);

    expect(result.caloriesTarget).toBeGreaterThan(0);
    expect(result.macros.fat.max).toBeGreaterThanOrEqual(result.macros.fat.min);
  });
});
