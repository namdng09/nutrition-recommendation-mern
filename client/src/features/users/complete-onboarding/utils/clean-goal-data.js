export const cleanGoalData = goal => {
  if (!goal) return undefined;
  const { mode, ...restGoal } = goal;

  const result = { ...restGoal };

  if (result.weightGoal) {
    result.weightGoal = Number(result.weightGoal);
  }
  if (result.targetWeightChange) {
    result.targetWeightChange = Number(result.targetWeightChange);
  }

  return result;
};
