import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { GacamApiService } from '../../core/services/gacam-api';
import { AuthService } from '../../core/services/auth';
import { LanguageService } from '../../core/services/language';
import { ToastService } from '../../shared/components/toast/toast';
import { Setting, CertificateDesign } from '../../models/types';
import { TranslatePipe } from '../../shared/pipes/translate';

@Component({
  selector: 'app-admin-settings',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, TranslatePipe],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class AdminSettingsComponent implements OnInit {
  private apiService = inject(GacamApiService);
  private toastService = inject(ToastService);
  authService = inject(AuthService);
  langService = inject(LanguageService);

  loading = signal(true);
  certLoading = signal(true);

  // General Portal Settings Form
  settForm = new FormGroup({
    signatoryName: new FormControl('', [Validators.required]),
    sealPhotoUrl: new FormControl('', [Validators.required])
  });

  // Certificate Design Form
  certForm = new FormGroup({
    primaryColor: new FormControl('#003F4A', [Validators.required]),
    secondaryColor: new FormControl('#C9A96B', [Validators.required]),
    borderColor: new FormControl('#003F4A', [Validators.required]),
    borderWidth: new FormControl(10, [Validators.required, Validators.min(0)]),
    titleEn: new FormControl('', [Validators.required]),
    titleAr: new FormControl('', [Validators.required]),
    headerTextEn: new FormControl('', [Validators.required]),
    headerTextAr: new FormControl('', [Validators.required]),
    signatoryName: new FormControl('', [Validators.required]),
    signatoryTitleEn: new FormControl('', [Validators.required]),
    signatoryTitleAr: new FormControl('', [Validators.required]),
    signatureImageUrl: new FormControl(''),
    backgroundImageUrl: new FormControl(''),
    showLogo: new FormControl(true),
    logoHeight: new FormControl(65, [Validators.required, Validators.min(10)])
  });

  currentCertDesign: CertificateDesign | null = null;

  ngOnInit() {
    this.fetchSettings();
    this.fetchCertSettings();
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

  fetchCertSettings() {
    this.certLoading.set(true);
    this.apiService.getCertDesign().subscribe({
      next: (design) => {
        this.currentCertDesign = design;
        this.certForm.patchValue({
          primaryColor: design.primaryColor ?? '#003F4A',
          secondaryColor: design.secondaryColor ?? '#C9A96B',
          borderColor: design.borderColor ?? '#003F4A',
          borderWidth: design.borderWidth ?? 10,
          titleEn: design.titleEn ?? '',
          titleAr: design.titleAr ?? '',
          headerTextEn: design.headerTextEn ?? '',
          headerTextAr: design.headerTextAr ?? '',
          signatoryName: design.signatoryName ?? '',
          signatoryTitleEn: design.signatoryTitleEn ?? '',
          signatoryTitleAr: design.signatoryTitleAr ?? '',
          signatureImageUrl: design.signatureImageUrl ?? '',
          backgroundImageUrl: design.backgroundImageUrl ?? '',
          showLogo: design.showLogo ?? true,
          logoHeight: design.logoHeight ?? 65
        });
        this.certLoading.set(false);
      },
      error: () => {
        this.toastService.showError('Could not fetch certificate design node.');
        this.certLoading.set(false);
      }
    });
  }

  onSaveSettings() {
    if (!this.authService.isAdmin() || this.settForm.invalid) return;
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

  onSaveCertSettings() {
    if (!this.authService.isAdmin() || this.certForm.invalid) return;
    this.certLoading.set(true);

    const payload: CertificateDesign = {
      id: this.currentCertDesign?.id || 1,
      primaryColor: this.certForm.value.primaryColor!,
      secondaryColor: this.certForm.value.secondaryColor!,
      borderColor: this.certForm.value.borderColor!,
      borderWidth: Number(this.certForm.value.borderWidth!),
      titleEn: this.certForm.value.titleEn!,
      titleAr: this.certForm.value.titleAr!,
      headerTextEn: this.certForm.value.headerTextEn!,
      headerTextAr: this.certForm.value.headerTextAr!,
      signatoryName: this.certForm.value.signatoryName!,
      signatoryTitleEn: this.certForm.value.signatoryTitleEn!,
      signatoryTitleAr: this.certForm.value.signatoryTitleAr!,
      signatureImageUrl: this.certForm.value.signatureImageUrl || null,
      backgroundImageUrl: this.certForm.value.backgroundImageUrl || null,
      showLogo: !!this.certForm.value.showLogo,
      logoHeight: Number(this.certForm.value.logoHeight!)
    };

    this.apiService.updateCertDesign(payload).subscribe({
      next: (updated) => {
        this.currentCertDesign = updated;
        this.toastService.showSuccess('Certificate template design committed.');
        this.certLoading.set(false);
      },
      error: () => {
        this.toastService.showError('Failed to commit certificate design parameters.');
        this.certLoading.set(false);
      }
    });
  }

  onUploadSignature(event: Event) {
    if (!this.authService.isAdmin()) return;
    const files = (event.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;

    this.certLoading.set(true);
    this.apiService.uploadSignature(files[0]).subscribe({
      next: (res) => {
        this.certForm.patchValue({ signatureImageUrl: res.relativePath });
        this.toastService.showSuccess('Signature asset uploaded successfully.');
        // If we save right after, user convenience is maximized
        this.onSaveCertSettings();
      },
      error: () => {
        this.toastService.showError('Failed to upload signature asset.');
        this.certLoading.set(false);
      }
    });
  }

  onUploadBackground(event: Event) {
    if (!this.authService.isAdmin()) return;
    const files = (event.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;

    this.certLoading.set(true);
    this.apiService.uploadBackground(files[0]).subscribe({
      next: (res) => {
        this.certForm.patchValue({ backgroundImageUrl: res.relativePath });
        this.toastService.showSuccess('Certificate background asset uploaded successfully.');
        this.onSaveCertSettings();
      },
      error: () => {
        this.toastService.showError('Failed to upload background asset.');
        this.certLoading.set(false);
      }
    });
  }

  onRemoveBackground() {
    if (!this.authService.isAdmin()) return;
    this.certLoading.set(true);
    this.apiService.removeBackground().subscribe({
      next: () => {
        this.certForm.patchValue({ backgroundImageUrl: null as any });
        this.toastService.showSuccess('Certificate background deleted. Standard white mode restored.');
        this.onSaveCertSettings();
      },
      error: () => {
        this.toastService.showError('Failed to clean background image asset.');
        this.certLoading.set(false);
      }
    });
  }
}
