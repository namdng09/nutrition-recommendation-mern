import { Apple, Ham, Home, Package, Users } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from '~/components/ui/sidebar';
import { ROLE } from '~/constants/role';
import { useProfile } from '~/features/users/view-profile/api/view-profile';

export function AdminSidebar({ ...props }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: profile } = useProfile();

  const userRole = profile?.role;

  const adminNavSections = [
    {
      title: 'Tổng quan',
      items: [
        {
          title: 'Dashboard',
          url: '/admin',
          icon: Home
        }
      ]
    },
    {
      title: 'Quản lý người dùng',
      items: [
        {
          title: 'Người dùng',
          url: '/admin/manage-users',
          icon: Users
        }
      ]
    }
  ];

  const nutritionistNavSections = [
    {
      title: 'Tổng quan',
      items: [
        {
          title: 'Dashboard',
          url: '/nutritionist',
          icon: Home
        }
      ]
    },
    {
      title: 'Quản lý',
      items: [
        {
          title: 'Nguyên liệu',
          url: '/nutritionist/manage-ingredients',
          icon: Apple
        },
        {
          title: 'Món ăn',
          url: '/nutritionist/manage-dishes',
          icon: Ham
        },
        {
          title: 'Bộ sưu tập',
          url: '/nutritionist/manage-collections',
          icon: Package
        }
      ]
    }
  ];

  const navSections =
    userRole === ROLE.NUTRITIONIST ? nutritionistNavSections : adminNavSections;

  const handleNavigation = url => {
    navigate(url);
  };

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader className='transition-all duration-300 ease-in-out'>
        <div className='flex items-center gap-2 transition-all duration-300 ease-in-out group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0'>
          <div className='flex aspect-square size-8 items-center justify-center transition-all duration-300 ease-in-out'>
            <img src='/vite.svg' alt='Logo' className='h-8 w-8' />
          </div>
          <div className='grid flex-1 text-left text-sm leading-tight transition-all duration-300 ease-in-out group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 overflow-hidden'>
            <span className='truncate font-semibold transition-all duration-300 ease-in-out'>
              Vite App
            </span>
            <span className='truncate text-xs transition-all duration-300 ease-in-out'>
              Admin Panel
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className='transition-all duration-300 ease-in-out'>
        {navSections.map(group => (
          <SidebarGroup
            key={group.title}
            className='transition-all duration-300 ease-in-out'
          >
            <SidebarGroupLabel className='transition-all duration-300 ease-in-out group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:opacity-0'>
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map(item => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem
                      key={item.title}
                      className='transition-all duration-300 ease-in-out'
                    >
                      <SidebarMenuButton
                        isActive={location.pathname === item.url}
                        tooltip={item.title}
                        onClick={() => handleNavigation(item.url)}
                        className='transition-all duration-300 ease-in-out cursor-pointer'
                      >
                        <Icon className='transition-all duration-300 ease-in-out' />
                        <span className='transition-all duration-300 ease-in-out group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:w-0 overflow-hidden'>
                          {item.title}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
