import { afterEach, describe, expect, it, vi } from 'vitest';

import { UserService } from '~/features/users/user-service';
import { ROLE } from '~/shared/constants/role';
import { UserModel } from '~/shared/database/models';

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

const mockFindById = vi.mocked(UserModel.findById);

describe('UserService.toggleCertificateVisibility (UC87)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throw 404 when user not found', async () => {
    mockFindById.mockResolvedValue(null);

    await expect(
      UserService.toggleCertificateVisibility('u1', true)
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy người dùng'
    });
  });

  it('should throw 403 when user is not nutritionist', async () => {
    mockFindById.mockResolvedValue({ role: ROLE.USER });

    await expect(
      UserService.toggleCertificateVisibility('u1', true)
    ).rejects.toMatchObject({
      status: 403,
      message: 'Chỉ chuyên gia dinh dưỡng mới có thể thay đổi cài đặt này'
    });
  });

  it('should throw 404 when user has no certificate', async () => {
    mockFindById.mockResolvedValue({
      role: ROLE.NUTRITIONIST,
      certificate: null
    });

    await expect(
      UserService.toggleCertificateVisibility('u1', true)
    ).rejects.toMatchObject({
      status: 404,
      message: 'Người dùng chưa có chứng chỉ'
    });
  });

  it('should toggle visibility and save', async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    mockFindById.mockResolvedValue({
      role: ROLE.NUTRITIONIST,
      certificate: { showCertificate: false },
      save
    });

    const result = await UserService.toggleCertificateVisibility('n1', true);

    expect(save).toHaveBeenCalled();
    expect(result.certificate.showCertificate).toBe(true);
  });
});
