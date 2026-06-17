import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GacamApiService } from '../../core/services/gacam-api';
import { AuthService } from '../../core/services/auth';
import { LanguageService } from '../../core/services/language';
import { ToastService } from '../../shared/components/toast/toast';
import { Certificate, Course, Enrollment, Payment } from '../../models/types';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { FooterComponent } from '../../shared/components/footer/footer';
import { TranslatePipe } from '../../shared/pipes/translate';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, NavbarComponent, FooterComponent, TranslatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
  langService  = inject(LanguageService);
  authService  = inject(AuthService);
  apiService   = inject(GacamApiService);
  toastService = inject(ToastService);
  router       = inject(Router);

  courses      = signal<Course[]>([]);
  enrollments  = signal<Enrollment[]>([]);
  payments     = signal<Payment[]>([]);
  certificates = signal<Certificate[]>([]);

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

  // ── Role badge helpers ───────────────────────────────────────────
  /**
   * Returns the highest-priority role label from the user's roles array.
   * Priority: Admin > Employee > Volunteer > User
   */
  getUserRoleLabel(): string {
    const roles: string[] = this.authService.currentUser()?.roles ?? [];
    const isAr = this.langService.lang() === 'ar';

    if (roles.some(r => r.toLowerCase() === 'admin'))
      return isAr ? 'مدير' : 'Admin';
    if (roles.some(r => r.toLowerCase() === 'employee'))
      return isAr ? 'موظف' : 'Employee';
    if (roles.some(r => r.toLowerCase() === 'volunteer'))
      return isAr ? 'متطوع' : 'Volunteer';
    return isAr ? 'عضو' : 'User';
  }

  /**
   * Returns Tailwind classes for the avatar ring + badge background
   * based on the user's highest role.
   */
  getRoleStyles(): { ring: string; badge: string; icon: string } {
    const roles: string[] = this.authService.currentUser()?.roles ?? [];

    if (roles.some(r => r.toLowerCase() === 'admin'))
      return {
        ring:  'border-red-400',
        badge: 'bg-red-500 text-white',
        icon:  'shield'
      };
    if (roles.some(r => r.toLowerCase() === 'employee'))
      return {
        ring:  'border-blue-400',
        badge: 'bg-blue-500 text-white',
        icon:  'badge'
      };
    if (roles.some(r => r.toLowerCase() === 'volunteer'))
      return {
        ring:  'border-emerald-400',
        badge: 'bg-emerald-500 text-white',
        icon:  'volunteer_activism'
      };
    // Default: User
    return {
      ring:  'border-champagne-gold',
      badge: 'bg-champagne-gold text-royal-teal',
      icon:  'person'
    };
  }

  // ────────────────────────────────────────────────────────────────
  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.fetchCatalog();
    this.fetchProfileHistories();
  }

  fetchCatalog() {
    this.apiService.getCourses().subscribe({
      next: (data) => this.courses.set(data),
      error: () => this.toastService.showError('Unable to fetch curriculum catalog.')
    });
  }

  fetchProfileHistories() {
    this.apiService.getMyEnrollments().subscribe(data => this.enrollments.set(data));
    this.apiService.getMyPayments().subscribe(data => this.payments.set(data));
    this.apiService.getMyCertificates().subscribe(data => this.certificates.set(data));
  }

  // ── Payment Modal ────────────────────────────────────────────────
  openPayModal(course: Course) {
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
      this.fetchProfileHistories();

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

  // ── Helpers ──────────────────────────────────────────────────────
  getCourseTitle(en: any): string {
    if (!en) return '';
    const courseId     = en.courseId    ?? en.CourseId;
    const localTitleEn = en.courseTitleEn || en.CourseTitleEn || en.course?.titleEn || en.course?.TitleEn;
    const localTitleAr = en.courseTitleAr || en.CourseTitleAr || en.course?.titleAr || en.course?.TitleAr;

    if (courseId !== undefined) {
      const course = this.courses().find(c => c.id === Number(courseId));
      if (course) return this.langService.lang() === 'ar' ? course.titleAr : course.titleEn;
    }

    if (this.langService.lang() === 'ar' && localTitleAr) return localTitleAr;
    if (localTitleEn) return localTitleEn;
    return this.langService.lang() === 'ar' ? `دورة رقم ${courseId ?? ''}` : `Course #${courseId ?? ''}`;
  }

  getEnrollmentStatusText(status: any): string {
    if (status == null) return '';
    const s = String(status);
    const isAr = this.langService.lang() === 'ar';
    if (s === '0' || s === 'PendingPayment') return isAr ? 'قيد الانتظار' : 'Pending Review';
    if (s === '1' || s === 'Approved')       return isAr ? 'مقبول'        : 'Approved';
    if (s === '2' || s === 'Rejected')       return isAr ? 'مرفوض'        : 'Rejected';
    return s;
  }

  getEnrollmentStatusClass(status: any): string {
    if (status == null) return 'bg-gray-100 text-gray-700';
    const s = String(status);
    if (s === '0' || s === 'PendingPayment') return 'bg-yellow-100 text-yellow-700 font-bold';
    if (s === '1' || s === 'Approved')       return 'bg-emerald-100 text-emerald-700 font-bold';
    if (s === '2' || s === 'Rejected')       return 'bg-red-100 text-red-700 font-bold';
    return 'bg-gray-100 text-gray-700';
  }

  /** IDs of enrollments currently requesting a certificate */
  certLoadingIds = signal<Set<number>>(new Set());

  isApproved(status: any): boolean {
    const s = String(status ?? '');
    return s === '1' || s === 'Approved';
  }

  /**
   * Returns the certificate linked to this enrollment (by relatedRecordId),
   * or undefined if none exists yet.
   */
  getCertForEnrollment(en: Enrollment): Certificate | undefined {
    return this.certificates().find(
      c => (c.relatedRecordId ?? (c as any).RelatedRecordId) === en.courseId
    );
  }

  issueCert(en: Enrollment) {
    // Mark this enrollment as loading
    this.certLoadingIds.update(ids => new Set([...ids, en.id]));

    this.apiService.issueCertificate({
      fullNameOnCertificate: this.authService.currentUser()?.fullName,
      type: 0,
      relatedRecordId: en.courseId
    }).subscribe({
      next: (cert) => {
        this.certLoadingIds.update(ids => { const s = new Set(ids); s.delete(en.id); return s; });
        this.certificates.update(curr => [cert, ...curr]);
        this.toastService.showSuccess(
          this.langService.lang() === 'ar'
            ? 'تم إصدار الشهادة بنجاح!'
            : 'Certificate issued successfully!'
        );
      },
      error: () => {
        this.certLoadingIds.update(ids => { const s = new Set(ids); s.delete(en.id); return s; });
        this.toastService.showError(
          this.langService.lang() === 'ar'
            ? 'تعذّر إصدار الشهادة. تأكد من اعتماد تسجيلك أولاً.'
            : 'Could not issue certificate. Make sure your enrollment is approved.'
        );
      }
    });
  }

  downloadCert(cert: Certificate) {
    if (typeof window !== 'undefined') {
      window.open(this.apiService.downloadCertificateUrl(cert.id), '_blank');
    }
  }
}