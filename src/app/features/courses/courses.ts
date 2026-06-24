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
import { TranslatePipe } from '../../shared/pipes/translate';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, TranslatePipe],
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
    if (this.authService.isLoggedIn()) {
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
    if (!this.authService.isLoggedIn()) {
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
    if (file) this.setReceiptFile(file);
  }

  onReceiptSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (file) this.setReceiptFile(file);
  }

  // ── Receipt helpers ──────────────────────────────────────────────

  /** Validate file type then store it */
  private setReceiptFile(file: File) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      this.toastService.showError(
        this.langService.lang() === 'ar'
          ? 'صيغة الملف غير مدعومة. يُرجى رفع صورة (JPG, PNG, WEBP) أو PDF.'
          : 'Unsupported file type. Please upload an image (JPG, PNG, WEBP) or PDF.'
      );
      return;
    }
    this.receiptFile.set(file);
    this.receiptFileName.set(file.name);
  }

  /** Convert any image to JPG before upload; PDF passes through unchanged */
  private convertToJpg(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      if (file.type === 'application/pdf') { resolve(file); return; }

      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width  = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        // White background so transparent PNGs don't go black
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        canvas.toBlob(blob => {
          if (!blob) { reject(new Error('Canvas toBlob failed')); return; }
          const jpgName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
          resolve(new File([blob], jpgName, { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.92);
      };

      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
      img.src = url;
    });
  }

  // ── Submit ───────────────────────────────────────────────────────
  private submitInProgress = false;   // prevents double-submit

  async onSubmitPayment() {
    if (this.payForm.invalid) return;
    const course = this.payTargetCourse();
    if (!course) return;
    if (this.submitInProgress) return;   // block repeated taps

    this.submitInProgress = true;
    this.payLoading.set(true);

    try {
      // 1. Upload receipt (converted to JPG) if provided
      let receiptUrl = '';
      const rawFile = this.receiptFile();
      if (rawFile) {
        let jpgFile: File;
        try {
          jpgFile = await this.convertToJpg(rawFile);
        } catch {
          this.toastService.showError(
            this.langService.lang() === 'ar'
              ? 'تعذّر معالجة الصورة. حاول مرة أخرى أو اختر ملفاً مختلفاً.'
              : 'Could not process the image. Please try again or choose a different file.'
          );
          return;   // finally block will reset flags
        }

        const uploadRes: any = await this.apiService.uploadPaymentReceipt(jpgFile).toPromise();
        receiptUrl = uploadRes?.absoluteUrl || uploadRes?.AbsoluteUrl || '';

        if (!receiptUrl) {
          this.toastService.showError(
            this.langService.lang() === 'ar'
              ? 'فشل رفع الإيصال. تأكد من الملف وحاول مجدداً.'
              : 'Receipt upload failed. Please check the file and try again.'
          );
          return;   // finally block will reset flags
        }
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
      this.submitInProgress = false;   // always unlock after response
    }
  }

  interacCopied = signal(false);

  copyInteracEmail(): void {
    navigator.clipboard.writeText('media@gacam.ca')
      .then(() => {
        this.interacCopied.set(true);
        setTimeout(() => this.interacCopied.set(false), 2000);
      })
      .catch(err => console.error('Copy failed:', err));
  }
}