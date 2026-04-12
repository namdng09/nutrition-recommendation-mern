import React from 'react';
import { FaCheckCircle, FaPaperPlane } from 'react-icons/fa';

import { useSubmitReviewRequest } from '../api/submit-review-request';

export default function SubmitReviewButton({ dishId, reviewStatus }) {
  const { mutate: submitReviewRequest, isPending: isSubmittingReview } =
    useSubmitReviewRequest();

  const isPendingReview = reviewStatus === 'Đang chờ đánh giá';
  const isReviewed = reviewStatus === 'Đã được đánh giá';
  const isDisabled = isSubmittingReview || isPendingReview || isReviewed;

  const handleSubmitReview = () => {
    if (isDisabled) return;
    submitReviewRequest({ dishId });
  };

  return (
    <button
      type='button'
      onClick={handleSubmitReview}
      disabled={isDisabled}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-60 ${
        isReviewed
          ? 'bg-emerald-600'
          : isPendingReview
            ? 'bg-amber-500'
            : 'bg-sky-600 hover:bg-sky-700'
      }`}
    >
      {isReviewed ? (
        <>
          <FaCheckCircle className='text-xs' />
          Đã được đánh giá
        </>
      ) : isPendingReview ? (
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
