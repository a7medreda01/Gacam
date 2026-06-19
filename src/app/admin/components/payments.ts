import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { GacamApiService } from '../../core/services/gacam-api';
import { LanguageService } from '../../core/services/language';
import { ToastService } from '../../shared/components/toast/toast';
import { Enrollment, Payment } from '../../models/types';
import { TranslatePipe } from '../../shared/pipes/translate';

@Component({
  selector: 'app-admin-payments',
  imports: [CommonModule, MatIconModule, TranslatePipe],
  templateUrl: './payments.html',
  styleUrl: './payments.css'
})
export class AdminPaymentsComponent implements OnInit {
  private apiService   = inject(GacamApiService);
  langService          = inject(LanguageService);
  private toastService = inject(ToastService);

  loading         = signal(true);
  payments        = signal<Payment[]>([]);
  enrollments     = signal<Enrollment[]>([]);
  previewImageUrl = signal<string | null>(null);

  // Pagination and search states
  currentPage = signal(1);
  pageSize = signal(10);
  totalCount = signal(0);
  totalPages = signal(0);
  hasNext = signal(false);
  hasPrevious = signal(false);
  paymentSearch = signal('');
  paymentStatusFilter = signal<number | undefined>(undefined);

  private searchTimeout: any = null;

  // للـ drawer الجانبي
  drawerEnrollment = signal<Enrollment | null>(null);
  drawerPayment    = signal<Payment | null>(null);

  ngOnInit() { this.fetchAll(); }

  fetchAll() {
    this.loading.set(true);
    this.apiService.getAllPayments(
      this.currentPage(),
      this.pageSize(),
      this.paymentSearch(),
      this.paymentStatusFilter()
    ).subscribe({
      next: (data) => {
        this.payments.set(data.items);
        this.totalCount.set(data.totalCount);
        this.totalPages.set(data.totalPages);
        this.hasNext.set(data.hasNext);
        this.hasPrevious.set(data.hasPrevious);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
    this.apiService.getAllEnrollments().subscribe({
next: (data) => this.enrollments.set(data.items),     });
  }

  onSearchChange(searchval: string) {
    this.paymentSearch.set(searchval);
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.fetchAll();
    }, 400);
  }

  onStatusChange(statusval: string) {
    const s = statusval === '' ? undefined : Number(statusval);
    this.paymentStatusFilter.set(s);
    this.currentPage.set(1);
    this.fetchAll();
  }

  nextPage() {
    if (this.hasNext()) {
      this.currentPage.update(p => p + 1);
      this.fetchAll();
    }
  }

  prevPage() {
    if (this.hasPrevious()) {
      this.currentPage.update(p => p - 1);
      this.fetchAll();
    }
  }

  changePageSize(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.fetchAll();
  }

  // ── Related Enrollment/Payment lookup ───────────────────────────
  getRelatedEnrollment(pay: Payment): Enrollment | null {
    return this.enrollments().find(e => e.id === pay.relatedRecordId) ?? null;
  }

  getRelatedPayment(enrollment: Enrollment): Payment | null {
    return this.payments().find(p => p.relatedRecordId === enrollment.id && p.type === 1) ?? null;
  }

  openEnrollmentDrawer(pay: Payment) {
    const en = this.getRelatedEnrollment(pay);
    if (!en) {
      this.toastService.showError('No enrollment record linked to this payment.');
      return;
    }
    this.drawerPayment.set(null);
    this.drawerEnrollment.set(en);
  }

  openPaymentDrawer(enrollment: Enrollment) {
    const pay = this.getRelatedPayment(enrollment);
    if (!pay) {
      this.toastService.showError('No payment record linked to this enrollment.');
      return;
    }
    this.drawerEnrollment.set(null);
    this.drawerPayment.set(pay);
  }

  closeDrawer() {
    this.drawerEnrollment.set(null);
    this.drawerPayment.set(null);
  }

  // ── Receipt Preview ──────────────────────────────────────────────
  openReceipt(url: string | null | undefined) {
    if (!url) return;
    if (url.toLowerCase().includes('.pdf')) {
      window.open(url, '_blank');
    } else {
      this.previewImageUrl.set(url);
    }
  }

  closePreview() { this.previewImageUrl.set(null); }

  // ── Status Helpers ───────────────────────────────────────────────
  isPending(status: number | string): boolean {
    const s = String(status);
    return s === '0' || s === 'PendingVerification' || s === 'Pending';
  }

  getPaymentStatusText(status: number | string): string {
    const s    = String(status);
    const isAr = this.langService.lang() === 'ar';
    if (s === '0') return isAr ? 'قيد التحقق'       : 'Pending Verification';
    if (s === '1') return isAr ? 'تم الدفع / مقبول' : 'Paid / Approved';
    if (s === '2') return isAr ? 'مرفوض'            : 'Rejected';
    if (s === '3') return isAr ? 'مسترجع'           : 'Refunded';
    return String(status);
  }

  getPaymentStatusClass(status: number | string): string {
    const s = String(status);
    if (s === '0') return 'bg-yellow-100 text-yellow-700 font-bold';
    if (s === '1') return 'bg-emerald-100 text-emerald-700 font-bold';
    if (s === '2') return 'bg-red-100 text-red-700 font-bold';
    if (s === '3') return 'bg-blue-100 text-blue-700 font-bold';
    return 'bg-gray-100 text-gray-700';
  }

  getEnrollmentStatusText(status: number | string): string {
    const s    = String(status);
    const isAr = this.langService.lang() === 'ar';
    if (s === '0') return isAr ? 'قيد الانتظار' : 'Pending';
    if (s === '1') return isAr ? 'مقبول'        : 'Approved';
    if (s === '2') return isAr ? 'مرفوض'        : 'Rejected';
    return String(status);
  }

  getEnrollmentStatusClass(status: number | string): string {
    const s = String(status);
    if (s === '0') return 'bg-yellow-100 text-yellow-700 font-bold';
    if (s === '1') return 'bg-emerald-100 text-emerald-700 font-bold';
    if (s === '2') return 'bg-red-100 text-red-700 font-bold';
    return 'bg-gray-100 text-gray-700';
  }

  // ── Review Actions ───────────────────────────────────────────────
  approvePayment(id: number) {
    this.apiService.reviewPayment(id, true, 'Interac match verified. Approved.').subscribe({
      next:  () => { this.toastService.showSuccess('Payment approved!'); this.fetchAll(); this.closeDrawer(); },
      error: () =>   this.toastService.showError('Could not approve payment.')
    });
  }

  rejectPayment(id: number) {
    this.apiService.reviewPayment(id, false, 'Payment could not be verified.').subscribe({
      next:  () => { this.toastService.showSuccess('Payment rejected.'); this.fetchAll(); this.closeDrawer(); },
      error: () =>   this.toastService.showError('Could not reject payment.')
    });
  }
}