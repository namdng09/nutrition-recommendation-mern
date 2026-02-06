import { Suspense } from 'react';

import PostDetail from '~/features/post/view-post-detail/components/post-detail';
import PostDetailSkeleton from '~/features/post/view-post-detail/components/post-detail-skeleton';

const Page = () => {
  return (
    <div className='container mx-auto py-8 px-4'>
      <Suspense fallback={<PostDetailSkeleton />}>
        <PostDetail />
      </Suspense>
    </div>
  );
};

export default Page;
