import { useParams } from 'react-router';

import NutritionistReviewDetail from '~/features/review/submit-review-request/components/nutritionist/review-detail';

const Page = () => {
  const { id } = useParams();

  return <NutritionistReviewDetail dishId={id} />;
};

export default Page;
