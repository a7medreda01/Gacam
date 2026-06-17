/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { GacamApiService } from '../../core/services/gacam-api';
import { LanguageService } from '../../core/services/language';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { FooterComponent } from '../../shared/components/footer/footer';
import { TranslatePipe } from '../../shared/pipes/translate';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, MatIconModule, NavbarComponent, FooterComponent, TranslatePipe],
  template: `
    <app-navbar></app-navbar>

    <main class="min-h-screen bg-light-ivory py-16">
      <div class="container-gacam max-w-5xl">
        <!-- Topic Heading -->
        <div class="text-center mb-16 flex flex-col gap-3">
          <span class="text-xs font-bold uppercase tracking-widest text-champagne-gold">
            {{ langService.lang() === 'ar' ? 'التعريف والسياسات الاستراتيجية' : 'Strategic Governance Documentation' }}
          </span>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-royal-teal tracking-tight">
            {{ 'NAV.ABOUT' | translate }}
          </h1>
        </div>

        <!-- 1. Who We Are Section -->
        <section class="bg-white p-8 sm:p-10 rounded-2xl border border-champagne-gold/15 shadow-sm mb-10 text-start">
          <h2 class="text-xl font-bold text-royal-teal mb-4 flex items-center gap-2">
            <mat-icon class="text-champagne-gold">corporate_fare</mat-icon>
            <span>{{ langService.lang() === 'ar' ? 'من نحن ورسالتنا التأسيسية بكندا' : 'Establishment Mandate' }}</span>
          </h2>
          <div class="text-xs sm:text-sm text-deep-teal/85 leading-relaxed font-sans whitespace-pre-line">
            {{ langService.lang() === 'ar' ? aboutContent()?.contentAr : aboutContent()?.contentEn }}
          </div>
        </section>

        <!-- 2. Vision and Mission Split Frame -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div class="bg-royal-teal text-white p-8 rounded-2xl border border-champagne-gold/25 shadow-md text-start flex flex-col gap-3">
            <h3 class="text-base font-extrabold text-champagne-gold uppercase tracking-wider flex items-center gap-2">
              <mat-icon>visibility</mat-icon>
              <span>{{ langService.lang() === 'ar' ? 'الرؤية الاستراتيجية' : 'Strategic Vision' }}</span>
            </h3>
            <p class="text-xs sm:text-sm text-white/85 leading-relaxed font-sans">
              {{ langService.lang() === 'ar' ? 'تأسيس إطار عمل إعلامي احترافي يعزز وجود الإعلام الخليجي والعربي في كندا ويرسخ قيم التميز والمصداقية بمهنية رائدة.' : 'To establish an objective professional media framework that consolidates Gulf & Arab pluralistic viewpoints safely across Canada.' }}
            </p>
          </div>

          <div class="bg-deep-teal text-white p-8 rounded-2xl border border-champagne-gold/25 shadow-md text-start flex flex-col gap-3">
            <h3 class="text-base font-extrabold text-champagne-gold uppercase tracking-wider flex items-center gap-2">
              <mat-icon>moving</mat-icon>
              <span>{{ langService.lang() === 'ar' ? 'الرسالة التشغيلية' : 'Operational Mission' }}</span>
            </h3>
            <p class="text-xs sm:text-sm text-white/85 leading-relaxed font-sans">
              {{ langService.lang() === 'ar' ? 'تمكين وتطوير مهارات الإعلاميين وصناع المحتوى من خلال البرامج والندوات التعليمية الرشيدة وحماية هيبة الصحيفة ومصداقية التقارير.' : 'To empower and mentor emerging reporters and creators through structured educational curriculums, certifications, and compliance metrics.' }}
            </p>
          </div>
        </div>

        <!-- 3. GACAM Commission Code of Ethics / Editorial Guidelines -->
        <div class="bg-white p-8 sm:p-10 rounded-2xl border border-champagne-gold/15 shadow-sm text-start flex flex-col gap-6">
          <h2 class="text-xl font-bold text-royal-teal border-b border-light-ivory pb-3 flex items-center gap-2">
            <mat-icon class="text-champagne-gold">gavel</mat-icon>
            <span>{{ langService.lang() === 'ar' ? 'القيم الأساسية وسياسة النشر والتصحيح' : 'Core Principles & Editorial Code' }}</span>
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="flex flex-col gap-2">
              <h4 class="text-xs font-bold text-royal-teal uppercase tracking-wider">1. {{ langService.lang() === 'ar' ? 'النزاهة والتوثيق' : 'Transparency & Accuracy' }}</h4>
              <p class="text-[11px] text-deep-teal/80 font-sans leading-relaxed">
                {{ langService.lang() === 'ar' ? 'التقصي والتدقيق وإسناد المصادر والشفافية قبل النشر لضمان البعد عن الشائعات.' : 'Rigorous source checking, factual auditing, and copyright compliance remain non-negotiable standards.' }}
              </p>
            </div>
            <div class="flex flex-col gap-2">
              <h4 class="text-xs font-bold text-royal-teal uppercase tracking-wider">2. {{ langService.lang() === 'ar' ? 'التصحيح المفتوح والشكاوى' : 'Corrections & Complaints' }}</h4>
              <p class="text-[11px] text-deep-teal/80 font-sans leading-relaxed">
                {{ langService.lang() === 'ar' ? 'نلتزم ميكانيكياً بتصحيح أي خطأ إيجابي يتم تحديده ونشر اعتذارات توضيحية عاجلة.' : 'Honoring corrections transparently and responding promptly to public concerns regarding visual or print statements.' }}
              </p>
            </div>
            <div class="flex flex-col gap-2">
              <h4 class="text-xs font-bold text-royal-teal uppercase tracking-wider">3. {{ langService.lang() === 'ar' ? 'التنوع الثقافي والمسؤولية' : 'Representation & Diversity' }}</h4>
              <p class="text-[11px] text-deep-teal/80 font-sans leading-relaxed">
                {{ langService.lang() === 'ar' ? 'التوازن التام ومكافحة خطابات الكراهية وتعزيز حضور متميز للمصالح الخليجية والعربية بشكل مسؤول.' : 'Rejecting hate-speech, and representing multi-cultural identities objectively across all audiovisual activities.' }}
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>

    <app-footer></app-footer>
  `
})
export class AboutComponent implements OnInit {
  langService = inject(LanguageService);
  apiService = inject(GacamApiService);

  aboutContent = signal<any | null>(null);

  ngOnInit() {
    this.fetchAboutPage();
  }

  fetchAboutPage() {
    this.apiService.getPage('about-us').subscribe({
      next: (data) => {
        this.aboutContent.set(data);
      }
    });
  }
}
