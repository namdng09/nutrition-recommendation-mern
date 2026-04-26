import React from 'react';

import { StepOneOneDiet } from './step-one-one-diet';
import { StepOneTwoAllergen } from './step-one-two-allergen';

export function StepOneContainer({ control, currentSubStep }) {
  const renderSubStep = () => {
    switch (currentSubStep) {
      case 1:
        return <StepOneOneDiet control={control} />;
      case 2:
        return <StepOneTwoAllergen control={control} />;
      default:
        return null;
    }
  };

  return <div>{renderSubStep()}</div>;
}
