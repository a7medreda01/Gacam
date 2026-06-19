/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GacamApiService } from '../../core/services/gacam-api';
import { AuthService } from '../../core/services/auth';
import { LanguageService } from '../../core/services/language';
import { ToastService } from '../../shared/components/toast/toast';
import { Course, Enrollment } from '../../models/types';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { FooterComponent } from '../../shared/components/footer/footer';
import { TranslatePipe } from '../../shared/pipes/translate';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, NavbarComponent, FooterComponent, TranslatePipe],
  templateUrl: './courses.html',
  styleUrl: './courses.css'
})
export class CoursesComponent implements OnInit {
  langService  = inject(LanguageService);
  authService  = inject(AuthService);
  apiService   = inject(GacamApiService);
  toastService = inject(ToastService);
  router       = inject(Router);

  courses     = signal<Course[]>([]);
  enrollments = signal<Enrollment[]>([]);
  loading     = signal(true);

  // ── Enrolled course IDs (computed from enrollments) ──────────────
  enrolledCourseIds = computed<Set<number>>(() => {
    const ids = new Set<number>();
    for (const en of this.enrollments()) {
      const id = en.courseId ?? (en as any).CourseId;
      if (id !== undefined && id !== null) ids.add(Number(id));
    }
    return ids;
  });

  isEnrolled(courseId: number): boolean {
    return this.enrolledCourseIds().has(courseId);
  }

  // ── Payment Modal ────────────────────────────────────────────────
  showPayModal     = signal(false);
  payTargetCourse  = signal<Course | null>(null);
  payLoading       = signal(false);
  receiptFile      = signal<File | null>(null);
  receiptFileName  = signal('');
  receiptDragOver  = signal(false);

  payForm = new FormGroup({
    senderName:      new FormControl('', [Validators.required]),
    referenceNumber: new FormControl('', [Validators.required, Validators.minLength(4)]),
    amount:          new FormControl<number>(0, [Validators.required, Validators.min(1)])
  });

  // ────────────────────────────────────────────────────────────────
  ngOnInit() {
    this.fetchCatalog();
    if (this.authService.isAuthenticated()) {
      this.fetchMyEnrollments();
    }
  }

  fetchCatalog() {
    this.loading.set(true);
    this.apiService.getCourses().subscribe({
      next: (data) => { this.courses.set(data?.items || data); this.loading.set(false); },
      error: () => {
        this.toastService.showError('Unable to fetch curriculum catalog.');
        this.loading.set(false);
      }
    });
  }

  fetchMyEnrollments() {
    this.apiService.getMyEnrollments().subscribe({
      next: (data: unknown) => {
        let list: any[] = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data && typeof data === 'object') {
          const obj = data as Record<string, any>;
          if (Array.isArray(obj['items'])) list = obj['items'];
          else if (Array.isArray(obj['data'])) list = obj['data'];
        }
        this.enrollments.set(list);
      },
      error: () => this.enrollments.set([])
    });
  }

  // ── Payment Modal ────────────────────────────────────────────────
  openPayModal(course: Course) {
    if (!this.authService.isAuthenticated()) {
      this.toastService.showError(
        this.langService.lang() === 'ar' ? 'يجب تسجيل الدخول أولاً للتسجيل في دورة.' : 'Please log in first to enroll in a course.'
      );
      this.router.navigate(['/login']);
      return;
    }

    this.payTargetCourse.set(course);
    this.payForm.reset();
    this.payForm.patchValue({ amount: course.feeAmount });
    this.receiptFile.set(null);
    this.receiptFileName.set('');
    this.showPayModal.set(true);
  }

  closePayModal() {
    this.showPayModal.set(false);
    this.payTargetCourse.set(null);
  }

  onReceiptDragOver(e: DragEvent)  { e.preventDefault(); this.receiptDragOver.set(true);  }
  onReceiptDragLeave(e: DragEvent) { e.preventDefault(); this.receiptDragOver.set(false); }

  onReceiptDrop(e: DragEvent) {
    e.preventDefault();
    this.receiptDragOver.set(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) { this.receiptFile.set(file); this.receiptFileName.set(file.name); }
  }

  onReceiptSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (file) { this.receiptFile.set(file); this.receiptFileName.set(file.name); }
  }

  async onSubmitPayment() {
    if (this.payForm.invalid) return;
    const course = this.payTargetCourse();
    if (!course) return;

    this.payLoading.set(true);

    try {
      // 1. Upload receipt if provided
      let receiptUrl = '';
      const file = this.receiptFile();
      if (file) {
        const uploadRes: any = await this.apiService.uploadPaymentReceipt(file).toPromise();
        receiptUrl = uploadRes?.absoluteUrl || uploadRes?.AbsoluteUrl || '';
      }

      // 2. Check if already enrolled (avoid duplicate enrollment)
      const existingEnrollments = this.enrollments();
      let enrollmentId: number;

      const existing = existingEnrollments.find(
        en => (en.courseId ?? (en as any).CourseId) === course.id
      );

      if (existing) {
        enrollmentId = existing.id;
      } else {
        const enrollment = await this.apiService.enrollCourse(course.id).toPromise();
        enrollmentId = enrollment?.id ?? 0;
      }

      // 3. Submit payment linked to enrollment
      const payload = {
        amount:          this.payForm.value.amount,
        senderName:      this.payForm.value.senderName,
        referenceNumber: this.payForm.value.referenceNumber,
        receiptUrl:      receiptUrl,
        type:            1,
        relatedRecordId: enrollmentId
      };

      await this.apiService.submitPayment(payload).toPromise();

      this.toastService.showSuccess(
        this.langService.lang() === 'ar'
          ? 'تم إرسال طلب التسجيل وبيانات الدفع بنجاح! سيتم مراجعتها من قِبل الإدارة.'
          : 'Enrollment & payment submitted successfully! Our team will verify and confirm shortly.'
      );

      this.closePayModal();
      this.fetchMyEnrollments();

    } catch (err: any) {
      const msg = err?.error?.Message || err?.message || '';
      this.toastService.showError(
        msg.includes('already enrolled')
          ? (this.langService.lang() === 'ar' ? 'أنت مسجل في هذه الدورة مسبقاً.' : 'You are already enrolled in this course.')
          : 'Could not complete enrollment or payment submission. Please try again.'
      );
    } finally {
      this.payLoading.set(false);
    }
  }
}