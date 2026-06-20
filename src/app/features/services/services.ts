import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { GacamApiService } from '../../core/services/gacam-api';
import { AuthService } from '../../core/services/auth';
import { LanguageService } from '../../core/services/language';
import { ToastService } from '../../shared/components/toast/toast';
import { Accreditation, AccreditationCategory, ServiceFee } from '../../models/types';
import { TranslatePipe } from '../../shared/pipes/translate';
import { MediaCardComponent } from './media-card/media-card';

const CARD_STATUS_LABELS: Record<number, string> = {
  0: 'ACTIVE', 1: 'EXPIRED', 2: 'SUSPENDED', 3: 'REVOKED',
};

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule, MatIconModule,
    TranslatePipe, MediaCardComponent
  ],
  templateUrl: './services.html',
  // styleUrl: './services.css'
})
export class ServicesComponent implements OnInit {
  langService  = inject(LanguageService);
  authService  = inject(AuthService);
  apiService   = inject(GacamApiService);
  toastService = inject(ToastService);

  loading       = signal(true);
  submitting    = signal(false);
  myApplication = signal<Accreditation | null>(null);
  categories    = signal<AccreditationCategory[]>([]);

  applyForm = new FormGroup({
    category: new FormControl('', [Validators.required]),
    document: new FormControl<File | null>(null),
  });


cardFee = signal<ServiceFee | null>(null);

ngOnInit() {
  this.checkApplication();
  this.fetchCategories();
  this.fetchServiceFees();
}

fetchServiceFees() {
  this.apiService.getServiceFees().subscribe({
    next: (fees) => {
      const card = fees.find(f => f.orderType === 1 && f.isActive);
      this.cardFee.set(card ?? null);
    }
  });
}

totalFee(): number {
  const fee = this.cardFee();
  return fee ? fee.unitPrice + fee.shippingFee : 0;
}

  fetchCategories() {
    this.apiService.getAccreditationCategories().subscribe({
      next: (cats) => {
        const items = cats?.items || cats;
        this.categories.set(items);
        if (items.length > 0 && !this.applyForm.value.category) {
          this.applyForm.patchValue({ category: String(items[0].id) });
        }
      }
    });
  }

  checkApplication() {
    if (!this.authService.isLoggedIn()) {
      this.loading.set(false);
      return;
    }

    this.apiService.getMyAccreditation().subscribe({
      next:  (app) => { this.myApplication.set(app); this.loading.set(false); },
      error: ()    => this.loading.set(false),
    });
  }

  onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.applyForm.patchValue({ document: file });
  }

  onApply() {
    if (this.applyForm.invalid) return;
    this.submitting.set(true);

    const { category, document } = this.applyForm.value;
    this.apiService.applyAccreditation(category!, document ?? undefined).subscribe({
      next: (res) => {
        this.myApplication.set(res);
        this.submitting.set(false);
        this.toastService.showSuccess(
          this.langService.lang() === 'ar'
            ? 'تم تقديم طلبك بنجاح! سيتم مراجعته من قِبل فريق GACAM.'
            : 'Application submitted! GACAM staff will review it shortly.'
        );
      },
      error: () => {
        this.toastService.showError(
          this.langService.lang() === 'ar'
            ? 'فشل تقديم الطلب. حاول مجدداً.'
            : 'Unable to submit application. Please try again.'
        );
        this.submitting.set(false);
      },
    });
  }

  requestCertificate() {
    const app = this.myApplication();
    if (!app) return;

    this.apiService.issueCertificate({
      fullNameOnCertificate: app.userFullName,
      type:                  0,
      relatedRecordId:       app.id,
    }).subscribe({
      next: (cert) => {
        this.toastService.showSuccess(
          this.langService.lang() === 'ar'
            ? 'تم إصدار شهادتك! سيبدأ التنزيل فوراً.'
            : 'Certificate issued! Starting download…'
        );
        const url = this.apiService.downloadCertificateUrl(cert.id);
        if (typeof window !== 'undefined') window.open(url, '_blank');
      },
      error: () => this.toastService.showError('Could not process certificate request.'),
    });
  }

  /* ── Display helpers — accept string or number from API ── */

  private toStr(val: string | number | undefined | null): string {
    return val == null ? '' : String(val);
  }

  categoryLabel(app: Accreditation | null | undefined): string {
    if (!app) return '';
    return this.langService.lang() === 'ar' ? app.categoryNameAr : app.categoryNameEn;
  }

  statusLabel(status: string | number | undefined | null): string {
    if (status == null) return '';
    if (typeof status === 'string') return status;
    const map: Record<number, string> = { 0: 'Pending', 1: 'Approved', 2: 'Rejected', 3: 'Refunded' };
    return map[status] ?? '';
  }

  statusBadgeClass(status: string | number | undefined | null): string {
    const s = this.toStr(status).toLowerCase();
    if (s === 'pending'  || s === '0') return 'bg-amber-100 text-amber-700';
    if (s === 'approved' || s === '1') return 'bg-emerald-100 text-emerald-700';
    if (s === 'rejected' || s === '2') return 'bg-red-100 text-red-700';
    if (s === 'refunded' || s === '3') return 'bg-gray-100 text-gray-500';
    return 'bg-gray-100 text-gray-500';
  }

  isPending(status: string | number | undefined | null): boolean {
    const s = this.toStr(status).toLowerCase();
    return s === 'pending' || s === '0';
  }

  isApproved(status: string | number | undefined | null): boolean {
    const s = this.toStr(status).toLowerCase();
    return s === 'approved' || s === '1';
  }

  isRejected(status: string | number | undefined | null): boolean {
    const s = this.toStr(status).toLowerCase();
    return s === 'rejected' || s === '2';
  }

  isRefunded(status: string | number | undefined | null): boolean {
    const s = this.toStr(status).toLowerCase();
    return s === 'refunded' || s === '3';
  }

  cardStatusLabel(status: number | undefined | null): string {
    if (status == null) return 'ACTIVE';
    return CARD_STATUS_LABELS[status] ?? 'ACTIVE';
  }

  cardStatusClass(status: number | undefined | null): string {
    const map: Record<number, string> = {
      0: 'bg-emerald-500 text-white', // Active
      1: 'bg-orange-500 text-white',  // Expired
      2: 'bg-yellow-500 text-white',  // Suspended
      3: 'bg-red-500 text-white',     // Revoked
    };
    return status != null ? (map[status] ?? 'bg-emerald-500 text-white') : 'bg-emerald-500 text-white';
  }



  // ── Order Modal State ──
  showOrderModal       = signal(false);
  orderLoading         = signal(false);
  orderReceiptFile     = signal<File | null>(null);
  orderReceiptFileName = signal('');
  orderDragOver        = signal(false);
  orderStep            = signal<1 | 2>(1);

  orderForm = new FormGroup({
    senderName:      new FormControl('', [Validators.required]),
    referenceNumber: new FormControl('', [Validators.required, Validators.minLength(4)]),
    amount:          new FormControl<number>(0, [Validators.required, Validators.min(1)]),
    notes:           new FormControl(''),
    phone:           new FormControl('', [Validators.pattern(/^[0-9+\-\s()]{7,20}$/)]),
    address:         new FormControl('', [Validators.maxLength(500)]),
  });

  openOrderModal() {
    const fee = this.cardFee();
    const total = fee ? fee.unitPrice + fee.shippingFee : 0;
    this.orderForm.reset();
    this.orderForm.patchValue({ amount: total });
    this.orderReceiptFile.set(null);
    this.orderReceiptFileName.set('');
    this.orderStep.set(1);
    this.showOrderModal.set(true);
  }

  closeOrderModal() {
    this.showOrderModal.set(false);
  }

  goToOrderStep2() { this.orderStep.set(2); }
  goToOrderStep1() { this.orderStep.set(1); }

  onOrderDragOver(e: DragEvent)  { e.preventDefault(); this.orderDragOver.set(true); }
  onOrderDragLeave(e: DragEvent) { e.preventDefault(); this.orderDragOver.set(false); }
  onOrderDrop(e: DragEvent) {
    e.preventDefault(); this.orderDragOver.set(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) { this.orderReceiptFile.set(file); this.orderReceiptFileName.set(file.name); }
  }
  onOrderFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (file) { this.orderReceiptFile.set(file); this.orderReceiptFileName.set(file.name); }
  }

  async onSubmitCardOrder() {
    if (this.orderStep() !== 2 || this.orderForm.invalid) return;
    const app = this.myApplication();
    if (!app) return;

    this.orderLoading.set(true);
    try {
      // 1. Create Order — type = 1 (بطاقة اعتماد)
      const order = await this.apiService.createOrder({
        orderType:       1, // AccreditationCardPrint
        relatedRecordId: app.id,
        quantity:        1,
        notes:           this.orderForm.value.notes ?? '',
        phone:           this.orderForm.value.phone  || undefined,
        address:         this.orderForm.value.address || undefined,
      }).toPromise();

      if (!order) throw new Error('Order creation failed.');

      // 2. Upload receipt
      let receiptUrl = '';
      const file = this.orderReceiptFile();
      if (file) {
        const uploadRes: any = await this.apiService.uploadPaymentReceipt(file).toPromise();
        receiptUrl = uploadRes?.absoluteUrl || uploadRes?.AbsoluteUrl || '';
      }

      // 3. Submit Payment
      const payment = await this.apiService.submitPayment({
        amount:          order.totalAmount,
        senderName:      this.orderForm.value.senderName,
        referenceNumber: this.orderForm.value.referenceNumber,
        receiptUrl,
        type:            2,
        relatedRecordId: order.id,
      }).toPromise();

      if (!payment) throw new Error('Payment failed.');

      // 4. Link Payment to Order
      await this.apiService.linkOrderPayment(order.id, payment.id).toPromise();

      this.toastService.showSuccess(
        this.langService.lang() === 'ar'
          ? 'تم تقديم طلب طباعة البطاقة بنجاح! سيتم مراجعته قريباً.'
          : 'Card print order submitted successfully!'
      );
      this.closeOrderModal();
    } catch {
      this.toastService.showError('Could not process card order. Please try again.');
    } finally {
      this.orderLoading.set(false);
    }
  }

  getCardOrderTotal(): number {
    const fee = this.cardFee();
    return fee ? fee.unitPrice + fee.shippingFee : 0;
  }
}
