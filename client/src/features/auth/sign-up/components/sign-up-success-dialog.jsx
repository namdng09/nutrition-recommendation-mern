import { CheckCircle, Clock } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import { ROLE } from '~/constants/role';

const SignUpSuccessDialog = ({ open, role, onConfirm }) => {
  const isNutritionist = role === ROLE.NUTRITIONIST;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className='max-w-md'
        onInteractOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader className='items-center text-center gap-3'>
          <div className='flex h-14 w-14 items-center justify-center rounded-full bg-primary/10'>
            {isNutritionist ? (
              <Clock className='h-7 w-7 text-primary' />
            ) : (
              <CheckCircle className='h-7 w-7 text-primary' />
            )}
          </div>

          <DialogTitle className='text-xl'>
            {isNutritionist ? 'Đăng ký thành công!' : 'Chào mừng bạn!'}
          </DialogTitle>

          <DialogDescription asChild>
            <div className='space-y-3 text-muted-foreground'>
              {isNutritionist ? (
                <>
                  <p>
                    Tài khoản chuyên gia dinh dưỡng của bạn đã được tạo. Chứng
                    chỉ của bạn đang chờ xét duyệt từ quản trị viên.
                  </p>
                  <div className='flex justify-center'>
                    <Badge
                      variant='outline'
                      className='gap-1.5 border-yellow-400 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30 dark:text-yellow-400'
                    >
                      <Clock className='h-3 w-3' />
                      Đang chờ duyệt
                    </Badge>
                  </div>
                  <p>
                    Bạn sẽ nhận được email thông báo khi chứng chỉ được phê
                    duyệt hoặc từ chối.
                  </p>
                </>
              ) : (
                <p>
                  Tài khoản của bạn đã được tạo thành công. Hãy hoàn tất hồ sơ
                  để bắt đầu hành trình dinh dưỡng của bạn.
                </p>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className='mt-2'>
          <Button className='w-full' onClick={onConfirm}>
            Tiếp tục
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SignUpSuccessDialog;
