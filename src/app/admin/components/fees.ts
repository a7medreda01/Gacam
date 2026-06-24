import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { GacamApiService } from '../../core/services/gacam-api';
import { LanguageService } from '../../core/services/language';
import { ToastService } from '../../shared/components/toast/toast';
import { ServiceFee, OrderType } from '../../models/types';
import { TranslatePipe } from '../../shared/pipes/translate';

@Component({
  selector: 'app-admin-fees',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, TranslatePipe],
  template: `
    <div class="space-y-8 animate-fade-in text-start">
      
      <!-- Top banner headers -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-champagne-gold/15 pb-6">
        <div>
          <span class="text-xs font-bold uppercase tracking-widest text-champagne-gold">
            {{ langService.lang() === 'ar' ? 'البوابة المالية للهيئة' : 'Financial Management Node' }}
          </span>
          <h1 class="text-2xl font-black text-royal-teal tracking-tight mt-1">
            {{ langService.lang() === 'ar' ? 'التحكم بأسعار ورسوم الخدمات' : 'Service Pricing & Tariffs' }}
          </h1>
          <p class="text-xs text-deep-teal/60 font-sans mt-0.5">
            {{ langService.lang() === 'ar' ? 'تعديل وتحديث أسعار التراخيص والبطاقات وتكلفة الشحن الدولي لكافة الطلبات.' : 'Modify global tariffs, international parcel shipping, and accreditation application fees live.' }}
          </p>
        </div>
        
        <button (click)="fetchFees()"
                class="inline-flex items-center gap-1.5 px-4 py-2 bg-royal-teal text-white border border-champagne-gold/20 rounded-xl hover:bg-champagne-gold hover:text-royal-teal transition-all text-xs font-bold cursor-pointer font-sans shadow-md">
          <mat-icon class="text-xs scale-90" [class.animate-spin]="loading()">sync</mat-icon>
          <span>{{ langService.lang() === 'ar' ? 'تحديث البيانات' : 'Sync Tariffs' }}</span>
        </button>
      </div>

      <!-- Loading Placeholder -->
      @if (loading()) {
        <div class="bg-white rounded-3xl border border-champagne-gold/10 p-24 flex flex-col items-center justify-center gap-3 shadow-sm">
          <div class="w-10 h-10 border-3 border-royal-teal border-t-transparent rounded-full animate-spin"></div>
          <p class="text-xs font-medium text-deep-teal/50 font-sans">
            {{ langService.lang() === 'ar' ? 'جاري تحميل قائمة الأسعار المعتمدة...' : 'Querying remote tariff records...' }}
          </p>
        </div>
      } @else {
        <!-- Dynamic Grid of Service Fees -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (fee of fees(); track fee.id) {
            <div class="bg-white rounded-3xl border border-champagne-gold/15 shadow-md flex flex-col hover:border-royal-teal/40 transition-all duration-300 relative overflow-hidden group">
              <!-- Accent bar -->
              <div class="absolute top-0 inset-x-0 h-1.5 bg-royal-teal"></div>
              
              <div class="p-6 flex-grow flex flex-col justify-between">
                <!-- Card Header -->
                <div class="mb-5">
                  <div class="flex items-center justify-between mb-2">
                    <span class="px-2.5 py-0.5 bg-light-ivory text-royal-teal border border-champagne-gold/25 rounded-md text-[9px] font-bold font-mono uppercase tracking-wider">
                      {{ fee.code }}
                    </span>
                    <span class="inline-flex items-center gap-1 text-[10px] uppercase font-bold font-mono"
                          [class]="fee.isActive ? 'text-emerald-600' : 'text-rose-500'">
                      <span class="w-1.5 h-1.5 rounded-full" [class]="fee.isActive ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                      {{ fee.isActive ? (langService.lang() === 'ar' ? 'نشط' : 'Active') : (langService.lang() === 'ar' ? 'معطل' : 'Disabled') }}
                    </span>
                  </div>
                  
                  <h3 class="text-sm font-extrabold text-royal-teal">
                    {{ langService.lang() === 'ar' ? fee.nameAr : fee.nameEn }}
                  </h3>
                  <p class="text-[10px] text-deep-teal/50 font-sans mt-0.5">
                    {{ langService.lang() === 'ar' ? 'نوع الطلب المالي: ' : 'Financial Order Type: ' }}
                    <span class="font-mono text-xs font-bold text-champagne-gold">{{ getOrderTypeLabel(fee.orderType) }}</span>
                  </p>
                </div>

                <!-- Values / Stats Overview -->
                <div class="grid grid-cols-2 gap-3 bg-light-ivory/50 rounded-xl p-3 border border-champagne-gold/10 mb-5 text-center">
                  <div>
                    <span class="text-[9px] text-deep-teal/40 block font-bold uppercase tracking-wider font-mono">
                      {{ langService.lang() === 'ar' ? 'سعر الخدمة' : 'Unit Price' }}
                    </span>
                    <span class="text-sm font-black text-royal-teal font-sans">
                      {{ fee.unitPrice | number:'1.2-2' }} <span class="text-[10px] font-sans font-medium text-champagne-gold">CAD</span>
                    </span>
                  </div>
                  <div>
                    <span class="text-[9px] text-deep-teal/40 block font-bold uppercase tracking-wider font-mono">
                      {{ langService.lang() === 'ar' ? 'تكلفة التوصيل' : 'Courier Fee' }}
                    </span>
                    <span class="text-sm font-black text-teal-600 font-sans">
                      {{ fee.shippingFee | number:'1.2-2' }} <span class="text-[10px] font-sans font-medium text-champagne-gold">CAD</span>
                    </span>
                  </div>
                </div>

                <!-- Inline Mini-form for Editing -->
                <form [formGroup]="getFormGroup(fee.id)" class="space-y-3.5">
                  <div class="grid grid-cols-2 gap-3">
                    <div class="flex flex-col gap-1 text-[11px]">
                      <label class="font-bold text-deep-teal font-sans">
                        {{ langService.lang() === 'ar' ? 'سعر الخدمة *' : 'Unit Price *' }}
                      </label>
                      <input type="number" formControlName="unitPrice"
                             class="px-3 py-1.5 border border-champagne-gold/30 rounded-lg bg-light-ivory/30 focus:outline-royal-teal font-sans text-xs w-full" />
                    </div>
                    
                    <div class="flex flex-col gap-1 text-[11px]">
                      <label class="font-bold text-deep-teal font-sans">
                        {{ langService.lang() === 'ar' ? 'رسوم التوصيل *' : 'Shipping Fee *' }}
                      </label>
                      <input type="number" formControlName="shippingFee"
                             class="px-3 py-1.5 border border-champagne-gold/30 rounded-lg bg-light-ivory/30 focus:outline-royal-teal font-sans text-xs w-full" />
                    </div>
                  </div>

                  <!-- Status Toggle & Title custom edits -->
                  <div class="flex items-center justify-between py-1 bg-light-ivory/20 px-2 rounded-lg border border-champagne-gold/5 text-xs font-sans">
                    <span class="font-bold text-deep-teal mt-0.5">
                      {{ langService.lang() === 'ar' ? 'متاح للطلب العام' : 'Public Availability' }}
                    </span>
                    <label class="relative inline-flex items-center cursor-pointer select-none">
                      <input type="checkbox" formControlName="isActive" class="sr-only peer" />
                      <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-royal-teal"></div>
                    </label>
                  </div>

                  <!-- Action Buttons -->
                  <div class="pt-2">
                    <button type="button" (click)="saveFee(fee)"
                            [disabled]="isFormInvalid(fee.id) || updatingId() === fee.id"
                            class="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-royal-teal text-white border border-champagne-gold/25 rounded-xl text-xs font-bold transition-all hover:bg-champagne-gold hover:text-royal-teal cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
                      @if (updatingId() === fee.id) {
                        <mat-icon class="text-xs scale-90 animate-spin">refresh</mat-icon>
                        <span>{{ langService.lang() === 'ar' ? 'جاري الحفظ...' : 'Saving updates...' }}</span>
                      } @else {
                        <mat-icon class="text-xs scale-90">save</mat-icon>
                        <span>{{ langService.lang() === 'ar' ? 'حفظ وتحديث السعر' : 'Save & Update Tariff' }}</span>
                      }
                    </button>
                  </div>
                </form>

              </div>
            </div>
          }
        </div>
      }

    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AdminFeesComponent implements OnInit {
  langService  = inject(LanguageService);
  private apiService   = inject(GacamApiService);
  private toastService = inject(ToastService);
  private fb           = inject(FormBuilder);

  loading = signal(true);
  updatingId = signal<number | null>(null);
  fees = signal<ServiceFee[]>([]);

  // Local Angular Reactive FormGroups map keyed by ServiceFee ID
  feeFormsMap: { [id: number]: FormGroup } = {};

  ngOnInit() {
    this.fetchFees();
  }

  fetchFees() {
    this.loading.set(true);
    this.apiService.getFees().subscribe({
      next: (res) => {
        this.fees.set(res || []);
        this.initializeForms(res || []);
        this.loading.set(false);
      },
      error: () => {
        this.toastService.showError('Could not sync current remote Service Tariffs nodes.');
        this.loading.set(false);
      }
    });
  }

  initializeForms(feesList: ServiceFee[]) {
    this.feeFormsMap = {};
    feesList.forEach(fee => {
      this.feeFormsMap[fee.id] = this.fb.group({
        unitPrice: [fee.unitPrice ?? fee.amount ?? 0, [Validators.required, Validators.min(0)]],
        shippingFee: [fee.shippingFee ?? 0, [Validators.required, Validators.min(0)]],
        isActive: [fee.isActive ?? true]
      });
    });
  }

  getFormGroup(id: number): FormGroup {
    return this.feeFormsMap[id] || this.fb.group({});
  }

  isFormInvalid(id: number): boolean {
    const group = this.feeFormsMap[id];
    return group ? group.invalid : true;
  }

  /**
   * Maps the numeric/raw OrderType value coming from the backend
   * to its human-readable label, matching the backend enum:
   * public enum OrderType { CertificatePrint, AccreditationCardPrint }
   */
  getOrderTypeLabel(t: any): string {
    const isAr = this.langService.lang() === 'ar';
    const val = Number(t);
    return val === OrderType.CertificatePrint
      ? (isAr ? 'طباعة شهادة' : 'Certificate Print')
      : (isAr ? 'طباعة بطاقة الاعتماد' : 'Accreditation Card Print');
  }

  saveFee(fee: ServiceFee) {
    const group = this.feeFormsMap[fee.id];
    if (!group || group.invalid) return;

    this.updatingId.set(fee.id);
    const formValues = group.value;

    const payload = {
      unitPrice: parseFloat(formValues.unitPrice),
      shippingFee: parseFloat(formValues.shippingFee),
      isActive: !!formValues.isActive
    };

    // Use code or orderType to identify
    const param = fee.code || fee.orderType;

    this.apiService.updateServiceFee(param, payload).subscribe({
      next: (updatedFee) => {
        this.toastService.showSuccess(
          this.langService.lang() === 'ar' 
            ? `تم تحديث رسوم الخدمة (${fee.code}) بنجاح.` 
            : `Tariff updates for service (${fee.code}) successfully written to system nodes.`
        );
        
        // Refresh local state lists gracefully
        this.fees.update(list => list.map(f => f.id === fee.id ? { ...f, ...updatedFee, ...payload } : f));
        this.updatingId.set(null);
      },
      error: () => {
        this.toastService.showError('Could not complete update requests. Access Denied or server node failure.');
        this.updatingId.set(null);
      }
    });
  }
}