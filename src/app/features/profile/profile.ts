import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GacamApiService } from '../../core/services/gacam-api';
import { AuthService } from '../../core/services/auth';
import { LanguageService } from '../../core/services/language';
import { ToastService } from '../../shared/components/toast/toast';
import { Certificate, Course, Enrollment, Payment, Order, OrderType, ServiceFee } from '../../models/types';
import { TranslatePipe } from '../../shared/pipes/translate';
import { InteracPaymentBannerComponent } from '../../shared/components/payment/iteractpayment';
type MobileProfileTab = 'catalog' | 'courses' | 'payments' | 'certificates' | 'orders';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule, TranslatePipe, InteracPaymentBannerComponent],
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
  orders       = signal<Order[]>([]);

  activeMobileTab = signal<MobileProfileTab>('courses');

  // ── Print Order Modal ─────────────────────────────────────────────
  showOrderModal       = signal(false);
  orderTargetId        = signal<number | null>(null);
  orderTargetType      = signal<OrderType | null>(null);
  orderLoading         = signal(false);
  orderReceiptFile     = signal<File | null>(null);
  orderReceiptFileName = signal('');
  orderDragOver        = signal(false);
  serviceFees          = signal<ServiceFee[]>([]);

  orderForm = new FormGroup({
    senderName:      new FormControl('', [Validators.required]),
    referenceNumber: new FormControl('', [Validators.required, Validators.minLength(4)]),
    amount:          new FormControl<number>(75, [Validators.required, Validators.min(1)]),
    notes:           new FormControl(''),
    phone:           new FormControl('', [Validators.pattern(/^[0-9+\-\s()]{7,20}$/)]),
    address:         new FormControl('', [Validators.maxLength(500)])
  });

  // ── Payment Modal ────────────────────────────────────────────────
  showPayModal    = signal(false);
  payTargetCourse = signal<Course | null>(null);
  payLoading      = signal(false);
  receiptFile     = signal<File | null>(null);
  receiptFileName = signal('');
  receiptDragOver = signal(false);

  payForm = new FormGroup({
    senderName:      new FormControl('', [Validators.required]),
    referenceNumber: new FormControl('', [Validators.required, Validators.minLength(4)]),
    amount:          new FormControl<number>(0, [Validators.required, Validators.min(1)])
  });

  // ── Enrolled course IDs ──────────────────────────────────────────
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
  getUserRoleLabel(): string {
    const roles: string[] = this.authService.getCurrentUser()?.roles ?? [];
    const isAr = this.langService.lang() === 'ar';
    if (roles.some(r => r.toLowerCase() === 'admin'))     return isAr ? 'مدير'    : 'Admin';
    if (roles.some(r => r.toLowerCase() === 'employee'))  return isAr ? 'موظف'    : 'Employee';
    if (roles.some(r => r.toLowerCase() === 'volunteer')) return isAr ? 'متطوع'   : 'Volunteer';
    return isAr ? 'عضو' : 'User';
  }

  getRoleStyles(): { ring: string; badge: string; icon: string } {
    const roles: string[] = this.authService.getCurrentUser()?.roles ?? [];
    if (roles.some(r => r.toLowerCase() === 'admin'))
      return { ring: 'border-red-400',      badge: 'bg-red-500 text-white',      icon: 'shield' };
    if (roles.some(r => r.toLowerCase() === 'employee'))
      return { ring: 'border-blue-400',     badge: 'bg-blue-500 text-white',     icon: 'badge' };
    if (roles.some(r => r.toLowerCase() === 'volunteer'))
      return { ring: 'border-emerald-400',  badge: 'bg-emerald-500 text-white',  icon: 'volunteer_activism' };
    return { ring: 'border-champagne-gold', badge: 'bg-champagne-gold text-royal-teal', icon: 'person' };
  }

  // ── Profile Photo Upload ──────────────────────────────────────────
  avatarUploading = signal(false);

  onAvatarSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.toastService.showError('Please select a valid image file (PNG/JPG).');
      return;
    }
    this.avatarUploading.set(true);
    this.authService.uploadProfileImage(file).subscribe({
      next: () => {
        this.toastService.showSuccess(
          this.langService.lang() === 'ar' ? 'تم تحديث الصورة الشخصية بنجاح!' : 'Profile avatar updated successfully!'
        );
        this.avatarUploading.set(false);
      },
      error: () => {
        this.toastService.showError('Could not process avatar upload.');
        this.avatarUploading.set(false);
      }
    });
  }

  // ── Shared file helpers ──────────────────────────────────────────

  /** Validate file type; show error and abort if unsupported */
  private validateAndSetFile(
    file: File,
    fileSig: ReturnType<typeof signal<File | null>>,
    nameSig: ReturnType<typeof signal<string>>
  ): boolean {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      this.toastService.showError(
        this.langService.lang() === 'ar'
          ? 'صيغة الملف غير مدعومة. يُرجى رفع صورة (JPG, PNG, WEBP) أو PDF.'
          : 'Unsupported file type. Please upload an image (JPG, PNG, WEBP) or PDF.'
      );
      return false;
    }
    fileSig.set(file);
    nameSig.set(file.name);
    return true;
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
        ctx.fillStyle = '#ffffff';   // white bg so transparent PNGs don't go black
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob(blob => {
          if (!blob) { reject(new Error('Canvas toBlob failed')); return; }
          const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
          resolve(new File([blob], name, { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.92);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
      img.src = url;
    });
  }

  /** Upload a receipt file (after converting to JPG). Returns the URL or throws. */
  private async uploadReceipt(rawFile: File): Promise<string> {
    let file: File;
    try {
      file = await this.convertToJpg(rawFile);
    } catch {
      throw new Error('convert_failed');
    }
    const uploadRes: any = await this.apiService.uploadPaymentReceipt(file).toPromise();
    const url = uploadRes?.absoluteUrl || uploadRes?.AbsoluteUrl || '';
    if (!url) throw new Error('upload_failed');
    return url;
  }

  // ── ngOnInit ─────────────────────────────────────────────────────
  ngOnInit() {
    this.authService.getProfile().subscribe();
    this.fetchCatalog();
    this.fetchProfileHistories();
    this.fetchServiceFees();
  }

  fetchServiceFees() {
    this.apiService.getServiceFees().subscribe({
      next: (data: unknown) => {
        let list: any[] = [];
        if (Array.isArray(data)) list = data;
        else if (data && typeof data === 'object') {
          const obj = data as Record<string, any>;
          if (Array.isArray(obj['items'])) list = obj['items'];
          else if (Array.isArray(obj['data'])) list = obj['data'];
        }
        this.serviceFees.set(list);
      },
      error: () => this.toastService.showError('Unable to fetch service pricing.')
    });
  }

  getServiceFeeForType(type: OrderType | null): ServiceFee | undefined {
    if (type === null) return undefined;
    return this.serviceFees().find(f => Number(f.orderType) === Number(type) && f.isActive);
  }

  getOrderTotalPrice(type: OrderType | null, quantity = 1): number {
    const fee = this.getServiceFeeForType(type);
    if (!fee) return 0;
    return fee.unitPrice * quantity + fee.shippingFee;
  }

  fetchCatalog() {
    this.apiService.getCourses().subscribe({
      next: (data) => this.courses.set(data?.items || data),
      error: () => this.toastService.showError('Unable to fetch curriculum catalog.')
    });
  }

  fetchProfileHistories() {
    this.apiService.getMyEnrollments().subscribe({
      next: (data: unknown) => this.enrollments.set(this.extractList(data)),
      error: () => this.enrollments.set([])
    });
    this.apiService.getMyPayments().subscribe({
      next: (data: unknown) => this.payments.set(this.extractList(data)),
      error: () => this.payments.set([])
    });
    this.apiService.getMyCertificates().subscribe({
      next: (data: unknown) => this.certificates.set(this.extractList(data)),
      error: () => this.certificates.set([])
    });
    this.apiService.getMyOrders(1, 50).subscribe({
      next: (data: unknown) => this.orders.set(this.extractList(data)),
      error: () => this.orders.set([])
    });
  }

  private extractList(data: unknown): any[] {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') {
      const obj = data as Record<string, any>;
      if (Array.isArray(obj['items'])) return obj['items'];
      if (Array.isArray(obj['data']))  return obj['data'];
    }
    return [];
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
    if (file) this.validateAndSetFile(file, this.receiptFile, this.receiptFileName);
  }

  onReceiptSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (file) this.validateAndSetFile(file, this.receiptFile, this.receiptFileName);
  }

  private paySubmitInProgress = false;

  async onSubmitPayment() {
    if (this.payForm.invalid) return;
    const course = this.payTargetCourse();
    if (!course) return;
    if (this.paySubmitInProgress) return;

    this.paySubmitInProgress = true;
    this.payLoading.set(true);

    try {
      // 1. Upload receipt
      let receiptUrl = '';
      const rawFile = this.receiptFile();
      if (rawFile) {
        try {
          receiptUrl = await this.uploadReceipt(rawFile);
        } catch (err: any) {
          this.toastService.showError(
            err?.message === 'convert_failed'
              ? (this.langService.lang() === 'ar' ? 'تعذّر معالجة الصورة. اختر ملفاً مختلفاً.' : 'Could not process the image. Please choose a different file.')
              : (this.langService.lang() === 'ar' ? 'فشل رفع الإيصال. تأكد من الملف وحاول مجدداً.' : 'Receipt upload failed. Please check the file and try again.')
          );
          return;
        }
      }

      // 2. Enrollment (reuse existing if any)
      const existing = this.enrollments().find(
        en => (en.courseId ?? (en as any).CourseId) === course.id
      );
      let enrollmentId: number;
      if (existing) {
        enrollmentId = existing.id;
      } else {
        const enrollment = await this.apiService.enrollCourse(course.id).toPromise();
        enrollmentId = enrollment?.id ?? 0;
      }

      // 3. Submit payment
      await this.apiService.submitPayment({
        amount:          this.payForm.value.amount,
        senderName:      this.payForm.value.senderName,
        referenceNumber: this.payForm.value.referenceNumber,
        receiptUrl,
        type:            1,
        relatedRecordId: enrollmentId
      }).toPromise();

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
      this.paySubmitInProgress = false;
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

  certLoadingIds = signal<Set<number>>(new Set());

  isApproved(status: any): boolean {
    const s = String(status ?? '');
    return s === '1' || s === 'Approved';
  }

  getCertForEnrollment(en: Enrollment): Certificate | undefined {
    return this.certificates().find(
      c => (c.relatedRecordId ?? (c as any).RelatedRecordId) === en.courseId
    );
  }

  issueCert(en: Enrollment) {
    this.certLoadingIds.update(ids => new Set([...ids, en.id]));
    this.apiService.issueCertificate({
      fullNameOnCertificate: this.authService.getCurrentUser()?.fullName,
      type: 0,
      relatedRecordId: en.courseId
    }).subscribe({
      next: (cert) => {
        this.certLoadingIds.update(ids => { const s = new Set(ids); s.delete(en.id); return s; });
        this.certificates.update(curr => [cert, ...curr]);
        this.toastService.showSuccess(
          this.langService.lang() === 'ar' ? 'تم إصدار الشهادة بنجاح!' : 'Certificate issued successfully!'
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

  // ── Print Order Handlers ─────────────────────────────────────────
  getPrintOrderForCertificate(certId: number): Order | undefined {
    return this.orders().find(
      o => Number(o.orderType) === OrderType.CertificatePrint && Number(o.relatedRecordId) === certId
    );
  }

  closeOrderModel() {
    this.showOrderModal.set(false);
    this.orderTargetId.set(null);
    this.orderTargetType.set(null);
  }

  onOrderDragOver(e: DragEvent)  { e.preventDefault(); this.orderDragOver.set(true);  }
  onOrderDragLeave(e: DragEvent) { e.preventDefault(); this.orderDragOver.set(false); }

  onOrderDrop(e: DragEvent) {
    e.preventDefault();
    this.orderDragOver.set(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) this.validateAndSetFile(file, this.orderReceiptFile, this.orderReceiptFileName);
  }

  onOrderFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (file) this.validateAndSetFile(file, this.orderReceiptFile, this.orderReceiptFileName);
  }

  private orderSubmitInProgress = false;

  async onSubmitPrintOrder() {
    if (this.orderStep() !== 2) return;
    if (this.orderForm.invalid) return;
    const recordId = this.orderTargetId();
    const type     = this.orderTargetType();
    if (recordId === null || type === null) return;
    if (this.orderSubmitInProgress) return;

    this.orderSubmitInProgress = true;
    this.orderLoading.set(true);

    try {
      // 1. Create order
      const order = await this.apiService.createOrder({
        orderType:       type,
        relatedRecordId: recordId,
        quantity:        1,
        notes:           this.orderForm.value.notes ?? 'Standard print delivery.',
        phone:           this.orderForm.value.phone   || undefined,
        address:         this.orderForm.value.address || undefined
      }).toPromise();

      if (!order) throw new Error('Order creation failed.');

      // 2. Upload receipt
      let receiptUrl = '';
      const rawFile = this.orderReceiptFile();
      if (rawFile) {
        try {
          receiptUrl = await this.uploadReceipt(rawFile);
        } catch (err: any) {
          this.toastService.showError(
            err?.message === 'convert_failed'
              ? (this.langService.lang() === 'ar' ? 'تعذّر معالجة الصورة. اختر ملفاً مختلفاً.' : 'Could not process the image. Please choose a different file.')
              : (this.langService.lang() === 'ar' ? 'فشل رفع الإيصال. تأكد من الملف وحاول مجدداً.' : 'Receipt upload failed. Please check the file and try again.')
          );
          return;
        }
      }

      // 3. Submit payment (amount from server to avoid price drift)
      const payment = await this.apiService.submitPayment({
        amount:          order.totalAmount,
        senderName:      this.orderForm.value.senderName,
        referenceNumber: this.orderForm.value.referenceNumber,
        receiptUrl,
        type:            2,
        relatedRecordId: order.id
      }).toPromise();

      if (!payment) throw new Error('Payment submission failed.');

      // 4. Link payment to order
      await this.apiService.linkOrderPayment(order.id, payment.id).toPromise();

      this.toastService.showSuccess(
        this.langService.lang() === 'ar'
          ? 'تم تقديم طلب الطباعة وسداد الرسوم بنجاح! سيتم مراجعته وتحديث حالته قريباً.'
          : 'Print order & payment receipt submitted successfully!'
      );
      this.closeOrderModel();
      this.fetchProfileHistories();

    } catch (err: any) {
      this.toastService.showError('Could not process order. Make sure details are correct.');
    } finally {
      this.orderLoading.set(false);
      this.orderSubmitInProgress = false;
    }
  }

  getOrderTypeLabel(t: any): string {
    const isAr = this.langService.lang() === 'ar';
    return Number(t) === 0
      ? (isAr ? 'طباعة شهادة' : 'Certificate Print')
      : (isAr ? 'طباعة بطاقة الاعتماد' : 'Accreditation Card Print');
  }

  getOrderStatusLabel(s: any): string {
    const isAr = this.langService.lang() === 'ar';
    switch (Number(s)) {
      case 0:  return isAr ? 'قيد الانتظار'    : 'Pending';
      case 1:  return isAr ? 'بانتظار الدفع'   : 'Waiting Payment';
      case 2:  return isAr ? 'تم تقديم الدفع'  : 'Payment Submitted';
      case 3:  return isAr ? 'قيد المراجعة'    : 'Under Review';
      case 4:  return isAr ? 'مقبول'            : 'Approved';
      case 5:  return isAr ? 'قيد الإنتاج'     : 'In Production';
      case 6:  return isAr ? 'تمت الطباعة'     : 'Printed';
      case 7:  return isAr ? 'جاهز للتسليم'    : 'Ready for Delivery';
      case 8:  return isAr ? 'تم التسليم'      : 'Delivered';
      case 9:  return isAr ? 'مرفوض'            : 'Rejected';
      case 10: return isAr ? 'ملغى'             : 'Cancelled';
      default: return isAr ? 'غير معروف'        : 'Unknown';
    }
  }

  getOrderStatusClass(s: any): string {
    const val = Number(s);
    if (val === 4 || val === 8)  return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    if (val === 9 || val === 10) return 'bg-red-100 text-red-800 border border-red-200';
    if (val >= 5 && val <= 7)    return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
    return 'bg-amber-100 text-amber-800 border border-amber-200';
  }

  // ── Print Order Modal: Step control ──────────────────────────────
  orderStep = signal<1 | 2>(1);
  goToOrderStep2() { this.orderStep.set(2); }
  goToOrderStep1() { this.orderStep.set(1); }

  openOrderModel(recordId: number, type: OrderType) {
    this.orderTargetId.set(recordId);
    this.orderTargetType.set(type);
    this.orderReceiptFile.set(null);
    this.orderReceiptFileName.set('');
    this.orderForm.reset();
    this.orderStep.set(1);
    this.orderForm.patchValue({ amount: this.getOrderTotalPrice(type, 1) });
    this.showOrderModal.set(true);
  }

  today = new Date();

  isCourseEnded(en: any): boolean {
    const course = this.courses().find(c => c.id === Number(en.courseId ?? en['CourseId']));
    if (!course?.endDate) return true;
    return new Date(course.endDate) <= new Date();
  }

  getCourseEndDate(en: any): Date | null {
    const course = this.courses().find(c => c.id === Number(en.courseId ?? en['CourseId']));
    return course?.endDate ? new Date(course.endDate) : null;
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