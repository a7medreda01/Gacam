import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { LanguageService } from '../../../core/services/language';
import { TranslatePipe } from '../../pipes/translate';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, MatIconModule, TranslatePipe],
  template: `
    <footer class="bg-deep-teal text-white pt-12 md:pt-16 pb-6 border-t-4 border-champagne-gold">
      <div class="container-gacam grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 pb-12 border-b border-white/10">
        
        <!-- Column 1: Brand & Strategic Vision -->
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-full border border-champagne-gold bg-royal-teal flex items-center justify-center">
              <span class="text-champagne-gold font-bold text-sm tracking-widest font-sans">GA</span>
            </div>
            <div class="flex flex-col">
              <span class="font-bold text-base tracking-wider font-sans uppercase">GACAM</span>
              <span class="text-[9px] text-champagne-gold font-semibold uppercase tracking-widest">Canada</span>
            </div>
          </div>
          <p class="text-xs text-white/70 leading-relaxed font-sans">
            {{ 'FOOTER.DESC' | translate }}
          </p>

        </div>

        <!-- Column 2: Public Portals Links -->
        <div class="flex flex-col gap-4">
          <h4 class="text-sm font-bold uppercase tracking-widest text-champagne-gold border-s-2 border-champagne-gold ps-2">
            {{ 'FOOTER.QUICK_ACTIONS' | translate }}
          </h4>
          <nav class="flex flex-col gap-2.5 text-xs text-white/85">
            <a routerLink="/" class="hover:text-champagne-gold transition-colors">→ {{ 'NAV.HOME' | translate }}</a>
            <a routerLink="/about" class="hover:text-champagne-gold transition-colors">→ {{ 'NAV.ABOUT' | translate }}</a>
            <a routerLink="/services" class="hover:text-champagne-gold transition-colors">→ {{ 'NAV.SERVICES' | translate }}</a>
            <a routerLink="/volunteer" class="hover:text-champagne-gold transition-colors">→ {{ 'NAV.VOLUNTEER' | translate }}</a>
            <a routerLink="/news" class="hover:text-champagne-gold transition-colors">→ {{ 'NAV.NEWS' | translate }}</a>
          </nav>
        </div>

        <!-- Column 3: Institutional Protocols -->
        <div class="flex flex-col gap-4">
          <h4 class="text-sm font-bold uppercase tracking-widest text-champagne-gold border-s-2 border-champagne-gold ps-2">
            {{ 'FOOTER.POLICIES' | translate }}
          </h4>
          <nav class="flex flex-col gap-2.5 text-xs text-white/85">
            <a routerLink="/about" class="hover:text-champagne-gold transition-colors">→ {{ 'FOOTER.EDITORIAL' | translate }}</a>
            <a routerLink="/about" class="hover:text-champagne-gold transition-colors">→ {{ 'FOOTER.COMPLAINTS' | translate }}</a>
            <a routerLink="/about" class="hover:text-champagne-gold transition-colors">→ {{ 'FOOTER.CORRECTIONS' | translate }}</a>
            <a routerLink="/about" class="hover:text-champagne-gold transition-colors">→ {{ 'FOOTER.ETHICS' | translate }}</a>
            <a routerLink="/verify-certificate" class="hover:text-champagne-gold transition-colors">→ {{ 'CERT.VERIFY_TITLE' | translate }}</a>
          </nav>
        </div>

        <!-- Column 4: Contact & Locations -->
        <div class="flex flex-col gap-4">
          <h4 class="text-sm font-bold uppercase tracking-widest text-champagne-gold border-s-2 border-champagne-gold ps-2">
            {{ 'FOOTER.HEADQUARTERS' | translate }}
          </h4>
          <div class="flex flex-col gap-3 text-xs text-white/80">
            <span class="flex items-start gap-2">
              <mat-icon class="text-champagne-gold text-lg h-5 w-5">place</mat-icon>
              <span>525 Highland Road West, Kitchener, ON, N2M 5P4</span>
            </span>
            <span class="flex items-center gap-2">
              <mat-icon class="text-champagne-gold text-lg h-5 w-5">email</mat-icon>
              <span>media&#64;gacam.ca</span>
            </span>
            <span class="flex items-center gap-2">
              <mat-icon class="text-champagne-gold text-lg h-5 w-5">phone</mat-icon>
              <span>+1 (416) 832-3566</span>
            </span>
                        <span class="flex items-center gap-2">
              <mat-icon class="text-champagne-gold text-lg h-5 w-5">favorite</mat-icon>
              <a href="https://instagram.com/gacam.ca" target="_blank" rel="noopener noreferrer" class="hover:text-champagne-gold transition-colors">Instagram: @gacam.ca</a>
            </span>
          </div>
        </div>
      </div>

      <!-- Trademark Signatures & Slogan -->
      <div class="container-gacam pt-6 flex flex-col md:flex-row justify-between items-center text-xs gap-3 text-white/60">
        <span>&copy; 2026 GACAM Canada. {{ 'FOOTER.COPYRIGHT' | translate }}</span>
        <div class="flex items-center gap-3">
          <span class="text-champagne-gold">One Media • One Future</span>
          <span class="text-white/20">|</span>

        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  langService = inject(LanguageService);
}