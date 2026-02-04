import type { Request, Response } from 'express';
import { HydratedDocument } from 'mongoose';

import type { User } from '~/shared/database/models/user-model';
import { ApiResponse } from '~/shared/utils';

import { AuthService } from './auth-service';

export const AuthController = {
  login: async (req: Request, res: Response) => {
    const loginData = req.body;
    const { accessToken, refreshToken, hasOnboarded } =
      await AuthService.login(loginData);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json(
      ApiResponse.success('Login successful', {
        accessToken,
        hasOnboarded
      })
    );
  },

  loginWithProvider: async (req: Request, res: Response) => {
    const user = req.user as HydratedDocument<User>;
    const provider = (req as any).authInfo?.provider;
    const providerId = (req as any).authInfo?.providerId;

    const { accessToken, refreshToken, hasOnboarded } =
      await AuthService.loginWithProvider(provider, providerId, user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.redirect(
      `${process.env.CLIENT_URL}/auth/callback?accessToken=${accessToken}&hasOnboarded=${hasOnboarded}`
    );
  },

  signUp: async (req: Request, res: Response) => {
    const signUpData = req.body;
    const avatar = req.file;

    const { accessToken, refreshToken, hasOnboarded } =
      await AuthService.signUp(signUpData, avatar);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json(
      ApiResponse.success('Sign up successful', {
        accessToken,
        hasOnboarded
      })
    );
  },

  logout: async (req: Request, res: Response) => {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(200).json(ApiResponse.success('Logout successful'));
  },

  refreshAccessToken: async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;

    const accessToken = await AuthService.refreshAccessToken(refreshToken);

    res.status(200).json(
      ApiResponse.success('Access token refreshed successfully', {
        accessToken
      })
    );
  },

  forgotPassword: async (req: Request, res: Response) => {
    const { email } = req.body;

    await AuthService.forgotPassword(email);

    res
      .status(200)
      .json(
        ApiResponse.success('A password reset link has been sent to your email')
      );
  },

  resetPassword: async (req: Request, res: Response) => {
    const { token } = req.query;
    const { password } = req.body;

    await AuthService.resetPassword(token as string, password);

    res
      .status(200)
      .json(ApiResponse.success('Your password has been reset successfully'));
  }
};
