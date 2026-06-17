import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { GacamApiService } from '../../../core/services/gacam-api';
import { LanguageService } from '../../../core/services/language';
import { NewsArticle } from '../../../models/types';
import { ToastService } from '../../../shared/components/toast/toast';


@Component({
  selector: 'app-admin-news',
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './news.html',
//   styleUrl: './news.css'
})
export class AdminNewsComponent implements OnInit {
  private apiService   = inject(GacamApiService);
  langService          = inject(LanguageService);
  private toastService = inject(ToastService);

  loading       = signal(true);
  news          = signal<NewsArticle[]>([]);
  filterType    = signal<number | undefined>(undefined); // 0=News, 1=PressRelease

  // Drawer
  drawerArticle = signal<NewsArticle | null>(null);

  // Modal (Create / Edit)
  showModal     = signal(false);
  editingId     = signal<number | null>(null);
  saving        = signal(false);

  // Delete confirmation
  deleteTargetId = signal<number | null>(null);
  deleting       = signal(false);

  // Form model
  form = {
    titleEn:    '',
    titleAr:    '',
    contentEn:  '',
    contentAr:  '',
    imageUrl:   '',
    type:       0,   // 0 = News, 1 = PressRelease
    isActive:   true
  };

  ngOnInit() { this.fetchNews(); }

  fetchNews() {
    this.loading.set(true);
    this.apiService.getNews(this.filterType()).subscribe({
      next:  (data) => { this.news.set(data); this.loading.set(false); },
      error: ()     => { this.toastService.showError('Failed to load news.'); this.loading.set(false); }
    });
  }

  setFilter(type: number | undefined) {
    this.filterType.set(type);
    this.fetchNews();
  }

  // ── Drawer ───────────────────────────────────────────────────────
  openDrawer(article: NewsArticle) { this.drawerArticle.set(article); }
  closeDrawer()                    { this.drawerArticle.set(null); }

  // ── Modal ────────────────────────────────────────────────────────
  openCreateModal() {
    this.editingId.set(null);
    this.form = { titleEn: '', titleAr: '', contentEn: '', contentAr: '', imageUrl: '', type: 0, isActive: true };
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
      type:      article.type === 'News' ? 0 : 1,
      isActive:  true
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
    const payload = { ...this.form, imageUrl: this.form.imageUrl || null };
    const id = this.editingId();

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
  confirmDelete(id: number) {
    this.deleteTargetId.set(id);
    this.drawerArticle.set(null);
  }

  cancelDelete() { this.deleteTargetId.set(null); }

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
  getTypeLabel(type: 'News' | 'PressRelease' | number): string {
    const isAr = this.langService.lang() === 'ar';
    const t = typeof type === 'number' ? (type === 0 ? 'News' : 'PressRelease') : type;
    if (t === 'PressRelease') return isAr ? 'بيان صحفي' : 'Press Release';
    return isAr ? 'خبر' : 'News';
  }

  getTypeClass(type: 'News' | 'PressRelease'): string {
    return type === 'PressRelease'
      ? 'bg-blue-100 text-blue-700 font-bold'
      : 'bg-emerald-100 text-emerald-700 font-bold';
  }
}