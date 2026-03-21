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

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Separator } from '~/components/ui/separator';
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
import { useProfile } from '~/features/users/view-profile/api/view-profile';
import { useIsMobile } from '~/hooks/use-mobile';
import { logout } from '~/store/features/auth-slice';

export function ProfileSidebar({ ...props }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector(state => state.auth.user);
  const { data: profile } = useProfile();
  const isMobile = useIsMobile();
  const { setOpenMobile } = useSidebar();

  const displayName = profile?.name || user?.name || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const avatarSrc = profile?.avatar;

  // Helper function to get user initials
  const getUserInitials = () => {
    if (!displayName) return 'U';
    const names = displayName.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return displayName[0].toUpperCase();
  };

  // Navigation groups
  const navGroups = [
    {
      label: 'Thông tin cá nhân',
      items: [
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
        }
      ]
    },
    {
      label: 'Sở thích',
      items: [
        {
          title: 'Danh sách Yêu thích',
          url: '/profile/favorites',
          icon: Heart
        },
        {
          title: 'Món ăn bị chặn',
          url: '/profile/blocks',
          icon: CircleOff
        }
      ]
    },
    {
      label: 'Tiến độ & Lịch trình',
      items: [
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
      ]
    }
  ];

  // Add certificate for nutritionists
  if (user?.role === ROLE.NUTRITIONIST) {
    navGroups.push({
      label: 'Chuyên môn',
      items: [
        {
          title: 'Chứng chỉ',
          url: '/profile/certificate',
          icon: Award
        }
      ]
    });
  }

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };

  return (
    <>
      {/* Mobile Toggle Button - Enhanced with Shadow */}
      {isMobile && (
        <div className='fixed left-0 top-20 z-50 md:hidden'>
          <SidebarTrigger className='h-12 w-12 -translate-x-1/2 rounded-full bg-primary text-primary-foreground shadow-xl transition-all hover:shadow-2xl hover:scale-110'>
            <Menu className='h-6 w-6' />
          </SidebarTrigger>
        </div>
      )}

      <Sidebar
        collapsible={isMobile ? 'offcanvas' : 'icon'}
        className='md:top-20 md:h-[calc(100svh-5rem)]'
        {...props}
      >
        {/* Enhanced Header with User Info */}
        <SidebarHeader className='border-b border-sidebar-border/50 p-4 transition-all duration-300 ease-in-out'>
          <div className='flex items-center gap-3 transition-all duration-300 ease-in-out group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0'>
            {/* Avatar with gradient border */}
            <div className='relative flex-shrink-0 transition-all duration-300 ease-in-out'>
              <div className='absolute -inset-0.5 rounded-full bg-gradient-to-r from-primary to-primary/50 opacity-70 blur-sm group-data-[collapsible=icon]:opacity-100' />
              <Avatar className='relative h-10 w-10 border-2 border-sidebar transition-all duration-300 ease-in-out group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8'>
                <AvatarImage src={avatarSrc} alt={displayName} />
                <AvatarFallback className='bg-primary/10 text-primary font-semibold'>
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* User Info */}
            <div className='flex min-w-0 flex-1 flex-col gap-0.5 transition-all duration-300 ease-in-out group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 overflow-hidden'>
              <span className='truncate font-semibold text-sm transition-all duration-300 ease-in-out'>
                {displayName}
              </span>
              <div className='flex items-center gap-2'>
                <span className='truncate text-xs text-muted-foreground transition-all duration-300 ease-in-out'>
                  {displayEmail}
                </span>
                {user?.role === ROLE.NUTRITIONIST && (
                  <Badge
                    variant='outline'
                    className='h-4 px-1 text-[10px] border-primary/50 text-primary'
                  >
                    Chuyên gia
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </SidebarHeader>

        {/* Enhanced Content with Grouped Navigation */}
        <SidebarContent className='px-2 transition-all duration-300 ease-in-out'>
          {navGroups.map((group, groupIndex) => (
            <div key={group.label}>
              <SidebarGroup className='py-2 transition-all duration-300 ease-in-out'>
                <SidebarGroupLabel className='mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 transition-all duration-300 ease-in-out group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:opacity-0'>
                  {group.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className='gap-1'>
                    {group.items.map(item => {
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
                            className='group relative h-11 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] data-[active=true]:shadow-sm'
                          >
                            <Link
                              to={item.url}
                              onClick={() => isMobile && setOpenMobile(false)}
                            >
                              {/* Active indicator */}
                              {isActive && (
                                <div className='absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary to-primary/50 transition-all duration-300 ease-in-out' />
                              )}

                              {/* Icon */}
                              <Icon className='h-5 w-5 flex-shrink-0 text-primary transition-all duration-300 ease-in-out group-hover:scale-110' />

                              {/* Label */}
                              <span className='flex-1 font-medium transition-all duration-300 ease-in-out group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 overflow-hidden'>
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

              {/* Separator between groups (except last) */}
              {groupIndex < navGroups.length - 1 && (
                <Separator className='my-2 opacity-50 group-data-[collapsible=icon]:mx-2' />
              )}
            </div>
          ))}
        </SidebarContent>

        {/* Enhanced Footer */}
        <SidebarFooter className='border-t border-sidebar-border/50 p-2 transition-all duration-300 ease-in-out'>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip='Đăng xuất'
                onClick={handleLogout}
                className='group h-11 cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] text-destructive hover:text-destructive hover:bg-destructive/10 hover:shadow-sm'
              >
                <LogOut className='h-5 w-5 flex-shrink-0 transition-all duration-300 ease-in-out group-hover:scale-110' />
                <span className='font-medium transition-all duration-300 ease-in-out group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 overflow-hidden'>
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
