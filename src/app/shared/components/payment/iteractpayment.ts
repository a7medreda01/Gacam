import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LanguageService } from '../../../core/services/language';
@Component({
  selector: 'app-interac-payment-banner',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="px-3 py-2.5 bg-champagne-gold/10 border border-champagne-gold/20 rounded-lg flex items-center justify-between gap-3">
      <div class="flex items-center gap-2 min-w-0">
        <mat-icon class="text-royal-teal text-base shrink-0">account_balance</mat-icon>
        <div class="min-w-0">
          <p class="text-[10px] font-bold uppercase tracking-widest text-deep-teal/60">
            {{ langService.lang() === 'ar' ? 'الدفع عبر Interac e‑Transfer إلى' : 'Send Interac e‑Transfer to' }}
          </p>
          <p class="text-xs font-extrabold text-royal-teal font-mono truncate">{{ email }}</p>
        </div>
      </div>

      <button type="button" (click)="copyEmail()"
              class="shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
              [class.text-green-600]="copied()"
              [class.bg-green-50]="copied()"
              [class.text-royal-teal\\/70]="!copied()"
              [class.hover:text-royal-teal]="!copied()"
              [class.hover:bg-royal-teal\\/10]="!copied()"
              [attr.aria-label]="langService.lang() === 'ar' ? 'نسخ البريد الإلكتروني' : 'Copy email'">
        @if (copied()) {
          <mat-icon class="text-base">check</mat-icon>
          <span class="text-[10px] font-bold">{{ langService.lang() === 'ar' ? 'تم النسخ' : 'Copied' }}</span>
        } @else {
          <mat-icon class="text-base">content_copy</mat-icon>
        }
      </button>
    </div>
  `,
})
export class InteracPaymentBannerComponent {
  /** الإيميل المعروض — ممكن تغيّره من بره لو عايز إيميل مختلف في مكان معيّن */
  @Input() email = 'media@gacam.ca';

  protected copied = signal(false);

  constructor(protected langService: LanguageService) {}

  copyEmail(): void {
    navigator.clipboard.writeText(this.email)
      .then(() => {
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2000);
      })
      .catch(err => console.error('Copy failed:', err));
  }
}