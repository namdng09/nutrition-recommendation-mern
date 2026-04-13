import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { Textarea } from '~/components/ui/textarea';
import { useEvaluateReview } from '~/features/review/submit-review-request/api/evaluate-review';

const DEFAULT_VALUES = {
  rating: '5',
  feedback: ''
};

const EvaluateReviews = ({
  open,
  onOpenChange,
  dishId,
  dishName,
  onSuccess
}) => {
  const form = useForm({
    defaultValues: DEFAULT_VALUES
  });

  const { mutate: evaluateReview, isPending } = useEvaluateReview({
    onSuccess: () => {
      onOpenChange(false);
      form.reset(DEFAULT_VALUES);
      onSuccess?.();
    }
  });

  useEffect(() => {
    if (open) {
      form.reset(DEFAULT_VALUES);
    }
  }, [form, open, dishId]);

  const handleSubmit = values => {
    if (!dishId) return;

    evaluateReview({
      dishId,
      rating: Number(values.rating),
      feedback: values.feedback.trim()
    });
  };

  const handleOpenChange = nextOpen => {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      form.reset(DEFAULT_VALUES);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Đánh giá món ăn</DialogTitle>
          <DialogDescription>
            Gửi đánh giá cho món ăn: <strong>{dishName || '-'}</strong>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4'
            id='evaluate-review-form'
          >
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
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Chọn điểm đánh giá' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(value => (
                        <SelectItem key={value} value={String(value)}>
                          {value} sao
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
          </form>
        </Form>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button
            type='submit'
            form='evaluate-review-form'
            disabled={isPending}
          >
            {isPending ? 'Đang gửi đánh giá...' : 'Gửi đánh giá'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EvaluateReviews;
