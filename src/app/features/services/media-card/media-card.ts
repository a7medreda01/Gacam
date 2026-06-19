import { Component, Input, inject, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LanguageService } from '../../../core/services/language';
import {
  Accreditation,
  MediaCardStatus,
  MediaCardStatusLabel
} from '../../../models/types';
import QRCode from 'qrcode';

@Component({
  selector: 'app-media-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './media-card.component.html',
  styles: [`
    .card-scene {
      width: 100%;
      max-width: 300px;
      margin: 0 auto;
      perspective: 1000px;
      cursor: pointer;
    }
    .card-inner {
      position: relative;
      width: 100%;
      transform-style: preserve-3d;
      transition: transform 0.7s cubic-bezier(.4,0,.2,1);
    }
    .card-scene:hover .card-inner {
      transform: rotateY(180deg);
    }
    .card-face {
      width: 100%;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 12px 40px rgba(0,0,0,0.35);
      border: 1.5px solid #c9a84c;
    }
    .card-back {
      position: absolute;
      top: 0; left: 0;
      transform: rotateY(180deg);
    }
    .card-face svg { display: block; width: 100%; }
  `]
})
export class MediaCardComponent implements OnInit {
  @Input({ required: true }) application!: Accreditation;
  @Input() userProfileImageUrl: string | null | undefined = null;

  @ViewChild('frontSvg', { static: false }) frontSvgRef!: ElementRef<SVGSVGElement>;
  @ViewChild('backSvg',  { static: false }) backSvgRef!:  ElementRef<SVGSVGElement>;

  langService = inject(LanguageService);
private cdr = inject(ChangeDetectorRef);

  qrDataUrl: string | null = null;
  logoBase64: string | null = null;
  profileBase64: string | null = null;
  profileReady = true;
  pdfLoading = false;

  // ← احفظ الـ Promise علشان printCardAsPdf يقدر يستناها
  private qrReadyPromise!: Promise<void>;

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  async ngOnInit(): Promise<void> {
    this.qrReadyPromise = this.generateQr(); // ← احفظ الـ Promise قبل await

    await Promise.all([
      this.qrReadyPromise,
      this.loadImageAsBase64('logo.png').then(b => this.logoBase64 = b),
      this.userProfileImageUrl
        ? this.loadImageAsBase64(this.userProfileImageUrl).then(b => {
            this.profileBase64 = b;
            this.profileReady = true;
          })
        : Promise.resolve(null).then(() => this.profileReady = true)
    ]);
  }

  // ─── QR generation (frontend, no API needed) ───────────────────────────────

private async generateQr(): Promise<void> {
  const content = this.application.mediaCard?.qrCodeData;
  if (!content || content.trim().length === 0) return;

  try {
    this.qrDataUrl = await QRCode.toDataURL(content, {
      width: 140,
      margin: 1,
      color: { dark: '#0d3d3d', light: '#ffffff' }
    });
    this.cdr.detectChanges(); // ← بيخلي Angular يشوف التغيير
  } catch {
    this.qrDataUrl = null;
  }
}

  // ─── Load any image as base64 (fixes html → PDF image issue) ──────────────

  private loadImageAsBase64(url: string): Promise<string | null> {
    return new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width  = img.naturalWidth  || img.width;
        canvas.height = img.naturalHeight || img.height;
        canvas.getContext('2d')!.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  // ─── PDF export via SVG serialization (no html2canvas flip issue) ─────────

  async printCardAsPdf(): Promise<void> {
    if (this.pdfLoading) return;
    this.pdfLoading = true;

    try {
      // ← استنى الـ QR يكون جاهز فعلاً قبل ما نكمل
      await this.qrReadyPromise;

      const { default: jsPDF } = await import('jspdf');

      const frontSvg = this.frontSvgRef?.nativeElement;
      const backSvg  = this.backSvgRef?.nativeElement;
      if (!frontSvg || !backSvg) return;

      const CARD_W_MM = 85.6;
      const CARD_H_MM = 148;

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [CARD_W_MM, CARD_H_MM] });

      // وش
      const frontPng = await this.svgToPng(frontSvg);
      const topY = (CARD_H_MM - CARD_W_MM * (520 / 300)) / 2;
      pdf.addImage(frontPng, 'PNG', 0, topY, CARD_W_MM, CARD_W_MM * (520 / 300));

      // ظهر
      pdf.addPage();
      const backPng = await this.svgToPng(backSvg);
      pdf.addImage(backPng, 'PNG', 0, topY, CARD_W_MM, CARD_W_MM * (520 / 300));

      const name = this.application.userFullName?.replace(/\s+/g, '_') ?? 'card';
      pdf.save(`GACAM_MediaCard_${name}.pdf`);
    } finally {
      this.pdfLoading = false;
    }
  }

  /**
   * يحول SVG element لـ PNG data-URL عن طريق:
   * 1. serialize الـ SVG لـ string
   * 2. يستبدل href الصور بـ base64 علشان مفيش CORS
   * 3. يرسمه على canvas
   */
  private svgToPng(svgEl: SVGSVGElement): Promise<string> {
    return new Promise((resolve, reject) => {
      // clone علشان منعدلش الـ DOM
      const clone = svgEl.cloneNode(true) as SVGSVGElement;

      // استبدال الصور بـ base64
      clone.querySelectorAll('image').forEach(img => {
        const href = img.getAttribute('href') || img.getAttribute('xlink:href') || '';
        if (href === 'logo.png' && this.logoBase64)
          img.setAttribute('href', this.logoBase64);
        else if (this.userProfileImageUrl && href === this.userProfileImageUrl && this.profileBase64)
          img.setAttribute('href', this.profileBase64);
        // الـ QR هو base64 بالفعل — مش محتاج نعمل حاجة
      });

      const svgStr  = new XMLSerializer().serializeToString(clone);
      const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url     = URL.createObjectURL(svgBlob);

      const SCALE = 3;
      const W = 300 * SCALE;
      const H = 520 * SCALE;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width  = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, W, H);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('SVG render failed')); };
      img.src = url;
    });
  }

  // ─── Getters ───────────────────────────────────────────────────────────────

  get lang(): string { return this.langService.lang(); }

  get categoryLabel(): string {
    const nameAr = this.application.categoryNameAr;
    const nameEn = this.application.categoryNameEn;
    return this.lang === 'ar' ? (nameAr || nameEn || '—') : (nameEn || nameAr || '—');
  }

  get cardStatusClass(): Record<string, boolean> {
    const s = this.application.mediaCard?.status as MediaCardStatus | undefined;
    return {
      'bg-emerald-50 text-emerald-700 border-emerald-200': s === MediaCardStatus.Active,
      'bg-orange-50 text-orange-700 border-orange-200':    s === MediaCardStatus.Expired,
      'bg-red-50 text-red-700 border-red-200':             s === MediaCardStatus.Revoked,
    };
  }

  get cardStatusLabel(): string {
    const s = this.application.mediaCard?.status as MediaCardStatus | undefined;
    return s ? (MediaCardStatusLabel[s] ?? 'ACTIVE') : 'ACTIVE';
  }
}