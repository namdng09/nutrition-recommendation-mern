import React from 'react';
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
import { buildFormData } from '~/lib/form-data';
import { loadUser } from '~/store/features/auth-slice';

import { useSignUp } from '../api/sign-up';
import SignUpForm from './sign-up-form';

const SignUpCard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const signUpMutation = useSignUp({
    onSuccess: data => {
      const { accessToken } = data.data;
      dispatch(loadUser({ accessToken }));
      navigate('/');
      toast.success(data.message || 'Account created successfully');
    },
    onError: error => {
      toast.error(
        error.response?.data?.message || 'Sign up failed. Please try again.'
      );
    }
  });

  const handleSubmit = data => {
    const formData = buildFormData(data, {
      exclude: ['confirmPassword'],
      fileFields: ['avatar']
    });

    signUpMutation.mutate(formData);
  };

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create a new account to get started</CardDescription>
      </CardHeader>

      <CardContent>
        <SignUpForm
          onSubmit={handleSubmit}
          isLoading={signUpMutation.isPending}
        />
      </CardContent>

      <CardFooter className='pt-6'>
        <p className='text-sm text-muted-foreground text-center w-full'>
          Already have an account?{' '}
          <Link
            to='/auth/login'
            className='text-primary underline hover:text-primary/80'
          >
            Log in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default SignUpCard;
