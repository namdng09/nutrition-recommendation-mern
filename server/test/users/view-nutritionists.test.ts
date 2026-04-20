import { afterEach, describe, expect, it, vi } from 'vitest';

import { UserService } from '~/features/users/user-service';
import { CERTIFICATE_STATUS } from '~/shared/constants/certificate-status';
import { ROLE } from '~/shared/constants/role';
import { UserModel } from '~/shared/database/models';
import { buildPaginateOptions } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  UserModel: {
    paginate: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    create: vi.fn(),
    deleteMany: vi.fn(),
    countDocuments: vi.fn()
  },
  AuthModel: {
    create: vi.fn(),
    deleteMany: vi.fn()
  },
  GroceryModel: {
    deleteMany: vi.fn()
  },
  ScheduleModel: {
    deleteMany: vi.fn()
  },
  PostModel: {
    updateMany: vi.fn()
  }
}));

vi.mock('~/shared/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('~/shared/utils')>();
  return {
    ...actual,
    buildPaginateOptions: vi.fn(),
    validateObjectId: vi.fn(),
    hashPassword: vi.fn(),
    sendMail: vi.fn(),
    generateToken: vi.fn(),
    deleteAvatar: vi.fn(),
    uploadAvatar: vi.fn(),
    uploadCertificate: vi.fn(),
    deleteCertificate: vi.fn()
  };
});

const mockPaginate = vi.mocked(UserModel.paginate);
const mockBuildPaginateOptions = vi.mocked(buildPaginateOptions);

describe('UserService.viewNutritionists (UC83)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return approved nutritionists list', async () => {
    mockBuildPaginateOptions.mockReturnValue({ page: 1, limit: 10 });
    mockPaginate.mockResolvedValue({
      docs: [
        {
          _id: 'n1',
          role: ROLE.NUTRITIONIST,
          certificate: {
            status: CERTIFICATE_STATUS.APPROVED,
            showCertificate: true,
            fileUrl: 'url',
            publicId: 'pid'
          },
          toObject: () => ({ _id: 'n1', role: ROLE.NUTRITIONIST })
        }
      ],
      totalDocs: 1
    } as any);

    const result = await UserService.viewNutritionists({ filter: {} });

    expect(mockPaginate).toHaveBeenCalledWith(
      {
        role: ROLE.NUTRITIONIST,
        'certificate.status': CERTIFICATE_STATUS.APPROVED
      },
      expect.objectContaining({
        select: 'name avatar role certificate nutritionistProfile'
      })
    );
    expect(result.docs).toHaveLength(1);
  });

  it('should hide certificate files when visibility is off', async () => {
    mockBuildPaginateOptions.mockReturnValue({ page: 1, limit: 10 });
    mockPaginate.mockResolvedValue({
      docs: [
        {
          _id: 'n2',
          role: ROLE.NUTRITIONIST,
          certificate: {
            status: CERTIFICATE_STATUS.APPROVED,
            showCertificate: false,
            fileUrl: 'url',
            publicId: 'pid',
            name: 'Cert A'
          },
          toObject: () => ({
            _id: 'n2',
            role: ROLE.NUTRITIONIST,
            certificate: {
              status: CERTIFICATE_STATUS.APPROVED,
              showCertificate: false,
              fileUrl: 'url',
              publicId: 'pid',
              name: 'Cert A'
            }
          })
        }
      ],
      totalDocs: 1
    } as any);

    const result = await UserService.viewNutritionists({ filter: {} });

    expect(result.docs[0]).toEqual(
      expect.objectContaining({
        certificate: expect.objectContaining({
          status: CERTIFICATE_STATUS.APPROVED,
          showCertificate: false,
          name: 'Cert A'
        })
      })
    );
    expect(result.docs[0].certificate).not.toHaveProperty('fileUrl');
    expect(result.docs[0].certificate).not.toHaveProperty('publicId');
  });

  it('should return docs as-is when certificate is missing', async () => {
    mockBuildPaginateOptions.mockReturnValue({ page: 1, limit: 10 });
    mockPaginate.mockResolvedValue({
      docs: [{ _id: 'n3', role: ROLE.NUTRITIONIST }],
      totalDocs: 1
    } as any);

    const result = await UserService.viewNutritionists({ filter: {} });

    expect(result.docs[0]).toEqual({ _id: 'n3', role: ROLE.NUTRITIONIST });
  });

  it('should throw 404 when no nutritionists found', async () => {
    mockBuildPaginateOptions.mockReturnValue({ page: 1, limit: 10 });
    mockPaginate.mockResolvedValue({ docs: [], totalDocs: 0 } as any);

    await expect(
      UserService.viewNutritionists({ filter: {} })
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy chuyên gia dinh dưỡng nào'
    });
  });
});
