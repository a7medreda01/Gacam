import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { GacamApiService } from '../../core/services/gacam-api';
import { LanguageService } from '../../core/services/language';
import { ToastService } from '../../shared/components/toast/toast';
import { Accreditation } from '../../models/types';
import { TranslatePipe } from '../../shared/pipes/translate';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-accreditations',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, TranslatePipe],
  templateUrl: './accreditations.html',
  styleUrl: './accreditations.css'
})
export class AdminAccreditationsComponent implements OnInit {
  private apiService  = inject(GacamApiService);
  langService         = inject(LanguageService);
  private toastService = inject(ToastService);

  loading         = signal(true);
  accs            = signal<Accreditation[]>([]);
  accSearch       = signal('');
  accStatusFilter = signal('');
  selectedAcc     = signal<Accreditation | null>(null);
  reviewLoading   = signal(false);

  currentPage  = signal(1);
  pageSize     = signal(10);
  totalCount   = signal(0);
  totalPages   = signal(0);
  hasNext      = signal(false);
  hasPrevious  = signal(false);

  reviewForm = new FormGroup({
    status: new FormControl<string>('1', [Validators.required]),
  });

  private statusLabels: Record<number, string> = {
    0: 'Pending', 1: 'Approved', 2: 'Rejected', 3: 'Refunded'
  };

  filteredAccs = computed(() => this.accs());

  accStats = computed(() => {
    const all = this.accs();
    return [
      { label: 'Total loaded', count: all.length,                                                  color: 'text-royal-teal'  },
      { label: 'Pending',      count: all.filter(a => a.status === 0).length,                      color: 'text-yellow-600'  },
      { label: 'Approved',     count: all.filter(a => a.status === 1).length,                      color: 'text-emerald-600' },
      { label: 'Rejected',     count: all.filter(a => a.status === 2 || a.status === 3).length,     color: 'text-red-500'     },
    ];
  });

  private searchTimeout: any = null;

  ngOnInit() {
    this.fetchAccreditations();
  }

  fetchAccreditations() {
    this.loading.set(true);
    this.apiService.getAllAccreditations(
      this.accStatusFilter() || undefined,
      this.currentPage(),
      this.pageSize(),
      this.accSearch()
    ).subscribe({
      next:  (data) => {
        this.accs.set(data.items);
        this.totalCount.set(data.totalCount);
        this.totalPages.set(data.totalPages);
        this.hasNext.set(data.hasNext);
        this.hasPrevious.set(data.hasPrevious);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); }
    });
  }

  onSearchChange(searchval: string) {
    this.accSearch.set(searchval);
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.fetchAccreditations();
    }, 400);
  }

  onStatusChange(statusval: string) {
    this.accStatusFilter.set(statusval);
    this.currentPage.set(1);
    this.fetchAccreditations();
  }

  nextPage() {
    if (this.hasNext()) {
      this.currentPage.update(p => p + 1);
      this.fetchAccreditations();
    }
  }

  prevPage() {
    if (this.hasPrevious()) {
      this.currentPage.update(p => p - 1);
      this.fetchAccreditations();
    }
  }

  changePageSize(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.fetchAccreditations();
  }

  openReviewModal(a: Accreditation) {
    this.selectedAcc.set(a);
    this.reviewForm.reset({ status: '1' });
    this.reviewLoading.set(false);
  }

  closeReviewModal() {
    this.selectedAcc.set(null);
    this.reviewLoading.set(false);
  }

  onAccReviewSubmit() {
    if (this.reviewForm.invalid) return;
    const acc = this.selectedAcc();
    if (!acc) return;

    const statusValue = Number(this.reviewForm.value.status); // 1 | 2 | 3
    this.reviewLoading.set(true);

    this.apiService.reviewAccreditation(acc.id, statusValue).subscribe({
      next: (updated) => {
        this.accs.update(list => list.map(a => a.id === updated.id ? updated : a));

        const isAr = this.langService.lang() === 'ar';
        const msg  = statusValue === 1
          ? (isAr ? 'تمت الموافقة وإصدار البطاقة بنجاح!'  : 'Application approved — card issued!')
          : statusValue === 2
            ? (isAr ? 'تم رفض الطلب.'                      : 'Application rejected.')
            : (isAr ? 'تمت إعادة المبلغ.'                  : 'Application refunded.');

        this.toastService.showSuccess(msg);
        this.closeReviewModal();
      },
      error: () => {
        this.toastService.showError('Failed to submit review. Please try again.');
        this.reviewLoading.set(false);
      }
    });
  }

  isPending(status: number): boolean {
    return status === 0;
  }

  getCategoryName(a: Accreditation): string {
    return this.langService.lang() === 'ar'
      ? (a as any).categoryNameAr
      : (a as any).categoryNameEn;
  }

  getDocumentUrl(relativeUrl?: string): string {
    if (!relativeUrl) return '';
    const apiBase = environment.apiUrl.replace(/\/api\/?$/, '');
    return relativeUrl.startsWith('http') ? relativeUrl : `${apiBase}${relativeUrl}`;
  }

  getAccreditationStatusText(status: number): string {
    const label = this.statusLabels[status] ?? 'Unknown';
    if (this.langService.lang() !== 'ar') return label;
    const map: Record<string, string> = {
      Pending: 'قيد المراجعة', Approved: 'معتمد', Rejected: 'مرفوض', Refunded: 'مسترد'
    };
    return map[label] ?? label;
  }

  getAccreditationStatusClass(status: number): string {
    const label = this.statusLabels[status] ?? '';
    const map: Record<string, string> = {
      Pending:  'bg-yellow-100 text-yellow-700 font-bold',
      Approved: 'bg-emerald-100 text-emerald-700 font-bold',
      Rejected: 'bg-red-100 text-red-700 font-bold',
      Refunded: 'bg-gray-100 text-gray-500 font-bold',
    };
    return map[label] ?? 'bg-gray-100 text-gray-500';
  }

private cardStatusLabels: Record<number, string> = {
  0: 'Active', 1: 'Expired', 2: 'Suspended', 3: 'Revoked'
};
getCardStatusText(status: number): string {
  return this.cardStatusLabels[status] ?? 'Unknown';
}

getCardStatusClass(status: number): string {
  const map: Record<number, string> = {
    0: 'bg-emerald-100 text-emerald-700', // Active
    1: 'bg-orange-100 text-orange-600',   // Expired
    2: 'bg-yellow-100 text-yellow-700',   // Suspended
    3: 'bg-red-100 text-red-600',         // Revoked
  };
  return map[status] ?? 'bg-gray-100 text-gray-500';
}
}