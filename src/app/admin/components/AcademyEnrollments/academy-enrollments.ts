import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { GacamApiService } from '../../../core/services/gacam-api';
import { LanguageService } from '../../../core/services/language';
import { Course, Enrollment, Payment } from '../../../models/types';
import { ToastService } from '../../../shared/components/toast/toast';

@Component({
  selector: 'app-admin-academy-enrollments',
  imports: [CommonModule, MatIconModule],
  templateUrl: './academy-enrollments.html',
//   styleUrl: './academy-enrollments.css'
})
export class AdminAcademyEnrollmentsComponent implements OnInit {
  private apiService   = inject(GacamApiService);
  langService          = inject(LanguageService);
  private toastService = inject(ToastService);

  loading     = signal(true);
  courses     = signal<Course[]>([]);
  enrollments = signal<Enrollment[]>([]);

  // ── Filter ───────────────────────────────────────────────────────

  activeFilter = signal<string>('all');

  readonly statusFilters = [
    { value: 'all',            label: 'All'     },
    { value: 'PendingPayment', label: 'Pending' },
    { value: 'Approved',       label: 'Approved'},
    { value: 'Rejected',       label: 'Rejected'}
  ];

  filteredEnrollments = computed(() => {
    const filter = this.activeFilter();
    if (filter === 'all') return this.enrollments();

    return this.enrollments().filter(e => {
      const s = String(e.status ?? '');
      if (filter === 'PendingPayment') return s === '0' || s === 'PendingPayment';
      if (filter === 'Approved')       return s === '1' || s === 'Approved';
      if (filter === 'Rejected')       return s === '2' || s === 'Rejected';
      return true;
    });
  });

  // ── Payment Drawer ───────────────────────────────────────────────

  drawerPayment = signal<Payment | null>(null);
  drawerLoading = signal(false);

  ngOnInit() { this.fetchData(); }

  fetchData() {
    this.loading.set(true);
    this.apiService.getCourses().subscribe({
      next: (cs) => {
        this.courses.set(cs);
        this.apiService.getAllEnrollments().subscribe({
          next:  (en) => { this.enrollments.set(en); this.loading.set(false); },
          error: ()   => this.loading.set(false)
        });
      },
      error: () => this.loading.set(false)
    });
  }

  // ── Enrollment actions ───────────────────────────────────────────

  approveEnrollment(id: number, approve: boolean) {
    const newStatus = approve ? 1 : 2;
    this.apiService.reviewEnrollment(id, newStatus, 'Evaluated and verified.').subscribe({
      next: () => {
        this.toastService.showSuccess('Enrollment status updated successfully!');
        this.fetchData();
      },
      error: () => this.toastService.showError('Could not process student enrollment review.')
    });
  }

  showPaymentDrawer(enrollment: Enrollment) {
    if (!enrollment.paymentId) {
      this.toastService.showError('No payment linked to this enrollment yet.');
      return;
    }
    this.drawerLoading.set(true);
    this.drawerPayment.set(null);

    this.apiService.getPaymentById(enrollment.paymentId).subscribe({
      next:  (pay) => { this.drawerPayment.set(pay); this.drawerLoading.set(false); },
      error: ()    => { this.toastService.showError('Could not load payment record.'); this.drawerLoading.set(false); }
    });
  }

  closePaymentDrawer() { this.drawerPayment.set(null); }

  // ── Helpers ──────────────────────────────────────────────────────

  getCourseTitleForEnrollment(en: any): string {
    if (!en) return '';

    const titleEn = en.courseTitleEn ?? en.CourseTitleEn;
    const titleAr = en.courseTitleAr ?? en.CourseTitleAr;

    if (this.langService.lang() === 'ar' && titleAr) return titleAr;
    if (titleEn) return titleEn;

    const courseId = en.courseId ?? en.CourseId;
    if (courseId !== undefined) {
      const course = this.courses().find(c => c.id === Number(courseId));
      if (course) return this.langService.lang() === 'ar' ? course.titleAr : course.titleEn;
    }

    return this.langService.lang() === 'ar' ? `دورة رقم ${courseId ?? ''}` : `Course #${courseId ?? ''}`;
  }

  getEnrollmentStatusText(status: any): string {
    if (status == null) return '';
    const s    = String(status);
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

  isPending(status: any): boolean {
    const s = String(status ?? '');
    return s === '0' || s === 'PendingPayment';
  }
}