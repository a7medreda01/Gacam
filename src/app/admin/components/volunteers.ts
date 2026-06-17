import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { GacamApiService } from '../../core/services/gacam-api';
import { LanguageService } from '../../core/services/language';
import { ToastService } from '../../shared/components/toast/toast';
import { Volunteer } from '../../models/types';
import { TranslatePipe } from '../../shared/pipes/translate';
import { environment } from '../../../environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-admin-volunteers',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslatePipe],
  templateUrl: './volunteers.html',
  styleUrl: './volunteers.css'
})
export class AdminVolunteersComponent implements OnInit {
  private apiService   = inject(GacamApiService);
  langService          = inject(LanguageService);
  private toastService = inject(ToastService);

  loading      = signal(true);
  vols         = signal<Volunteer[]>([]);
  processingId = signal<number | null>(null);

  // CV preview modal
  previewOpen  = signal(false);
  previewUrl   = signal<string>('');
  previewName  = signal<string>('');

  ngOnInit() { this.fetchVolunteers(); }

  fetchVolunteers() {
    this.loading.set(true);
    this.apiService.getVolunteers().subscribe({
      next:  (data) => { this.vols.set(data); this.loading.set(false); },
      error: ()     =>   this.loading.set(false)
    });
  }

  // ── CV helpers ───────────────────────────────────────────────
  /** Build a full URL from the relative path stored in the DB */
  resolveCvUrl(cvUrl: string | undefined): string {
    if (!cvUrl) return '';
    // Already absolute
    if (cvUrl.startsWith('http')) return cvUrl;
    // Relative — prepend API base (strip trailing /api if present for static files)
    const base = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${base}${cvUrl.startsWith('/') ? '' : '/'}${cvUrl}`;
  }

  openCvPreview(vol: Volunteer) {
    const url = this.resolveCvUrl(vol.cvUrl);
    if (!url) return;
    this.previewUrl.set(url);
    this.previewName.set(vol.fullName);
    this.previewOpen.set(true);
  }

  closeCvPreview() {
    this.previewOpen.set(false);
    this.previewUrl.set('');
    this.previewName.set('');
  }

  downloadCv(vol: Volunteer) {
    const url = this.resolveCvUrl(vol.cvUrl);
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `CV_${vol.fullName.replace(/\s+/g, '_')}.pdf`;
    a.target = '_blank';
    a.rel = 'noopener';
    a.click();
  }

  // ── Status helpers ───────────────────────────────────────────
  getVolunteerStatusText(status: string | number | undefined): string {
    if (status == null) return '';
    const s = String(status).toLowerCase();
    const isAr = this.langService.lang() === 'ar';
    if (s === '0' || s === 'pending')                      return isAr ? 'قيد المراجعة' : 'Pending Review';
    if (s === '1' || s === 'approved' || s === 'accepted') return isAr ? 'تم القبول'    : 'Accepted';
    if (s === '2' || s === 'rejected')                     return isAr ? 'مرفوض'        : 'Rejected';
    return String(status);
  }

  getVolunteerStatusClass(status: string | number | undefined): string {
    if (status == null) return 'bg-gray-100 text-gray-700';
    const s = String(status).toLowerCase();
    if (s === '0' || s === 'pending')                      return 'bg-yellow-100 text-yellow-700 font-bold';
    if (s === '1' || s === 'approved' || s === 'accepted') return 'bg-emerald-100 text-emerald-700 font-bold';
    if (s === '2' || s === 'rejected')                     return 'bg-red-100 text-red-700 font-bold';
    return 'bg-gray-100 text-gray-700';
  }

  isPending(s?: string | number) {
    const v = String(s ?? '').toLowerCase();
    return v === '0' || v === 'pending';
  }

  // ── Area label ───────────────────────────────────────────────
  getVolunteeringAreaText(area: number | string): string {
    const n = Number(area);
    const isAr = this.langService.lang() === 'ar';
    const areasAr = ['الصحافة والإعلام','التصوير والإنتاج','العلاقات العامة','إدارة الفعاليات','الترجمة والتحرير','التصميم والخدمات الإبداعية','الإعلام الرقمي','البرامج التدريبية','الدعم الإداري'];
    const areasEn = ['Media and Journalism','Photography and Production','Public Relations','Event Management','Translation and Editing','Design and Creative Services','Digital Media','Training Programs','Administrative Support'];
    if (n >= 0 && n < areasEn.length) return isAr ? areasAr[n] : areasEn[n];
    return String(area);
  }

  // ── Review ───────────────────────────────────────────────────
  reviewVolunteer(id: number, approve: boolean) {
    this.processingId.set(id);
    const note = approve
      ? (this.langService.lang() === 'ar' ? 'تم القبول من قِبل مكتب التطوع.' : 'Approved by Volunteer Office.')
      : (this.langService.lang() === 'ar' ? 'تم الرفض من قِبل مكتب التطوع.' : 'Rejected by Volunteer Office.');

    this.apiService.reviewVolunteer(id, approve ? 1 : 2, note).subscribe({
      next: () => {
        this.toastService.showSuccess(
          approve
            ? (this.langService.lang() === 'ar' ? 'تم قبول المتطوع بنجاح.' : 'Volunteer approved successfully!')
            : (this.langService.lang() === 'ar' ? 'تم رفض الطلب.' : 'Application rejected.')
        );
        this.processingId.set(null);
        this.fetchVolunteers();
      },
      error: () => {
        this.toastService.showError(this.langService.lang() === 'ar' ? 'حدث خطأ. يرجى المحاولة مرة أخرى.' : 'Could not process decision.');
        this.processingId.set(null);
      }
    });
  }
  private sanitizer = inject(DomSanitizer);

safePreviewUrl = computed<SafeResourceUrl>(() =>
  this.sanitizer.bypassSecurityTrustResourceUrl(this.previewUrl())
);
}