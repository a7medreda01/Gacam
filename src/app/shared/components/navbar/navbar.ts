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
export class NavbarComponent implements OnInit {
  langService = inject(LanguageService);
  authService = inject(AuthService);
  apiService = inject(GacamApiService);

  mobileMenuOpen = signal(false);
  infoDropdownOpen = signal(false);
  mobileSubMenuOpen = signal(false);

  dynamicPages = signal<PageInfoNavbarModel[]>([]);

  // الصفحات اللي بتروح في "المزيد" / "Portals & Policies" dropdown
  // (الأساسيين: الرئيسية، البرامج التدريبية، الخدمات المهنية، التطوع، التحقق، من نحن — موجودين بشكل ثابت في الـ nav)
  sectionsPages = [
    { slug: 'leadership-board-of-directors', labelEn: 'Board of Directors & Leadership', labelAr: 'أعضاء مجلس الإدارة والقيادة', icon: 'groups' },
    { slug: 'media-authority', labelEn: 'Media Oversight', labelAr: 'الإشراف الإعلامي', icon: 'gavel' },
    { slug: 'editorial-policy', labelEn: 'Editorial Policy', labelAr: 'السياسة التحريرية', icon: 'article' },
    { slug: 'complaints-policy', labelEn: 'Complaints & Feedback Policy', labelAr: 'سياسة الشكاوى والملاحظات', icon: 'feedback' },
    { slug: 'corrections-policy', labelEn: 'Corrections & Clarifications Policy', labelAr: 'سياسة التصحيح والتوضيح', icon: 'spellcheck' },
    { slug: 'code-of-ethics', labelEn: 'Code of Professional Conduct', labelAr: 'ميثاق السلوك المهني', icon: 'verified_user' },
    { slug: 'partners', labelEn: 'Partners & Sponsors', labelAr: 'الشركاء والجهات الداعمة', icon: 'handshake' },
    { slug: 'faq', labelEn: 'FAQ & Help', labelAr: 'الأسئلة الشائعة والمساعدة', icon: 'help_outline' },
    { slug: 'contact-us', labelEn: 'Contact Us', labelAr: 'تواصل معنا', icon: 'alternate_email' },
    { slug: 'terms-of-use', labelEn: 'Terms of Use', labelAr: 'شروط وبنود استخدام الموقع', icon: 'policy' },
    { slug: 'privacy-policy', labelEn: 'Privacy & Security Policy', labelAr: 'سياسة الخصوصية والأمان', icon: 'security' }
  ];

  // slugs اللي ليها لينك ثابت أساسي في الـ nav، عشان منكررش الصفحات الديناميكية المطابقة ليهم في الـ dropdown
  private readonly primarySlugs = new Set([
    'about-us', 'services', 'volunteers', 'volunteer',
    'training-programs', 'courses', 'media-id-verification', 'verify-certificate'
  ]);

  allPagesCombined = computed(() => {
    const list = [...this.sectionsPages];
    const registeredSlugs = new Set(this.sectionsPages.map(p => p.slug));

    for (const dp of this.dynamicPages()) {
      if (!registeredSlugs.has(dp.slug) && !this.primarySlugs.has(dp.slug)) {
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
        this.dynamicPages.set(pages?.items || (Array.isArray(pages) ? pages : []));
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
    if (slug === 'courses' || slug === 'training-programs') return ['/courses'];
    return ['/page', slug];
  }
}