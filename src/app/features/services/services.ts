import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { GacamApiService } from '../../core/services/gacam-api';
import { AuthService } from '../../core/services/auth';
import { LanguageService } from '../../core/services/language';
import { ToastService } from '../../shared/components/toast/toast';
import { Accreditation } from '../../models/types';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { FooterComponent } from '../../shared/components/footer/footer';
import { TranslatePipe } from '../../shared/pipes/translate';

/* ── helpers ── */
const CATEGORY_LABELS: Record<number, string> = {
  0: 'Press', 1: 'Media', 2: 'Staff', 3: 'Organizer',
  4: 'Speaker', 5: 'Guest', 6: 'VIP', 7: 'Trainee',
  8: 'Volunteer', 9: 'Board Member', 10: 'Executive',
  11: 'Honorary', 12: 'Partner',
};

const CARD_STATUS_LABELS: Record<number, string> = {
  0: 'ACTIVE', 1: 'EXPIRED', 2: 'REVOKED',
};

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatIconModule,
            NavbarComponent, FooterComponent, TranslatePipe],
  template: `
    <app-navbar></app-navbar>

    <main class="min-h-screen bg-light-ivory py-16">
      <div class="container-gacam">

        <!-- ── Page Header ── -->
        <div class="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-3">
          <span class="text-[11px] font-bold uppercase tracking-[0.2em] text-champagne-gold">
            GACAM Official Registry
          </span>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-royal-teal tracking-tight">
            {{ 'NAV.SERVICES' | translate }} &amp; {{ 'NAV.ACCREDITATION' | translate }}
          </h1>
          <p class="text-xs sm:text-sm text-deep-teal/70 leading-relaxed font-sans mt-1">
            {{ langService.lang() === 'ar'
              ? 'بوابة إصدار الاعتمادات الإعلامية الرسمية للصحفيين والمراسلين والنشطاء بدولة كندا.'
              : 'The central system for issuing accredited media press passes and credential verification.'
            }}
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          <!-- ── Left: Info Panel ── -->
          <div class="lg:col-span-5 flex flex-col gap-6">

            <!-- Fee Card -->
            <div class="bg-royal-teal text-white border border-champagne-gold/25 p-8 rounded-2xl shadow-xl relative overflow-hidden">
              <div class="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-champagne-gold/10 blur-2xl pointer-events-none"></div>

              <h2 class="text-xs font-bold text-champagne-gold uppercase tracking-[0.18em] border-b border-white/10 pb-4 mb-6">
                {{ langService.lang() === 'ar' ? 'الرسوم المعتمدة' : 'Fee Schedule' }}
              </h2>

              <div class="flex flex-col gap-5">
                <div class="flex justify-between items-center">
                  <div>
                    <p class="text-sm font-bold">50 CAD</p>
                    <p class="text-xs text-white/60 mt-0.5">
                      {{ langService.lang() === 'ar' ? 'رسوم المعالجة والطباعة' : 'Card Processing & Printing' }}
                    </p>
                  </div>
                  <mat-icon class="text-champagne-gold/80">credit_card</mat-icon>
                </div>

                <div class="flex justify-between items-center border-t border-white/5 pt-5">
                  <div>
                    <p class="text-sm font-bold">25 CAD</p>
                    <p class="text-xs text-white/60 mt-0.5">
                      {{ langService.lang() === 'ar' ? 'رسوم الشحن السريع' : 'Tracked Courier Shipping' }}
                    </p>
                  </div>
                  <mat-icon class="text-champagne-gold/80">local_shipping</mat-icon>
                </div>

                <div class="bg-deep-teal/40 border border-white/10 rounded-xl p-4 flex justify-between items-center mt-1">
                  <div>
                    <p class="text-base font-extrabold text-champagne-gold">75 CAD</p>
                    <p class="text-[10px] uppercase tracking-widest text-white/50 mt-0.5">
                      {{ langService.lang() === 'ar' ? 'المجموع الكلي' : 'Total Due' }}
                    </p>
                  </div>
                  <span class="text-xs bg-champagne-gold text-royal-teal font-extrabold px-3 py-1 rounded-full font-mono">CAD</span>
                </div>
              </div>

              <p class="mt-6 text-[10px] text-white/50 leading-relaxed font-sans italic border-t border-white/5 pt-4 flex gap-2 items-start">
                <mat-icon class="text-[14px] h-4 w-4 flex-shrink-0 mt-0.5">info</mat-icon>
                <span>
                  {{ langService.lang() === 'ar'
                    ? 'رسوم المعالجة غير قابلة للاسترداد عند بدء المراجعة.'
                    : 'All processing fees are non-refundable upon review outset.'
                  }}
                </span>
              </p>
            </div>

            <!-- Benefits -->
            <div class="bg-white border border-champagne-gold/15 p-6 rounded-2xl flex flex-col gap-4">
              <h3 class="text-[11px] font-bold text-royal-teal uppercase tracking-[0.16em]">
                {{ langService.lang() === 'ar' ? 'مزايا الاعتماد' : 'Accreditation Benefits' }}
              </h3>
              <ul class="text-xs text-deep-teal/75 flex flex-col gap-3 font-sans">
                <li class="flex gap-2.5 items-start">
                  <mat-icon class="text-champagne-gold text-sm h-4 w-4 flex-shrink-0 mt-0.5">verified</mat-icon>
                  <span>{{ langService.lang() === 'ar' ? 'انتساب مؤسسي رسمي يعكس المكانة المهنية.' : 'Official institutional affiliation and professional recognition.' }}</span>
                </li>
                <li class="flex gap-2.5 items-start">
                  <mat-icon class="text-champagne-gold text-sm h-4 w-4 flex-shrink-0 mt-0.5">qr_code_scanner</mat-icon>
                  <span>{{ langService.lang() === 'ar' ? 'تحقق فوري عبر مسح QR مرتبط بالسجلات الحية.' : 'Instant QR verification linked to live registry records.' }}</span>
                </li>
                <li class="flex gap-2.5 items-start">
                  <mat-icon class="text-champagne-gold text-sm h-4 w-4 flex-shrink-0 mt-0.5">badge</mat-icon>
                  <span>{{ langService.lang() === 'ar' ? 'دورة حياة كاملة للبطاقة: فعال، منتهي، ملغى.' : 'Full card lifecycle — Active, Expired, Revoked statuses.' }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- ── Right: Workspace ── -->
          <div class="lg:col-span-7 bg-white rounded-2xl border border-champagne-gold/15 shadow-sm overflow-hidden">

            <!-- Guest -->
            @if (!authService.isAuthenticated()) {
              <div class="p-10 text-center flex flex-col items-center gap-6">
                <div class="h-16 w-16 bg-royal-teal/5 rounded-full flex items-center justify-center border border-champagne-gold/20">
                  <mat-icon class="text-royal-teal" style="font-size:32px;width:32px;height:32px;">lock</mat-icon>
                </div>
                <div class="flex flex-col gap-2">
                  <h3 class="text-base font-bold text-royal-teal">
                    {{ langService.lang() === 'ar' ? 'تسجيل الدخول مطلوب' : 'Authentication Required' }}
                  </h3>
                  <p class="text-xs text-deep-teal/60 font-sans max-w-sm mx-auto leading-relaxed">
                    {{ langService.lang() === 'ar'
                      ? 'يرجى تسجيل الدخول لتقديم طلب الاعتماد الإعلامي.'
                      : 'Sign in to your GACAM account to submit your media accreditation request.'
                    }}
                  </p>
                </div>
                <div class="flex gap-3">
                  <a routerLink="/login"
                     class="px-6 py-2.5 text-xs font-bold bg-royal-teal text-white hover:bg-champagne-gold hover:text-royal-teal rounded-lg transition-colors shadow-sm">
                    {{ 'NAV.LOGIN' | translate }}
                  </a>
                  <a routerLink="/register"
                     class="px-6 py-2.5 text-xs font-bold border border-royal-teal/20 text-royal-teal hover:bg-light-ivory rounded-lg transition-colors">
                    {{ 'NAV.REGISTER' | translate }}
                  </a>
                </div>
              </div>

            } @else if (loading()) {
              <!-- Loading -->
              <div class="p-10 flex flex-col items-center justify-center gap-3">
                <div class="w-8 h-8 border-2 border-royal-teal border-t-transparent rounded-full animate-spin"></div>
                <p class="text-xs text-deep-teal/50 font-sans">
                  {{ langService.lang() === 'ar' ? 'جاري التحقق من السجلات...' : 'Checking records…' }}
                </p>
              </div>

            } @else if (!myApplication()) {
              <!-- ── Apply Form ── -->
              <div class="p-8">
                <div class="mb-6 border-b border-light-ivory pb-5">
                  <h3 class="text-base font-bold text-royal-teal">
                    {{ 'ACCREDITATION.APPLY' | translate }}
                  </h3>
                  <p class="text-xs text-deep-teal/50 mt-1 font-sans">
                    {{ langService.lang() === 'ar'
                      ? 'أكمل النموذج أدناه لتقديم طلب الاعتماد الإعلامي.'
                      : 'Complete the form below to submit your media accreditation application.'
                    }}
                  </p>
                </div>

                <form [formGroup]="applyForm" (ngSubmit)="onApply()" class="flex flex-col gap-5">

                  <!-- Category -->
                  <div class="flex flex-col gap-1.5 text-start">
                    <label for="acc-category" class="text-[11px] font-bold text-deep-teal uppercase tracking-wider">
                      {{ langService.lang() === 'ar' ? 'فئة الاعتماد' : 'Accreditation Category' }}
                      <span class="text-champagne-gold ml-0.5">*</span>
                    </label>
                    <select id="acc-category" formControlName="category"
                            class="px-4 py-2.5 text-xs border border-champagne-gold/25 rounded-lg bg-light-ivory/60
                                   focus:outline-none focus:ring-2 focus:ring-royal-teal/30 focus:border-royal-teal font-sans text-deep-teal transition">
                      <option value="Press">Press — صحفي</option>
                      <option value="Media">Media — إعلامي</option>
                      <option value="Staff">Staff — طاقم</option>
                      <option value="Organizer">Organizer — منظم</option>
                      <option value="Speaker">Speaker — متحدث</option>
                      <option value="Guest">Guest — ضيف</option>
                      <option value="VIP">VIP</option>
                      <option value="Trainee">Trainee — متدرب</option>
                      <option value="Volunteer">Volunteer — متطوع</option>
                      <option value="Partner">Partner — شريك</option>
                    </select>
                  </div>

                  <!-- Document Upload -->
                  <div class="flex flex-col gap-1.5 text-start">
                    <label for="acc-doc" class="text-[11px] font-bold text-deep-teal uppercase tracking-wider">
                      {{ langService.lang() === 'ar' ? 'المستند الداعم (CV، هوية، إلخ)' : 'Supporting Document' }}
                      <span class="text-deep-teal/30 font-normal normal-case ml-1 tracking-normal">
                        {{ langService.lang() === 'ar' ? '(اختياري)' : '(optional)' }}
                      </span>
                    </label>
                    <input id="acc-doc" type="file" accept=".pdf,.jpg,.jpeg,.png"
                           (change)="onFileChange($event)"
                           class="px-4 py-2 text-xs border border-champagne-gold/25 rounded-lg bg-light-ivory/60
                                  file:mr-3 file:text-[10px] file:font-bold file:border-0 file:bg-royal-teal
                                  file:text-white file:px-3 file:py-1.5 file:rounded file:cursor-pointer
                                  focus:outline-none focus:ring-2 focus:ring-royal-teal/30" />
                    <p class="text-[10px] text-deep-teal/40 font-sans">
                      {{ langService.lang() === 'ar' ? 'PDF أو صورة بحد أقصى 5MB' : 'PDF or image, max 5 MB' }}
                    </p>
                  </div>

                  <button type="submit" [disabled]="applyForm.invalid || submitting()"
                          class="mt-1 px-6 py-3 bg-royal-teal text-white font-bold hover:bg-champagne-gold hover:text-royal-teal
                                 rounded-lg transition-colors cursor-pointer text-xs flex items-center justify-center gap-2
                                 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                    @if (submitting()) {
                      <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{{ langService.lang() === 'ar' ? 'جاري الإرسال...' : 'Submitting…' }}</span>
                    } @else {
                      <mat-icon class="text-sm">send</mat-icon>
                      <span>{{ 'COMMON.SUBMIT' | translate }}</span>
                    }
                  </button>
                </form>
              </div>

            } @else {
              <!-- ── Application Status View ── -->

              <!-- Status Header Bar -->
              <div class="px-8 py-5 border-b border-light-ivory flex justify-between items-center gap-4">
                <div>
                  <h3 class="text-sm font-bold text-royal-teal">
                    {{ langService.lang() === 'ar' ? 'طلب الاعتماد' : 'Accreditation Application' }}
                  </h3>
                  <p class="text-[10px] text-deep-teal/40 mt-0.5 font-mono">
                    #{{ myApplication()?.id }} &nbsp;·&nbsp;
                    {{ langService.lang() === 'ar' ? 'تقدمت بتاريخ' : 'Submitted' }}
                    {{ myApplication()?.createdAt | date:'mediumDate' }}
                  </p>
                </div>
                <span class="px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase"
                      [class]="statusBadgeClass(myApplication()?.status)">
                  {{ statusLabel(myApplication()?.status) }}
                </span>
              </div>

              <!-- Application Info -->
              <div class="px-8 py-6 border-b border-light-ivory">
                <div class="grid grid-cols-2 gap-x-8 gap-y-4 text-xs">
                  <div>
                    <p class="text-[9px] font-bold uppercase tracking-widest text-deep-teal/40 mb-1">
                      {{ langService.lang() === 'ar' ? 'الاسم الكامل' : 'Full Name' }}
                    </p>
                    <p class="font-bold text-royal-teal">{{ myApplication()?.userFullName }}</p>
                  </div>
                  <div>
                    <p class="text-[9px] font-bold uppercase tracking-widest text-deep-teal/40 mb-1">
                      {{ langService.lang() === 'ar' ? 'البريد الإلكتروني' : 'Email' }}
                    </p>
                    <p class="font-semibold text-deep-teal/75">{{ myApplication()?.userEmail }}</p>
                  </div>
                  <div>
                    <p class="text-[9px] font-bold uppercase tracking-widest text-deep-teal/40 mb-1">
                      {{ langService.lang() === 'ar' ? 'الفئة' : 'Category' }}
                    </p>
                    <p class="font-bold text-royal-teal">{{ categoryLabel(myApplication()?.category) }}</p>
                  </div>

                </div>
              </div>

              <!-- ── Pending ── -->
              @if (isPending(myApplication()?.status)) {
                <div class="px-8 py-6">
                  <div class="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <mat-icon class="text-amber-500 flex-shrink-0 mt-0.5">hourglass_empty</mat-icon>
                    <div>
                      <p class="text-xs font-bold text-amber-800 mb-1">
                        {{ langService.lang() === 'ar' ? 'طلبك قيد المراجعة' : 'Application Under Review' }}
                      </p>
                      <p class="text-[11px] text-amber-700 font-sans leading-relaxed">
                        {{ langService.lang() === 'ar'
                          ? 'يراجع فريق GACAM طلبك حالياً. سيتم إشعارك فور اتخاذ القرار.'
                          : 'The GACAM team is reviewing your application. You will be notified once a decision is made.'
                        }}
                      </p>
                    </div>
                  </div>
                </div>
              }

              <!-- ── Approved: Professional Media Card ── -->
              @if (isApproved(myApplication()?.status)) {
                <div class="px-8 py-6 flex flex-col gap-6">

                  <!-- Approved notice -->
                  <div class="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl">
                    <mat-icon class="text-emerald-600 flex-shrink-0">verified</mat-icon>
                    <p class="text-xs font-bold">
                      {{ langService.lang() === 'ar'
                        ? 'تم اعتمادك رسمياً كعضو في هيئة GACAM الإعلامية.'
                        : 'Your GACAM media accreditation has been officially approved.'
                      }}
                    </p>
                  </div>

                  <!-- ── GACAM Digital Media Card ── -->
                  <div class="flex justify-center">
                    <div class="relative w-full max-w-sm select-none">

                      <!-- Card Body -->
                      <div class="bg-gradient-to-br from-royal-teal via-deep-teal to-[#062a2a] rounded-2xl border-2 border-champagne-gold/60 shadow-2xl overflow-hidden">

                        <!-- Gold accent bar top -->
                        <div class="h-1 w-full bg-gradient-to-r from-champagne-gold via-yellow-300 to-champagne-gold"></div>

                        <!-- Card Header -->
                        <div class="px-5 pt-4 pb-3 flex justify-between items-center border-b border-white/10">
                          <div class="flex items-center gap-2">
                            <div class="h-7 w-7 rounded bg-champagne-gold/20 border border-champagne-gold/30 flex items-center justify-center">
                              <mat-icon class="text-champagne-gold text-sm h-4 w-4">campaign</mat-icon>
                            </div>
                            <div>
                              <p class="text-[8px] font-extrabold tracking-[0.2em] text-champagne-gold uppercase leading-none">GACAM</p>
                              <p class="text-[7px] text-white/40 tracking-widest uppercase leading-none mt-0.5">Media Council Canada</p>
                            </div>
                          </div>
                          <span class="text-[9px] font-extrabold px-2.5 py-1 rounded-full tracking-wider uppercase"
                                [class]="cardStatusClass(myApplication()?.mediaCard?.status)">
                            {{ cardStatusLabel(myApplication()?.mediaCard?.status) }}
                          </span>
                        </div>

                        <!-- Card Body Content -->
                        <div class="px-5 py-4 flex gap-4 items-center">

                          <!-- Photo placeholder -->
                          <div class="h-20 w-16 rounded-lg bg-deep-teal/60 border border-champagne-gold/20 flex-shrink-0 flex items-center justify-center overflow-hidden">
                            <mat-icon class="text-white/20" style="font-size:36px;width:36px;height:36px;">person</mat-icon>
                          </div>

                          <!-- Member info -->
                          <div class="flex flex-col gap-1 text-start min-w-0">
                            <p class="text-white font-extrabold text-sm tracking-wide leading-tight truncate">
                              {{ myApplication()?.userFullName | uppercase }}
                            </p>
                            <div class="flex items-center gap-1.5 mt-0.5">
                              <span class="text-[9px] bg-champagne-gold/20 border border-champagne-gold/30 text-champagne-gold font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                {{ categoryLabel(myApplication()?.category) }}
                              </span>
                            </div>
                            <p class="text-[10px] text-white/50 mt-1 truncate font-mono">{{ myApplication()?.userEmail }}</p>
                          </div>
                        </div>

                        <!-- Card Footer -->
                        <div class="px-5 py-3 bg-black/20 border-t border-white/5 flex justify-between items-end">
                          <div>
                            <p class="text-[7px] text-white/30 uppercase tracking-[0.15em] mb-0.5">Card Serial</p>
                            <p class="text-[11px] font-mono font-bold text-champagne-gold tracking-wider">
                              {{ myApplication()?.mediaCard?.cardNumber }}
                            </p>
                          </div>
                          <div class="text-end">
                            <p class="text-[7px] text-white/30 uppercase tracking-[0.15em] mb-0.5">Valid Until</p>
                            <p class="text-[11px] font-mono font-bold text-white/80">
                              {{ myApplication()?.mediaCard?.expiresAt | date:'MM/yy' }}
                            </p>
                          </div>
                        </div>

                        <!-- Gold accent bar bottom -->
                        <div class="h-0.5 w-full bg-gradient-to-r from-transparent via-champagne-gold/40 to-transparent"></div>
                      </div>

                      <!-- Subtle glow under card -->
                      <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-royal-teal/30 blur-xl rounded-full pointer-events-none"></div>
                    </div>
                  </div>

                  <!-- QR / Card Meta -->
                  @if (myApplication()?.mediaCard) {
                    <div class="grid grid-cols-2 gap-3 text-xs">
                      <div class="bg-light-ivory/70 border border-champagne-gold/10 rounded-xl p-3 text-start">
                        <p class="text-[9px] text-deep-teal/40 uppercase tracking-wider mb-1">
                          {{ langService.lang() === 'ar' ? 'تاريخ الإصدار' : 'Issued At' }}
                        </p>
                        <p class="font-semibold text-royal-teal text-[11px]">
                          {{ myApplication()?.mediaCard?.issuedAt | date:'mediumDate' }}
                        </p>
                      </div>
                      <div class="bg-light-ivory/70 border border-champagne-gold/10 rounded-xl p-3 text-start">
                        <p class="text-[9px] text-deep-teal/40 uppercase tracking-wider mb-1">
                          {{ langService.lang() === 'ar' ? 'تاريخ الانتهاء' : 'Expires At' }}
                        </p>
                        <p class="font-semibold text-royal-teal text-[11px]">
                          {{ myApplication()?.mediaCard?.expiresAt | date:'mediumDate' }}
                        </p>
                      </div>
                      <div class="col-span-2 bg-light-ivory/70 border border-champagne-gold/10 rounded-xl p-3 text-start">
                        <p class="text-[9px] text-deep-teal/40 uppercase tracking-wider mb-1">QR Verify URL</p>
                        <p class="font-mono text-[10px] text-deep-teal/70 break-all">
                          {{ myApplication()?.mediaCard?.qrCodeData }}
                        </p>
                      </div>
                    </div>
                  }

                  <!-- Certificate CTA -->
                  <button (click)="requestCertificate()"
                          class="w-full py-3.5 bg-royal-teal text-white hover:bg-champagne-gold hover:text-royal-teal
                                 rounded-xl text-xs font-bold shadow-sm cursor-pointer flex items-center justify-center
                                 gap-2 transition-all">
                    <mat-icon class="text-sm">picture_as_pdf</mat-icon>
                    <span>
                      {{ langService.lang() === 'ar'
                        ? 'إصدار وتنزيل شهادة الاعتماد PDF'
                        : 'Download GACAM Accreditation Certificate (PDF)'
                      }}
                    </span>
                  </button>
                </div>
              }

              <!-- ── Rejected ── -->
              @if (isRejected(myApplication()?.status)) {
                <div class="px-8 py-6">
                  <div class="p-5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <mat-icon class="text-red-400 flex-shrink-0 mt-0.5">cancel</mat-icon>
                    <div>
                      <h4 class="text-xs font-bold text-red-800 mb-1">
                        {{ langService.lang() === 'ar' ? 'لم تتم الموافقة على الطلب' : 'Application Not Approved' }}
                      </h4>
                      <p class="text-[11px] text-red-700 font-sans leading-relaxed">
                        {{ langService.lang() === 'ar'
                          ? 'يرجى التواصل مع فريق GACAM للاستفسار عن أسباب الرفض.'
                          : 'Please contact GACAM support to inquire about the reason and reapplication options.'
                        }}
                      </p>
                    </div>
                  </div>
                </div>
              }

              <!-- ── Refunded ── -->
              @if (isRefunded(myApplication()?.status)) {
                <div class="px-8 py-6">
                  <div class="p-5 bg-gray-50 border border-gray-200 rounded-xl flex items-start gap-3">
                    <mat-icon class="text-gray-400 flex-shrink-0 mt-0.5">undo</mat-icon>
                    <div>
                      <h4 class="text-xs font-bold text-gray-700 mb-1">
                        {{ langService.lang() === 'ar' ? 'تمت إعادة المبلغ' : 'Application Refunded' }}
                      </h4>
                      <p class="text-[11px] text-gray-500 font-sans leading-relaxed">
                        {{ langService.lang() === 'ar'
                          ? 'تمت إعادة رسوم طلبك. يمكنك التقديم من جديد في أي وقت.'
                          : 'Your application fee has been refunded. You may reapply at any time.'
                        }}
                      </p>
                    </div>
                  </div>
                </div>
              }

            }
          </div>
        </div>
      </div>
    </main>

    <app-footer></app-footer>
  `
})
export class ServicesComponent implements OnInit {
  langService  = inject(LanguageService);
  authService  = inject(AuthService);
  apiService   = inject(GacamApiService);
  toastService = inject(ToastService);

