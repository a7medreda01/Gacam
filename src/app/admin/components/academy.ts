import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { GacamApiService } from '../../core/services/gacam-api';
import { LanguageService } from '../../core/services/language';
import { ToastService } from '../../shared/components/toast/toast';
import { Course, Enrollment, Payment } from '../../models/types';
import { TranslatePipe } from '../../shared/pipes/translate';

@Component({
  selector: 'app-admin-academy',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, TranslatePipe],
  templateUrl: './academy.html',
  styleUrl: './academy.css'
})
export class AdminAcademyComponent implements OnInit {
  private apiService  = inject(GacamApiService);
  langService         = inject(LanguageService);
  private toastService = inject(ToastService);
 
  loading       = signal(true);
  courses       = signal<Course[]>([]);
 
  // Pagination and search states
  currentPage = signal(1);
  pageSize = signal(10);
  totalCount = signal(0);
  totalPages = signal(0);
  hasNext = signal(false);
  hasPrevious = signal(false);
  courseSearch = signal('');

  private searchTimeout: any = null;

  /** The course currently being edited — null means "add" mode */
  editingCourse = signal<Course | null>(null);
 
  /** The course queued for deletion (drives the confirmation modal) */
  courseToDelete = signal<Course | null>(null);
 
  courseForm = new FormGroup({
    titleEn:       new FormControl('',   [Validators.required]),
    titleAr:       new FormControl('',   [Validators.required]),
    descriptionEn: new FormControl('',   [Validators.required]),
    descriptionAr: new FormControl('',   [Validators.required]),
    feeAmount:     new FormControl(150,  [Validators.required, Validators.min(0)]),
    startDate:     new FormControl('',   [Validators.required]),
    endDate:       new FormControl('',   [Validators.required]),
    isActive:      new FormControl(true)
  });
 
  ngOnInit() { this.fetchCourses(); }
 
  fetchCourses() {
    this.loading.set(true);
    this.apiService.getCourses(
      this.currentPage(),
      this.pageSize(),
      this.courseSearch()
    ).subscribe({
      next:  (data) => {
        this.courses.set(data.items);
        this.totalCount.set(data.totalCount);
        this.totalPages.set(data.totalPages);
        this.hasNext.set(data.hasNext);
        this.hasPrevious.set(data.hasPrevious);
        this.loading.set(false);
      },
      error: ()   => this.loading.set(false)
    });
  }

  onSearchChange(searchval: string) {
    this.courseSearch.set(searchval);
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.fetchCourses();
    }, 400);
  }

  nextPage() {
    if (this.hasNext()) {
      this.currentPage.update(p => p + 1);
      this.fetchCourses();
    }
  }

  prevPage() {
    if (this.hasPrevious()) {
      this.currentPage.update(p => p - 1);
      this.fetchCourses();
    }
  }

  changePageSize(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.fetchCourses();
  }
 
  // ── Form submission (add or update) ─────────────────────────────
 
  onSubmitCourse() {
    if (this.courseForm.invalid) return;
 
    const editing = this.editingCourse();
    if (editing) {
      this.updateCourse(editing.id);
    } else {
      this.createCourse();
    }
  }
 
  private createCourse() {
    this.apiService.createCourse(this.courseForm.value).subscribe({
      next: () => {
        this.toastService.showSuccess('Course added to catalog successfully!');
        this.resetForm();
        this.fetchCourses();
      },
      error: () => this.toastService.showError('Could not add course. Please review the form.')
    });
  }
 
  private updateCourse(id: number) {
    this.apiService.updateCourse(id, this.courseForm.value).subscribe({
      next: () => {
        this.toastService.showSuccess('Course updated successfully!');
        this.resetForm();
        this.fetchCourses();
      },
      error: () => this.toastService.showError('Could not update course.')
    });
  }
 
  // ── Edit helpers ─────────────────────────────────────────────────
 
  startEdit(course: Course) {
    this.editingCourse.set(course);
    this.courseForm.setValue({
      titleEn:       course.titleEn,
      titleAr:       course.titleAr,
      descriptionEn: course.descriptionEn,
      descriptionAr: course.descriptionAr,
      feeAmount:     course.feeAmount,
      startDate:     course.startDate?.slice(0, 10) ?? '',
      endDate:       course.endDate?.slice(0, 10)   ?? '',
      isActive:      course.isActive
    });
  }
 
  cancelEdit() { this.resetForm(); }
 
  private resetForm() {
    this.editingCourse.set(null);
    this.courseForm.reset({ feeAmount: 150, isActive: true });
  }
 
  // ── Delete helpers (two-step: request → confirm / cancel) ────────
 
  requestDelete(course: Course) {
    this.courseToDelete.set(course);
  }
 
  cancelDelete() {
    this.courseToDelete.set(null);
  }
 
  confirmDelete() {
    const course = this.courseToDelete();
    if (!course) return;
 
    this.apiService.deleteCourse(course.id).subscribe({
      next: () => {
        this.toastService.showSuccess('Course deleted successfully.');
        this.courseToDelete.set(null);
        // If we were editing the same course, clear the form too
        if (this.editingCourse()?.id === course.id) this.resetForm();
        this.fetchCourses();
      },
      error: () => {
        this.toastService.showError('Unable to remove course — it may have active student enrollments.');
        this.courseToDelete.set(null);
      }
    });
  }
}