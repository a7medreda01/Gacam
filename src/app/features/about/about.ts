/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, inject, signal } from '@angular/core';

import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { GacamApiService } from '../../core/services/gacam-api';
import { LanguageService } from '../../core/services/language';
import { TranslatePipe } from '../../shared/pipes/translate';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslatePipe],
  template: `
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
              {{ langService.lang() === 'ar'
                ? 'بناء إطار إعلامي حديث ومهني يعزز حضور وتأثير الإعلام الخليجي والعربي في كندا، ويرسخ قيم التميز والمصداقية والتواصل المسؤول بين مختلف المجتمعات.'
                : 'To establish a modern and professional media framework that elevates the presence and impact of Gulf and Arab media in Canada, while promoting excellence, credibility, and responsible communication across diverse communities.'
              }}
            </p>
          </div>

          <div class="bg-deep-teal text-white p-8 rounded-2xl border border-champagne-gold/25 shadow-md text-start flex flex-col gap-3">
            <h3 class="text-base font-extrabold text-champagne-gold uppercase tracking-wider flex items-center gap-2">
              <mat-icon>moving</mat-icon>
              <span>{{ langService.lang() === 'ar' ? 'الرسالة التشغيلية' : 'Operational Mission' }}</span>
            </h3>
            <p class="text-xs sm:text-sm text-white/85 leading-relaxed font-sans">
              {{ langService.lang() === 'ar'
                ? 'تمكين الإعلاميين وصنّاع المحتوى من خلال برامج تدريبية ومبادرات إعلامية وتعليمية تُسهم في تطوير مهاراتهم المهنية، وترسخ الممارسات الأخلاقية، وتدعم سرداً إعلامياً مسؤولاً وشاملاً.'
                : 'To support and empower media professionals and content creators through training, development programs, and media initiatives that uphold ethical standards, strengthen professional skills, and encourage responsible and inclusive storytelling.'
              }}
            </p>
          </div>
        </div>

        <!-- 3. Core Values Grid -->
        <div class="bg-white p-8 sm:p-10 rounded-2xl border border-champagne-gold/15 shadow-sm text-start flex flex-col gap-6 mb-10">
          <h2 class="text-xl font-bold text-royal-teal border-b border-light-ivory pb-3 flex items-center gap-2">
            <mat-icon class="text-champagne-gold">verified_user</mat-icon>
            <span>{{ langService.lang() === 'ar' ? 'القيم الأساسية' : 'Core Values' }}</span>
          </h2>

          <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div class="bg-light-ivory/40 border border-champagne-gold/10 p-5 rounded-xl flex flex-col items-center text-center gap-3 hover:shadow-sm transition-shadow">
              <mat-icon class="text-royal-teal text-3xl" style="font-size:32px;width:32px;height:32px;">shield</mat-icon>
              <h4 class="text-xs font-bold text-royal-teal uppercase tracking-wider">
                {{ langService.lang() === 'ar' ? 'النزاهة' : 'Integrity' }}
              </h4>
            </div>

            <div class="bg-light-ivory/40 border border-champagne-gold/10 p-5 rounded-xl flex flex-col items-center text-center gap-3 hover:shadow-sm transition-shadow">
              <mat-icon class="text-royal-teal text-3xl" style="font-size:32px;width:32px;height:32px;">workspace_premium</mat-icon>
              <h4 class="text-xs font-bold text-royal-teal uppercase tracking-wider">
                {{ langService.lang() === 'ar' ? 'المهنية' : 'Professionalism' }}
              </h4>
            </div>

            <div class="bg-light-ivory/40 border border-champagne-gold/10 p-5 rounded-xl flex flex-col items-center text-center gap-3 hover:shadow-sm transition-shadow">
              <mat-icon class="text-royal-teal text-3xl" style="font-size:32px;width:32px;height:32px;">balance</mat-icon>
              <h4 class="text-xs font-bold text-royal-teal uppercase tracking-wider">
                {{ langService.lang() === 'ar' ? 'الاستقلالية' : 'Independence' }}
              </h4>
            </div>

            <div class="bg-light-ivory/40 border border-champagne-gold/10 p-5 rounded-xl flex flex-col items-center text-center gap-3 hover:shadow-sm transition-shadow">
              <mat-icon class="text-royal-teal text-3xl" style="font-size:32px;width:32px;height:32px;">verified_user</mat-icon>
              <h4 class="text-xs font-bold text-royal-teal uppercase tracking-wider">
                {{ langService.lang() === 'ar' ? 'المسؤولية' : 'Accountability' }}
              </h4>
            </div>

            <div class="bg-light-ivory/40 border border-champagne-gold/10 p-5 rounded-xl flex flex-col items-center text-center gap-3 hover:shadow-sm transition-shadow">
              <mat-icon class="text-royal-teal text-3xl" style="font-size:32px;width:32px;height:32px;">visibility</mat-icon>
              <h4 class="text-xs font-bold text-royal-teal uppercase tracking-wider">
                {{ langService.lang() === 'ar' ? 'الشفافية' : 'Transparency' }}
              </h4>
            </div>

            <div class="bg-light-ivory/40 border border-champagne-gold/10 p-5 rounded-xl flex flex-col items-center text-center gap-3 hover:shadow-sm transition-shadow">
              <mat-icon class="text-royal-teal text-3xl" style="font-size:32px;width:32px;height:32px;">groups</mat-icon>
              <h4 class="text-xs font-bold text-royal-teal uppercase tracking-wider">
                {{ langService.lang() === 'ar' ? 'احترام التنوع' : 'Respect for Diversity' }}
              </h4>
            </div>
          </div>
        </div>

        <!-- 4. Commitment Quote -->
        <div class="bg-royal-teal text-white p-6 rounded-2xl text-center border border-champagne-gold/20 shadow-md">
          <p class="text-sm font-bold italic leading-relaxed">
            "{{ langService.lang() === 'ar'
              ? 'نلتزم بالمعايير المهنية والأخلاقية ونعمل من أجل إعلام يعكس هوية مجتمعاتنا ويخدم قضاياها ويواكب تطلعاتها.'
              : 'We commit to professional and ethical standards, working towards media that reflects our communities\' identity, serves their causes, and keeps pace with their aspirations.'
            }}"
          </p>
        </div>

      </div>
    </main>
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
