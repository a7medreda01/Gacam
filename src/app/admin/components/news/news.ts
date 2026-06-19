import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { GacamApiService } from '../../../core/services/gacam-api';
import { LanguageService } from '../../../core/services/language';
import { NewsArticle } from '../../../models/types';
import { ToastService } from '../../../shared/components/toast/toast';

// Maps NewsType enum string → number (matches C# enum order)
const NEWS_TYPE_MAP: Record<string, number> = {
  News:          0,
  PressRelease:  1,
  Announcement:  2,
  Statement:     3,
  EventAndForum: 4,
  Initiative:    5,
};

@Component({
  selector: 'app-admin-news',
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './news.html',
})
export class AdminNewsComponent implements OnInit {
  private apiService   = inject(GacamApiService);
  langService          = inject(LanguageService);
  private toastService = inject(ToastService);

  loading    = signal(true);
  news       = signal<NewsArticle[]>([]);
  filterType = signal<number | undefined>(undefined);

  // Pagination
  currentPage  = signal(1);
  pageSize     = signal(10);
  totalCount   = signal(0);
  totalPages   = signal(0);
  hasNext      = signal(false);
  hasPrevious  = signal(false);
  newsSearch   = signal('');

  private searchTimeout: any = null;

  // Drawer
  drawerArticle = signal<NewsArticle | null>(null);

  // Modal
  showModal = signal(false);
  editingId = signal<number | null>(null);
  saving    = signal(false);

  // Delete
  deleteTargetId = signal<number | null>(null);
  deleting       = signal(false);

  // Form — type stored as string internally, converted to number on save
  form: {
    titleEn:   string;
    titleAr:   string;
    contentEn: string;
    contentAr: string;
    imageUrl:  string;
    type:      string;   // 'News' | 'PressRelease' | ...
    isActive:  boolean;
  } = {
    titleEn:   '',
    titleAr:   '',
    contentEn: '',
    contentAr: '',
    imageUrl:  '',
    type:      'News',
    isActive:  true,
  };

  ngOnInit() { this.fetchNews(); }

  // ── Data ────────────────────────────────────────────────────────
  fetchNews() {
    this.loading.set(true);
    this.apiService.getNews(
      this.filterType(),
      this.currentPage(),
      this.pageSize(),
      this.newsSearch()
    ).subscribe({
      next: (data) => {
        this.news.set(data.items);
        this.totalCount.set(data.totalCount);
        this.totalPages.set(data.totalPages);
        this.hasNext.set(data.hasNext);
        this.hasPrevious.set(data.hasPrevious);
        this.loading.set(false);
      },
      error: () => {
        this.toastService.showError('Failed to load news.');
        this.loading.set(false);
      }
    });
  }

  onSearchChange(searchval: string) {
    this.newsSearch.set(searchval);
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.fetchNews();
    }, 400);
  }

  setFilter(type: number | undefined) {
    this.filterType.set(type);
    this.currentPage.set(1);
    this.fetchNews();
  }

  nextPage() {
    if (this.hasNext()) { this.currentPage.update(p => p + 1); this.fetchNews(); }
  }

  prevPage() {
    if (this.hasPrevious()) { this.currentPage.update(p => p - 1); this.fetchNews(); }
  }

  changePageSize(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.fetchNews();
  }

  // ── Drawer ───────────────────────────────────────────────────────
  openDrawer(article: NewsArticle)  { this.drawerArticle.set(article); }
  closeDrawer()                     { this.drawerArticle.set(null); }

  // ── Modal ────────────────────────────────────────────────────────
  openCreateModal() {
    this.editingId.set(null);
    this.form = { titleEn: '', titleAr: '', contentEn: '', contentAr: '', imageUrl: '', type: 'News', isActive: true };
    this.showModal.set(true);
  }

  openEditModal(article: NewsArticle) {
    this.editingId.set(article.id);
    this.form = {
      titleEn:   article.titleEn,
      titleAr:   article.titleAr,
      contentEn: article.contentEn,
      contentAr: article.contentAr,
      imageUrl:  article.imageUrl ?? '',
      type:      article.type,   // already a string e.g. 'PressRelease'
      isActive:  true,
    };
    this.showModal.set(true);
    this.drawerArticle.set(null);
  }

  closeModal() { this.showModal.set(false); }

  saveNews() {
    if (!this.form.titleEn.trim() || !this.form.titleAr.trim()) {
      this.toastService.showError('Title (EN & AR) are required.');
      return;
    }
    this.saving.set(true);

    // Convert string type → number for the API
    const payload = {
      ...this.form,
      type:     NEWS_TYPE_MAP[this.form.type] ?? 0,
      imageUrl: this.form.imageUrl || null,
    };

    const id   = this.editingId();
    const req$ = id
      ? this.apiService.updateNews(id, payload)
      : this.apiService.createNews(payload);

    req$.subscribe({
      next: () => {
        this.toastService.showSuccess(id ? 'Article updated.' : 'Article created.');
        this.saving.set(false);
        this.closeModal();
        this.fetchNews();
      },
      error: () => {
        this.toastService.showError('Could not save article.');
        this.saving.set(false);
      }
    });
  }

  // ── Delete ───────────────────────────────────────────────────────
  confirmDelete(id: number) { this.deleteTargetId.set(id); this.drawerArticle.set(null); }
  cancelDelete()            { this.deleteTargetId.set(null); }

  executeDelete() {
    const id = this.deleteTargetId();
    if (id === null) return;
    this.deleting.set(true);
    this.apiService.deleteNews(id).subscribe({
      next: () => {
        this.toastService.showSuccess('Article deleted.');
        this.deleting.set(false);
        this.deleteTargetId.set(null);
        this.fetchNews();
      },
      error: () => {
        this.toastService.showError('Could not delete article.');
        this.deleting.set(false);
      }
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────
getTypeLabel(type: string | number): string {
  const isAr = this.langService.lang() === 'ar';
  const map: Record<number, string> = {
    0: isAr ? 'خبر'       : 'News',
    1: isAr ? 'بيان صحفي' : 'Press Release',
    2: isAr ? 'إعلان'     : 'Announcement',
    3: isAr ? 'تصريح'     : 'Statement',
    4: isAr ? 'فعالية'    : 'Event & Forum',
    5: isAr ? 'مبادرة'    : 'Initiative',
  };
  return map[+type] ?? String(type);
}

getTypeClass(type: string | number): string {
  const classes: Record<number, string> = {
    0: 'bg-emerald-100 text-emerald-700',
    1: 'bg-blue-100 text-blue-700',
    2: 'bg-purple-100 text-purple-700',
    3: 'bg-orange-100 text-orange-700',
    4: 'bg-pink-100 text-pink-700',
    5: 'bg-yellow-100 text-yellow-700',
  };
  return (classes[+type] ?? 'bg-gray-100 text-gray-700') + ' font-bold';
}
}