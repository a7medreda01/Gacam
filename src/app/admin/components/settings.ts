import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { GacamApiService } from '../../core/services/gacam-api';
import { ToastService } from '../../shared/components/toast/toast';
import { Setting } from '../../models/types';
import { TranslatePipe } from '../../shared/pipes/translate';

@Component({
  selector: 'app-admin-settings',
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class AdminSettingsComponent implements OnInit {
  private apiService = inject(GacamApiService);
  private toastService = inject(ToastService);

  loading = signal(true);

  settForm = new FormGroup({
    signatoryName: new FormControl('', [Validators.required]),
    sealPhotoUrl: new FormControl('', [Validators.required])
  });

  ngOnInit() {
    this.fetchSettings();
  }

  fetchSettings() {
    this.loading.set(true);
    this.apiService.getSettings().subscribe({
      next: (setts) => {
        this.settForm.setValue({
          signatoryName: setts.signatoryName ?? '',
          sealPhotoUrl: setts.sealPhotoUrl ?? ''
        });
        this.loading.set(false);
      },
      error: () => {
        this.toastService.showError('Could not sync current configuration node.');
        this.loading.set(false);
      }
    });
  }

  onSaveSettings() {
    if (this.settForm.invalid) return;
    this.loading.set(true);

    this.apiService.getSettings().subscribe({
      next: (current) => {
        const payload: Setting = {
          ...current,
          signatoryName: this.settForm.value.signatoryName!,
          sealPhotoUrl: this.settForm.value.sealPhotoUrl!
        };
        this.apiService.updateSettings(payload).subscribe({
          next: () => {
            this.toastService.showSuccess('Global configurations saved successfully.');
            this.loading.set(false);
          },
          error: () => {
            this.toastService.showError('Could not write configuration node updates.');
            this.loading.set(false);
          }
        });
      },
      error: () => {
        this.toastService.showError('Error sync reading configuration nodes.');
        this.loading.set(false);
      }
    });
  }
}
