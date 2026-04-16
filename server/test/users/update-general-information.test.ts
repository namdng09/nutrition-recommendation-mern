import { afterEach, describe, expect, it, vi } from 'vitest';

import { UserService } from '~/features/users/user-service';
import { UserModel } from '~/shared/database/models';
import { deleteAvatar, uploadAvatar, validateObjectId } from '~/shared/utils';

vi.mock('~/shared/database/models', () => ({
  UserModel: {
    findByIdAndUpdate: vi.fn(),
    findById: vi.fn(),
    paginate: vi.fn(),
    create: vi.fn(),
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
    uploadAvatar: vi.fn(),
    deleteAvatar: vi.fn(),
    buildPaginateOptions: vi.fn(),
    hashPassword: vi.fn(),
    sendMail: vi.fn(),
    generateToken: vi.fn(),
    uploadCertificate: vi.fn(),
    deleteCertificate: vi.fn()
  };
});

const mockFindByIdAndUpdate = vi.mocked(UserModel.findByIdAndUpdate);
const mockValidateObjectId = vi.mocked(validateObjectId);
const mockUploadAvatar = vi.mocked(uploadAvatar);
const mockDeleteAvatar = vi.mocked(deleteAvatar);

describe('UserService.updateProfile (UC67 - Update General Information)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should throw 400 when user id is invalid', async () => {
    mockValidateObjectId.mockReturnValue(false);

    await expect(
      UserService.updateProfile('bad-id', { name: 'User X' } as any)
    ).rejects.toMatchObject({
      status: 400,
      message: 'Định dạng ID người dùng không hợp lệ'
    });
  });

  it('should throw 404 when user does not exist', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindByIdAndUpdate.mockResolvedValue(null);

    await expect(
      UserService.updateProfile('u404', { name: 'User X' } as any)
    ).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy người dùng'
    });
  });

  it('should update name and return updated user', async () => {
    mockValidateObjectId.mockReturnValue(true);
    mockFindByIdAndUpdate.mockResolvedValue({
      _id: 'u1',
      name: 'User X'
    } as any);

    const result = await UserService.updateProfile('u1', {
      name: 'User X'
    } as any);

    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
      'u1',
      { name: 'User X' },
      { new: true }
    );
    expect(result._id).toBe('u1');
  });

  it('should replace avatar when avatar file is provided', async () => {
    const save = vi.fn().mockResolvedValue(undefined);

    mockValidateObjectId.mockReturnValue(true);
    mockFindByIdAndUpdate.mockResolvedValue({
      _id: { toString: () => 'u2' },
      save
    } as any);
    mockDeleteAvatar.mockResolvedValue(undefined as any);
    mockUploadAvatar.mockResolvedValue({
      success: true,
      data: { secure_url: 'https://cdn/avatar.png' }
    } as any);

    const result = await UserService.updateProfile(
      'u2',
      { name: 'Avatar User' } as any,
      { buffer: Buffer.from('avatar') } as Express.Multer.File
    );

    expect(mockDeleteAvatar).toHaveBeenCalledWith('u2');
    expect(mockUploadAvatar).toHaveBeenCalled();
    expect(save).toHaveBeenCalled();
    expect(result._id.toString()).toBe('u2');
  });
});
