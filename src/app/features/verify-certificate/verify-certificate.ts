/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GacamApiService } from '../../core/services/gacam-api';
import { LanguageService } from '../../core/services/language';
import { ToastService } from '../../shared/components/toast/toast';
import { TranslatePipe } from '../../shared/pipes/translate';
import { Course } from '../../models/types';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-verify-certificate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, TranslatePipe],
  templateUrl: './verify-certificate.html',
  styleUrl: './verify-certificate.css'
})
export class VerifyCertificateComponent {
  langService  = inject(LanguageService);
  apiService   = inject(GacamApiService);
  toastService = inject(ToastService);
  route        = inject(ActivatedRoute);

  // ── Serial verification ──────────────────────────────────────────
  queryForm = new FormGroup({
    serialNumber: new FormControl('', [Validators.required, Validators.minLength(4)])
  });
  serialResult = signal<any | null>(null);

  // ── File verification ────────────────────────────────────────────
  dragOver     = signal(false);
  selectedFile = signal<File | null>(null);
  fileName     = signal('');
  fileResult   = signal<any | null>(null);

  // ── Course enrollment modal ──────────────────────────────────────
  showEnrollModal = signal(false);
  courses         = signal<Course[]>([]);
  coursesLoading  = signal(false);
  selectedCourse  = signal<Course | null>(null);

  enrollForm = new FormGroup({
    courseId: new FormControl<number | null>(null, [Validators.required])
  });
  enrollLoading = signal(false);

  // ────────────────────────────────────────────────────────────────
  ngOnInit() {
    this.enrollForm.get('courseId')!.valueChanges.subscribe(id => {
      const course = id ? (this.courses().find(c => c.id === id) ?? null) : null;
      this.selectedCourse.set(course);
    });

    this.route.paramMap.subscribe(params => {
      const certificateNumber = params.get('number');
      if (!certificateNumber) return;
      this.queryForm.patchValue({ serialNumber: certificateNumber });
      this.verify(certificateNumber);
    });
  }

  // ────────────────────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────────────────────

  isCardType(type: string | undefined | null): boolean {
    return (type || '').toLowerCase().includes('card');
  }

  /**
   * يوحد الـ fields بين البطاقة والشهادة عشان الـ template يشتغل بشكل موحد
   * البطاقة:  cardNumber / fullName / categoryNameEn / expiresAt
   * الشهادة:  certificateNumber / fullNameOnCertificate / relatedItemTitle / expiredAt
   */
  private normalizeData(type: string, raw: any): any {
    if (!raw) return {};

    if (this.isCardType(type)) {
      return {
        certificateNumber:     raw.cardNumber,
        fullNameOnCertificate: raw.fullName,
        relatedItemTitle:      raw.categoryNameEn,
        expiredAt:             raw.expiresAt ?? null,
        issuedAt:              raw.issuedAt,
        status:                raw.status,
        isExpired:             raw.isExpired,
      };
    }

    return {
      ...raw,
      expiredAt: raw.expiredAt ?? null,
    };
  }

  getExpiry(data: any): string | null {
    return data?.expiredAt ?? null;
  }

  isExpired(dateStr: string | null | undefined): boolean {
    if (!dateStr) return false;
    return new Date(dateStr).getTime() < Date.now();
  }

  // ────────────────────────────────────────────────────────────────
  // Serial verification
  // ────────────────────────────────────────────────────────────────
  onVerifySerial() {
    if (this.queryForm.invalid) return;
    const code = this.queryForm.value.serialNumber!.trim();
    this.verify(code);
  }

  private verify(code: string) {
    this.apiService.verify(code).subscribe({
      next: (res) => {
        if (res?.isValid) {
          const raw = res.data ?? res;
          const normalized = this.normalizeData(res.type, raw);
          this.serialResult.set({ valid: true, type: res.type, data: normalized });
          this.toastService.showSuccess(
            this.isCardType(res.type)
              ? 'Official press card record located successfully!'
              : 'Official certificate record located successfully!'
          );
        } else {
          this.serialResult.set({ valid: false });
          this.toastService.showError(
            res?.message ?? 'Registry query failed: No matches found.'
          );
        }
      },
      error: () => {
        this.serialResult.set({ valid: false });
        this.toastService.showError('Registry query failed: Verification server is unreachable.');
      }
    });
  }

  // ────────────────────────────────────────────────────────────────
  // File verification
  // ────────────────────────────────────────────────────────────────
  onDragOver(e: DragEvent)  { e.preventDefault(); this.dragOver.set(true);  }
  onDragLeave(e: DragEvent) { e.preventDefault(); this.dragOver.set(false); }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.dragOver.set(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) { this.selectedFile.set(file); this.fileName.set(file.name); }
  }

  onFileSelected(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) { this.selectedFile.set(file); this.fileName.set(file.name); }
  }

  onVerifyFile() {
    const file = this.selectedFile();
    if (!file) return;

    this.apiService.verifyCertificateFile(file).subscribe({
      next: (res) => {
        // البطاقة المنتهية بترجع isValid=false من الـ backend
        // نعاملها كـ valid لو في data موجودة
        const hasData = res?.data != null;
        const isValid = res?.isValid || (hasData && this.isCardType(res?.type));

        if (isValid) {
          const raw = res.data ?? res;
          const normalized = this.normalizeData(res.type, raw);
          this.fileResult.set({ valid: true, type: res.type, data: normalized });
          this.toastService.showSuccess(
            this.isCardType(res.type)
              ? 'Press card file verified successfully!'
              : 'Certificate file verified successfully!'
          );
        } else {
          this.fileResult.set({ valid: false });
          this.toastService.showError(
            res?.message ?? 'Registry file verification failed: Invalid certificate signature.'
          );
        }
      },
      error: () => {
        this.fileResult.set({ valid: false });
        this.toastService.showError('Validation process returned parsing failure.');
      }
    });
  }

  // ────────────────────────────────────────────────────────────────
  // Enrollment modal
  // ────────────────────────────────────────────────────────────────
  openEnrollModal() {
    this.enrollForm.reset();
    this.showEnrollModal.set(true);

    if (this.courses().length === 0) {
      this.coursesLoading.set(true);
      this.apiService.getCourses().subscribe({
        next: (cs) => { this.courses.set(cs?.items || cs); this.coursesLoading.set(false); },
        error: ()   => {
          this.toastService.showError('Could not load available courses.');
          this.coursesLoading.set(false);
        }
      });
    }
  }

  closeEnrollModal() { this.showEnrollModal.set(false); }

  onSubmitEnrollment() {
    if (this.enrollForm.invalid) return;
    this.enrollLoading.set(true);

    this.apiService.enrollCourse(this.enrollForm.value.courseId!).subscribe({
      next: () => {
        this.toastService.showSuccess(
          this.langService.lang() === 'ar'
            ? 'تم تقديم طلب التسجيل بنجاح! سيتم مراجعته من قبل الإدارة.'
            : 'Enrollment request submitted! Our team will review and confirm shortly.'
        );
        this.enrollLoading.set(false);
        this.closeEnrollModal();
      },
      error: () => {
        this.toastService.showError('Could not submit enrollment. You may already be registered for this course.');
        this.enrollLoading.set(false);
      }
    });
  }

  getCourseDateRange(c: Course): string {
    if (!c.startDate || !c.endDate) return '';
    const fmt = (d: string) => new Date(d).toLocaleDateString('en-CA', { month: 'short', year: 'numeric' });
    return `${fmt(c.startDate)} – ${fmt(c.endDate)}`;
  }
}