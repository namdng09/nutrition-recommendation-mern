import React from 'react';
import { useLocation } from 'react-router';
import { Outlet } from 'react-router';
import { useNavigate } from 'react-router';

import { AdminProfileDropdown } from '~/components/admin/admin-profile-dropdown';
import { AdminSidebar } from '~/components/admin/admin-sidebar.jsx';
import { ModeToggle } from '~/components/mode-toggle';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '~/components/ui/breadcrumb';
import { Separator } from '~/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from '~/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/components/ui/tooltip';
import { usePendingCertificatesCount } from '~/features/users/manage-certificate/api/pending-certificates-count';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: pendingCount = 0 } = usePendingCertificatesCount();

  const getBreadcrumbItems = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);

    const breadcrumbMap = {
      admin: 'Dashboard',
      'manage-users': 'Quản lý người dùng',
      'create-user': 'Tạo người dùng',
      'update-user': 'Cập nhật người dùng',
      nutritionist: 'Dashboard',
      'manage-ingredients': 'Quản lý nguyên liệu',
      'create-ingredient': 'Tạo nguyên liệu',
      'update-ingredient': 'Cập nhật nguyên liệu',
      'manage-dishes': 'Quản lý món ăn',
      'create-dish': 'Tạo món ăn',
      'update-dish': 'Cập nhật món ăn',
      'manage-collections': 'Quản lý bộ sưu tập',
      'create-collection': 'Tạo bộ sưu tập',
      'update-collection': 'Cập nhật bộ sưu tập',
      'manage-posts': 'Quản lý bài viết',
      'create-post': 'Tạo bài viết'
    };

    const items = [];
    let currentPath = '';

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(segment);

      if (isMongoId) {
        // Nếu là MongoDB ID, thêm breadcrumb "Chi tiết"
        items.push({
          title: 'Chi tiết',
          href: currentPath,
          isLast: true
        });
        return;
      }

      const title =
        breadcrumbMap[segment] ||
        segment.charAt(0).toUpperCase() + segment.slice(1);

      if (index === 0) {
        items.push({
          title: title,
          href: currentPath,
          isLast: false
        });
      } else if (index === segments.length - 1) {
        items.push({
          title: title,
          href: currentPath,
          isLast: true
        });
      } else {
        items.push({
          title: title,
          href: currentPath,
          isLast: false
        });
      }
    });

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <SidebarProvider defaultOpen={true}>
      <AdminSidebar />
      <SidebarInset className='min-h-screen'>
        <header className='sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
          <div className='flex items-center gap-2 px-4'>
            <SidebarTrigger className='-ml-1' />
            <Separator orientation='vertical' className='mr-2 h-4' />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbItems.map((item, index) => (
                  <React.Fragment key={item.href}>
                    {index > 0 && (
                      <BreadcrumbSeparator className='hidden md:block' />
                    )}
                    <BreadcrumbItem
                      className={index === 0 ? 'hidden md:block' : ''}
                    >
                      {item.isLast ? (
                        <BreadcrumbPage>{item.title}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={item.href}>
                          {item.title}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className='flex items-center gap-4 ml-auto px-4'>
            {pendingCount > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() =>
                        navigate('/admin/manage-users?role=Nutritionist')
                      }
                      className='relative flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='18'
                        height='18'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                        <polyline points='14 2 14 8 20 8' />
                        <line x1='16' y1='13' x2='8' y2='13' />
                        <line x1='16' y1='17' x2='8' y2='17' />
                        <polyline points='10 9 9 9 8 9' />
                      </svg>
                      <span className='absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500 text-[10px] font-bold text-white leading-none'>
                        {pendingCount > 99 ? '99+' : pendingCount}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side='bottom'>
                    <p>{pendingCount} chứng chỉ chờ duyệt</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <ModeToggle />
            <AdminProfileDropdown />
          </div>
        </header>
        <div className='flex flex-1 flex-col p-6 overflow-auto'>
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;
