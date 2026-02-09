import { Suspense } from 'react';

import PostsFilter from '~/features/post/view-post/components/nutritionist/posts-filter';
import PostsTable from '~/features/post/view-post/components/nutritionist/posts-table';
import PostsTableSkeleton from '~/features/post/view-post/components/nutritionist/posts-table-skeleton';
const Page = () => {
  return (
    <div className='space-y-4'>
      <PostsFilter />
      <Suspense fallback={<PostsTableSkeleton />}>
        <PostsTable />
      </Suspense>
    </div>
  );
};

export default Page;
