import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth';
import { LanguageService } from '../../core/services/language';
import { ToastService } from '../../shared/components/toast/toast';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { FooterComponent } from '../../shared/components/footer/footer';
import { TranslatePipe } from '../../shared/pipes/translate';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule, NavbarComponent, FooterComponent, TranslatePipe],
  template: `
    <app-navbar></app-navbar>

    <main class="min-h-screen bg-light-ivory py-20 flex items-center justify-center text-start">
      <div class="w-full max-w-md p-6 sm:p-8 bg-white border border-champagne-gold/20 rounded-2xl shadow-xl animate-fade-in mx-4">
        
        <div class="text-center mb-6">
          <div class="h-12 w-12 rounded-full border border-champagne-gold bg-royal-teal flex items-center justify-center mx-auto mb-3 shadow-md">
            <mat-icon class="text-champagne-gold">lock_open</mat-icon>
          </div>
          <h2 class="text-lg font-bold text-royal-teal uppercase tracking-widest">
            {{ langService.lang() === 'ar' ? 'إنشاء كلمة مرور جديدة' : 'Reset Password' }}
          </h2>
          <p class="text-xs text-deep-teal/60 mt-1 font-sans">
            {{ langService.lang() === 'ar' ? 'الرجاء إدخال كلمة المرور الجديدة وتأكيدها.' : 'Provide your new account password below.' }}
          </p>
        </div>

        <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-5 text-xs">
          
          <!-- New Password -->
          <div class="flex flex-col gap-1.5 font-sans">
            <label for="new-pass" class="font-bold text-deep-teal font-sans">
              {{ langService.lang() === 'ar' ? 'كلمة المرور الجديدة *' : 'New Password *' }}
            </label>
            <div class="relative">
              <mat-icon class="absolute left-3 top-2.5 text-deep-teal/40 text-sm">lock_outline</mat-icon>
              <input id="new-pass" type="password" formControlName="newPassword"
                     placeholder="••••••••"
                     class="w-full pl-9 pr-4 py-2 border border-champagne-gold/30 rounded-lg bg-light-ivory text-deep-teal focus:outline-none focus:border-royal-teal font-sans" />
            </div>
          </div>

          <!-- Confirm Password -->
          <div class="flex flex-col gap-1.5 font-sans">
            <label for="confirm-pass" class="font-bold text-deep-teal font-sans">
              {{ langService.lang() === 'ar' ? 'تأكيد كلمة المرور *' : 'Confirm New Password *' }}
            </label>
            <div class="relative">
              <mat-icon class="absolute left-3 top-2.5 text-deep-teal/40 text-sm font-sans">lock</mat-icon>
              <input id="confirm-pass" type="password" formControlName="confirmPassword"
                     placeholder="••••••••"
                     class="w-full pl-9 pr-4 py-2 border border-champagne-gold/30 rounded-lg bg-light-ivory text-deep-teal focus:outline-none focus:border-royal-teal font-sans" />
            </div>
            @if (resetForm.hasError('mismatch')) {
              <p class="text-[10px] text-red-500 font-bold mt-1">
                {{ langService.lang() === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match.' }}
              </p>
            }
          </div>

          <button type="submit" [disabled]="resetForm.invalid || loading()"
                  class="w-full py-2.5 bg-royal-teal text-white hover:bg-champagne-gold hover:text-royal-teal rounded-lg font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            @if (loading()) {
              <mat-icon class="animate-spin text-sm">sync</mat-icon>
            } @else {
              <mat-icon class="text-sm">security</mat-icon>
            }
            <span>{{ loading() ? 'Saving…' : (langService.lang() === 'ar' ? 'حفظ وتحديث كلمة المرور' : 'Save & Update Password') }}</span>
          </button>

        </form>

      </div>
    </main>

    <app-footer></app-footer>
  `
})
export class ResetPasswordComponent implements OnInit {
  authService = inject(AuthService);
  langService = inject(LanguageService);
  toast       = inject(ToastService);
  route       = inject(ActivatedRoute);
  router      = inject(Router);

  tokenStr = '';
  emailStr = '';

  resetForm = new FormGroup({
    newPassword:     new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required])
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(g: any) {
    const p = g.get('newPassword')?.value;
    const c = g.get('confirmPassword')?.value;
    return p === c ? null : { mismatch: true };
  }

  loading = signal(false);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.tokenStr = params['token'] || '';
      this.emailStr = params['email'] || '';
    });
  }

  onSubmit() {
    if (this.resetForm.invalid) return;
    this.loading.set(true);

    const payload = {
      email:       this.emailStr,
      token:       this.tokenStr,
      newPassword: this.resetForm.value.newPassword!
    };

    this.authService.resetPassword(payload).subscribe({
      next: () => {
        this.toast.showSuccess(
          this.langService.lang() === 'ar' ? 'تم تعيين كلمة المرور بنجاح!' : 'Password reset accomplished!'
        );
        this.loading.set(false);
        this.router.navigate(['/login']);
      },
      error: () => {
        this.toast.showError('Could not set new passwords. Reset token has expired or is invalid.');
        this.loading.set(false);
      }
    });
  }
}
