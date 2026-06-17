/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GacamApiService } from '../../core/services/gacam-api';
import { LanguageService } from '../../core/services/language';
import { ToastService } from '../../shared/components/toast/toast';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { FooterComponent } from '../../shared/components/footer/footer';
import { TranslatePipe } from '../../shared/pipes/translate';
import { Course } from '../../models/types';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-verify-certificate',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, NavbarComponent, FooterComponent, TranslatePipe],
  templateUrl: './verify-certificate.html',
  styleUrl: './verify-certificate.css'
})
export class VerifyCertificateComponent {
  langService = inject(LanguageService);
  apiService  = inject(GacamApiService);
  toastService = inject(ToastService);
route = inject(ActivatedRoute);
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

  enrollForm = new FormGroup({
    courseId: new FormControl<number | null>(null, [Validators.required])
  });
  enrollLoading = signal(false);

  // ────────────────────────────────────────────────────────────────
  // Serial verification
  // ────────────────────────────────────────────────────────────────
  onVerifySerial() {
    if (this.queryForm.invalid) return;
    const code = this.queryForm.value.serialNumber!.trim();

    this.apiService.verifyCard(code).subscribe({
      next: (res) => {
        if (res && res.valid) {
          this.serialResult.set({ valid: true, type: 'card', data: res.data || res });
          this.toastService.showSuccess('Official press card record located successfully!');
        } else {
          this.onVerifyCertificateSerial(code);
        }
      },
      error: () => this.onVerifyCertificateSerial(code)
    });
  }
ngOnInit() {

  this.enrollForm.get('courseId')!.valueChanges.subscribe(id => {
    const course = id ? (this.courses().find(c => c.id === id) ?? null) : null;
    this.selectedCourse.set(course);
  });

  this.route.paramMap.subscribe(params => {

    const certificateNumber = params.get('number');

    if (!certificateNumber)
      return;

    this.queryForm.patchValue({
      serialNumber: certificateNumber
    });

    this.onVerifyCertificateSerial(certificateNumber);
  });
}
  onVerifyCertificateSerial(code: string) {
    this.apiService.verifyCertificate(code).subscribe({
      next: (res) => {
        const isValid = res && (res.isValid === true || res.IsValid === true || res.valid === true || res.Valid === true);
        if (isValid) {
          this.serialResult.set({
            valid: true,
            type: 'certificate',
            data: {
              fullNameOnCertificate: res.fullNameOnCertificate || res.FullNameOnCertificate || (res.data && (res.data.fullNameOnCertificate || res.data.fullName)) || '',
              certificateNumber:     res.certificateNumber     || res.CertificateNumber     || code,
              type:                  res.type                  || res.Type                  || '',
              relatedItemTitle:      res.relatedItemTitle      || res.RelatedItemTitle      || '',
              issuedAt:              res.issuedAt              || res.IssuedAt              || ''
            }
          });
          this.toastService.showSuccess('Official certificate record located successfully!');
        } else {
          this.serialResult.set({ valid: false });
          this.toastService.showError('Registry query failed: No matches found for card or certificate.');
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
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      this.selectedFile.set(files[0]);
      this.fileName.set(files[0].name);
    }
  }

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
      this.fileName.set(input.files[0].name);
    }
  }

  onVerifyFile() {
    const file = this.selectedFile();
    if (!file) return;

    this.apiService.verifyCertificateFile(file).subscribe({
      next: (res) => {
        const isValid = res && (res.isValid === true || res.IsValid === true || res.valid === true || res.Valid === true);
        if (isValid) {
          this.fileResult.set({
            valid: true,
            certificateNumber:     res.certificateNumber     || res.CertificateNumber     || '',
            fullNameOnCertificate: res.fullNameOnCertificate || res.FullNameOnCertificate || '',
            type:                  res.type                  || res.Type                  || '',
            relatedItemTitle:      res.relatedItemTitle      || res.RelatedItemTitle      || '',
            issuedAt:              res.issuedAt              || res.IssuedAt              || ''
          });
          this.toastService.showSuccess('Sha256 decryption check matched verified roots!');
        } else {
          this.fileResult.set({ valid: false });
          this.toastService.showError('Registry file verification failed: Invalid certificate signature.');
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
        next: (cs) => { this.courses.set(cs); this.coursesLoading.set(false); },
        error: ()   => {
          this.toastService.showError('Could not load available courses.');
          this.coursesLoading.set(false);
        }
      });
    }
  }

  closeEnrollModal() {
    this.showEnrollModal.set(false);
  }

  onSubmitEnrollment() {
    if (this.enrollForm.invalid) return;
    this.enrollLoading.set(true);

    const courseId = this.enrollForm.value.courseId!;
    this.apiService.enrollCourse(courseId).subscribe({
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
  selectedCourse = signal<Course | null>(null);

}