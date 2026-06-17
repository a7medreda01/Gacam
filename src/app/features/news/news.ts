import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { GacamApiService } from '../../core/services/gacam-api';
import { LanguageService } from '../../core/services/language';
import { NewsArticle } from '../../models/types';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { FooterComponent } from '../../shared/components/footer/footer';
import { TranslatePipe } from '../../shared/pipes/translate';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, MatIconModule, NavbarComponent, FooterComponent, TranslatePipe],
  template: `
    <app-navbar></app-navbar>

    <main class="min-h-screen bg-light-ivory py-16">
      <div class="container-gacam">
        <!-- Main title topics -->
        <div class="text-center max-w-3xl mx-auto mb-12 flex flex-col gap-3">
          <span class="text-xs font-bold uppercase tracking-widest text-champagne-gold">Journalistic Bulletins</span>
          <h1 class="text-3xl font-extrabold text-royal-teal tracking-tight">
            {{ 'NAV.NEWS' | translate }}
          </h1>
        </div>

        <!-- Filter tabs bar -->
        <div class="flex justify-center items-center gap-4 mb-10">
          <button (click)="changeFilter(undefined)" class="px-5 py-2 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                  [class.bg-royal-teal]="activeFilter() === undefined" [class.text-white]="activeFilter() === undefined"
                  [class.bg-white]="activeFilter() !== undefined" [class.text-deep-teal]="activeFilter() !== undefined" [class.hover:bg-champagne-gold/15]="activeFilter() !== undefined">
            {{ langService.lang() === 'ar' ? 'الكل' : 'All Stories' }}
          </button>
          <button (click)="changeFilter(0)" class="px-5 py-2 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                  [class.bg-royal-teal]="activeFilter() === 0" [class.text-white]="activeFilter() === 0"
                  [class.bg-white]="activeFilter() !== 0" [class.text-deep-teal]="activeFilter() !== 0" [class.hover:bg-champagne-gold/15]="activeFilter() !== 0">
            {{ langService.lang() === 'ar' ? 'الأخبار العامة' : 'General News' }}
          </button>
          <button (click)="changeFilter(1)" class="px-5 py-2 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                  [class.bg-royal-teal]="activeFilter() === 1" [class.text-white]="activeFilter() === 1"
                  [class.bg-white]="activeFilter() !== 1" [class.text-deep-teal]="activeFilter() !== 1" [class.hover:bg-champagne-gold/15]="activeFilter() !== 1">
            {{ langService.lang() === 'ar' ? 'البيانات الصحفية' : 'Press Releases' }}
          </button>
        </div>

        @if (loading()) {
          <div class="text-center py-20 animate-pulse text-sm font-semibold">
            Fetching articles...
          </div>
        } @else {
          
          @if (news().length === 0) {
            <div class="text-center py-20 bg-white p-8 rounded-2xl border border-champagne-gold/15 max-w-md mx-auto">
              <mat-icon class="text-champagne-gold text-5xl h-12 w-12 mb-3">campaign</mat-icon>
              <h3 class="text-sm font-bold text-royal-teal">No bulletins found</h3>
            </div>
          } @else {
            <!-- News Grids -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              @for (item of news(); track item.id) {
                <div class="bg-white rounded-2xl border border-champagne-gold/15 overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all duration-150">
                  <div class="relative">
                    <img [src]="item.imageUrl" alt="Article Visual" referrerpolicy="no-referrer" class="w-full h-40 object-cover" />
                    <div class="absolute top-3 left-3 bg-royal-teal text-white text-[9px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">
                      {{ item.type === 'PressRelease' ? 'PR' : 'NEWS' }}
                    </div>
                  </div>

                  <div class="p-5 flex-grow flex flex-col gap-3 text-start">
                    <span class="text-[10px] text-deep-teal/50 font-medium flex items-center gap-1 font-mono">
                      <mat-icon class="text-xs h-3.5 w-3.5 leading-none">calendar_today</mat-icon>
                      <span>{{ item.publishedAt | date:'shortDate' }}</span>
                      <span>•</span>
                      <mat-icon class="text-xs h-3.5 w-3.5 leading-none">visibility</mat-icon>
                      <span>{{ item.viewCount }}</span>
                    </span>

                    <h3 class="text-sm font-bold text-royal-teal line-clamp-2">
                      {{ langService.lang() === 'ar' ? item.titleAr : item.titleEn }}
                    </h3>
                    <p class="text-xs text-deep-teal/70 leading-relaxed line-clamp-3 font-sans">
                      {{ langService.lang() === 'ar' ? item.contentAr : item.contentEn }}
                    </p>
                  </div>

                  <div class="p-5 pt-0 text-start">
                    <button (click)="openDetail(item)" class="text-xs font-bold text-champagne-gold hover:text-royal-teal transition-colors flex items-center gap-1 cursor-pointer">
                      <span>{{ langService.lang() === 'ar' ? 'قراءة التقرير بالكامل' : 'Read Full Story' }}</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              }
            </div>
          }

        }

      </div>
    </main>

    <!-- Detailed Popup Overlay -->
    @if (selectedItem()) {
      <div class="fixed inset-0 bg-deep-teal/70 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in">
        <div class="bg-white rounded-3xl border border-champagne-gold/20 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl p-6 sm:p-8 flex flex-col gap-6 text-start relative">
          
          <!-- Close button -->
          <button (click)="closeDetail()" class="absolute top-4 right-4 text-deep-teal/50 hover:text-royal-teal transition-colors flex items-center justify-center p-1 border border-light-ivory rounded-full">
            <mat-icon>close</mat-icon>
          </button>

          <!-- Type and Date tags -->
          <div class="flex items-center gap-3 text-xs font-semibold">
            <span class="px-3 py-1 bg-royal-teal text-white rounded-lg">
              {{ selectedItem()?.type === 'PressRelease' ? 'Press Release' : 'General News' }}
            </span>
            <span class="text-deep-teal/60 font-mono">{{ selectedItem()?.publishedAt | date:'medium' }}</span>
            <span class="text-deep-teal/60 flex items-center gap-1 font-mono">
              <mat-icon class="text-xs h-3.5 w-3.5">visibility</mat-icon>
              <span>{{ selectedItem()?.viewCount }}</span>
            </span>
          </div>

          <!-- Banner Image fallback -->
          <img [src]="selectedItem()?.imageUrl" alt="Spotlight Banner" referrerpolicy="no-referrer" class="w-full h-56 object-cover rounded-2xl shadow-inner border border-champagne-gold/15" />

          <!-- Title -->
          <h2 class="text-lg sm:text-xl font-extrabold text-royal-teal leading-snug">
            {{ langService.lang() === 'ar' ? selectedItem()?.titleAr : selectedItem()?.titleEn }}
          </h2>

          <!-- Content -->
          <p class="text-xs sm:text-sm text-deep-teal/85 leading-relaxed font-sans whitespace-pre-line border-t border-light-ivory pt-4">
            {{ langService.lang() === 'ar' ? selectedItem()?.contentAr : selectedItem()?.contentEn }}
          </p>

          <!-- Close actions -->
          <div class="flex justify-end pt-4 border-t border-light-ivory">
            <button (click)="closeDetail()" class="px-5 py-2 bg-light-ivory text-royal-teal hover:bg-champagne-gold hover:text-royal-teal text-xs font-bold rounded-xl transition-all cursor-pointer">
              {{ 'COMMON.BACK' | translate }}
            </button>
          </div>
        </div>
      </div>
    }

    <app-footer></app-footer>
  `
})
export class NewsComponent implements OnInit {
  langService = inject(LanguageService);
  apiService = inject(GacamApiService);

  loading = signal(true);
  news = signal<NewsArticle[]>([]);
  activeFilter = signal<number | undefined>(undefined);
  selectedItem = signal<NewsArticle | null>(null);

  ngOnInit() {
    this.fetchNews();
  }

  fetchNews() {
    this.loading.set(true);
    this.apiService.getNews(this.activeFilter()).subscribe({
      next: (data) => {
        this.news.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  changeFilter(type: number | undefined) {
    this.activeFilter.set(type);
    this.fetchNews();
  }

  openDetail(article: NewsArticle) {
    this.selectedItem.set(article);
    // Increment view count on backend
    this.apiService.viewNewsArticle(article.id).subscribe({
      next: () => {
        article.viewCount += 1;
      }
    });
  }

  closeDetail() {
    this.selectedItem.set(null);
  }
}
