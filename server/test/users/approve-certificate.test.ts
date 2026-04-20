import { afterEach, describe, expect, it, vi } from 'vitest';

import { UserService } from '~/features/users/user-service';
import { CERTIFICATE_STATUS } from '~/shared/constants/certificate-status';
import { UserModel } from '~/shared/database/models';
import { sendMail } from '~/shared/utils';

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
    sendMail: vi.fn(),
    buildPaginateOptions: vi.fn(),
    validateObjectId: vi.fn(),
    hashPassword: vi.fn(),
    generateToken: vi.fn(),
    deleteAvatar: vi.fn(),
    uploadAvatar: vi.fn(),
    uploadCertificate: vi.fn(),
    deleteCertificate: vi.fn()
  };
});

const mockFindById = vi.mocked(UserModel.findById);
const mockSendMail = vi.mocked(sendMail);

describe('UserService.approveCertificate (UC88)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throw 404 when user not found', async () => {
    mockFindById.mockResolvedValue(null);

    await expect(UserService.approveCertificate('n1')).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy người dùng'
    });
  });

  it('should throw 404 when user has no certificate', async () => {
    mockFindById.mockResolvedValue({ certificate: null });

    await expect(UserService.approveCertificate('n1')).rejects.toMatchObject({
      status: 404,
      message: 'Người dùng chưa có chứng chỉ'
    });
  });

  it('should throw 400 when certificate already approved', async () => {
    mockFindById.mockResolvedValue({
      certificate: { status: CERTIFICATE_STATUS.APPROVED }
    });

    await expect(UserService.approveCertificate('n1')).rejects.toMatchObject({
      status: 400,
      message: 'Chứng chỉ đã được phê duyệt trước đó'
    });
  });

  it('should approve certificate and notify user', async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    mockFindById.mockResolvedValue({
      name: 'Nutri',
      email: 'nutri@test.com',
      certificate: { name: 'Cert A', status: CERTIFICATE_STATUS.PENDING },
      save
    });
    mockSendMail.mockResolvedValue({});

    const result = await UserService.approveCertificate('n2');

    expect(save).toHaveBeenCalled();
    expect(mockSendMail).toHaveBeenCalled();
    expect(result.certificate.status).toBe(CERTIFICATE_STATUS.APPROVED);
  });
});
