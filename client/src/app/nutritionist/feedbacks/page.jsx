import { Suspense } from 'react';

import FeedbackFilter from '~/features/feedback/view-feebacks/components/nutritionist/feedback-filter';
import FeedbackList from '~/features/feedback/view-feebacks/components/nutritionist/feedback-list';
import FeedbackSkeleton from '~/features/feedback/view-feebacks/components/nutritionist/feedback-skeleton';

const Page = () => {
  return (
    <div className='space-y-4'>
      <FeedbackFilter />
      <Suspense fallback={<FeedbackSkeleton />}>
        <FeedbackList />
      </Suspense>
    </div>
  );
};

export default Page;
