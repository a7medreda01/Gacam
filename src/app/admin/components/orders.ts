import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { GacamApiService } from '../../core/services/gacam-api';
import { LanguageService } from '../../core/services/language';
import { ToastService } from '../../shared/components/toast/toast';
import { Order, OrderStatus, OrderType } from '../../models/types';
import { TranslatePipe } from '../../shared/pipes/translate';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink, MatIconModule, TranslatePipe],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class AdminOrdersComponent implements OnInit {
  apiService  = inject(GacamApiService);
  langService = inject(LanguageService);
  toast       = inject(ToastService);

  orders      = signal<Order[]>([]);
  loading     = signal(true);

  // --- Printing & Certificate Configurations sub-tabs ---
  selectedSubTab = signal<'orders' | 'configs'>('orders');
  configLoading  = signal(false);

  // General site settings form
  generalSettingsForm = new FormGroup({
    id: new FormControl<number>(1),
    siteTitleEn: new FormControl('', [Validators.required]),
    siteTitleAr: new FormControl('', [Validators.required]),
    logoUrl: new FormControl(''),
    facebook: new FormControl(''),
    twitter: new FormControl(''),
    instagram: new FormControl(''),
    linkedin: new FormControl(''),
    youtube: new FormControl(''),
    email: new FormControl(''),
    phone: new FormControl(''),
    address: new FormControl('')
  });

  // Certificate / Card Visual design configuration form
  certDesignForm = new FormGroup({
    id: new FormControl<number>(1),
    primaryColor: new FormControl('#003F4A', [Validators.required]),
    secondaryColor: new FormControl('#C9A96B', [Validators.required]),
    borderColor: new FormControl('#003F4A', [Validators.required]),
    borderWidth: new FormControl<number>(10, [Validators.required, Validators.min(0)]),
    titleEn: new FormControl('', [Validators.required]),
    titleAr: new FormControl('', [Validators.required]),
    headerTextEn: new FormControl('', [Validators.required]),
    headerTextAr: new FormControl('', [Validators.required]),
    signatoryName: new FormControl(''),
    signatoryTitleEn: new FormControl(''),
    signatoryTitleAr: new FormControl(''),
    signatureImageUrl: new FormControl<string | null>(null),
    backgroundImageUrl: new FormControl<string | null>(null),
    showLogo: new FormControl<boolean>(true),
    logoHeight: new FormControl<number>(60, [Validators.required, Validators.min(10)])
  });

  uploadingLogo = signal(false);
  uploadingSignature = signal(false);
  uploadingBackground = signal(false);

  // Pagination & Search and Filter State
  searchVal   = signal('');
  statusFilter = signal<number | undefined>(undefined);
  
  currentPage = signal(1);
  pageSize    = signal(10);
  totalCount  = signal(0);
  totalPages  = signal(0);
  hasNext     = signal(false);
  hasPrevious = signal(false);

  // Modal actions
  showEditModal = signal(false);
  editingOrder  = signal<Order | null>(null);
  updating      = signal(false);

  // Status Change Forms
  statusForm = new FormGroup({
    status: new FormControl<number>(0, [Validators.required]),
    notes:  new FormControl('', [Validators.required, Validators.minLength(2)])
  });

  // Tracking details
  trackingForm = new FormGroup({
    trackingNumber: new FormControl(''),
    notes:          new FormControl('')
  });

  activeTab = signal<'status' | 'tracking'>('status');

  constructor() {
    // Re-fetch when page, size, search, and status tags update
    effect(() => {
      this.fetchOrders();
    });
  }

  ngOnInit() {
    this.fetchConfigData();
  }

  fetchOrders() {
    this.loading.set(true);
    const search = this.searchVal();
    const status = this.statusFilter();
    
    this.apiService.getOrders(
      this.currentPage(),
      this.pageSize(),
      search || undefined,
      status
    ).subscribe({
      next: (res) => {
        this.orders.set(res.items);
        this.totalCount.set(res.totalCount);
        this.totalPages.set(res.totalPages);
        this.hasNext.set(res.hasNext);
        this.hasPrevious.set(res.hasPrevious);
        this.loading.set(false);
      },
      error: () => {
        this.toast.showError('Unable to fetch print orders records.');
        this.loading.set(false);
      }
    });
  }

  onSearch(e: Event) {
    const input = e.target as HTMLInputElement;
    this.searchVal.set(input.value);
    this.currentPage.set(1);
  }

  onStatusFilter(status: number | undefined) {
    this.statusFilter.set(status);
    this.currentPage.set(1);
  }

  onPageSizeChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    this.pageSize.set(Number(select.value));
    this.currentPage.set(1);
  }

  setPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  // Edit / Update Modal Actions
  openEditModal(ord: Order) {
    this.editingOrder.set(ord);
    this.statusForm.reset({
      status: Number(ord.orderStatus),
      notes: ''
    });
    this.trackingForm.reset({
      trackingNumber: ord.trackingNumber || '',
      notes: ''
    });
    this.activeTab.set('status');
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.editingOrder.set(null);
  }

  updateOrderStatus() {
    const ord = this.editingOrder();
    if (!ord || this.statusForm.invalid) return;

    this.updating.set(true);
    const formVal = this.statusForm.value;
    const newStatus = Number(formVal.status) as OrderStatus;

    this.apiService.updateOrderStatus(ord.id, newStatus, formVal.notes || '').subscribe({
      next: () => {
        this.toast.showSuccess(
          this.langService.lang() === 'ar' ? 'تم تحديث حالة الطلب واللوج التاريخي بنجاح!' : 'Order status updated successfully!'
        );
        this.updating.set(false);
        this.closeEditModal();
        this.fetchOrders();
      },
      error: () => {
        this.toast.showError('Could not process status update.');
        this.updating.set(false);
      }
    });
  }

  updateTrackingDetails() {
    const ord = this.editingOrder();
    if (!ord) return;

    this.updating.set(true);
    const formVal = this.trackingForm.value;

    this.apiService.updateOrder(ord.id, {
      quantity: ord.quantity,
      notes: formVal.notes || undefined,
      trackingNumber: formVal.trackingNumber || undefined
    }).subscribe({
      next: () => {
        this.toast.showSuccess(
          this.langService.lang() === 'ar' ? 'تم تحديث تفاصيل التتبع والشحن!' : 'Tracking number updated successfully!'
        );
        this.updating.set(false);
        this.closeEditModal();
        this.fetchOrders();
      },
      error: () => {
        this.toast.showError('Could not save tracking details.');
        this.updating.set(false);
      }
    });
  }

  // UI status color helper
  getOrderTypeLabel(t: any): string {
    const isAr = this.langService.lang() === 'ar';
    const s = Number(t);
    return s === 0 ? (isAr ? 'طباعة شهادة' : 'Certificate Print') : (isAr ? 'طباعة بطاقة' : 'Card Print');
  }

  getOrderStatusLabel(s: any): string {
    const isAr = this.langService.lang() === 'ar';
    const val = Number(s);
    switch (val) {
      case 0: return isAr ? 'قيد الانتظار' : 'Pending';
      case 1: return isAr ? 'بانتظار الدفع' : 'Waiting Payment';
      case 2: return isAr ? 'تم تقديم الدفع' : 'Payment Submitted';
      case 3: return isAr ? 'قيد المراجعة' : 'Under Review';
      case 4: return isAr ? 'مقبول' : 'Approved';
      case 5: return isAr ? 'قيد الإنتاج' : 'In Production';
      case 6: return isAr ? 'تمت الطباعة' : 'Printed';
      case 7: return isAr ? 'جاهز للتسليم' : 'Ready for Delivery';
      case 8: return isAr ? 'تم التسليم' : 'Delivered';
      case 9: return isAr ? 'مرفوض' : 'Rejected';
      case 10: return isAr ? 'ملغى' : 'Cancelled';
      default: return isAr ? 'نشط' : 'Active';
    }
  }

  getOrderStatusClass(s: any): string {
    const val = Number(s);
    if (val === 4 || val === 8) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (val === 9 || val === 10) return 'bg-red-100 text-red-800 border-red-200';
    if (val === 5 || val === 6 || val === 7) return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    return 'bg-amber-100 text-amber-800 border-amber-200';
  }


  printLoadingIds = signal<Set<number>>(new Set());

