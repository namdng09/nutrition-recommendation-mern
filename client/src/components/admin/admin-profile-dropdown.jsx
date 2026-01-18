import { ChevronDown, LogOut, User } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '~/components/ui/popover';
import { useProfile } from '~/features/users/view-profile/api/view-profile';
import { logout } from '~/store/features/auth-slice';

export const AdminProfileDropdown = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: profile } = useProfile();

  const handleLogout = async () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='ghost' className='relative h-auto gap-3 px-2 py-1.5'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src={profile?.avatar} alt={profile?.name} />
            <AvatarFallback>
              <img
                src='/default-avatar.jpg'
                alt='Default avatar'
                className='h-full w-full object-cover'
              />
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col items-start text-left'>
            <span className='text-sm font-medium'>
              {profile?.name || 'User'}
            </span>
            <span className='text-xs text-muted-foreground'>
              {profile?.role || 'Admin'}
            </span>
          </div>
          <ChevronDown className='h-4 w-4 text-muted-foreground' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-48 p-2' align='end'>
        <div className='flex flex-col gap-1'>
          <Link
            to='/profile'
            className='flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent'
          >
            <User className='h-4 w-4' />
            View Profile
          </Link>
          <button
            onClick={handleLogout}
            className='flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-accent'
          >
            <LogOut className='h-4 w-4' />
            Logout
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
