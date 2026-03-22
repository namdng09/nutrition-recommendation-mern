// components/layouts/profile-layout.jsx
import React from 'react';
import { Outlet } from 'react-router';

import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar';
import { useIsMobile } from '~/hooks/use-mobile';

import { ProfileSidebar } from '../profile-sidebar';

const ProfileLayout = () => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <ProfileSidebar />
      <SidebarInset className='min-h-screen'>
        <div className='flex flex-1 flex-col p-4 md:p-6 overflow-auto'>
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ProfileLayout;
