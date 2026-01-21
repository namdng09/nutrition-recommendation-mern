import { ChevronDown, LogOut, Menu, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FaUserPlus } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useNavigate } from 'react-router';

import { ModeToggle } from '~/components/mode-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '~/components/ui/popover';
import { useProfile } from '~/features/users/view-profile/api/view-profile';
import { useIsMobile } from '~/hooks/use-mobile';
import { cn, NAV_LINKS } from '~/lib/utils';
import { logout } from '~/store/features/auth-slice';

import HeaderNav from './header-nav';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useSelector(state => state.auth);
  const { data: profile } = useProfile();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMobile) setMobileMenuOpen(false);
  }, [isMobile]);

  const handleLogout = async () => {
    dispatch(logout());
    navigate('/');
  };

  const displayName = profile?.name || user?.name || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const avatarSrc = profile?.avatar;

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='mx-auto flex h-25 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center'>
          <Link to='/' className='flex items-center gap-4'>
            <div className='flex h-18 w-28 items-center justify-center rounded-2xl border bg-[#2E7D32]/2 shadow-2xs'>
              <img
                src='/logo1.png'
                alt='Logo'
                className='h-20 w-20 object-contain scale-150'
              />
            </div>

            <div className='flex flex-col justify-center leading-tight'>
              <div className='text-xl font-bold text-[#1B5E20]'>EatDee</div>
              <div className='text-base text-[#2E7D32]/70'>Since 2025</div>
            </div>
          </Link>
        </div>

        <HeaderNav links={NAV_LINKS} />

        <div className='flex items-center gap-2'>
          <ModeToggle />

          {user ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='ghost'
                  className='group h-10 gap-2 rounded-full px-2 hover:bg-[#2E7D32]/10'
                >
                  <Avatar className='h-8 w-8'>
                    <AvatarImage src={avatarSrc} alt={displayName} />
                    <AvatarFallback>
                      <img
                        src='/default-avatar.jpg'
                        alt='Default avatar'
                        className='h-full w-full object-cover'
                      />
                    </AvatarFallback>
                  </Avatar>

                  <span className='hidden max-w-[140px] truncate text-sm font-medium text-[#1B5E20] sm:inline'>
                    {displayName}
                  </span>

                  <ChevronDown className='hidden h-4 w-4 text-[#1B5E20]/70 transition group-hover:text-[#1B5E20] sm:block' />
                </Button>
              </PopoverTrigger>

              <PopoverContent className='w-64 p-2' align='end'>
                <div className='flex items-center gap-3 rounded-lg border bg-card p-3'>
                  <Avatar className='h-10 w-10'>
                    <AvatarImage src={avatarSrc} alt={displayName} />
                    <AvatarFallback>
                      <img
                        src='/default-avatar.jpg'
                        alt='Default avatar'
                        className='h-full w-full object-cover'
                      />
                    </AvatarFallback>
                  </Avatar>
                  <div className='min-w-0'>
                    <div className='truncate text-sm font-semibold text-[#1B5E20]'>
                      {displayName}
                    </div>
                    {displayEmail ? (
                      <div className='truncate text-xs text-[#2E7D32]/70'>
                        {displayEmail}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className='mt-2 flex flex-col gap-1'>
                  <Link
                    to='/profile'
                    className='flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[#1B5E20] hover:bg-[#2E7D32]/10'
                  >
                    <User className='h-4 w-4' />
                    Hồ Sơ Người Dùng
                  </Link>

                  <button
                    onClick={handleLogout}
                    className='flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-[#2E7D32]/10'
                  >
                    <LogOut className='h-4 w-4' />
                    Đăng Xuất
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <div className='hidden items-center gap-2 sm:flex'>
              <Button
                variant='ghost'
                asChild
                className='rounded-full text-[#1B5E20] hover:bg-[#2E7D32]/10'
              >
                <Link to='/auth/login'>Đăng nhập</Link>
              </Button>

              <Button
                asChild
                className='rounded-full bg-[#1B5E20] text-white hover:bg-[#145017]'
              >
                <Link to='/auth/sign-up' className='flex items-center gap-2'>
                  Đăng Ký Tài Khoản
                  <FaUserPlus className='h-4 w-4' />
                </Link>
              </Button>
            </div>
          )}

          <Button
            variant='ghost'
            size='icon'
            className='md:hidden hover:bg-[#2E7D32]/10'
            onClick={() => setMobileMenuOpen(v => !v)}
          >
            {mobileMenuOpen ? (
              <X className='h-5 w-5' />
            ) : (
              <Menu className='h-5 w-5' />
            )}
            <span className='sr-only'>Toggle menu</span>
          </Button>
        </div>
      </div>

      <div
        className={cn(
          'md:hidden overflow-hidden border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-[max-height] duration-300',
          mobileMenuOpen ? 'max-h-96' : 'max-h-0'
        )}
      >
        <div className='mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8'>
          <div className='flex flex-col gap-1'>
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'rounded-xl px-3 py-2 text-sm font-medium transition',
                    'hover:bg-[#2E7D32]/10 hover:text-[#1B5E20]',
                    isActive
                      ? 'bg-[#2E7D32]/15 text-[#1B5E20] ring-1 ring-[#2E7D32]/25'
                      : 'text-[#1B5E20]/70'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}

            {!user && (
              <div className='mt-2 grid grid-cols-2 gap-2'>
                <Button
                  variant='outline'
                  asChild
                  className='rounded-xl border-[#2E7D32]/25 text-[#1B5E20] hover:bg-[#2E7D32]/10'
                >
                  <Link to='/auth/login'>Đăng Nhập</Link>
                </Button>
                <Button
                  asChild
                  className='rounded-xl bg-[#1B5E20] text-white hover:bg-[#145017]'
                >
                  <Link to='/auth/sign-up'>Đăng Ký</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
