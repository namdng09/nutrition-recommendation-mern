// components/profile-sidebar.jsx
import {
  Activity,
  Award,
  Calendar,
  CircleOff,
  Heart,
  LogOut,
  Menu,
  Target,
  Trophy,
  User,
  Utensils
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
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
  SidebarRail,
  SidebarTrigger,
  useSidebar
} from '~/components/ui/sidebar';
import { ROLE } from '~/constants/role';
import { useIsMobile } from '~/hooks/use-mobile';
import { logout } from '~/store/features/auth-slice';

export function ProfileSidebar({ ...props }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector(state => state.auth.user);
  const isMobile = useIsMobile();
  const { setOpenMobile } = useSidebar();

  const baseNavItems = [
    {
      title: 'Thông tin cá nhân',
      url: '/profile',
      icon: User
    },
    {
      title: 'Chế độ ăn',
      url: '/profile/diet',
      icon: Utensils
    },
    {
      title: 'Dị ứng thực phẩm',
      url: '/profile/food-allergies',
      icon: CircleOff
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
      title: 'Danh sách Yêu thích',
      url: '/profile/favorites',
      icon: Heart
    },
    {
      title: 'Món ăn bị chặn',
      url: '/profile/blocks',
      icon: CircleOff
    },
    {
      title: 'Thành tựu',
      url: '/profile/achievements',
      icon: Trophy
    },
    {
      title: 'Lịch trình bữa ăn',
      url: '/profile/schedule-settings',
      icon: Calendar
    }
  ];

  const nutritionistNavItems =
    user?.role === ROLE.NUTRITIONIST
      ? [
          {
            title: 'Chứng chỉ',
            url: '/profile/certificate',
            icon: Award
          }
        ]
      : [];

  const navItems = [...baseNavItems, ...nutritionistNavItems];

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };

  return (
    <>
      {/* Mobile Toggle Button - Fixed Position */}
      {isMobile && (
        <div className='fixed top-20 z-50 md:hidden'>
          <SidebarTrigger className='h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg '>
            <Menu className='h-5 w-5' />
          </SidebarTrigger>
        </div>
      )}

      <Sidebar
        collapsible={isMobile ? 'offcanvas' : 'icon'}
        className='md:top-20 md:h-[calc(100svh-5rem)]'
        {...props}
      >
        <SidebarHeader className='transition-all duration-300 ease-in-out'>
          <div className='flex items-center gap-2 transition-all duration-300 ease-in-out group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0'>
            <div className='flex aspect-square size-8 items-center justify-center transition-all duration-300 ease-in-out'>
              <User className='h-6 w-6 text-primary' />
            </div>
            <div className='mt-6 grid flex-1 text-left text-sm leading-tight transition-all duration-300 ease-in-out group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 overflow-hidden'>
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
                        <Link
                          to={item.url}
                          onClick={() => isMobile && setOpenMobile(false)}
                        >
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

        {!isMobile && <SidebarRail />}
      </Sidebar>
    </>
  );
}
