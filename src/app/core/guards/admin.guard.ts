import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

/** أي يوزر logged in */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  router.navigate(['/login']);
  return false;
};

/** Admin فقط */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  if (auth.isStaff()) return true; // Admin أو Employee

  router.navigate(['/']);
  return false;
};

/** يمنع الدخول لو اليوزر logged in (للـ login/register) */
export const noAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) return true;

  // لو Admin أو Employee يروح للـ admin panel
  if (auth.isStaff()) {
    router.navigate(['/admin']);
  } else {
    router.navigate(['/']);
  }
  return false;
};

/** Role-based guard مرن */
export const roleGuard = (roles: string[]): CanActivateFn =>
  () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
      router.navigate(['/login']);
      return false;
    }

    if (roles.some((r) => auth.hasRole(r))) return true;

    router.navigate(['/']);
    return false;
  };