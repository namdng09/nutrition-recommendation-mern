import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';

import PrivateRoute from '~/components/private-route';
import { ROLE } from '~/constants/role';

const AppLayout = lazy(() => import('~/components/layouts/app-layout'));
const RootLayout = lazy(() => import('~/components/layouts/root-layout'));
const AuthLayout = lazy(() => import('~/components/layouts/auth-layout'));
const AdminLayout = lazy(() => import('~/components/layouts/admin-layout'));
const ProfileLayout = lazy(() => import('~/components/layouts/profile-layout'));
const OnboardingLayout = lazy(
  () => import('~/components/layouts/onboarding-layout')
);
const ErrorComponent = lazy(() => import('~/components/error'));

const OnboardingPage = lazy(() => import('~/app/onboarding/page'));

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
            path: 'dishes/:id',
            Component: lazy(() => import('~/app/dishes/[id]/page'))
          },
          {
            path: 'schedules/day',
            Component: lazy(() => import('~/app/schedules/[day]/page'))
          },
          {
            path: 'schedules/week',
            Component: lazy(() => import('~/app/schedules/[week]/page'))
          },
          {
            path: 'posts',
            Component: lazy(() => import('~/app/posts/page'))
          },
          {
            path: 'posts/:id',
            Component: lazy(() => import('~/app/posts/[id]/page'))
          },
          {
            path: 'dishes/:id/nutrition',
            Component: lazy(() => import('~/app/dishes/[id]/nutrition/page'))
          },
          {
            path: 'profile',
            Component: () => (
              <PrivateRoute allowedRoles={[ROLE.USER, ROLE.ADMIN]}>
                <ProfileLayout />
              </PrivateRoute>
            ),
            children: [
              {
                index: true,
                Component: lazy(() => import('~/app/profile/page'))
              },
              {
                path: 'diet',
                Component: lazy(() => import('~/app/profile/diet/page'))
              },
              {
                path: 'nutrition-target',
                Component: lazy(
                  () => import('~/app/profile/nutrition-target/page')
                )
              },
              {
                path: 'physical-stats',
                Component: lazy(
                  () => import('~/app/profile/physical-stats/page')
                )
              },
              {
                path: 'schedule-settings',
                Component: lazy(
                  () => import('~/app/profile/schedule-settings/page')
                )
              }
            ]
          }
        ]
      },
      {
        path: 'onboarding',
        Component: OnboardingLayout,
        children: [
          {
            index: true,
            Component: () => (
              <PrivateRoute allowedRoles={[ROLE.USER]}>
                <OnboardingPage />
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
        path: '/nutritionist/',
        Component: () => (
          <PrivateRoute allowedRoles={[ROLE.NUTRITIONIST]}>
            <AdminLayout />
          </PrivateRoute>
        ),
        // Component: AdminLayout,
        children: [
          {
            path: '',
            Component: lazy(() => import('~/app/nutritionist/page'))
          },

          //Manage ingredients
          {
            path: 'manage-ingredients/',
            Component: lazy(
              () => import('~/app/nutritionist/manage-ingredients/page')
            )
          },
          {
            path: 'manage-ingredients/:id',
            Component: lazy(
              () => import('~/app/nutritionist/manage-ingredients/[id]/page')
            )
          },
          {
            path: 'manage-ingredients/create-ingredient',
            Component: lazy(
              () =>
                import(
                  '~/app/nutritionist/manage-ingredients/create-ingredient/page'
                )
            )
          },

          // Manage dishes
          {
            path: 'manage-dishes/',
            Component: lazy(
              () => import('~/app/nutritionist/manage-dishes/page')
            )
          },
          {
            path: 'manage-dishes/create-dish',
            Component: lazy(
              () => import('~/app/nutritionist/manage-dishes/create-dish/page')
            )
          },
          {
            path: 'manage-dishes/:id',
            Component: lazy(
              () => import('~/app/nutritionist/manage-dishes/[id]/page')
            )
          },

          // Manage collections
          {
            path: 'manage-collections/',
            Component: lazy(
              () => import('~/app/nutritionist/manage-collections/page')
            )
          },
          {
            path: 'manage-collections/create-collection',
            Component: lazy(
              () =>
                import(
                  '~/app/nutritionist/manage-collections/create-collections/page'
                )
            )
          },
          {
            path: 'manage-collections/:id',
            Component: lazy(
              () => import('~/app/nutritionist/manage-collections/[id]/page')
            )
          }
        ]
      },
      {
        path: '/admin/',
        Component: () => (
          <PrivateRoute allowedRoles={[ROLE.ADMIN]}>
            <AdminLayout />
          </PrivateRoute>
        ),
        // Component: AdminLayout,
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
      },
      {
        path: '*',
        Component: ErrorComponent
      }
    ]
  }
]);

export default router;
