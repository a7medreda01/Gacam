import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { GacamApiService } from '../../core/services/gacam-api';
import { AuthService } from '../../core/services/auth';
import { LanguageService } from '../../core/services/language';
import { ToastService } from '../../shared/components/toast/toast';
import { Order, OrderStatus, OrderType, OrderStatusHistory, Payment } from '../../models/types';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { FooterComponent } from '../../shared/components/footer/footer';
import { TranslatePipe } from '../../shared/pipes/translate';

type StepState = 'done' | 'current' | 'upcoming';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, NavbarComponent, FooterComponent, TranslatePipe],
  templateUrl: './order-details.html',
})
export class OrderDetailComponent implements OnInit {
  private route        = inject(ActivatedRoute);
  private router       = inject(Router);
  private apiService   = inject(GacamApiService);
  private authService  = inject(AuthService);
  langService           = inject(LanguageService);
  private toastService  = inject(ToastService);

  readonly OrderStatus = OrderStatus; // متاحة للتمبلت للمقارنات المباشرة

  loading        = signal(true);
  notFound       = signal(false);
  order          = signal<Order | null>(null);
  timeline       = signal<OrderStatusHistory[]>([]);
  payment        = signal<Payment | null>(null);
  paymentLoading = signal(false);

  readonly steps: OrderStatus[] = [
    OrderStatus.Pending,
    OrderStatus.WaitingPayment,
    OrderStatus.PaymentSubmitted,
    OrderStatus.UnderReview,
    OrderStatus.Approved,
    OrderStatus.InProduction,
    OrderStatus.Printed,
    OrderStatus.ReadyForDelivery,
    OrderStatus.Delivered,
  ];

  isTerminalRejectedOrCancelled = computed(() => {
    const o = this.order();
    return !!o && (o.orderStatus === OrderStatus.Rejected || o.orderStatus === OrderStatus.Cancelled);
  });

  currentStepIndex = computed(() => {
    const o = this.order();
    return o ? this.steps.indexOf(o.orderStatus) : -1;
  });

  sortedTimelineDesc = computed(() => [...this.timeline()].reverse());

  lastNote = computed(() => {
    const t = this.timeline();
    return t.length ? t[t.length - 1].notes : undefined;
  });

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.loading.set(false); this.notFound.set(true); return; }
    this.fetchOrder(id);
  }

  private fetchOrder(id: number) {
    this.loading.set(true);
    this.apiService.getOrderById(id).subscribe({
      next: (o) => {
        this.order.set(o);
        this.fetchTimeline(id);
        if (o.paymentId) this.fetchPayment(o.paymentId);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      }
    });
  }

  private fetchTimeline(id: number) {
    this.apiService.getOrderTimeline(id).subscribe({
      next:  (h) => { this.timeline.set(h ?? []); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  private fetchPayment(paymentId: number) {
    this.paymentLoading.set(true);
    this.apiService.getPaymentById(paymentId).subscribe({
      next:  (p) => { this.payment.set(p); this.paymentLoading.set(false); },
      error: () => { this.paymentLoading.set(false); }
    });
  }

  stepState(step: OrderStatus): StepState {
    const idx = this.steps.indexOf(step);
    const cur = this.currentStepIndex();
    if (idx < cur) return 'done';
    if (idx === cur) return 'current';
    return 'upcoming';
  }

  stepIcon(step: OrderStatus): string {
    const icons: Record<OrderStatus, string> = {
      [OrderStatus.Pending]:          'hourglass_empty',
      [OrderStatus.WaitingPayment]:   'payments',
      [OrderStatus.PaymentSubmitted]: 'receipt_long',
      [OrderStatus.UnderReview]:      'fact_check',
      [OrderStatus.Approved]:         'task_alt',
      [OrderStatus.InProduction]:     'precision_manufacturing',
      [OrderStatus.Printed]:          'print',
      [OrderStatus.ReadyForDelivery]: 'inventory_2',
      [OrderStatus.Delivered]:        'local_shipping',
      [OrderStatus.Rejected]:         'cancel',
      [OrderStatus.Cancelled]:        'block',
    };
    return icons[step] ?? 'circle';
  }

  getOrderTypeLabel(t: OrderType): string {
    const isAr = this.langService.lang() === 'ar';
    return t === OrderType.CertificatePrint
      ? (isAr ? 'طباعة شهادة' : 'Certificate Print')
      : (isAr ? 'طباعة بطاقة اعتماد' : 'Accreditation Card Print');
  }

  getStatusLabel(s: OrderStatus): string {
    const isAr = this.langService.lang() === 'ar';
    const map: Record<OrderStatus, [string, string]> = {
      [OrderStatus.Pending]:          ['Pending', 'قيد الانتظار'],
      [OrderStatus.WaitingPayment]:   ['Waiting Payment', 'بانتظار الدفع'],
      [OrderStatus.PaymentSubmitted]: ['Payment Submitted', 'تم تقديم الدفع'],
      [OrderStatus.UnderReview]:      ['Under Review', 'قيد المراجعة'],
      [OrderStatus.Approved]:         ['Approved', 'مقبول'],
      [OrderStatus.InProduction]:     ['In Production', 'قيد الإنتاج'],
      [OrderStatus.Printed]:          ['Printed', 'تمت الطباعة'],
      [OrderStatus.ReadyForDelivery]: ['Ready for Delivery', 'جاهز للتسليم'],
      [OrderStatus.Delivered]:        ['Delivered', 'تم التسليم'],
      [OrderStatus.Rejected]:         ['Rejected', 'مرفوض'],
      [OrderStatus.Cancelled]:        ['Cancelled', 'ملغى'],
    };
    const pair = map[s];
    return pair ? (isAr ? pair[1] : pair[0]) : '—';
  }

  getStatusBadgeClass(s: OrderStatus): string {
    if (s === OrderStatus.Delivered || s === OrderStatus.Approved) return 'bg-emerald-400 text-white';
    if (s === OrderStatus.Rejected || s === OrderStatus.Cancelled) return 'bg-red-400 text-white';
    if (s === OrderStatus.InProduction || s === OrderStatus.Printed || s === OrderStatus.ReadyForDelivery) return 'bg-indigo-400 text-white';
    return 'bg-amber-400 text-white';
  }
}