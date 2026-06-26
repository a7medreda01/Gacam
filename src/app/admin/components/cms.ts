import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { GacamApiService } from '../../core/services/gacam-api';
import { ToastService } from '../../shared/components/toast/toast';
import { LanguageService } from '../../core/services/language';
import { TranslatePipe } from '../../shared/pipes/translate';

@Component({
  selector: 'app-admin-cms',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, TranslatePipe],
  templateUrl: './cms.html',
  styleUrl: './cms.css'
})
export class AdminCmsComponent implements OnInit {
  private apiService = inject(GacamApiService);
  private toastService = inject(ToastService);
  langService = inject(LanguageService);

  loading = signal(false);
  cmsSlug = signal('');

  availablePages = [
    { slug: 'home', labelEn: 'Home Page', labelAr: 'الصفحة الرئيسية' },
    { slug: 'about-us', labelEn: 'About Us', labelAr: 'من نحن' },
    { slug: 'media-authority', labelEn: 'Media Authority', labelAr: 'الهيئة الإعلامية' },
    { slug: 'editorial-policy', labelEn: 'Editorial Policy', labelAr: 'سياسة التحرير' },
    { slug: 'complaints-policy', labelEn: 'Complaints Policy', labelAr: 'سياسة الشكاوى' },
    { slug: 'corrections-policy', labelEn: 'Corrections Policy', labelAr: 'سياسة التصحيح' },
    { slug: 'code-of-ethics', labelEn: 'Code of Ethics', labelAr: 'ميثاق الشرف الأخلاقي' },
    { slug: 'services', labelEn: 'Services', labelAr: 'الخدمات' },
    { slug: 'media-accreditation', labelEn: 'Media Accreditation', labelAr: 'الاعتماد الإعلامي' },
    { slug: 'media-id-verification', labelEn: 'Media ID Verification', labelAr: 'التحقق من الهوية الإعلامية' },
    { slug: 'training-programs', labelEn: 'Training Programs Info', labelAr: 'معلومات البرامج التدريبية' },
    { slug: 'volunteers', labelEn: 'Volunteers Directory', labelAr: 'دليل ومساندة المتطوعين' },
    { slug: 'partners', labelEn: 'Partners', labelAr: 'الشركاء' },
    { slug: 'news-press-releases', labelEn: 'News & Press Releases', labelAr: 'الأخبار والبيانات الصحفية' },
    { slug: 'leadership-board-of-directors', labelEn: 'Board of Directors Leadership', labelAr: 'مجلس الإدارة والقيادة' },
    { slug: 'faq', labelEn: 'FAQ', labelAr: 'الأسئلة الشائعة' },
    { slug: 'contact-us', labelEn: 'Contact Us', labelAr: 'تواصل معنا' },
    { slug: 'terms-of-use', labelEn: 'Terms of Use', labelAr: 'شروط وبنود الاستخدام' },
    { slug: 'privacy-policy', labelEn: 'Privacy Policy', labelAr: 'سياسة الخصوصية' },
    { slug: 'vision-mission', labelEn: 'Vision & Mission', labelAr: 'الرؤية والرسالة' },
    { slug: 'board-members', labelEn: 'Board Members', labelAr: 'أعضاء مجلس الإدارة' },
    { slug: 'organizational-chart', labelEn: 'Organizational Chart', labelAr: 'الهيكل التنظيمي' },
    { slug: 'volunteer', labelEn: 'Volunteer', labelAr: 'التطوع' },
    { slug: 'training', labelEn: 'Training Programs', labelAr: 'البرامج التدريبية' },
    { slug: 'news', labelEn: 'News & Activities', labelAr: 'الأخبار والأنشطة' },
    { slug: 'membership', labelEn: 'Membership', labelAr: 'العضوية' },
    { slug: 'media-card', labelEn: 'Media Card', labelAr: 'بطاقة الاعتماد' },
    { slug: 'gallery', labelEn: 'Gallery', labelAr: 'المعرض' },
    { slug: 'terms', labelEn: 'Terms & Conditions', labelAr: 'الشروط والأحكام' },
    { slug: 'certificates', labelEn: 'Certificates', labelAr: 'الشهادات' }
  ];

  cmsForm = new FormGroup({
    titleEn: new FormControl('', [Validators.required]),
    titleAr: new FormControl('', [Validators.required]),
    contentEn: new FormControl('', [Validators.required]),
    contentAr: new FormControl('', [Validators.required]),
    imageUrl: new FormControl('')
  });

  isNewPage = signal(false);

  ngOnInit() {
    // Automatically load the primary 'home' page or 'about-us' on init
    this.loadCmsPage('home');
  }

  loadCmsPage(slug: string) {
    this.loading.set(true);
    this.cmsSlug.set(slug);
    this.isNewPage.set(false);
    this.apiService.getPage(slug).subscribe({
      next: (pg) => {
        this.cmsForm.setValue({
          titleEn: pg.titleEn || '',
          titleAr: pg.titleAr || '',
          contentEn: pg.contentEn || '',
          contentAr: pg.contentAr || '',
          imageUrl: pg.imageUrl || ''
        });
        this.loading.set(false);
      },
      error: () => {
        const defaultPage = this.availablePages.find(p => p.slug === slug);
        this.cmsForm.setValue({
          titleEn: defaultPage?.labelEn || '',
          titleAr: defaultPage?.labelAr || '',
          contentEn: '',
          contentAr: '',
          imageUrl: ''
        });
        this.isNewPage.set(true);
        this.toastService.show(
          this.langService.lang() === 'ar'
            ? 'هذه الصفحة غير موجودة حالياً بقاعدة البيانات. يمكنك ملء الحقول وحفظها لإنشائها.'
            : 'This page does not exist in the database. You can fill the fields and save to create it.',
          'info'
        );
        this.loading.set(false);
      }
    });
  }

  onSaveCms() {
    if (this.cmsForm.invalid) return;
    const slug = this.cmsSlug();
    this.loading.set(true);

    if (this.isNewPage()) {
      const payload = {
        slug,
        ...this.cmsForm.value
      };
      this.apiService.createPage(payload).subscribe({
        next: () => {
          this.toastService.showSuccess(
            this.langService.lang() === 'ar'
              ? 'تم إنشاء وحفظ الصفحة بنجاح.'
              : 'Page template created and saved successfully.'
          );
          this.isNewPage.set(false);
          this.loading.set(false);
        },
        error: () => {
          // If creation POST fails, fallback to update PUT
          this.apiService.updatePage(slug, this.cmsForm.value).subscribe({
            next: () => {
              this.toastService.showSuccess(
                this.langService.lang() === 'ar'
                  ? 'تم تحديث الصفحة بنجاح.'
                  : 'Page template updated successfully.'
              );
              this.isNewPage.set(false);
              this.loading.set(false);
            },
            error: () => {
              this.toastService.showError(
                this.langService.lang() === 'ar'
                  ? 'خطأ أثناء إنشاء أو تحديث الصفحة.'
                  : 'Error creating or updating page nodes.'
              );
              this.loading.set(false);
            }
          });
        }
      });
    } else {
      this.apiService.updatePage(slug, this.cmsForm.value).subscribe({
        next: () => {
          this.toastService.showSuccess(
            this.langService.lang() === 'ar'
              ? 'تم حفظ التعديلات بنجاح.'
              : 'Page template saved successfully.'
          );
          this.loading.set(false);
        },
        error: () => {
          this.toastService.showError(
            this.langService.lang() === 'ar'
              ? 'خطأ أثناء تحديث الصفحة.'
              : 'Error updating page nodes.'
          );
          this.loading.set(false);
        }
      });
    }
  }
}
