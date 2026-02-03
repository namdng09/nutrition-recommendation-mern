import React from 'react';
import { useLocation } from 'react-router';
import { Outlet } from 'react-router';

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

const AdminLayout = () => {
  const location = useLocation();

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
      'update-collection': 'Cập nhật bộ sưu tập'
    };

    const items = [];
    let currentPath = '';

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(segment);
      if (isMongoId) {
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
      } else if (
        index === segments.length - 1 ||
        (isMongoId && index === segments.length - 2)
      ) {
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
