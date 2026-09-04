import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';
import { roleGuard } from '../core/guards/role.guard';

export const routes: Routes = [
  // Public routes — no guard needed
  {
    path: 'login',
    loadComponent: () => import('../features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('../features/auth/register/register.component').then(m => m.RegisterComponent),
  },

  // Every authenticated view gets the shared navigation shell.
  {
    path: '',
    loadComponent: () => import('./layout/dashboard-shell/dashboard-shell').then(m => m.DashboardShell),
    canActivate: [authGuard],
    children: [
      {
        path: 'book',
        loadComponent: () => import('../features/appointments/booking-form/booking-form.component').then(m => m.BookingFormComponent),
      },
      {
        path: 'my-membership',
        loadComponent: () => import('../features/memberships/client-membership/client-membership.component').then(m => m.ClientMembershipComponent),
      },
      {
        path: 'dashboard',
        canActivate: [roleGuard(['Staff', 'Manager'])],
        children: [
          { path: 'clients', loadComponent: () => import('../features/clients/client-list/client-list.component').then(m => m.ClientListComponent) },
          { path: 'clients/:id', loadComponent: () => import('../features/clients/client-detail/client-detail.component').then(m => m.ClientDetailComponent) },
          { path: 'schedule', loadComponent: () => import('../features/staff/staff-schedule/staff-schedule.component').then(m => m.StaffScheduleComponent) },
          { path: 'memberships/expiring', loadComponent: () => import('../features/memberships/expiring-list/expiring-list.component').then(m => m.ExpiringListComponent) },
          { path: 'staff', loadComponent: () => import('../features/staff/staff-list/staff-list.component').then(m => m.StaffListComponent), canActivate: [roleGuard(['Manager'])] },
          { path: 'services', loadComponent: () => import('../features/services/service-list/service-list.component').then(m => m.ServiceListComponent), canActivate: [roleGuard(['Manager'])] },
          { path: '', redirectTo: 'clients', pathMatch: 'full' },
        ],
      },
      {
        path: 'reports/commission',
        loadComponent: () => import('../features/payments/commission-report/commission-report.component').then(m => m.CommissionReportComponent),
        canActivate: [roleGuard(['Manager'])],
      },
      { path: '', redirectTo: 'book', pathMatch: 'full' },
    ],
  },

  {
    path: 'unauthorized',
    loadComponent: () => import('../shared/components/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent),
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }, // catch-all for unknown URLs
];