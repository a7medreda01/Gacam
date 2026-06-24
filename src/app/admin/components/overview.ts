import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { GacamApiService } from '../../core/services/gacam-api';
import { TranslatePipe } from '../../shared/pipes/translate';

enum DashboardPeriod {
  Month = 0,
  Week = 1,
  Year = 2
}

@Component({
  selector: 'app-admin-overview',
  imports: [CommonModule, MatIconModule, TranslatePipe],
  templateUrl: './overview.html',
  styleUrl: './overview.css'
})
export class AdminOverviewComponent implements OnInit {
  private apiService = inject(GacamApiService);

  loading = signal(true);

  selectedPeriod = signal<DashboardPeriod>(DashboardPeriod.Month);

  paymentsCount = signal(0);
  coursesCount = signal(0);
  accreditationsCount = signal(0);
  ordersCount = signal(0);
  partnersCount = signal(0);
  volunteersCount = signal(0);
  totalRevenue = signal(0);

  DashboardPeriod = DashboardPeriod;

  ngOnInit(): void {
    this.fetchOverviewData();
  }

  fetchOverviewData(): void {
    this.loading.set(true);

    this.apiService.getDashboardSummary({
      period: this.selectedPeriod()
    }).subscribe({
      next: (summary) => {
        this.paymentsCount.set(summary.paymentsCount ?? 0);
        this.coursesCount.set(summary.coursesCount ?? 0);
        this.accreditationsCount.set(summary.accreditationsCount ?? 0);
        this.ordersCount.set(summary.ordersCount ?? 0);
        this.partnersCount.set(summary.partnersCount ?? 0);
        this.volunteersCount.set(summary.volunteersCount ?? 0);
        this.totalRevenue.set(summary.totalRevenue ?? 0);

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
onPeriodChange(value: DashboardPeriod) {
  this.selectedPeriod.set(value);
  this.fetchOverviewData();
}

  getPeriodLabel(): string {
    switch (this.selectedPeriod()) {
      case DashboardPeriod.Month:
        return 'Month';
      case DashboardPeriod.Week:
        return 'Week';
      case DashboardPeriod.Year:
        return 'Year';
      default:
        return 'Month';
    }
  }
}