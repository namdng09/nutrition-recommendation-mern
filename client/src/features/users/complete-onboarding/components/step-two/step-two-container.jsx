import React from 'react';

import { StepTwoOnePhysical } from './step-two-one-physical';
import { StepTwoThreeNutrition } from './step-two-three-nutrition';
import { StepTwoTwoGoal } from './step-two-two-goal';

export function StepTwoContainer({ control, watch, setValue, currentSubStep }) {
  const renderSubStep = () => {
    switch (currentSubStep) {
      case 1:
        return <StepTwoOnePhysical control={control} />;
      case 2:
        return <StepTwoTwoGoal control={control} />;
      case 3:
        return (
          <StepTwoThreeNutrition
            control={control}
            watch={watch}
            setValue={setValue}
          />
        );
      default:
        return null;
    }
  };

  return <div>{renderSubStep()}</div>;
}
