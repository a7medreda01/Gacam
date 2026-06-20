import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth';
import { LanguageService } from '../../core/services/language';
import { ToastService } from '../../shared/components/toast/toast';
import { TranslatePipe } from '../../shared/pipes/translate';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule, TranslatePipe],
  template: `
    <main class="min-h-screen bg-light-ivory py-20 flex items-center justify-center text-start">
      <div class="w-full max-w-md p-6 sm:p-8 bg-white border border-champagne-gold/20 rounded-2xl shadow-xl animate-fade-in mx-4">
        
        <div class="text-center mb-6">
          <div class="h-12 w-12 rounded-full border border-champagne-gold bg-royal-teal flex items-center justify-center mx-auto mb-3 shadow-md">
            <mat-icon class="text-champagne-gold">lock_reset</mat-icon>
          </div>
          <h2 class="text-lg font-bold text-royal-teal uppercase tracking-widest">
            {{ langService.lang() === 'ar' ? 'نسيت كلمة المرور؟' : 'Recover Password' }}
          </h2>
          <p class="text-xs text-deep-teal/60 mt-1 font-sans">
            {{ langService.lang() === 'ar' ? 'أدخل بريدك الإلكتروني لإرسال رابط استعادة الحساب.' : 'Enter your registered email below to receive recovery instructions.' }}
          </p>
        </div>

        @if (emailSent()) {
          <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-4 rounded-xl flex flex-col gap-2 font-sans">
            <div class="flex items-center gap-1.5 font-bold">
              <mat-icon class="text-sm">mark_email_read</mat-icon>
              <span>{{ langService.lang() === 'ar' ? 'تم إرسال بريد الاستعادة' : 'Recovery email lodged!' }}</span>
            </div>
            <p class="opacity-85 text-[11px]">
              {{ langService.lang() === 'ar' ? 'إذا كان البريد مسجلاً لدينا، فستتلقى رسالة تحوي رابط إعادة تعيين كلمة المرور قريباً.' : 'If that address is on file, you should receive a password recovery link within minutes.' }}
            </p>
          </div>
          <div class="mt-6">
            <a routerLink="/login" class="block w-full py-2 bg-royal-teal hover:bg-deep-teal text-white text-xs font-bold rounded-lg text-center cursor-pointer transition-all">
              {{ langService.lang() === 'ar' ? 'العودة لتسجيل الدخول' : 'Go back to login' }}
            </a>
          </div>
        } @else {
          <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-5 text-xs">
            
            <div class="flex flex-col gap-1.5">
              <label for="recovery-email" class="font-bold text-deep-teal">
                {{ langService.lang() === 'ar' ? 'البريد الإلكتروني المسجل *' : 'Registered Email Address *' }}
              </label>
              <div class="relative">
                <mat-icon class="absolute left-3 top-2.5 text-deep-teal/40 text-sm">alternate_email</mat-icon>
                <input id="recovery-email" type="email" formControlName="email"
                       placeholder="e.g. j.doe&#64;gacam.media"
                       class="w-full pl-9 pr-4 py-2 border border-champagne-gold/30 rounded-lg bg-light-ivory text-deep-teal focus:outline-none focus:border-royal-teal font-sans" />
              </div>
            </div>

            <button type="submit" [disabled]="forgotForm.invalid || loading()"
                    class="w-full py-2.5 bg-royal-teal text-white hover:bg-champagne-gold hover:text-royal-teal rounded-lg font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              @if (loading()) {
                <mat-icon class="animate-spin text-sm">sync</mat-icon>
              } @else {
                <mat-icon class="text-sm">send</mat-icon>
              }
              <span>{{ loading() ? 'Sending…' : (langService.lang() === 'ar' ? 'إرسال رابط الاستعادة' : 'Lodging request') }}</span>
            </button>

            <div class="text-center mt-2 border-t border-light-ivory pt-4">
              <a routerLink="/login" class="text-xs font-bold text-royal-teal hover:text-deep-teal transition-colors font-sans">
                {{ langService.lang() === 'ar' ? 'الرجوع لصفحة الدخول' : 'Back to Login' }}
              </a>
            </div>

          </form>
        }

      </div>
    </main>
  `
})
export class ForgotPasswordComponent {
  authService = inject(AuthService);
  langService = inject(LanguageService);
  toast       = inject(ToastService);

  forgotForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  loading   = signal(false);
  emailSent = signal(false);

  onSubmit() {
    if (this.forgotForm.invalid) return;
    this.loading.set(true);

    const email = this.forgotForm.value.email!;
    this.authService.forgotPassword({email}).subscribe({
      next: () => {
        this.toast.showSuccess(
          this.langService.lang() === 'ar' ? 'تم إرسال تعليمات الاستعادة!' : 'Password reset link sent!'
        );
        this.emailSent.set(true);
        this.loading.set(false);
      },
      error: () => {
        this.emailSent.set(true);
        this.loading.set(false);
      }
    });
  }
}
