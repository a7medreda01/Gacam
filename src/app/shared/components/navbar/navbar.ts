import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { LanguageService } from '../../../core/services/language';
import { AuthService } from '../../../core/services/auth';
import { GacamApiService } from '../../../core/services/gacam-api';
import { TranslatePipe } from '../../pipes/translate';

interface PageInfoNavbarModel {
  slug: string;
  titleEn?: string | null;
  titleAr?: string | null;
  imageUrl?: string | null;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, TranslatePipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
/*
    <header class="bg-royal-teal text-white shadow-md border-b border-champagne-gold/20">
      <!-- Upper Info Bar -->
      <div class="bg-deep-teal/40 border-b border-white/5 py-1.5 md:py-2">
        <div class="container-gacam flex flex-col sm:flex-row justify-between items-center text-xs gap-2">
          <div class="flex items-center gap-4">
            <span class="flex items-center gap-1 text-white/80">
              <mat-icon class="text-champagne-gold text-sm h-4 w-4">email</mat-icon>
              <span>info&#64;gacam.media</span>
            </span>
            <span class="flex items-center gap-1 text-white/80">
              <mat-icon class="text-champagne-gold text-sm h-4 w-4">phone</mat-icon>
              <span>+1 (437) 990-0166</span>
            </span>
          </div>
          <div class="flex items-center gap-4 text-white/80">
            <span>One Media • One Future</span>
            <div class="flex items-center gap-2">
              <a href="https://facebook.com/gacam" target="_blank" class="hover:text-champagne-gold transition-colors">
                <mat-icon class="text-xs h-4.5 w-4.5">public</mat-icon>
              </a>
              <a href="https://instagram.com/gacam" target="_blank" class="hover:text-champagne-gold transition-colors">
                <mat-icon class="text-xs h-4.5 w-4.5">photo_camera</mat-icon>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Navigation Menu -->
      <div class="container-gacam py-3 md:py-4 flex justify-between items-center">
        <!-- Logo Brand & Slogan -->
        <a routerLink="/" class="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <!-- Stylized GACAM badge in SVG or text if needed. Inline golden seal looks premium -->
          <div class="h-10 w-10 md:h-12 md:w-12 rounded-full border border-champagne-gold bg-gradient-to-tr from-deep-teal to-royal-teal flex items-center justify-center shadow-inner">
            <span class="text-champagne-gold font-bold text-lg md:text-xl font-sans tracking-widest text-shadow">GA</span>
          </div>
          <div class="flex flex-col">
            <span class="font-bold text-base md:text-lg tracking-wider font-sans uppercase">GACAM</span>
            <span class="text-[9px] md:text-[10px] text-champagne-gold font-medium tracking-widest">
              {{ langService.lang() === 'ar' ? 'الهيئة العامة للإعلام بكندا' : 'Audiovisual Media Canada' }}
            </span>
          </div>
        </a>

        <!-- Desktop Links -->
        <nav class="hidden lg:flex items-center gap-6 xl:gap-8 font-medium">
          <a routerLink="/" routerLinkActive="text-champagne-gold border-b-2 border-champagne-gold" [routerLinkActiveOptions]="{exact: true}" class="hover:text-champagne-gold py-1 transition-colors">
            {{ 'NAV.HOME' | translate }}
          </a>
          <a routerLink="/about" routerLinkActive="text-champagne-gold border-b-2 border-champagne-gold" class="hover:text-champagne-gold py-1 transition-colors">
            {{ 'NAV.ABOUT' | translate }}
          </a>
          <a routerLink="/services" routerLinkActive="text-champagne-gold border-b-2 border-champagne-gold" class="hover:text-champagne-gold py-1 transition-colors">
            {{ 'NAV.SERVICES' | translate }}
          </a>
          <a routerLink="/volunteer" routerLinkActive="text-champagne-gold border-b-2 border-champagne-gold" class="hover:text-champagne-gold py-1 transition-colors">
            {{ 'NAV.VOLUNTEER' | translate }}
          </a>
          <a routerLink="/news" routerLinkActive="text-champagne-gold border-b-2 border-champagne-gold" class="hover:text-champagne-gold py-1 transition-colors">
            {{ 'NAV.NEWS' | translate }}
          </a>
          <a routerLink="/verify-certificate" routerLinkActive="text-champagne-gold border-b-2 border-champagne-gold" class="hover:text-champagne-gold py-1 transition-colors">
            {{ 'NAV.TRAINING' | translate }}
          </a>
        </nav>

        <!-- Right Side Controls & Languages -->
        <div class="hidden lg:flex items-center gap-4">
          <!-- Lang switcher -->
          <button (click)="toggleLanguage()" class="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-deep-teal hover:bg-champagne-gold hover:text-royal-teal border border-champagne-gold/30 rounded-lg transition-all font-semibold font-mono">
            <mat-icon class="text-sm">language</mat-icon>
            <span>{{ langService.lang() === 'ar' ? 'English (EN)' : 'العربية (AR)' }}</span>
          </button>

          <!-- Security Action CTAs -->
          @if (authService.isAuthenticated()) {
            <!-- If logged in -->
            <div class="flex items-center gap-3">
              @if (authService.isStaff()) {
                <a routerLink="/admin" class="px-4 py-2 text-xs font-semibold bg-champagne-gold text-royal-teal rounded-lg hover:bg-deep-gold hover:text-white transition-all shadow-sm">
                  {{ 'NAV.ADMIN' | translate }}
                </a>
              } @else {
                <a routerLink="/profile" class="px-4 py-2 text-xs font-semibold bg-champagne-gold text-royal-teal rounded-lg hover:bg-deep-gold hover:text-white transition-all shadow-sm">
                  {{ 'NAV.PROFILE' | translate }}
                </a>
              }
              <button (click)="authService.logout()" class="p-2 text-white/80 hover:text-champagne-gold transition-colors" title="Logout">
                <mat-icon>power_settings_new</mat-icon>
              </button>
            </div>
          } @else {
            <!-- Guest CTAs -->
            <div class="flex items-center gap-2">
              <a routerLink="/login" class="px-4 py-2 text-xs font-semibold hover:text-champagne-gold transition-colors">
                {{ 'NAV.LOGIN' | translate }}
              </a>
              <a routerLink="/register" class="px-4 py-2 text-xs font-semibold bg-champagne-gold text-royal-teal rounded-lg hover:bg-deep-gold hover:text-white transition-all shadow-sm">
                {{ 'NAV.REGISTER' | translate }}
              </a>
            </div>
          }
        </div>

        <!-- Mobile Collapsed Hamburger Menu trigger button -->
        <div class="flex items-center lg:hidden gap-3">
          <!-- Quick lang switcher -->
          <button (click)="toggleLanguage()" class="p-2 text-white/90 border border-white/15 rounded-lg text-xs" title="Translate">
            <mat-icon class="text-sm">language</mat-icon>
          </button>

          <button (click)="mobileMenuOpen.set(!mobileMenuOpen())" class="p-2 text-white hover:text-champagne-gold transition-colors" aria-label="Toggle Navigation">
            <mat-icon>{{ mobileMenuOpen() ? 'close' : 'menu' }}</mat-icon>
          </button>
        </div>
      </div>

      <!-- Mobile Dropdown Links Menu -->
      @if (mobileMenuOpen()) {
        <div class="lg:hidden bg-royal-teal border-t border-white/5 animate-fade-in p-4 mx-2 rounded-b-xl shadow-xl flex flex-col gap-3 font-medium text-sm">
          <a routerLink="/" (click)="mobileMenuOpen.set(false)" class="p-2 hover:bg-deep-teal/40 rounded-lg hover:text-champagne-gold transition-all">
            {{ 'NAV.HOME' | translate }}
          </a>
          <a routerLink="/about" (click)="mobileMenuOpen.set(false)" class="p-2 hover:bg-deep-teal/40 rounded-lg hover:text-champagne-gold transition-all">
            {{ 'NAV.ABOUT' | translate }}
          </a>
          <a routerLink="/services" (click)="mobileMenuOpen.set(false)" class="p-2 hover:bg-deep-teal/40 rounded-lg hover:text-champagne-gold transition-all">
            {{ 'NAV.SERVICES' | translate }}
          </a>
          <a routerLink="/volunteer" (click)="mobileMenuOpen.set(false)" class="p-2 hover:bg-deep-teal/40 rounded-lg hover:text-champagne-gold transition-all">
            {{ 'NAV.VOLUNTEER' | translate }}
          </a>
          <a routerLink="/news" (click)="mobileMenuOpen.set(false)" class="p-2 hover:bg-deep-teal/40 rounded-lg hover:text-champagne-gold transition-all">
            {{ 'NAV.NEWS' | translate }}
          </a>
          <a routerLink="/verify-certificate" (click)="mobileMenuOpen.set(false)" class="p-2 hover:bg-deep-teal/40 rounded-lg hover:text-champagne-gold transition-all">
            {{ 'NAV.TRAINING' | translate }}
          </a>

          <hr class="border-white/10 my-1" />

          @if (authService.isAuthenticated()) {
            <div class="flex flex-col gap-2">
              @if (authService.isStaff()) {
                <a routerLink="/admin" (click)="mobileMenuOpen.set(false)" class="p-2 text-center bg-champagne-gold text-royal-teal font-semibold rounded-lg block">
                  {{ 'NAV.ADMIN' | translate }}
                </a>
              } @else {
                <a routerLink="/profile" (click)="mobileMenuOpen.set(false)" class="p-2 text-center bg-champagne-gold text-royal-teal font-semibold rounded-lg block">
                  {{ 'NAV.PROFILE' | translate }}
                </a>
              }
              <button (click)="authService.logout(); mobileMenuOpen.set(false)" class="p-2 text-center border border-shadow-champagne rounded-lg text-white/80 hover:bg-red-900/10 block w-full">
                {{ 'NAV.LOGOUT' | translate }}
              </button>
            </div>
          } @else {
            <div class="flex flex-col gap-2 pt-1">
              <a routerLink="/login" (click)="mobileMenuOpen.set(false)" class="p-2.5 text-center hover:bg-deep-teal/40 rounded-lg hover:text-champagne-gold transition-all block font-semibold">
                {{ 'NAV.LOGIN' | translate }}
              </a>
              <a routerLink="/register" (click)="mobileMenuOpen.set(false)" class="p-2.5 text-center bg-champagne-gold text-royal-teal font-semibold rounded-lg block hover:bg-deep-gold">
                {{ 'NAV.REGISTER' | translate }}
              </a>
            </div>
          }
        </div>
      }
    </header>
*/

export class NavbarComponent implements OnInit {
  langService = inject(LanguageService);
  authService = inject(AuthService);
  apiService = inject(GacamApiService);

