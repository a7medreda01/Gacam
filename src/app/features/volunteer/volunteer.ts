import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpEventType, HttpResponse, HttpUploadProgressEvent } from '@angular/common/http';
import { filter, share } from 'rxjs/operators';
import { GacamApiService } from '../../core/services/gacam-api';
import { AuthService } from '../../core/services/auth';
import { LanguageService } from '../../core/services/language';
import { ToastService } from '../../shared/components/toast/toast';
import { Volunteer } from '../../models/types';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { FooterComponent } from '../../shared/components/footer/footer';
import { TranslatePipe } from '../../shared/pipes/translate';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-volunteer',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatIconModule, NavbarComponent, FooterComponent, TranslatePipe],
  templateUrl: './volunteer.html',
  styleUrl: './volunteer.css'
})
export class VolunteerComponent implements OnInit {
  langService   = inject(LanguageService);
  authService   = inject(AuthService);
  apiService    = inject(GacamApiService);
  toastService  = inject(ToastService);
  private http  = inject(HttpClient);

  loading        = signal(true);
  submitting     = signal(false);
  myApplication  = signal<Volunteer | null>(null);

  // CV upload state
  cvUploading    = signal(false);
  cvUploadPct    = signal(0);           // 0–100 progress
  cvFileName     = signal<string>('');  // display name of picked file
  cvRelativePath = signal<string>('');  // path returned by the server → sent in payload

  volForm = new FormGroup({
    fullName: new FormControl('', [Validators.required, Validators.minLength(4)]),
    email:    new FormControl('', [Validators.required, Validators.email]),
    phone:    new FormControl('', [Validators.required, Validators.pattern(/^\+?[0-9\s\-]{7,20}$/)]),
    area:     new FormControl<number>(0, [Validators.required]),
    skills:   new FormControl('', [Validators.required, Validators.minLength(10)]),
    notes:    new FormControl('')
  });

  ngOnInit() { this.checkStatus(); }

  checkStatus() {
    if (this.authService.isAuthenticated()) {
      this.apiService.getMyVolunteer().subscribe({
        next:  (res) => { this.myApplication.set(res); this.loading.set(false); },
        error: ()    =>   this.loading.set(false)
      });
    } else {
      this.loading.set(false);
    }
  }

  // ─── CV Upload ────────────────────────────────────────────────
  onCvFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;

