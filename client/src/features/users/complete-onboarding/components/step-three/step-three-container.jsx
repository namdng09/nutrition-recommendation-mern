import React from 'react';

import { StepThreeOneSchedule } from './step-three-one-schedule';
import { StepThreeXMealDetail } from './step-three-x-meal-detail';

export function StepThreeContainer({
  control,
  currentSubStep,
  selectedMealIndex,
  onBackToList
}) {
  const renderSubStep = () => {
    if (currentSubStep === 1) {
      return <StepThreeOneSchedule control={control} />;
    }

    // Calculate meal index from substep if not explicitly set
    // Substep 2 = meal index 0, substep 3 = meal index 1, etc.
    const mealIndex =
      selectedMealIndex !== null ? selectedMealIndex : currentSubStep - 2;

    return (
      <StepThreeXMealDetail
        control={control}
        mealIndex={mealIndex}
        onBack={onBackToList}
      />
    );
  };

  return <div>{renderSubStep()}</div>;
}
