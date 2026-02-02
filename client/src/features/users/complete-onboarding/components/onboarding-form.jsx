import { yupResolver } from '@hookform/resolvers/yup';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { Form } from '~/components/ui/form';

import { useCompleteOnboarding } from '../api/use-complete-onboarding';
import {
  onboardingSchema,
  stepFourSchema,
  stepOneSchema,
  stepThreeSchema,
  stepTwoSchema
} from '../schemas/onboarding-schema';
import { StepFourPreview } from './step-four-preview';
import { StepOneDiet } from './step-one-diet';
import { StepProgress } from './step-progress';
import { StepThreeGoals } from './step-three-goals';
import { StepTwoAboutYou } from './step-two-about-you';

export function OnboardingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const { mutate: completeOnboarding, isPending } = useCompleteOnboarding();

  const form = useForm({
    resolver: yupResolver(onboardingSchema),
    mode: 'onChange',
    defaultValues: {
      diet: '',
      allergens: [],
      medicalHistory: [],
      gender: '',
      dob: '',
      height: 0,
      weight: 0,
      bodyfat: '',
      activityLevel: '',
      goal: {
        target: ''
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

  const getStepSchema = step => {
    switch (step) {
      case 1:
        return stepOneSchema;
      case 2:
        return stepTwoSchema;
      case 3:
        return stepThreeSchema;
      case 4:
        return stepFourSchema;
      default:
        return null;
    }
  };

  const handleNext = async () => {
    const stepSchema = getStepSchema(currentStep);
    const currentValues = form.getValues();

    try {
      await stepSchema.validate(currentValues, { abortEarly: false });
      setCurrentStep(prev => Math.min(prev + 1, 4));
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
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleGoToStep = step => {
    setCurrentStep(step);
  };

  const onFinalSubmit = async data => {
    completeOnboarding(data, {
      onSuccess: response => {
        const successMessage =
          response?.message || 'Hoàn thành onboarding thành công!';
        toast.success(successMessage);
        navigate('/');
      },
      onError: error => {
        const errorMessage =
          error.response?.data?.message ||
          'Không thể hoàn thành onboarding. Vui lòng thử lại.';
        toast.error(errorMessage);
      }
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepOneDiet control={form.control} />;
      case 2:
        return <StepTwoAboutYou control={form.control} />;
      case 3:
        return <StepThreeGoals control={form.control} watch={form.watch} />;
      case 4:
        return (
          <StepFourPreview
            formData={form.getValues()}
            onBack={handleGoToStep}
            setValue={form.setValue}
          />
        );
      default:
        return null;
    }
  };

  const handleNextClick = () => {
    if (currentStep < 4) {
      handleNext();
    } else {
      form.handleSubmit(onFinalSubmit)();
    }
  };

  return (
    <div className='mx-auto w-full max-w-3xl pb-32'>
      <Form {...form}>
        <div className='space-y-8'>
          <div className='bg-card min-h-[400px] rounded-lg border p-6 shadow-sm'>
            {renderStep()}
          </div>
        </div>
      </Form>

      <StepProgress
        currentStep={currentStep}
        totalSteps={4}
        onNext={handleNextClick}
        onPrevious={handlePrevious}
        isPending={isPending}
        isLastStep={currentStep === 4}
      />
    </div>
  );
}
