import React from 'react';

import { StepOneOneDiet } from './step-one-one-diet';
import { StepOneThreeMedical } from './step-one-three-medical';
import { StepOneTwoAllergen } from './step-one-two-allergen';

export function StepOneContainer({ control, currentSubStep }) {
  const renderSubStep = () => {
    switch (currentSubStep) {
      case 1:
        return <StepOneOneDiet control={control} />;
      case 2:
        return <StepOneTwoAllergen control={control} />;
      case 3:
        return <StepOneThreeMedical control={control} />;
      default:
        return null;
    }
  };

  return <div>{renderSubStep()}</div>;
}
