import { afterEach, describe, expect, it, vi } from 'vitest';

import { uploadCertificateRequestSchema } from '~/features/users/user-dto';
import { UserService } from '~/features/users/user-service';
import { CERTIFICATE_STATUS } from '~/shared/constants/certificate-status';
import { ROLE } from '~/shared/constants/role';
import { UserModel } from '~/shared/database/models';
import {
  deleteCertificate,
  sendMail,
  uploadCertificate,
  validateObjectId
} from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  UserModel: {
    findById: vi.fn(),
    paginate: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    deleteMany: vi.fn(),
    countDocuments: vi.fn()
  },
  AuthModel: { create: vi.fn(), deleteMany: vi.fn() },
  GroceryModel: { deleteMany: vi.fn() },
  ScheduleModel: { deleteMany: vi.fn() },
  PostModel: { updateMany: vi.fn() }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    validateObjectId: vi.fn(),
    uploadCertificate: vi.fn(),
    deleteCertificate: vi.fn(),
    sendMail: vi.fn(),
    buildPaginateOptions: vi.fn(),
    hashPassword: vi.fn(),
    generateToken: vi.fn(),
    deleteAvatar: vi.fn(),
    uploadAvatar: vi.fn()
  };
});

const mockFindById = vi.mocked(UserModel.findById);
const mockValidateObjectId = vi.mocked(validateObjectId);
const mockUploadCertificate = vi.mocked(uploadCertificate);
const mockDeleteCertificate = vi.mocked(deleteCertificate);
const mockSendMail = vi.mocked(sendMail);

describe('UserService.uploadCertificate (UC86)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fail when certificate name is too short', async () => {
    const result = uploadCertificateRequestSchema.safeParse({
      certificateName: 'A'
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      'Tên chứng chỉ phải có ít nhất 2 ký tự'
    );
  });

  it('should throw 400 when id invalid', async () => {
    mockValidateObjectId.mockReturnValue(false);

    await expect(
      UserService.uploadCertificate('bad-id', { certificateName: 'Cert A' }, {
        buffer: Buffer.from('x')
      } as Express.Multer.File)
    ).rejects.toHaveProperty('status');
  });

  it('should throw 404 when user not found', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindById.mockResolvedValue(null);

    await expect(
      UserService.uploadCertificate(
        '507f1f77bcf86cd799439011',
        { certificateName: 'Cert A' },
        { buffer: Buffer.from('x') } as Express.Multer.File
      )
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy người dùng'
    });
  });

  it('should throw 403 when target user is not nutritionist', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindById.mockResolvedValue({
      role: ROLE.USER
    } as any);

    await expect(
      UserService.uploadCertificate(
        '507f1f77bcf86cd799439011',
        { certificateName: 'Cert A' },
        { buffer: Buffer.from('x') } as Express.Multer.File
      )
    ).rejects.toMatchObject({
      status: 403,
      message: 'Chỉ chuyên gia dinh dưỡng mới có thể tải lên chứng chỉ'
    });
  });

  it('should upload and save certificate for nutritionist', async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    mockValidateObjectId.mockReturnValue(true);
    mockFindById.mockResolvedValue({
      _id: { toString: () => 'n1' },
      role: ROLE.NUTRITIONIST,
      email: 'n1@test.com',
      name: 'Nutri 1',
      certificate: { status: CERTIFICATE_STATUS.REJECTED },
      save
    } as any);
    mockDeleteCertificate.mockResolvedValue(undefined as any);
    mockUploadCertificate.mockResolvedValue({
      success: true,
      data: { secure_url: 'https://cdn/cert.pdf', public_id: 'cert-1' }
    } as any);
    mockSendMail.mockResolvedValue({});

    const result = await UserService.uploadCertificate(
      '507f1f77bcf86cd799439011',
      { certificateName: 'Cert A' },
      { buffer: Buffer.from('pdf') } as Express.Multer.File
    );

    expect(mockDeleteCertificate).toHaveBeenCalledWith('n1');
    expect(save).toHaveBeenCalled();
    expect(result.role).toBe(ROLE.NUTRITIONIST);
  });
});
