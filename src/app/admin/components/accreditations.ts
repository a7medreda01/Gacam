import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { GacamApiService } from '../../core/services/gacam-api';
import { LanguageService } from '../../core/services/language';
import { ToastService } from '../../shared/components/toast/toast';
import { Accreditation } from '../../models/types';
import { TranslatePipe } from '../../shared/pipes/translate';

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

  // status: 1 = Approved, 2 = Rejected, 3 = Refunded
  reviewForm = new FormGroup({
    status: new FormControl<string>('1', [Validators.required]),
  });

  filteredAccs = computed(() => {
    const query  = this.accSearch().trim().toLowerCase();
    const status = this.accStatusFilter();
    const data   = this.accs();

    return data.filter(a => {
      const matchesStatus = !status || a.status === status;
      const matchesSearch = !query
        || (a.userFullName          ?? '').toLowerCase().includes(query)
        || (a.userEmail             ?? '').toLowerCase().includes(query)
        || (a.category              ?? '').toLowerCase().includes(query)
        || (a.mediaCard?.cardNumber ?? '').toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  });

  accStats = computed(() => {
    const all = this.accs();
    return [
      { label: 'Total',    count: all.length,                                                                          color: 'text-royal-teal'  },
      { label: 'Pending',  count: all.filter(a => a.status === 'Pending').length,                                      color: 'text-yellow-600'  },
      { label: 'Approved', count: all.filter(a => a.status === 'Approved').length,                                     color: 'text-emerald-600' },
      { label: 'Rejected', count: all.filter(a => a.status === 'Rejected' || a.status === 'Refunded').length,          color: 'text-red-500'     },
    ];
  });

  ngOnInit() {
    this.fetchAccreditations();
  }

  fetchAccreditations() {
    this.loading.set(true);
    this.apiService.getAllAccreditations().subscribe({
      next:  (data) => { this.accs.set(data); this.loading.set(false); },
      error: ()     => { this.loading.set(false); }
    });
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

  getAccreditationStatusText(status: string): string {
    if (this.langService.lang() !== 'ar') return status;
    const map: Record<string, string> = {
      'Pending':  'قيد المراجعة',
      'Approved': 'معتمد',
      'Rejected': 'مرفوض',
      'Refunded': 'مسترد',
    };
    return map[status] ?? status;
  }

  getAccreditationStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Pending':  'bg-yellow-100 text-yellow-700 font-bold',
      'Approved': 'bg-emerald-100 text-emerald-700 font-bold',
      'Rejected': 'bg-red-100 text-red-700 font-bold',
      'Refunded': 'bg-gray-100 text-gray-500 font-bold',
    };
    return map[status] ?? 'bg-gray-100 text-gray-500';
  }

  getCardStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Active':    'bg-emerald-100 text-emerald-700',
      'Expired':   'bg-orange-100 text-orange-600',
      'Suspended': 'bg-yellow-100 text-yellow-700',
      'Revoked':   'bg-red-100 text-red-600',
    };
    return map[status] ?? 'bg-gray-100 text-gray-500';
  }
}