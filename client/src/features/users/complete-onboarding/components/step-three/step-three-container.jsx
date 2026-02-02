import React from 'react';

import { StepThreeOneSchedule } from './step-three-one-schedule';
import { StepThreeXMealDetail } from './step-three-x-meal-detail';

export function StepThreeContainer({
  control,
  currentSubStep,
  selectedMealIndex,
  onEditMeal,
  onBackToList
}) {
  const renderSubStep = () => {
    if (currentSubStep === 1) {
      return <StepThreeOneSchedule control={control} onEditMeal={onEditMeal} />;
    }
    return (
      <StepThreeXMealDetail
        control={control}
        mealIndex={selectedMealIndex}
        onBack={onBackToList}
      />
    );
  };

  return <div>{renderSubStep()}</div>;
}
