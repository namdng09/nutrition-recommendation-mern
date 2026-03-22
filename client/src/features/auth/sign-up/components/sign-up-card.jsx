import React, { useState } from 'react';
import { HiOutlineUserPlus } from 'react-icons/hi2';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import { ROLE } from '~/constants/role';
import { buildFormData } from '~/lib/form-data';
import { loadUser } from '~/store/features/auth-slice';

import { useSignUp } from '../api/sign-up';
import NutritionistSignUpForm from './nutritionist-sign-up-form';
import RoleSelectionStep from './role-selection-step';
import SignUpSuccessDialog from './sign-up-success-dialog';
import UserSignUpForm from './user-sign-up-form';

const SignUpCard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const signUpMutation = useSignUp({
    onSuccess: data => {
      const { accessToken } = data.data;
      dispatch(loadUser({ accessToken }));
      setSuccessData(data.data);
    },
    onError: error => {
      toast.error(
        error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.'
      );
    }
  });

  const handleRoleSelect = role => {
    setSelectedRole(role);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedRole(null);
  };

  const handleSubmit = data => {
    const fileFields =
      selectedRole === ROLE.NUTRITIONIST
        ? ['avatar', 'certificate']
        : ['avatar'];

    const formData = buildFormData(data, {
      exclude: ['confirmPassword'],
      fileFields
    });

    formData.append('role', selectedRole);
    signUpMutation.mutate(formData);
  };

  const handleDialogConfirm = () => {
    const { hasOnboarded } = successData;
    if (selectedRole === ROLE.NUTRITIONIST) {
      navigate('/');
    } else {
      navigate(hasOnboarded ? '/' : '/onboarding');
    }
  };

  return (
    <>
      <Card className='w-full max-w-md rounded-2xl border border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-[0_18px_60px_rgba(0,0,0,0.10)]'>
        <CardHeader className='space-y-2'>
          <div className='flex items-center gap-3'>
            <div className='flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-accent shadow-sm'>
              <HiOutlineUserPlus className='h-6 w-6 text-primary' />
            </div>

            <div className='leading-[1.05]'>
              <CardTitle className='text-2xl font-bold text-primary'>
                Đăng ký
              </CardTitle>
              <CardDescription className='text-muted-foreground'>
                {step === 1
                  ? 'Tạo tài khoản mới để bắt đầu'
                  : selectedRole === ROLE.NUTRITIONIST
                    ? 'Đăng ký tài khoản chuyên gia dinh dưỡng'
                    : 'Điền thông tin tài khoản của bạn'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className='pt-2'>
          {step === 1 && <RoleSelectionStep onSelect={handleRoleSelect} />}
          {step === 2 && selectedRole === ROLE.USER && (
            <UserSignUpForm
              onSubmit={handleSubmit}
              onBack={handleBack}
              isLoading={signUpMutation.isPending}
            />
          )}
          {step === 2 && selectedRole === ROLE.NUTRITIONIST && (
            <NutritionistSignUpForm
              onSubmit={handleSubmit}
              onBack={handleBack}
              isLoading={signUpMutation.isPending}
            />
          )}
        </CardContent>

        <CardFooter className='pt-6'>
          <p className='text-sm text-center w-full text-muted-foreground'>
            Đã có tài khoản?{' '}
            <Link
              to='/auth/login'
              className='font-semibold text-primary hover:underline underline-offset-4'
            >
              Đăng nhập
            </Link>
          </p>
        </CardFooter>
      </Card>

      {successData && (
        <SignUpSuccessDialog
          open={true}
          role={selectedRole}
          onConfirm={handleDialogConfirm}
        />
      )}
    </>
  );
};

export default SignUpCard;