  loading    = signal(true);
  submitting = signal(false);
  myApplication = signal<Accreditation | null>(null);

  applyForm = new FormGroup({
    category: new FormControl('Press', [Validators.required]),
    document: new FormControl<File | null>(null),
  });

  ngOnInit() {
    this.checkApplication();
  }

  checkApplication() {
    if (!this.authService.isAuthenticated()) { this.loading.set(false); return; }

    this.apiService.getMyAccreditation().subscribe({
      next:  (app) => { this.myApplication.set(app); this.loading.set(false); },
      error: ()    => this.loading.set(false),
    });
  }

  onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.applyForm.patchValue({ document: file });
  }

  onApply() {
    if (this.applyForm.invalid) return;
    this.submitting.set(true);

    const { category, document } = this.applyForm.value;
    this.apiService.applyAccreditation(category!, document ?? undefined).subscribe({
      next: (res) => {
        this.myApplication.set(res);
        this.submitting.set(false);
        this.toastService.showSuccess(
          this.langService.lang() === 'ar'
            ? 'تم تقديم طلبك بنجاح! سيتم مراجعته من قِبل فريق GACAM.'
            : 'Application submitted! GACAM staff will review it shortly.'
        );
      },
      error: () => {
        this.toastService.showError(
          this.langService.lang() === 'ar'
            ? 'فشل تقديم الطلب. حاول مجدداً.'
            : 'Unable to submit application. Please try again.'
        );
        this.submitting.set(false);
      },
    });
  }

  requestCertificate() {
    const app = this.myApplication();
    if (!app) return;

    this.apiService.issueCertificate({
      fullNameOnCertificate: app.userFullName,
      type:                  0,
      relatedRecordId:       app.id,
    }).subscribe({
      next: (cert) => {
        this.toastService.showSuccess(
          this.langService.lang() === 'ar'
            ? 'تم إصدار شهادتك! سيبدأ التنزيل فوراً.'
            : 'Certificate issued! Starting download…'
        );
        const url = this.apiService.downloadCertificateUrl(cert.id);
        if (typeof window !== 'undefined') window.open(url, '_blank');
      },
      error: () => this.toastService.showError('Could not process certificate request.'),
    });
  }

  /* ── Display helpers — accept string or number from API ── */

  private toStr(val: string | number | undefined | null): string {
    return val == null ? '' : String(val);
  }

  categoryLabel(cat: string | number | undefined | null): string {
    // numeric enum → label
    const numMap: Record<number, string> = CATEGORY_LABELS;
    if (typeof cat === 'number') return numMap[cat] ?? 'Unknown';
    // string enum value returned directly
    if (typeof cat === 'string' && cat !== '') return cat;
    return '';
  }

  statusLabel(status: string | number | undefined | null): string {
    if (status == null) return '';
    if (typeof status === 'string') return status;          // API already returns "Pending" etc.
    const map: Record<number, string> = { 0: 'Pending', 1: 'Approved', 2: 'Rejected', 3: 'Refunded' };
    return map[status] ?? '';
  }

  statusBadgeClass(status: string | number | undefined | null): string {
    const s = this.toStr(status).toLowerCase();
    if (s === 'pending'  || s === '0') return 'bg-amber-100 text-amber-700';
    if (s === 'approved' || s === '1') return 'bg-emerald-100 text-emerald-700';
    if (s === 'rejected' || s === '2') return 'bg-red-100 text-red-700';
    if (s === 'refunded' || s === '3') return 'bg-gray-100 text-gray-500';
    return 'bg-gray-100 text-gray-500';
  }

  isPending(status: string | number | undefined | null): boolean {
    const s = this.toStr(status).toLowerCase();
    return s === 'pending' || s === '0';
  }

  isApproved(status: string | number | undefined | null): boolean {
    const s = this.toStr(status).toLowerCase();
    return s === 'approved' || s === '1';
  }

  isRejected(status: string | number | undefined | null): boolean {
    const s = this.toStr(status).toLowerCase();
    return s === 'rejected' || s === '2';
  }

  isRefunded(status: string | number | undefined | null): boolean {
    const s = this.toStr(status).toLowerCase();
    return s === 'refunded' || s === '3';
  }

  cardStatusLabel(status: string | number | undefined | null): string {
    if (typeof status === 'string' && status !== '') return status.toUpperCase();
    const map: Record<number, string> = { 0: 'ACTIVE', 1: 'EXPIRED', 2: 'REVOKED' };
    return map[Number(status) ?? 0] ?? 'ACTIVE';
  }

  cardStatusClass(status: string | number | undefined | null): string {
    const s = this.toStr(status).toLowerCase();
    if (s === 'active'  || s === '0') return 'bg-emerald-500 text-white';
    if (s === 'expired' || s === '1') return 'bg-orange-500 text-white';
    if (s === 'revoked' || s === '2') return 'bg-red-500 text-white';
    return 'bg-emerald-500 text-white';
  }
}