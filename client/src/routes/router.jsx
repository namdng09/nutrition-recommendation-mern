import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';

import PrivateRoute from '~/components/private-route';

const AppLayout = lazy(() => import('~/components/layouts/app-layout'));
const RootLayout = lazy(() => import('~/components/layouts/root-layout'));
const AuthLayout = lazy(() => import('~/components/layouts/auth-layout'));
const AdminLayout = lazy(() => import('~/components/layouts/admin-layout'));

const ErrorComponent = lazy(() => import('~/components/error'));

const ProfilePage = lazy(() => import('~/app/profile/page'));

const router = createBrowserRouter([
  {
    Component: AppLayout,
    ErrorBoundary: ErrorComponent,
    children: [
      {
        path: '/',
        Component: RootLayout,
        children: [
          {
            index: true,
            Component: lazy(() => import('~/app/page'))
          },
          {
            path: 'collections',
            Component: lazy(() => import('~/app/collections/page'))
          },
          {
            path: 'collections/:id',
            Component: lazy(() => import('~/app/collections/[id]/page'))
          },
          {
            path: 'ingredients',
            Component: lazy(() => import('~/app/ingredients/page'))
          },
          {
            path: 'ingredients/:id',
            Component: lazy(() => import('~/app/ingredients/[id]/page'))
          },
          {
            path: 'dishes',
            Component: lazy(() => import('~/app/dishes/page'))
          },
          {
            path: 'profile',
            Component: () => (
              <PrivateRoute allowedRoles={['user', 'admin']}>
                <ProfilePage />
              </PrivateRoute>
            )
          }
        ]
      },
      {
        path: '/auth/',
        Component: AuthLayout,
        children: [
          {
            path: 'login',
            Component: lazy(() => import('~/app/auth/login/page'))
          },
          {
            path: 'sign-up',
            Component: lazy(() => import('~/app/auth/sign-up/page'))
          },
          {
            path: 'callback',
            Component: lazy(() => import('~/app/auth/callback/page'))
          },
          {
            path: 'forgot-password',
            Component: lazy(() => import('~/app/auth/forgot-password/page'))
          },
          {
            path: 'reset-password',
            Component: lazy(() => import('~/app/auth/reset-password/page'))
          }
        ]
      },
      {
        path: '/admin/',
        Component: () => (
          <PrivateRoute allowedRoles={['admin']}>
            <AdminLayout />
          </PrivateRoute>
        ),
        children: [
          {
            path: '',
            Component: lazy(() => import('~/app/admin/page'))
          },
          {
            path: 'manage-users/',
            Component: lazy(() => import('~/app/admin/manage-users/page'))
          },
          {
            path: 'manage-users/:id',
            Component: lazy(() => import('~/app/admin/manage-users/[id]/page'))
          },
          {
            path: 'manage-users/create-user',
            Component: lazy(
              () => import('~/app/admin/manage-users/create-user/page')
            )
          }
        ]
      }
    ]
  }
]);

export default router;
