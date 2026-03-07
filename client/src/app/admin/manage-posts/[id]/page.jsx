import { Suspense } from 'react';
import { useParams } from 'react-router';

import PostDetail from '~/features/post/view-post-detail/components/admin/post-detail';
import PostDetailSkeleton from '~/features/post/view-post-detail/components/admin/post-detail-skeleton';

const PostDetailPage = () => {
  const { id } = useParams();

  return (
    <div className='container mx-auto py-8 px-4'>
      <Suspense fallback={<PostDetailSkeleton />}>
        <PostDetail id={id} />
      </Suspense>
    </div>
  );
};

export default PostDetailPage;
