import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LanguageService } from '../services/language';
import { AuthService } from '../services/auth';
import { ToastService } from '../../shared/components/toast/toast';

export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const langService = inject(LanguageService);
  const authService = inject(AuthService);
  const toastService = inject(ToastService);

  const currentLang = langService.lang();
  const token = authService.getAccessToken();

  // If we are executing on the server (SSR), do not try to hit the user's localhost:7233
  // as it is unreachable and will crash Node.js with connection refused errors.
  if (isPlatformServer(platformId)) {
    let body: unknown = [];
    if (req.url.includes('/api/Settings/certificate')) {
      body = {
        id: 1,
        primaryColor: '#003F4A',
        secondaryColor: '#C9A96B',
        borderColor: '#003F4A',
        borderWidth: 10.0,
        titleEn: 'CERTIFICATE OF ACCREDITATION',
        titleAr: 'شهادة الاعتماد والتميز الإعلامي',
        headerTextEn: 'GULF & ARAB GENERAL COMMISSION FOR AUDIOVISUAL MEDIA IN CANADA',
        headerTextAr: 'الهيئة العامة للإعلام المرئي والمسموع والخليجي والعربي في كندا',
        signatoryName: 'Dr. Faisal Al-Subaie',
        signatoryTitleEn: 'Executive Director of GACAM Administration',
        signatoryTitleAr: 'المدير التنفيذي لمجلس إدارة الهيئة',
        signatureImageUrl: '',
        showLogo: true,
        logoHeight: 65.0
      };
    } else if (req.url.includes('/api/Settings')) {
      body = {
        id: 1,
        siteTitleEn: 'GACAM Canada',
        siteTitleAr: 'الهيئة العامة للإعلام بكندا',
        logoUrl: '/assets/logo.png',
        socialLinksJson: '{}',
        contactInfo: '{}'
      };
    } else if (req.url.includes('/api/Pages')) {
      body = { items: [], totalCount: 0, currentPage: 1, pageSize: 10, totalPages: 0, hasNext: false, hasPrevious: false };
    } else if (req.url.includes('/api/News')) {
      body = { items: [], totalCount: 0, currentPage: 1, pageSize: 10, totalPages: 0, hasNext: false, hasPrevious: false };
    } else if (req.url.includes('/api/Accreditations')) {
      body = { items: [], totalCount: 0, currentPage: 1, pageSize: 10, totalPages: 0, hasNext: false, hasPrevious: false };
    } else if (req.url.includes('/api/Enrollments')) {
      body = { items: [], totalCount: 0, currentPage: 1, pageSize: 10, totalPages: 0, hasNext: false, hasPrevious: false };
    } else if (req.url.includes('/api/Payments')) {
      body = { items: [], totalCount: 0, currentPage: 1, pageSize: 10, totalPages: 0, hasNext: false, hasPrevious: false };
    } else if (req.url.includes('/api/Orders')) {
      body = { items: [], totalCount: 0, currentPage: 1, pageSize: 10, totalPages: 0, hasNext: false, hasPrevious: false };
    } else if (req.url.includes('/api/ServiceFees')) {
      body = [];
    } else if (req.url.includes('/api/Partners')) {
      body = [];
    } else if (req.url.includes('/api/Training/courses')) {
      body = { items: [], totalCount: 0, currentPage: 1, pageSize: 10, totalPages: 0, hasNext: false, hasPrevious: false };
    } else if (req.url.includes('/api/Volunteers')) {
      body = [];
    } else {
      body = [];
    }

    return of(new HttpResponse({ status: 200, body }));
  }

  // Attach appropriate localization and security identifiers
  let headers = req.headers.set('Accept-Language', currentLang);

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  let targetUrl = req.url;
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    targetUrl = targetUrl.replace('https://localhost:7233', '');
  }

  const clonedRequest = req.clone({
    headers,
    url: targetUrl
  });

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle connection errors caused by local API SSL (self-signed cert) or CORS issues
      if (error.status === 0) {
        toastService.show(
          currentLang === 'ar'
            ? 'تعذر الاتصال بالخادم المحلي (http/https). يرجى التأكد من تشغيل ASP.NET Core API وقبول الشهادة الأمنية لـ localhost بزيارة https://localhost:7233/api'
            : 'Unable to connect to your local API. Please make sure your ASP.NET Core API is running on localhost:7233, and you have accepted its self-signed SSL certificate by visiting https://localhost:7233/api in a new tab.',
          'error'
        );
      }
      return throwError(() => error);
    })
  );
};

