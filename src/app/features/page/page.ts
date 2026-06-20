import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { GacamApiService } from '../../core/services/gacam-api';
import { LanguageService } from '../../core/services/language';
import { TranslatePipe } from '../../shared/pipes/translate';

interface PageDataModel {
  slug: string;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  imageUrl?: string | null;
}

@Component({
  selector: 'app-dynamic-page',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  template: `
    <main class="min-h-screen bg-light-ivory py-16">
      <div class="container-gacam max-w-5xl">
        
        @if (loading()) {
          <div class="flex flex-col items-center justify-center py-20 animate-pulse">
            <mat-icon class="text-4xl text-royal-teal animate-spin mb-4">hourglass_empty</mat-icon>
            <p class="text-xs text-deep-teal/60 font-sans">
              {{ langService.lang() === 'ar' ? 'جاري تحميل تفاصيل الصفحة...' : 'Loading page details...' }}
            </p>
          </div>
        } @else if (pageData(); as data) {
          <article class="bg-white rounded-3xl border border-champagne-gold/15 shadow-md overflow-hidden animate-fade-in">
            
            <!-- Hero banner if imageUrl is NOT null/empty -->
            @if (data.imageUrl) {
              <div class="relative h-64 md:h-80 w-full overflow-hidden border-b border-champagne-gold/25">
                <img 
                  [src]="data.imageUrl" 
                  [alt]="langService.lang() === 'ar' ? data.titleAr : data.titleEn"
                  class="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  referrerpolicy="no-referrer"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-8">
                  <div class="text-white text-start">
                    <span class="text-xs font-bold uppercase tracking-widest text-champagne-gold mb-2 block">GACAM Dynamic Node</span>
                    <h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight">
                      {{ langService.lang() === 'ar' ? data.titleAr : data.titleEn }}
                    </h1>
                  </div>
                </div>
              </div>
            } @else {
              <!-- Standard clean header without Image -->
              <div class="bg-gradient-to-r from-royal-teal to-deep-teal p-8 md:p-12 text-start border-b border-champagne-gold/20">
                <div class="flex items-center gap-3 mb-2">
                  <div class="h-8 w-8 rounded-full bg-champagne-gold/20 border border-champagne-gold/30 flex items-center justify-center text-champagne-gold">
                    <mat-icon class="text-sm">description</mat-icon>
                  </div>
                  <span class="text-xs font-bold uppercase tracking-widest text-champagne-gold">GACAM Information Node</span>
                </div>
                <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {{ langService.lang() === 'ar' ? data.titleAr : data.titleEn }}
                </h1>
              </div>
            }

            <!-- Body Content Section -->
            <div class="p-8 sm:p-12 text-start">
              <div class="text-xs sm:text-sm text-deep-teal/85 leading-relaxed font-sans whitespace-pre-line prose max-w-none">
                {{ langService.lang() === 'ar' ? data.contentAr : data.contentEn }}
              </div>
            </div>

            <!-- Bottom Back navigation -->
            <div class="bg-light-ivory/40 px-8 py-4 border-t border-champagne-gold/10 flex justify-between items-center text-xs">
              <span class="text-deep-teal/60">Slug: {{ data.slug }}</span>
              <a routerLink="/" class="flex items-center gap-1.5 font-bold text-royal-teal hover:text-champagne-gold duration-150">
                <mat-icon class="text-sm">home</mat-icon>
                <span>{{ langService.lang() === 'ar' ? 'الرجوع للرئيسية' : 'Back to Home' }}</span>
              </a>
            </div>

          </article>
        } @else {
          <!-- Page Not Found fallback -->
          <div class="bg-white rounded-3xl border border-champagne-gold/15 p-12 shadow-sm text-center">
            <mat-icon class="text-4xl text-champagne-gold mb-3">error_outline</mat-icon>
            <h2 class="text-lg font-bold text-royal-teal mb-2">
              {{ langService.lang() === 'ar' ? 'الصفحة غير متوفرة حالياً' : 'Page Not Found' }}
            </h2>
            <p class="text-xs text-deep-teal/60 mb-6 font-sans">
              {{ langService.lang() === 'ar' ? 'الصفحة المطلوبة لم يتم العثور عليها أو تم تعليق محتواها مؤقتاً.' : 'The requested node is not initialized or does not exist.' }}
            </p>
            <a routerLink="/" class="inline-flex items-center gap-2 px-5 py-2.5 bg-royal-teal text-white border border-champagne-gold/20 text-xs font-bold rounded-lg hover:bg-champagne-gold hover:text-royal-teal duration-150">
              <mat-icon class="text-sm">arrow_back</mat-icon>
              <span>{{ langService.lang() === 'ar' ? 'الرجوع للرئيسية' : 'Return Home' }}</span>
            </a>
          </div>
        }

      </div>
    </main>
  `
})
export class PageComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  apiService = inject(GacamApiService);
  langService = inject(LanguageService);

  pageData = signal<PageDataModel | null>(null);
  loading = signal(false);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.fetchPage(slug);
      }
    });
  }

  fetchPage(slug: string) {
    this.loading.set(true);
    this.apiService.getPage(slug).subscribe({
      next: (data) => {
        this.pageData.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.pageData.set(null);
        this.loading.set(false);
      }
    });
  }
}
