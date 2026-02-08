import { Suspense } from 'react';

import PostList from '~/features/post/view-post/components/post-list';
import PostSkeleton from '~/features/post/view-post/components/post-skeleton';

const Page = () => {
  return (
    <div className='container mx-auto py-8 px-4'>
      <Suspense fallback={<PostSkeleton />}>
        <PostList />
      </Suspense>
    </div>
  );
};

export default Page;
