import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';
import { ToastService } from '../../shared/components/toast/toast';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  if (authService.isStaff()) {
    return true;
  }

  toastService.showError('Access Denied: Terminal restricted to GACAM Administrative Personnel.');
  return router.createUrlTree(['/']);
};
