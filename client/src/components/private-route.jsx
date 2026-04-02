import { FiLock } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';

import { Button } from './ui/button';
import { Spinner } from './ui/spinner';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading, loggingOut } = useSelector(state => state.auth);

  if (loggingOut) {
    return null;
  }

  if (loading) {
    return <Spinner size='lg' />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className='flex min-h-[60vh] items-center justify-center px-4 py-10 transition-colors duration-300'>
        <div className='w-full max-w-md border border-border bg-card p-10 text-center shadow-2xl shadow-primary/10 backdrop-blur-sm dark:shadow-none'>
          <div className='relative mx-auto mb-8 flex h-24 w-24 items-center justify-center'>
            <div className='absolute inset-0 rounded-full bg-primary/20 blur-3xl opacity-60 animate-pulse' />
            <div className='relative flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/5 border border-primary/10 shadow-sm'>
              <FiLock className='text-4xl text-primary' />
            </div>
          </div>

          <div className='space-y-4'>
            <h2 className='text-2xl font-semibold tracking-tight text-foreground'>
              Bạn chưa đăng nhập
            </h2>
            <p className='text-sm leading-relaxed text-muted-foreground sm:text-base'>
              Vui lòng đăng nhập để tiếp tục truy cập trang này và khám phá
              những nội dung đang chờ bạn.
            </p>
          </div>

          <div className='mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center'>
            <Button
              asChild
              className='h-12 rounded-2xl bg-primary px-8 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95'
            >
              <Link to='/auth/login' className='font-semibold'>
                Đăng nhập
              </Link>
            </Button>

            <Button
              variant='outline'
              asChild
              className='h-12 rounded-2xl border-border bg-transparent px-8 text-foreground transition-all hover:bg-secondary'
            >
              <Link to='/' className='font-medium'>
                Về trang chủ
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default PrivateRoute;
