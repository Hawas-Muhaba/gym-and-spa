import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../stores/auth.store';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authStore = inject(AuthStore);
    const router = inject(Router);

    const userRole = authStore.user()?.role;
    if (userRole && allowedRoles.includes(userRole)) return true;

    router.navigate(['/unauthorized']);
    return false;
  };
};