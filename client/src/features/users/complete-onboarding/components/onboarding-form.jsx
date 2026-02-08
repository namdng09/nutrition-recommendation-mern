import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { Form } from '~/components/ui/form';
import { ACTIVITY_LEVEL } from '~/constants/activity-level';
import { BODYFAT } from '~/constants/bodyfat';
import { DIET, DIET_OPTIONS } from '~/constants/diet';
import { GENDER } from '~/constants/gender';
import { USER_TARGET } from '~/constants/user-target';
import { getStoredAccessToken, saveAccessToken } from '~/lib/auth-tokens';
import { loadUser } from '~/store/features/auth-slice';

import { useCompleteOnboarding } from '../api/use-complete-onboarding';
import {
  onboardingSchema,
  stepOneSchema,
  stepThreeSchema,
  stepTwoOneSchema,
  stepTwoSchema,
  stepTwoTwoSchema
} from '../schemas/onboarding-schema';
import { cleanGoalData } from '../utils/clean-goal-data';
import { StepFourSuccess } from './step-four/step-four-success';
import { StepOneContainer } from './step-one/step-one-container';
import { StepProgress } from './step-progress';
import { StepThreeContainer } from './step-three/step-three-container';
import { StepTwoContainer } from './step-two/step-two-container';
import { StepZeroIntro } from './step-zero/step-zero-intro';

