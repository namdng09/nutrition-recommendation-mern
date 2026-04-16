import { afterEach, describe, expect, it, vi } from 'vitest';

import { UserService } from '~/features/users/user-service';
import { CERTIFICATE_STATUS } from '~/shared/constants/certificate-status';
import { UserModel } from '~/shared/database/models';

vi.mock('~/shared/database/models', () => ({
  UserModel: {
    countDocuments: vi.fn(),
    findById: vi.fn(),
    paginate: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    deleteMany: vi.fn()
  },
  AuthModel: { create: vi.fn(), deleteMany: vi.fn() },
  GroceryModel: { deleteMany: vi.fn() },
  ScheduleModel: { deleteMany: vi.fn() },
  PostModel: { updateMany: vi.fn() }
}));

const mockCountDocuments = vi.mocked(UserModel.countDocuments);

describe('UserService.pendingCertificatesCount', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should count pending certificates', async () => {
    mockCountDocuments.mockResolvedValue(7 as any);

    const result = await UserService.pendingCertificatesCount();

    expect(mockCountDocuments).toHaveBeenCalledWith({
      'certificate.status': CERTIFICATE_STATUS.PENDING
    });
    expect(result).toBe(7);
  });
});
