import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { GacamApiService } from '../../core/services/gacam-api';
import { LanguageService } from '../../core/services/language';
import { NewsArticle } from '../../models/types';
import { TranslatePipe } from '../../shared/pipes/translate';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslatePipe],
  templateUrl: './news.component.html',
})
export class NewsComponent implements OnInit {
  langService = inject(LanguageService);
  apiService = inject(GacamApiService);

  // ── State ─────────────────────────────────────────────────────────────────
  loading      = signal(true);
  news         = signal<NewsArticle[]>([]);
  activeFilter = signal<number | undefined>(undefined);
  selectedItem = signal<NewsArticle | null>(null);

  // ── Pagination ─────────────────────────────────────────────────────────────
  readonly PAGE_SIZE = 8;          // cards per page (4-col grid → 2 rows)
  currentPage = signal(1);

  totalPages = computed(() => Math.ceil(this.news().length / this.PAGE_SIZE));

  /** Slice of articles shown on the current page */
  pagedNews = computed(() => {
    const start = (this.currentPage() - 1) * this.PAGE_SIZE;
    return this.news().slice(start, start + this.PAGE_SIZE);
  });

  /**
   * Builds the array of page numbers (and -1 for ellipsis) shown in the
   * pagination bar.  Always shows first, last, current ±1.
   */
  pageNumbers = computed<number[]>(() => {
    const total   = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: number[] = [];
    const add = (n: number) => { if (!pages.includes(n)) pages.push(n); };
    const dots = () => { if (pages[pages.length - 1] !== -1) pages.push(-1); };

    add(1);
    if (current > 3)               dots();
    if (current > 2)               add(current - 1);
                                   add(current);
    if (current < total - 1)       add(current + 1);
    if (current < total - 2)       dots();
                                   add(total);

    return pages;
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0 });
    }
    this.fetchNews();
  }

  // ── Data ───────────────────────────────────────────────────────────────────
  fetchNews() {
    this.loading.set(true);
    this.apiService.getNews(this.activeFilter()).subscribe({
      next: (data) => {
        this.news.set(data?.items ?? data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  changeFilter(type: number | undefined) {
    this.activeFilter.set(type);
    this.currentPage.set(1);   // reset to first page on filter change
    this.fetchNews();
  }

  // ── Pagination helpers ─────────────────────────────────────────────────────
  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // ── Detail popup ───────────────────────────────────────────────────────────
  openDetail(article: NewsArticle) {
    this.selectedItem.set(article);
    this.apiService.viewNewsArticle(article.id).subscribe({
      next: () => { article.viewCount += 1; },
    });
  }

  closeDetail() {
    this.selectedItem.set(null);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  getTypeLabel(type: string | number): string {
    const isAr = this.langService.lang() === 'ar';
    const map: Record<number, string> = {
      0: isAr ? 'خبر' : 'News',
      1: isAr ? 'بيان صحفي' : 'Press Release',
      2: isAr ? 'إعلان' : 'Announcement',
      3: isAr ? 'تصريح' : 'Statement',
      4: isAr ? 'فعالية ومنتدى' : 'Event & Forum',
      5: isAr ? 'مبادرة' : 'Initiative',
    };
    return map[+type] ?? String(type);
  }

  getTypeClass(type: string | number): string {
    const classes: Record<number, string> = {
      0: 'bg-emerald-50 text-emerald-800 border-emerald-200/50',
      1: 'bg-blue-50 text-blue-800 border-blue-200/50',
      2: 'bg-purple-50 text-purple-800 border-purple-200/50',
      3: 'bg-orange-50 text-orange-800 border-orange-200/50',
      4: 'bg-pink-50 text-pink-800 border-pink-200/50',
      5: 'bg-amber-50 text-amber-800 border-amber-200/50',
    };
    return (classes[+type] ?? 'bg-slate-50 text-slate-800 border-slate-200/50') + ' border font-sans font-bold';
  }
}