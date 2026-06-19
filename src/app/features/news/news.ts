import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
}