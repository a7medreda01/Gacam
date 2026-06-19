import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { GacamApiService } from '../../core/services/gacam-api';
import { LanguageService } from '../../core/services/language';
import { ToastService } from '../../shared/components/toast/toast';
import { AccreditationCategory } from '../../models/types';

@Component({
  selector: 'app-admin-accreditation-categories',
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './accreditation-categories.html',
})
export class AdminAccreditationCategoriesComponent implements OnInit {
  apiService   = inject(GacamApiService);
  langService  = inject(LanguageService);
  toastService = inject(ToastService);

  loading    = signal(true);
  categories = signal<AccreditationCategory[]>([]);

  // Modal State
  showModal = signal(false);
  editingId = signal<number | null>(null);
  saving    = signal(false);

  // Delete State
  deleteTargetId = signal<number | null>(null);
  deleting       = signal(false);

  // Form Model
  form = {
    nameEn: '',
    nameAr: ''
  };

  ngOnInit() {
    this.fetchCategories();
  }

  fetchCategories() {
    this.loading.set(true);
    this.apiService.getAccreditationCategories().subscribe({
      next: (data) => {
        this.categories.set(data?.items || data);
        this.loading.set(false);
      },
      error: () => {
        this.toastService.showError('Failed to load accreditation categories.');
        this.loading.set(false);
      }
    });
  }

  openCreateModal() {
    this.editingId.set(null);
    this.form = { nameEn: '', nameAr: '' };
    this.showModal.set(true);
  }

  openEditModal(cat: AccreditationCategory) {
    this.editingId.set(cat.id);
    this.form = {
      nameEn: cat.nameEn,
      nameAr: cat.nameAr
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveCategory() {
    if (!this.form.nameEn.trim() || !this.form.nameAr.trim()) {
      this.toastService.showError('All fields (Name EN, Name AR) are required.');
      return;
    }

    this.saving.set(true);
    const id = this.editingId();
    const req$ = id
      ? this.apiService.updateAccreditationCategory(id, this.form)
      : this.apiService.createAccreditationCategory(this.form);

    req$.subscribe({
      next: () => {
        this.toastService.showSuccess(id ? 'Category updated.' : 'Category created.');
        this.saving.set(false);
        this.closeModal();
        this.fetchCategories();
      },
      error: () => {
        this.toastService.showError('Could not save category.');
        this.saving.set(false);
      }
    });
  }

  confirmDelete(id: number) {
    this.deleteTargetId.set(id);
  }

  cancelDelete() {
    this.deleteTargetId.set(null);
  }

  executeDelete() {
    const id = this.deleteTargetId();
    if (id === null) return;
    this.deleting.set(true);
    this.apiService.deleteAccreditationCategory(id).subscribe({
      next: () => {
        this.toastService.showSuccess('Category deleted.');
        this.deleting.set(false);
        this.deleteTargetId.set(null);
        this.fetchCategories();
      },
      error: () => {
        this.toastService.showError('Could not delete category.');
        this.deleting.set(false);
      }
    });
  }
}