  mobileMenuOpen = signal(false);
  infoDropdownOpen = signal(false);
  mobileSubMenuOpen = signal(false);

  dynamicPages = signal<PageInfoNavbarModel[]>([]);

  sectionsPages = [
    { slug: 'about-us', labelEn: 'About Us', labelAr: 'من نحن', icon: 'info' },
    { slug: 'media-authority', labelEn: 'Media Authority', labelAr: 'الهيئة الإعلامية والرقابية', icon: 'gavel' },
    { slug: 'editorial-policy', labelEn: 'Editorial Policy', labelAr: 'السياسة التحريرية', icon: 'article' },
    { slug: 'complaints-policy', labelEn: 'Complaints Policy', labelAr: 'سياسة الشكاوى والملاحظات', icon: 'feedback' },
    { slug: 'corrections-policy', labelEn: 'Corrections Policy', labelAr: 'سياسة التصحيح والتوضيح', icon: 'spellcheck' },
    { slug: 'code-of-ethics', labelEn: 'Code of Ethics', labelAr: 'ميثاق الشرف الأخلاقي', icon: 'verified_user' },
    { slug: 'services', labelEn: 'Services & Fees', labelAr: 'الخدمات المهنية والرسوم', icon: 'business_center' },
    { slug: 'media-accreditation', labelEn: 'Media Accreditation', labelAr: 'طلب الاعتماد الإعلامي', icon: 'badge' },
    { slug: 'media-id-verification', labelEn: 'Media ID Verification', labelAr: 'التحقق من الهوية الإعلامية', icon: 'assignment_turned_in' },
    { slug: 'training-programs', labelEn: 'Training Programs', labelAr: 'البرامج والورش التدريبية', icon: 'school' },
    { slug: 'volunteers', labelEn: 'Community Volunteers', labelAr: 'التطوع والمساندة المجتمعية', icon: 'volunteer_activism' },
    { slug: 'partners', labelEn: 'Our Core Partners', labelAr: 'الشركاء والجهات الداعمة', icon: 'handshake' },
    { slug: 'news-press-releases', labelEn: 'Press Releases & News', labelAr: 'الأخبار والخبر العاجل', icon: 'campaign' },
    { slug: 'leadership-board-of-directors', labelEn: 'Board of Directors', labelAr: 'أعضاء مجلس الإدارة والقيادة', icon: 'groups' },
    { slug: 'faq', labelEn: 'FAQ', labelAr: 'الأسئلة الشائعة والمساعدة', icon: 'help_outline' },
    { slug: 'contact-us', labelEn: 'Contact Us', labelAr: 'تواصل معنا', icon: 'alternate_email' },
    { slug: 'terms-of-use', labelEn: 'Terms of Use', labelAr: 'شروط وبنود استخدام المواقع', icon: 'policy' },
    { slug: 'privacy-policy', labelEn: 'Privacy Policy', labelAr: 'سياسة الخصوصية والأمان', icon: 'security' }
  ];

  allPagesCombined = computed(() => {
    const list = [...this.sectionsPages];
    const registeredSlugs = new Set(this.sectionsPages.map(p => p.slug));
    
    for (const dp of this.dynamicPages()) {
      if (!registeredSlugs.has(dp.slug)) {
        list.push({
          slug: dp.slug,
          labelEn: dp.titleEn || dp.slug,
          labelAr: dp.titleAr || dp.slug,
          icon: 'description'
        });
      }
    }
    return list;
  });

  ngOnInit() {
    this.apiService.getPages().subscribe({
      next: (pages) => {
        this.dynamicPages.set(pages || []);
      },
      error: () => {
        this.dynamicPages.set([]);
      }
    });
  }

  toggleLanguage() {
    const current = this.langService.lang();
    this.langService.setLanguage(current === 'ar' ? 'en' : 'ar');
  }

  getPageLink(slug: string): string[] {
    if (slug === 'services') return ['/services'];
    if (slug === 'volunteer' || slug === 'volunteers') return ['/volunteer'];
    if (slug === 'news' || slug === 'news-press-releases') return ['/news'];
    if (slug === 'verify-certificate' || slug === 'media-id-verification') return ['/verify-certificate'];
    return ['/page', slug];
  }
}