printCredential(ord: Order) {
  this.printLoadingIds.update(ids => new Set([...ids, ord.id]));

  this.apiService.getCertificateById(ord.relatedRecordId).subscribe({
    next: (cert) => {
      this.printLoadingIds.update(ids => { const s = new Set(ids); s.delete(ord.id); return s; });
      if (typeof window !== 'undefined') {
        window.open(this.apiService.downloadCertificateUrl(cert.id), '_blank');
      }
    },
    error: () => {
      this.printLoadingIds.update(ids => { const s = new Set(ids); s.delete(ord.id); return s; });
      this.toast.showError(
        this.langService.lang() === 'ar'
          ? 'تعذر العثور على السجل المرتبط بهذا الطلب (شهادة / بطاقة).'
          : 'Could not find the related certificate/card record for this order.'
      );
    }
  });
}
isCertificateOrder(ord: Order): boolean {
  return Number(ord.orderType) === 0;
}

  // --- Configurations & Printing Design logic ---
  fetchConfigData() {
    this.configLoading.set(true);
    // Fetch settings
    this.apiService.getSettings().subscribe({
      next: (setts) => {
        let social = { facebook: '', twitter: '', instagram: '', linkedin: '', youtube: '' };
        let contact = { email: '', phone: '', address: '' };
        try {
          if (setts.socialLinksJson) {
            social = { ...social, ...JSON.parse(setts.socialLinksJson) };
          }
        } catch(e) {}
        try {
          if (setts.contactInfo) {
            contact = { ...contact, ...JSON.parse(setts.contactInfo) };
          }
        } catch(e) {}

        this.generalSettingsForm.patchValue({
          id: setts.id || 1,
          siteTitleEn: setts.siteTitleEn || '',
          siteTitleAr: setts.siteTitleAr || '',
          logoUrl: setts.logoUrl || '',
          facebook: social.facebook || '',
          twitter: social.twitter || '',
          instagram: social.instagram || '',
          linkedin: social.linkedin || '',
          youtube: social.youtube || '',
          email: contact.email || '',
          phone: contact.phone || '',
          address: contact.address || ''
        });
      }
    });

    // Fetch cert design
    this.apiService.getCertDesign().subscribe({
      next: (design) => {
        this.certDesignForm.patchValue({
          id: design.id || 1,
          primaryColor: design.primaryColor || '#003F4A',
          secondaryColor: design.secondaryColor || '#C9A96B',
          borderColor: design.borderColor || '#003F4A',
          borderWidth: design.borderWidth ?? 10,
          titleEn: design.titleEn || '',
          titleAr: design.titleAr || '',
          headerTextEn: design.headerTextEn || '',
          headerTextAr: design.headerTextAr || '',
          signatoryName: design.signatoryName || '',
          signatoryTitleEn: design.signatoryTitleEn || '',
          signatoryTitleAr: design.signatoryTitleAr || '',
          signatureImageUrl: design.signatureImageUrl || null,
          backgroundImageUrl: design.backgroundImageUrl || null,
          showLogo: design.showLogo ?? true,
          logoHeight: design.logoHeight ?? 60
        });
        this.configLoading.set(false);
      },
      error: () => {
        this.configLoading.set(false);
      }
    });
  }

  onSaveGeneralSettings() {
    if (this.generalSettingsForm.invalid) return;
    this.configLoading.set(true);

    const fv = this.generalSettingsForm.value;
    const socialLinksJson = JSON.stringify({
      facebook: fv.facebook || '',
      twitter: fv.twitter || '',
      instagram: fv.instagram || '',
      linkedin: fv.linkedin || '',
      youtube: fv.youtube || ''
    });

    const contactInfo = JSON.stringify({
      email: fv.email || '',
      phone: fv.phone || '',
      address: fv.address || ''
    });

    const payload = {
      id: fv.id || 1,
      siteTitleEn: fv.siteTitleEn || '',
      siteTitleAr: fv.siteTitleAr || '',
      logoUrl: fv.logoUrl || '',
      socialLinksJson,
      contactInfo
    };

    this.apiService.updateSettings(payload as any).subscribe({
      next: () => {
        this.toast.showSuccess(
          this.langService.lang() === 'ar' ? 'تم حفظ إعدادات الهوية العامة للموقع بنجاح!' : 'General site parameters updated successfully!'
        );
        this.configLoading.set(false);
      },
      error: () => {
        this.toast.showError('Could not update general settings.');
        this.configLoading.set(false);
      }
    });
  }

  onSaveCertDesign() {
    if (this.certDesignForm.invalid) return;
    this.configLoading.set(true);

    const fv = this.certDesignForm.value;
    const payload = {
      id: fv.id || 1,
      primaryColor: fv.primaryColor || '#003F4A',
      secondaryColor: fv.secondaryColor || '#C9A96B',
      borderColor: fv.borderColor || '#003F4A',
      borderWidth: Number(fv.borderWidth) || 10,
      titleEn: fv.titleEn || '',
      titleAr: fv.titleAr || '',
      headerTextEn: fv.headerTextEn || '',
      headerTextAr: fv.headerTextAr || '',
      signatoryName: fv.signatoryName || '',
      signatoryTitleEn: fv.signatoryTitleEn || '',
      signatoryTitleAr: fv.signatoryTitleAr || '',
      signatureImageUrl: fv.signatureImageUrl || null,
      backgroundImageUrl: fv.backgroundImageUrl || null,
      showLogo: fv.showLogo ?? true,
      logoHeight: Number(fv.logoHeight) || 60
    };

    this.apiService.updateCertDesign(payload as any).subscribe({
      next: () => {
        this.toast.showSuccess(
          this.langService.lang() === 'ar' ? 'تم تحديث تصميم الشهادات والبطاقات واللوائح الشرفية بنجاح!' : 'Certificates and interactive credentials designer updated successfully!'
        );
        this.configLoading.set(false);
      },
      error: () => {
        this.toast.showError('Could not write certificate design parameters.');
        this.configLoading.set(false);
      }
    });
  }

  onFileSelected(event: Event, type: 'logo' | 'signature' | 'background') {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    if (type === 'logo') {
      this.uploadingLogo.set(true);
      this.apiService.uploadLogo(file).subscribe({
        next: (res) => {
          this.generalSettingsForm.patchValue({ logoUrl: res.relativePath });
          this.toast.showSuccess(
            this.langService.lang() === 'ar' ? 'تم رفع الشعار وحفظه تلقائيًا!' : 'Logo uploaded and auto-saved!'
          );
          this.uploadingLogo.set(false);
        },
        error: () => {
          this.toast.showError('Could not upload logo.');
          this.uploadingLogo.set(false);
        }
      });
    } else if (type === 'signature') {
      this.uploadingSignature.set(true);
      this.apiService.uploadSignature(file).subscribe({
        next: (res) => {
          this.certDesignForm.patchValue({ signatureImageUrl: res.relativePath });
          this.toast.showSuccess(
            this.langService.lang() === 'ar' ? 'تم رفع التوقيع وحفظه تلقائيًا!' : 'Signature uploaded and auto-saved!'
          );
          this.uploadingSignature.set(false);
        },
        error: () => {
          this.toast.showError('Could not upload signature.');
          this.uploadingSignature.set(false);
        }
      });
    } else if (type === 'background') {
      this.uploadingBackground.set(true);
      this.apiService.uploadBackground(file).subscribe({
        next: (res) => {
          this.certDesignForm.patchValue({ backgroundImageUrl: res.relativePath });
          this.toast.showSuccess(
            this.langService.lang() === 'ar' ? 'تم رفع الخلفية وحفظها تلقائيًا!' : 'Background image uploaded and auto-saved!'
          );
          this.uploadingBackground.set(false);
        },
        error: () => {
          this.toast.showError('Could not upload background image.');
          this.uploadingBackground.set(false);
        }
      });
    }
  }

  removeBackgroundImage() {
    this.configLoading.set(true);
    this.apiService.removeBackground().subscribe({
      next: () => {
        this.certDesignForm.patchValue({ backgroundImageUrl: null });
        this.toast.showSuccess(
          this.langService.lang() === 'ar' ? 'تم إزالة خلفية الشهادات بنجاح!' : 'Background image removed.'
        );
        this.configLoading.set(false);
      },
      error: () => {
        this.toast.showError('Could not remove background image.');
        this.configLoading.set(false);
      }
    });
  }
}
