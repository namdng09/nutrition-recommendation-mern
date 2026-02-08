import { ChevronDown, LogOut, Settings, Sparkles, User } from 'lucide-react';
import { FaUserPlus } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router';

import { ModeToggle } from '~/components/mode-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '~/components/ui/popover';
import { useProfile } from '~/features/users/view-profile/api/view-profile';
import { logout } from '~/store/features/auth-slice';

const OnboardingHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { data: profile } = useProfile();

  const handleLogout = async () => {
    dispatch(logout());
    navigate('/');
  };

  const displayName = profile?.name || user?.name || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const avatarSrc = profile?.avatar;

  return (
    <header className='sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center'>
          <Link
            to='/'
            className='group flex items-center gap-3 transition-all hover:opacity-90'
          >
            <div className='relative flex h-17 w-17 items-center justify-center bg-transparent'>
              <img
                src='/logo2.png'
                alt='Logo'
                className='h-full w-full object-contain scale-[1.8]'
              />
            </div>

            <div className='flex flex-col leading-none'>
              <span className='text-2xl font-black tracking-tight text-primary'>
                Eat<span className='text-foreground'>Dee</span>
              </span>
              <span className='text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mt-0.5'>
                Healthy Life
              </span>
            </div>
          </Link>
        </div>

        <div className='flex items-center gap-3'>
          <div className='hidden sm:block'>
            <ModeToggle />
          </div>
          <div className='hidden sm:block h-6 w-px bg-border mr-3' />
          <div className='sm:hidden'>
            <ModeToggle />
          </div>

          {user ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='ghost'
                  className='group relative h-11 gap-3 rounded-full pl-1.5 pr-4 transition-all hover:bg-primary/5 border border-transparent hover:border-primary/10'
                >
                  <Avatar className='h-8 w-8 border border-border transition-transform group-hover:scale-105 shadow-sm'>
                    <AvatarImage src={avatarSrc} alt={displayName} />
                    <AvatarFallback className='bg-primary/10 text-[10px] font-bold'>
                      {displayName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className='hidden flex-col items-start leading-none sm:flex'>
                    <span className='max-w-[100px] truncate text-sm font-bold text-foreground'>
                      {displayName}
                    </span>
                    <span className='text-[10px] text-muted-foreground font-medium'>
                      Thành viên
                    </span>
                  </div>

                  <ChevronDown className='hidden h-3.5 w-3.5 text-muted-foreground transition-transform duration-300 group-data-[state=open]:rotate-180 sm:block' />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                className='w-72 p-1.5 mt-2 rounded-2xl shadow-2xl border-border/50 backdrop-blur-xl'
                align='end'
              >
                <div className='flex items-center gap-3 rounded-xl bg-primary/[0.03] p-4 border border-primary/5 mb-1'>
                  <Avatar className='h-11 w-11 border-2 border-background shadow-md'>
                    <AvatarImage src={avatarSrc} alt={displayName} />
                    <AvatarFallback className='bg-primary/10'>
                      ED
                    </AvatarFallback>
                  </Avatar>

                  <div className='min-w-0'>
                    <div className='truncate text-[15px] font-bold text-foreground flex items-center gap-1'>
                      {displayName}
                      <Sparkles className='h-3 w-3 text-primary' />
                    </div>
                    <div className='truncate text-xs text-muted-foreground font-medium'>
                      {displayEmail || 'Basic Member'}
                    </div>
                  </div>
                </div>

                <div className='grid gap-0.5'>
                  <Link
                    to='/profile'
                    className='group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-primary/5 hover:text-primary'
                  >
                    <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-secondary group-hover:bg-primary/10'>
                      <User className='h-4 w-4' />
                    </div>
                    Hồ Sơ Người Dùng
                  </Link>
                  <div className='my-1 border-t border-border/50' />

                  <button
                    onClick={handleLogout}
                    className='group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-destructive transition-colors hover:bg-destructive/5'
                  >
                    <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/5 group-hover:bg-destructive/10'>
                      <LogOut className='h-4 w-4' />
                    </div>
                    Đăng Xuất
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <div className='flex items-center gap-3'>
              <Button
                variant='ghost'
                asChild
                className='hidden rounded-full px-6 font-bold text-foreground/80 transition-all hover:bg-accent sm:flex'
              >
                <Link to='/auth/login'>Đăng nhập</Link>
              </Button>

              <Button
                asChild
                className='rounded-full bg-primary px-6 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95'
              >
                <Link to='/auth/sign-up' className='flex items-center gap-2'>
                  <span className='hidden sm:inline'>Đăng Ký</span>
                  <span className='sm:hidden'>Đăng Ký</span>
                  <FaUserPlus className='h-4 w-4' />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default OnboardingHeader;
