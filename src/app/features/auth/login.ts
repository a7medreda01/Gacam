import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth';
import { LanguageService } from '../../core/services/language';
import { ToastService } from '../../shared/components/toast/toast';
import { TranslatePipe } from '../../shared/pipes/translate';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatIconModule, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  langService = inject(LanguageService);
  authService = inject(AuthService);
  toastService = inject(ToastService);
  router = inject(Router);

  loading = signal(false);
  showPassword = signal(false);

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  onLogin() {
    if (this.loginForm.invalid) return;
    this.loading.set(true);

    const { email, password } = this.loginForm.value;

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: (user) => {
        this.loading.set(false);
        this.toastService.showSuccess(`Welcome back, ${user.user.fullName}!`);
        
        // Redirect appropriately using robust case-insensitive check
        if (this.authService.isStaff()) {
          this.router.navigate(['/admin']);
        } else {
          // Redirect to Home as requested: "لما اعمل تسجيل دخول مش بيحولني علي الرئيسية"
          this.router.navigate(['/']);
        }
      },
      error: () => {
        this.loading.set(false);
        this.toastService.showError('Invalid email or password parameters. Access Denied.');
      }
    });
  }
}
