import mongoose from 'mongoose';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it
} from 'vitest';

import { PostService } from '~/features/posts/post-service';
import { POST_CATEGORY } from '~/shared/constants/post-category';
import { ROLE } from '~/shared/constants/role';
import { PostModel } from '~/shared/database/models';

describe('PostService.viewPosts', () => {
  let userId1: string;
  let userId2: string;

  beforeAll(async () => {
    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_URI || 'mongodb://localhost:27017/test'
      );
    }
    userId1 = new mongoose.Types.ObjectId().toString();
    userId2 = new mongoose.Types.ObjectId().toString();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await PostModel.deleteMany({});

    // Create test posts
    await PostModel.create({
      author: {
        _id: userId1,
        name: 'User 1',
        role: ROLE.NUTRITIONIST
      },
      title: 'Cách giảm cân hiệu quả',
      content: 'Nội dung chi tiết về giảm cân...',
      slug: 'cach-giam-can-hieu-qua',
      category: POST_CATEGORY.NUTRITION,
      tags: ['giảm cân', 'dinh dưỡng'],
      isPublished: true,
      publishedAt: new Date(),
      views: 100
    });

    await PostModel.create({
      author: {
        _id: userId1,
        name: 'User 1',
        role: ROLE.NUTRITIONIST
      },
      title: 'Top 10 món ăn healthy',
      content: 'Danh sách các món ăn tốt cho sức khỏe...',
      slug: 'top-10-mon-an-healthy',
      category: POST_CATEGORY.RECIPE,
      tags: ['healthy', 'công thức'],
      isPublished: false,
      views: 50
    });

    await PostModel.create({
      author: {
        _id: userId2,
        name: 'User 2',
        role: ROLE.ADMIN
      },
      title: 'Lối sống khỏe mạnh',
      content: 'Hướng dẫn lối sống khỏe mạnh...',
      slug: 'loi-song-khoe-manh',
      category: POST_CATEGORY.LIFESTYLE,
      tags: ['lối sống'],
      isPublished: true,
      publishedAt: new Date(),
      views: 200
    });
  });

  afterEach(async () => {
    // Clean up after each test
    await PostModel.deleteMany({});
  });

  afterAll(async () => {
    // Close connection
    await mongoose.connection.close();
  });

  // Branch - Happy case
  it('should get all posts successfully', async () => {
    const parsed = {
      filter: {},
      limit: 10
    };

    const result = await PostService.viewPosts(parsed);

    expect(result).toBeDefined();
    expect(result.docs).toBeDefined();
    expect(Array.isArray(result.docs)).toBe(true);
    expect(result.docs.length).toBe(3);
    expect(result.page).toBeDefined();
    expect(result.totalPages).toBeDefined();
  });
});
