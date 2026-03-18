import { PostModel } from '~/shared/database/models';

export async function getSocialStats(authorId: string): Promise<{
  totalLikes: number;
  totalComments: number;
}> {
  const posts = await PostModel.find({ 'author._id': authorId })
    .select('likes comments')
    .lean();

  let totalLikes = 0;
  let totalComments = 0;

  for (const post of posts) {
    totalLikes += post.likes?.length ?? 0;
    totalComments += post.comments?.length ?? 0;
  }

  return { totalLikes, totalComments };
}
