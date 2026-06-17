import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth';
import { LanguageService } from '../../core/services/language';
import { ToastService } from '../../shared/components/toast/toast';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { FooterComponent } from '../../shared/components/footer/footer';
import { TranslatePipe } from '../../shared/pipes/translate';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatIconModule, NavbarComponent, FooterComponent, TranslatePipe],
  template: `
    <app-navbar></app-navbar>

    <main class="min-h-screen bg-light-ivory py-16 flex items-center justify-center">
      <div class="w-full max-w-lg bg-white p-8 rounded-2xl border border-champagne-gold/15 shadow-xl text-start">
        
        <!-- Headers -->
        <div class="text-center mb-8 flex flex-col gap-2">
          <div class="h-12 w-12 rounded-full border border-champagne-gold bg-royal-teal flex items-center justify-center mx-auto shadow-sm">
            <span class="text-champagne-gold font-bold font-sans">GA</span>
          </div>
          <h2 class="text-xl font-extrabold text-royal-teal uppercase tracking-wide">
            {{ 'AUTH.REGISTER_TITLE' | translate }}
          </h2>
          <p class="text-xs text-deep-teal/50 font-sans">
            {{ langService.lang() === 'ar' ? 'سجل حساباً وتراخيصك الرسمية معنا للتوثيقات' : 'Join the official GACAM portal network' }}
          </p>
        </div>

        <!-- Form fields -->
        <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="flex flex-col gap-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Full name -->
            <div class="flex flex-col gap-1.5">
              <label for="reg-name" class="text-xs font-bold text-deep-teal">{{ 'COMMON.FULL_NAME' | translate }} *</label>
              <input id="reg-name" type="text" formControlName="fullName" class="px-4 py-2 text-xs border border-champagne-gold/30 rounded-lg bg-light-ivory focus:outline-royal-teal font-sans" placeholder="e.g., Omar Al-Harbi" />
            </div>
            <!-- Email -->
            <div class="flex flex-col gap-1.5">
              <label for="reg-email" class="text-xs font-bold text-deep-teal">{{ 'COMMON.EMAIL' | translate }} *</label>
              <input id="reg-email" type="email" formControlName="email" class="px-4 py-2 text-xs border border-champagne-gold/30 rounded-lg bg-light-ivory focus:outline-royal-teal font-sans" placeholder="omar&#64;newsagency.com" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Phone -->
            <div class="flex flex-col gap-1.5">
              <label for="reg-phone" class="text-xs font-bold text-deep-teal">{{ 'COMMON.PHONE' | translate }} *</label>
              <input id="reg-phone" type="text" formControlName="phoneNumber" class="px-4 py-2 text-xs border border-champagne-gold/30 rounded-lg bg-light-ivory focus:outline-royal-teal font-sans" placeholder="+1 (416) 555-0199" />
            </div>
            <!-- Agency -->
            <div class="flex flex-col gap-1.5">
              <label for="reg-org" class="text-xs font-bold text-deep-teal">{{ langService.lang() === 'ar' ? 'الجهة الإعلامية المنتسب لها' : 'Affiliated Media Body' }} *</label>
              <input id="reg-org" type="text" formControlName="organization" class="px-4 py-2 text-xs border border-champagne-gold/30 rounded-lg bg-light-ivory focus:outline-royal-teal font-sans" placeholder="e.g., Canada Broadcasting Corp" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Password -->
            <div class="flex flex-col gap-1.5">
              <label for="reg-pass" class="text-xs font-bold text-deep-teal">{{ 'COMMON.PASSWORD' | translate }} *</label>
              <input id="reg-pass" type="password" formControlName="password" class="px-4 py-2 text-xs border border-champagne-gold/30 rounded-lg bg-light-ivory focus:outline-royal-teal font-sans" placeholder="Minimum 6 characters" />
            </div>
            <!-- Country code -->
            <div class="flex flex-col gap-1.5">
              <label for="reg-country" class="text-xs font-bold text-deep-teal">{{ langService.lang() === 'ar' ? 'الدولة والمدينة الحالية' : 'Country / Location' }} *</label>
              <input id="reg-country" type="text" formControlName="country" class="px-4 py-2 text-xs border border-champagne-gold/30 rounded-lg bg-light-ivory focus:outline-royal-teal font-sans" placeholder="e.g., Canada" />
            </div>
          </div>


          <!-- CTA Buttons -->
          <button type="submit" [disabled]="registerForm.invalid || loading()" class="mt-4 px-6 py-3 bg-royal-teal text-white font-bold hover:bg-champagne-gold hover:text-royal-teal text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5">
            @if (loading()) {
              <span class="animate-spin text-xs">...</span>
            } @else {
              <mat-icon class="text-sm">person_add</mat-icon>
            }
            <span>{{ 'NAV.REGISTER' | translate }}</span>
          </button>
        </form>

        <!-- Redirect options -->
        <div class="mt-6 pt-4 border-t border-light-ivory text-center text-xs font-medium text-deep-teal/75">
          <span>{{ 'AUTH.ALREADY_ACCOUNT' | translate }}</span> &nbsp;
          <a routerLink="/login" class="text-champagne-gold font-bold hover:text-royal-teal transition-colors">
            {{ 'NAV.LOGIN' | translate }}
          </a>
        </div>

      </div>
    </main>

    <app-footer></app-footer>
  `
})
export class RegisterComponent {
  langService = inject(LanguageService);
  authService = inject(AuthService);
  toastService = inject(ToastService);
  router = inject(Router);

  loading = signal(false);

  registerForm = new FormGroup({
    fullName: new FormControl('', [Validators.required, Validators.minLength(4)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    phoneNumber: new FormControl('', [Validators.required]),
    organization: new FormControl('', [Validators.required]),
    country: new FormControl('Canada', [Validators.required])
  });

  onRegister() {
    if (this.registerForm.invalid) return;
    this.loading.set(true);

    this.authService.register(this.registerForm.value).subscribe({
      next: (user) => {
        this.loading.set(false);
        this.toastService.showSuccess(`Welcome, ${user.fullName}! Account created.`);
        this.router.navigate(['/services']);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.showError('Registration failed. Email address may be registered already.');
      }
    });
  }
}
