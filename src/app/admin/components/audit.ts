import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GacamApiService } from '../../core/services/gacam-api';
import { AuditLog } from '../../models/types';
import { TranslatePipe } from '../../shared/pipes/translate';

@Component({
  selector: 'app-admin-audit',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './audit.html',
  styleUrl: './audit.css'
})
export class AdminAuditComponent implements OnInit {
  private apiService = inject(GacamApiService);

  loading = signal(true);
  auditLogs = signal<AuditLog[]>([]);

  ngOnInit() {
    this.fetchAuditLogs();
  }

  fetchAuditLogs() {
    this.loading.set(true);
    this.apiService.getAuditLogs().subscribe({
      next: (data) => {
        this.auditLogs.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
