import React from 'react';
import { Outlet } from 'react-router';

import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar';

import { ProfileSidebar } from '../profile-sidebar';

const ProfileLayout = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <ProfileSidebar />
      <SidebarInset className='min-h-screen'>
        <div className='flex flex-1 flex-col p-6 overflow-auto'>
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ProfileLayout;
