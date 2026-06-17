import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { GacamApiService } from '../../core/services/gacam-api';
import { TranslatePipe } from '../../shared/pipes/translate';

@Component({
  selector: 'app-admin-overview',
  imports: [CommonModule, MatIconModule, TranslatePipe],
  templateUrl: './overview.html',
  styleUrl: './overview.css'
})
export class AdminOverviewComponent implements OnInit {
  private apiService = inject(GacamApiService);

  loading = signal(true);
  accsCount = signal(0);
  enrollmentsCount = signal(0);
  volsCount = signal(0);
  payments = signal<any[]>([]);

  totalRevenue = computed(() => {
    return this.payments()
      .filter(p => p.status === 'Approved' || p.status === 'Paid' || p.status === '1')
      .reduce((s, p) => s + (Number(p.amount) || 0), 0);
  });

  ngOnInit() {
    this.fetchOverviewData();
  }

  fetchOverviewData() {
    this.loading.set(true);
    this.apiService.getAllAccreditations().subscribe({
      next: (ac) => this.accsCount.set(ac.length),
      error: () => {}
    });

    this.apiService.getAllEnrollments().subscribe({
      next: (en) => this.enrollmentsCount.set(en.length),
      error: () => {}
    });

    this.apiService.getVolunteers().subscribe({
      next: (vl) => this.volsCount.set(vl.length),
      error: () => {}
    });

    this.apiService.getAllPayments().subscribe({
      next: (py) => {
        this.payments.set(py);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  exportReport(type: 'payments' | 'auditlogs') {
    let url = '';
    if (type === 'payments') {
      url = this.apiService.getPaymentsReportUrl();
    } else {
      url = this.apiService.getAuditLogsReportUrl();
    }

    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  }
}
