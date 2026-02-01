import {
  Activity,
  Calendar,
  LogOut,
  Target,
  User,
  Utensils
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from '~/components/ui/sidebar';
import { logout } from '~/store/features/auth-slice';

export function ProfileSidebar({ ...props }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const navItems = [
    {
      title: 'Tổng quan',
      url: '/profile',
      icon: User
    },
    {
      title: 'Chế độ ăn & Dị ứng',
      url: '/profile/diet',
      icon: Utensils
    },
    {
      title: 'Mục tiêu dinh dưỡng',
      url: '/profile/nutrition-target',
      icon: Target
    },
    {
      title: 'Chỉ số cơ thể',
      url: '/profile/physical-stats',
      icon: Activity
    },
    {
      title: 'Lịch trình bữa ăn',
      url: '/profile/schedule-settings',
      icon: Calendar
    }
  ];

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader className='transition-all duration-300 ease-in-out'>
        <div className='flex items-center gap-2 transition-all duration-300 ease-in-out group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0'>
          <div className='flex aspect-square size-8 items-center justify-center transition-all duration-300 ease-in-out'>
            <User className='h-6 w-6 text-primary' />
          </div>
          <div className='grid flex-1 text-left text-sm leading-tight transition-all duration-300 ease-in-out group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 overflow-hidden'>
            <span className='truncate font-semibold transition-all duration-300 ease-in-out'>
              Cài đặt hồ sơ
            </span>
            <span className='truncate text-xs text-muted-foreground transition-all duration-300 ease-in-out'>
              Quản lý tài khoản
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className='transition-all duration-300 ease-in-out'>
        <SidebarGroup className='transition-all duration-300 ease-in-out'>
          <SidebarGroupLabel className='transition-all duration-300 ease-in-out group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:opacity-0'>
            Cài đặt
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem
                    key={item.title}
                    className='transition-all duration-300 ease-in-out'
                  >
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className='transition-all duration-300 ease-in-out'
                    >
                      <Link to={item.url}>
                        <Icon className='transition-all duration-300 ease-in-out text-primary' />
                        <span className='transition-all duration-300 ease-in-out group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 overflow-hidden'>
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='transition-all duration-300 ease-in-out'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip='Đăng xuất'
              onClick={handleLogout}
              className='transition-all duration-300 ease-in-out cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10'
            >
              <LogOut className='transition-all duration-300 ease-in-out' />
              <span className='transition-all duration-300 ease-in-out group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 overflow-hidden'>
                Đăng xuất
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
