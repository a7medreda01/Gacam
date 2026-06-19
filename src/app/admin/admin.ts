import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth';
import { LanguageService } from '../core/services/language';
import { ToastService } from '../shared/components/toast/toast';
import { TranslatePipe } from '../shared/pipes/translate';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, MatIconModule, TranslatePipe],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminLayoutComponent implements OnInit {
  langService  = inject(LanguageService);
  authService  = inject(AuthService);
  private toastService = inject(ToastService);
  private router       = inject(Router);

  sidebarOpen = signal(false);

  ngOnInit() {
    if (!this.authService.isStaff()) {
      this.toastService.showError('Access Denied: Terminal restricted to GACAM Administrative Personnel.');
      this.router.navigate(['/']);
    }
  }

  toggleSidebar()  { this.sidebarOpen.update(v => !v); }
  closeSidebar()   { this.sidebarOpen.set(false); }
  leaveAdmin()     { this.router.navigate(['/']); }
}