    // Validate: PDF / DOC / DOCX — check MIME type AND extension
    // (Windows may send empty/wrong MIME for .pdf/.docx)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const allowedExts = ['.pdf', '.doc', '.docx'];
    const fileExt = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!allowedTypes.includes(file.type) && !allowedExts.includes(fileExt)) {
      this.toastService.showError(
        this.langService.lang() === 'ar'
          ? 'يُسمح فقط بملفات PDF أو Word.'
          : 'Only PDF or Word files are allowed.'
      );
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.toastService.showError(
        this.langService.lang() === 'ar'
          ? 'حجم الملف يتجاوز 5 ميجابايت.'
          : 'File size exceeds 5 MB limit.'
      );
      input.value = '';
      return;
    }

    this.cvFileName.set(file.name);
    this.cvUploading.set(true);
    this.cvUploadPct.set(0);
    this.cvRelativePath.set('');

    const fd = new FormData();
    fd.append('file', file);

    // share() ensures ONE HTTP request even with two subscribers
    const req$ = this.http.post(
      `${environment.apiUrl}/Files/upload/cvs`,
      fd,
      { reportProgress: true, observe: 'events' }
    ).pipe(share());

    // ── Progress watcher ───────────────────────────────────────
    req$.pipe(
      filter((ev): ev is HttpUploadProgressEvent =>
        ev.type === HttpEventType.UploadProgress
      )
    ).subscribe(ev => {
      if (ev.total) {
        this.cvUploadPct.set(Math.round(100 * ev.loaded / ev.total));
      }
    });

    // ── Final response handler ─────────────────────────────────
    req$.pipe(
      filter((ev): ev is HttpResponse<any> =>
        ev.type === HttpEventType.Response
      )
    ).subscribe({
      next: (res) => {
        // Support both PascalCase and camelCase from backend
        const body = res.body as any;
        const path: string = body?.RelativePath ?? body?.relativePath ?? body?.relativeUrl ?? '';

        console.log('[CV Upload] body:', body, '| resolved path:', path);

        if (!path) {
          this.cvUploading.set(false);
          this.cvFileName.set('');
          input.value = '';
          this.toastService.showError(
            this.langService.lang() === 'ar'
              ? 'استجابة غير متوقعة من الخادم. حاول مرة أخرى.'
              : 'Unexpected server response. Please try again.'
          );
          return;
        }
        this.cvRelativePath.set(path);
        this.cvUploadPct.set(100);
        this.cvUploading.set(false);
        this.toastService.showSuccess(
          this.langService.lang() === 'ar'
            ? 'تم رفع السيرة الذاتية بنجاح ✓'
            : 'CV uploaded successfully ✓'
        );
      },
      error: () => {
        this.cvUploading.set(false);
        this.cvFileName.set('');
        this.cvRelativePath.set('');
        input.value = '';
        this.toastService.showError(
          this.langService.lang() === 'ar'
            ? 'فشل رفع الملف. حاول مرة أخرى.'
            : 'CV upload failed. Please try again.'
        );
      }
    });
  }

  removeCv(input: HTMLInputElement) {
    this.cvFileName.set('');
    this.cvRelativePath.set('');
    this.cvUploadPct.set(0);
    input.value = '';
  }

  // ─── Submit ───────────────────────────────────────────────────
  onSubmit() {
    if (this.volForm.invalid) { this.volForm.markAllAsTouched(); return; }
    if (!this.cvRelativePath()) {
      this.toastService.showError(
        this.langService.lang() === 'ar' ? 'يرجى رفع السيرة الذاتية أولاً.' : 'Please upload your CV first.'
      );
      return;
    }

    this.submitting.set(true);
    const payload = {
      fullName: this.volForm.value.fullName!,
      email:    this.volForm.value.email!,
      phone:    this.volForm.value.phone!,
      area:     Number(this.volForm.value.area),
      skills:   this.volForm.value.skills!,
      notes:    this.volForm.value.notes ?? '',
      cvUrl:    this.cvRelativePath()
    };

    this.apiService.applyVolunteer(payload).subscribe({
      next: (res) => {
        this.myApplication.set(res);
        this.toastService.showSuccess(
          this.langService.lang() === 'ar'
            ? 'تم إرسال طلبك بنجاح. سيتم مراجعته من قِبل فريق الهيئة.'
            : 'Volunteer application submitted! GACAM team will review your profile shortly.'
        );
        this.submitting.set(false);
      },
      error: () => {
        this.toastService.showError(
          this.langService.lang() === 'ar'
            ? 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.'
            : 'Could not submit application. Please try again.'
        );
        this.submitting.set(false);
      }
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────
  get f() { return this.volForm.controls; }
  get cvReady() { return !!this.cvRelativePath() && !this.cvUploading(); }

  getVolunteerStatusText(status: string | number | undefined): string {
    if (status === undefined || status === null) return '';
    const s = String(status).toLowerCase();
    const isAr = this.langService.lang() === 'ar';
    if (s === '0' || s === 'pending')                        return isAr ? 'قيد المراجعة' : 'Pending Review';
    if (s === '1' || s === 'approved' || s === 'accepted')   return isAr ? 'تم القبول'    : 'Accepted';
    if (s === '2' || s === 'rejected')                       return isAr ? 'مرفوض'        : 'Rejected';
    return String(status);
  }

  getVolunteerStatusClass(status: string | number | undefined): string {
    if (status === undefined || status === null) return 'bg-gray-100 text-gray-700';
    const s = String(status).toLowerCase();
    if (s === '0' || s === 'pending')                        return 'bg-yellow-100 text-yellow-700 font-bold';
    if (s === '1' || s === 'approved' || s === 'accepted')   return 'bg-emerald-100 text-emerald-700 font-bold';
    if (s === '2' || s === 'rejected')                       return 'bg-red-100 text-red-700 font-bold';
    return 'bg-gray-100 text-gray-700';
  }

  isPending(s?: string|number)  { const v = String(s??'').toLowerCase(); return v==='0'||v==='pending'; }
  isApproved(s?: string|number) { const v = String(s??'').toLowerCase(); return v==='1'||v==='approved'||v==='accepted'; }
  isRejected(s?: string|number) { const v = String(s??'').toLowerCase(); return v==='2'||v==='rejected'; }

  getVolunteeringAreaText(area: number | string): string {
    const n = Number(area);
    const isAr = this.langService.lang() === 'ar';
    const areasAr = ['الصحافة والإعلام','التصوير والإنتاج','العلاقات العامة','إدارة الفعاليات','الترجمة والتحرير','التصميم والخدمات الإبداعية','الإعلام الرقمي','البرامج التدريبية','الدعم الإداري'];
    const areasEn = ['Media and Journalism','Photography and Production','Public Relations','Event Management','Translation and Editing','Design and Creative Services','Digital Media','Training Programs','Administrative Support'];
    if (n >= 0 && n < areasEn.length) return isAr ? areasAr[n] : areasEn[n];
    return String(area);
  }
}