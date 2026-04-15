import { afterEach, describe, expect, it, vi } from 'vitest';

import { signUpRequestSchema } from '~/features/auth/auth-dto';
import { AuthService } from '~/features/auth/auth-service';
import { CERTIFICATE_STATUS } from '~/shared/constants/certificate-status';
import { ROLE } from '~/shared/constants/role';
import { AuthModel, UserModel } from '~/shared/database/models';
import {
  generateToken,
  hashPassword,
  sendMail,
  uploadAvatar,
  uploadCertificate
} from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  AuthModel: {
    findOne: vi.fn(),
    create: vi.fn()
  },
  UserModel: {
    findOne: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    hashPassword: vi.fn(),
    generateToken: vi.fn(),
    uploadAvatar: vi.fn(),
    uploadCertificate: vi.fn(),
    sendMail: vi.fn().mockResolvedValue(true)
  };
});

const mockFindAuth = vi.mocked(AuthModel.findOne);
const mockCreateAuth = vi.mocked(AuthModel.create);
const mockFindUser = vi.mocked(UserModel.findOne);
const mockCreateUser = vi.mocked(UserModel.create);
const mockFindByIdAndUpdateUser = vi.mocked(UserModel.findByIdAndUpdate);
const mockHashPassword = vi.mocked(hashPassword);
const mockGenerateToken = vi.mocked(generateToken);
const mockUploadAvatar = vi.mocked(uploadAvatar);
const mockUploadCertificate = vi.mocked(uploadCertificate);
const mockSendMail = vi.mocked(sendMail);

describe('AuthService.signUp (UC03)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validation', () => {
    it('should fail when email format is invalid', () => {
      const result = signUpRequestSchema.safeParse({
        email: 'invalid-email',
        name: 'New User',
        password: 'Abcd@1234',
        role: ROLE.USER
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe('Email không hợp lệ');
    });

    it('should fail when password is too short', () => {
      const result = signUpRequestSchema.safeParse({
        email: 'user@example.com',
        name: 'New User',
        password: 'Abcd123',
        role: ROLE.USER
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Mật khẩu phải có ít nhất 8 ký tự'
      );
    });

    it('should fail when password does not meet complexity requirements', () => {
      const result = signUpRequestSchema.safeParse({
        email: 'user@example.com',
        name: 'New User',
        password: 'password123',
        role: ROLE.USER
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Mật khẩu phải gồm chữ thường, chữ hoa, số và ký tự đặc biệt'
      );
    });

    it('should fail when name is too short', () => {
      const result = signUpRequestSchema.safeParse({
        email: 'user@example.com',
        name: 'A',
        password: 'Abcd@1234',
        role: ROLE.USER
      });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Tên phải có ít nhất 2 ký tự'
      );
    });
  });

  describe('business logic', () => {
    it('should throw 400 when auth account already exists', async () => {
      mockFindAuth.mockResolvedValue({ _id: 'auth-1' } as any);

      await expect(
        AuthService.signUp({
          email: 'exists@example.com',
          name: 'Exists',
          password: 'Abcd@1234',
          role: ROLE.USER
        })
      ).rejects.toMatchObject({
        status: 400,
        message: 'Tài khoản với email này đã tồn tại'
      });
    });

    it('should throw 400 when user already exists', async () => {
      mockFindAuth.mockResolvedValue(null);
      mockFindUser.mockResolvedValue({ _id: 'user-exists' } as any);

      await expect(
        AuthService.signUp({
          email: 'existing-user@example.com',
          name: 'Existing User',
          password: 'Abcd@1234',
          role: ROLE.USER
        })
      ).rejects.toMatchObject({
        status: 400,
        message: 'Tài khoản với email này đã tồn tại'
      });
    });

    it('should sign up normal user successfully', async () => {
      mockFindAuth.mockResolvedValue(null);
      mockFindUser.mockResolvedValue(null);
      mockCreateUser.mockResolvedValue({
        _id: { toString: () => 'user-1' },
        email: 'new@example.com',
        role: ROLE.USER,
        hasOnboarded: false
      } as any);
      mockHashPassword.mockResolvedValue('hashed-pass');
      mockCreateAuth.mockResolvedValue({ _id: 'auth-1' } as any);
      mockGenerateToken.mockReturnValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      });

      const result = await AuthService.signUp({
        email: 'new@example.com',
        name: 'New User',
        password: 'Abcd@1234',
        role: ROLE.USER
      });

      expect(mockCreateAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'local',
          providerId: 'new@example.com',
          localPassword: 'hashed-pass'
        })
      );
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        hasOnboarded: false
      });
      expect(mockUploadCertificate).not.toHaveBeenCalled();
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    it('should sign up nutritionist successfully', async () => {
      mockFindAuth.mockResolvedValue(null);
      mockFindUser.mockResolvedValue(null);
      mockCreateUser.mockResolvedValue({
        _id: { toString: () => 'nutri-1' },
        email: 'nutri@example.com',
        name: 'Nutritionist',
        role: ROLE.NUTRITIONIST,
        hasOnboarded: false
      } as any);
      mockHashPassword.mockResolvedValue('hashed-pass');
      mockCreateAuth.mockResolvedValue({ _id: 'auth-2' } as any);
      mockUploadCertificate.mockResolvedValue({
        success: true,
        data: {
          secure_url: 'https://img.test/cert.jpg',
          public_id: 'cert-1'
        }
      } as any);
      mockGenerateToken.mockReturnValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      });

      await AuthService.signUp(
        {
          email: 'nutri@example.com',
          name: 'Nutritionist',
          password: 'Abcd@1234',
          role: ROLE.NUTRITIONIST,
          workplace: 'Hospital A',
          graduatedUniversity: 'University B',
          professionalBio: 'Bio'
        },
        undefined,
        {
          buffer: Buffer.from('cert'),
          originalname: 'certificate.pdf'
        } as Express.Multer.File
      );

      expect(mockUploadCertificate).toHaveBeenCalled();
      expect(mockFindByIdAndUpdateUser).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          certificate: expect.objectContaining({
            status: CERTIFICATE_STATUS.PENDING,
            fileUrl: 'https://img.test/cert.jpg'
          }),
          nutritionistProfile: expect.objectContaining({
            workplace: 'Hospital A',
            graduatedUniversity: 'University B'
          })
        })
      );
      expect(mockSendMail).toHaveBeenCalledTimes(2);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({ template: 'certificate-pending' })
      );
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({ template: 'nutritionist-welcome' })
      );
    });

    it('should update nutritionist profile successfully', async () => {
      mockFindAuth.mockResolvedValue(null);
      mockFindUser.mockResolvedValue(null);
      mockCreateUser.mockResolvedValue({
        _id: { toString: () => 'nutri-2b' },
        email: 'nutri2b@example.com',
        name: 'Nutritionist 2B',
        role: ROLE.NUTRITIONIST,
        hasOnboarded: false
      } as any);
      mockHashPassword.mockResolvedValue('hashed-pass');
      mockCreateAuth.mockResolvedValue({ _id: 'auth-3b' } as any);
      mockGenerateToken.mockReturnValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      });

      await AuthService.signUp({
        email: 'nutri2b@example.com',
        name: 'Nutritionist 2B',
        password: 'Abcd@1234',
        role: ROLE.NUTRITIONIST,
        graduatedUniversity: 'University C'
      });

      expect(mockFindByIdAndUpdateUser).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          nutritionistProfile: {
            workplace: '',
            graduatedUniversity: 'University C',
            professionalBio: ''
          }
        })
      );
    });
  });
});
