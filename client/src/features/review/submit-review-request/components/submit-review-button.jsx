import React from 'react';
import { FaCheckCircle, FaPaperPlane } from 'react-icons/fa';

import { useSubmitReviewRequest } from '../api/submit-review-request';

export default function SubmitReviewButton({ dishId, reviewStatus }) {
  const { mutate: submitReviewRequest, isPending: isSubmittingReview } =
    useSubmitReviewRequest();

  const isReviewSubmitted = reviewStatus === 'Đang chờ đánh giá';

  const handleSubmitReview = () => {
    if (isReviewSubmitted) return;
    submitReviewRequest({ dishId });
  };

  return (
    <button
      type='button'
      onClick={handleSubmitReview}
      disabled={isSubmittingReview || isReviewSubmitted}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-60 ${
        isReviewSubmitted ? 'bg-emerald-600' : 'bg-sky-600 hover:bg-sky-700'
      }`}
    >
      {isReviewSubmitted ? (
        <>
          <FaCheckCircle className='text-xs' />
          Đã gửi review
        </>
      ) : (
        <>
          <FaPaperPlane className='text-xs' />
          {isSubmittingReview ? 'Đang gửi review...' : 'Gửi chuyên gia review'}
        </>
      )}
    </button>
  );
}