export function OnboardingForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [subSteps, setSubSteps] = useState({ 1: 1, 2: 1, 3: 1 });
  const [selectedMealIndex, setSelectedMealIndex] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mutate: completeOnboarding, isPending } = useCompleteOnboarding();

  const form = useForm({
    resolver: yupResolver(onboardingSchema),
    mode: 'onChange',
    defaultValues: {
      diet: DIET.ANYTHING,
      allergens: [],
      medicalHistory: [],
      gender: GENDER.MALE,
      dob: '',
      height: 0,
      weight: 0,
      bodyfat: BODYFAT.LOW,
      activityLevel: ACTIVITY_LEVEL.DESK_JOB_LIGHT_EXERCISE,
      goal: {
        mode: 'generic',
        target: USER_TARGET.MAINTAIN_WEIGHT,
        weightGoal: undefined,
        targetWeightChange: undefined
      },
      nutritionTarget: {
        caloriesTarget: 0,
        macros: {
          carbs: { min: 0, max: 0 },
          protein: { min: 0, max: 0 },
          fat: { min: 0, max: 0 }
        }
      },
      mealSettings: []
    }
  });

  const getTotalSubSteps = step => {
    switch (step) {
      case 0:
        return 1;
      case 1:
      case 2:
        return 3;
      case 3: {
        const mealCount = form.watch('mealSettings')?.length || 0;
        return 1 + mealCount;
      }
      default:
        return 1;
    }
  };

  const currentSubStep = subSteps[currentStep];
  const totalSubSteps = getTotalSubSteps(currentStep);
  const mealCount = form.watch('mealSettings')?.length || 0;

  const validateCurrentSubStep = async () => {
    if (currentStep === 2) {
      if (currentSubStep === 1) {
        const fields = Object.keys(stepTwoOneSchema.fields);
        return await form.trigger(fields);
      }
      if (currentSubStep === 2) {
        const fields = Object.keys(stepTwoTwoSchema.fields);
        return await form.trigger(fields);
      }
    }

    if (currentStep === 3 && currentSubStep > 1) {
      const mealIndex = currentSubStep - 2;
      const baseFn = `mealSettings.${mealIndex}`;
      const fields = [
        `${baseFn}.name`,
        `${baseFn}.dishCategories`,
        `${baseFn}.cookingPreference`,
        `${baseFn}.mealSize`,
        `${baseFn}.availableTime`,
        `${baseFn}.complexity`
      ];
      return await form.trigger(fields);
    }

    return true;
  };

  const handleSubStepNext = async () => {
    const isValid = await validateCurrentSubStep();

    if (!isValid) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (currentSubStep < totalSubSteps) {
      setSubSteps(prev => ({
        ...prev,
        [currentStep]: prev[currentStep] + 1
      }));
    } else {
      handleNext();
    }
  };

  const handleSubStepPrevious = () => {
    if (currentSubStep > 1) {
      setSubSteps(prev => ({ ...prev, [currentStep]: prev[currentStep] - 1 }));
    } else {
      handlePrevious();
    }
  };

  const getStepSchema = step => {
    switch (step) {
      case 1:
        return stepOneSchema;
      case 2:
        return stepTwoSchema;
      case 3:
        return stepThreeSchema;
      default:
        return null;
    }
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      setCurrentStep(1);
      return;
    }

    const stepSchema = getStepSchema(currentStep);
    const currentValues = form.getValues();

    try {
      await stepSchema.validate(currentValues, { abortEarly: false });
      setCurrentStep(prev => Math.min(prev + 1, 3));
    } catch (error) {
      if (error.inner) {
        error.inner.forEach(err => {
          form.setError(err.path, {
            type: 'manual',
            message: err.message
          });
        });
      }
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const onFinalSubmit = async data => {
    // Extract goal and remove mode field using utility
    const submitData = {
      ...data,
      goal: cleanGoalData(data.goal)
    };

    const selectedDiet = DIET_OPTIONS.find(d => d.value === submitData.diet);
    if (selectedDiet?.excludedAllergens) {
      const allAllergens = [
        ...submitData.allergens,
        ...selectedDiet.excludedAllergens
      ];
      submitData.allergens = [...new Set(allAllergens)];
    }

    completeOnboarding(submitData, {
      onSuccess: response => {
        const successMessage =
          response?.message || 'Hoàn thành onboarding thành công!';
        const { accessToken } = response.data;
        if (accessToken) {
          saveAccessToken(accessToken, true);
        }

        setCurrentStep(4);
      },
      onError: error => {
        const errorMessage =
          error.response?.data?.message ||
          'Không thể hoàn thành onboarding. Vui lòng thử lại.';
        toast.error(errorMessage);
      }
    });
  };

  const handleFinishOnboarding = () => {
    const accessToken = getStoredAccessToken();
    if (accessToken) {
      dispatch(loadUser({ accessToken, isRemember: true }));
    }
    navigate('/');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepZeroIntro />;
      case 1:
        return (
          <StepOneContainer
            control={form.control}
            currentSubStep={currentSubStep}
          />
        );
      case 2:
        return (
          <StepTwoContainer
            control={form.control}
            watch={form.watch}
            setValue={form.setValue}
            currentSubStep={currentSubStep}
          />
        );
      case 3:
        return (
          <StepThreeContainer
            control={form.control}
            currentSubStep={currentSubStep}
            selectedMealIndex={selectedMealIndex}
            onBackToList={() => {
              setSubSteps(prev => ({ ...prev, 3: 1 }));
            }}
          />
        );
      case 4:
        return <StepFourSuccess onFinish={handleFinishOnboarding} />;
      default:
        return null;
    }
  };

  const handleNextClick = e => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    if (currentStep === 3 && currentSubStep === totalSubSteps) {
      form.handleSubmit(onFinalSubmit, errors => {
        if (errors.mealSettings) {
          if (typeof errors.mealSettings.message === 'string') {
            toast.error(errors.mealSettings.message);
          } else {
            toast.error('Vui lòng kiểm tra lại thông tin chi tiết các bữa ăn');
          }
        } else {
          toast.error('Vui lòng kiểm tra lại thông tin');
        }
      })();
    } else {
      handleSubStepNext();
    }
  };

  return (
    <div className='pb-24'>
      <Form {...form}>
        <div className='space-y-8'>
          <div>{renderStep()}</div>
        </div>
      </Form>

      <StepProgress
        currentStep={currentStep}
        totalSteps={3}
        currentSubStep={currentSubStep}
        totalSubSteps={totalSubSteps}
        step3MealCount={mealCount}
        onNext={handleNextClick}
        onPrevious={handleSubStepPrevious}
        isPending={isPending}
        isLastStep={currentStep === 3 && currentSubStep === totalSubSteps}
      />
    </div>
  );
}
