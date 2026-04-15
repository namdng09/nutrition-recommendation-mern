import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form';
import { Textarea } from '~/components/ui/textarea';
import { useEvaluateReview } from '~/features/review/submit-review-request/api/evaluate-review';

const DEFAULT_VALUES = {
  rating: '5',
  feedback: ''
};

const EvaluateReviews = ({ dishId, dishName, onSuccess, disabled = false }) => {
  const form = useForm({
    defaultValues: DEFAULT_VALUES
  });
  const [hoverRating, setHoverRating] = useState(0);
  const chosenRating = Number(form.watch('rating') || 0);
  const activeRating = hoverRating || chosenRating;

  const { mutate: evaluateReview, isPending } = useEvaluateReview({
    onSuccess: () => {
      form.reset(DEFAULT_VALUES);
      onSuccess?.();
    }
  });

  useEffect(() => {
    if (dishId) {
      form.reset(DEFAULT_VALUES);
    }
  }, [form, dishId]);

  const handleSubmit = values => {
    if (!dishId) return;

    evaluateReview({
      dishId,
      rating: Number(values.rating),
      feedback: values.feedback.trim()
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
        <p className='text-sm text-muted-foreground'>
          Gửi đánh giá cho món ăn: <strong>{dishName || '-'}</strong>
        </p>

        <FormField
          control={form.control}
          name='rating'
          rules={{
            required: 'Điểm đánh giá là bắt buộc',
            validate: value => {
              const point = Number(value);
              return (
                (point >= 1 && point <= 5) ||
                'Điểm đánh giá phải nằm trong khoảng từ 1 đến 5'
              );
            }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Điểm đánh giá</FormLabel>
              <div
                className='flex items-center gap-1'
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map(value => (
                  <button
                    key={value}
                    type='button'
                    onClick={() => field.onChange(String(value))}
                    onMouseEnter={() => setHoverRating(value)}
                    aria-label={`Chọn ${value} sao`}
                    className='rounded-sm p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    disabled={isPending || disabled}
                  >
                    <Star
                      className={`h-6 w-6 transition-colors ${
                        value <= activeRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/40'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='feedback'
          rules={{
            required: 'Nội dung phản hồi là bắt buộc',
            validate: value =>
              value?.trim()?.length >= 2 ||
              'Nội dung phản hồi phải có ít nhất 2 ký tự'
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phản hồi</FormLabel>
              <FormControl>
                <Textarea
                  rows={5}
                  placeholder='Nhập nhận xét của bạn về món ăn này...'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex items-center justify-end gap-2'>
          <Button
            type='button'
            variant='outline'
            onClick={() => form.reset(DEFAULT_VALUES)}
            disabled={isPending || disabled}
          >
            Làm mới
          </Button>
          <Button type='submit' disabled={isPending || disabled || !dishId}>
            {isPending ? 'Đang gửi đánh giá...' : 'Gửi đánh giá'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EvaluateReviews;
