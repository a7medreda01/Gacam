// core/guards/noAuthGuard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const noAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) return true; // مش logged in → اكمل للصفحة

  // لو Admin أو Employee → روح للـ admin panel
  if (auth.isStaff()) {
    router.navigate(['/admin']);
  } else {
    router.navigate(['/']); // يوزر عادي → الهوم
  }

  return false;
};