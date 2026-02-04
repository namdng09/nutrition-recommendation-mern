import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import app from '~/app';

describe('POST /api/auth/logout', () => {
  beforeAll(async () => {
    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_URI || 'mongodb://localhost:27017/test'
      );
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Happy case - logout successfully
  it('should logout successfully and clear refresh token cookie', async () => {
    const res = await request(app).post('/api/auth/logout').send();

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Logout successful');

    // Check that refresh token cookie is cleared
    expect(res.headers['set-cookie']).toBeDefined();
    const cookies = Array.isArray(res.headers['set-cookie'])
      ? res.headers['set-cookie']
      : [res.headers['set-cookie']];
    const refreshTokenCookie = cookies.find((cookie: string) =>
      cookie.startsWith('refreshToken=')
    );
    expect(refreshTokenCookie).toBeDefined();
    expect(refreshTokenCookie).toContain('HttpOnly');
    // Cookie should be cleared (has Max-Age=0 or expires in the past)
    expect(
      refreshTokenCookie?.includes('Max-Age=0') ||
        refreshTokenCookie?.includes('Expires=')
    ).toBe(true);
  });

  // Branch: logout when already logged out (no refresh token)
  it('should logout successfully even without refresh token', async () => {
    const res = await request(app).post('/api/auth/logout').send();

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('message', 'Logout successful');
  });
});
