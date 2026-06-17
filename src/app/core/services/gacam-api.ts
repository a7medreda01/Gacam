/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Accreditation,
  AuditLog,
  Certificate,
  CertificateDesign,
  Course,
  Enrollment,
  NewsArticle,
  Partner,
  Payment,
  ServiceFee,
  Setting,
  User,
  Volunteer
} from '../../models/types';

@Injectable({
  providedIn: 'root'
})
export class GacamApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  // --- Pages CMS ---
  getPages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/Pages`);
  }

  getPage(slug: string): Observable<any> {
    return this.http.get<any>(`${this.base}/Pages/${slug}`);
  }

  updatePage(slug: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.base}/Pages/${slug}`, payload);
  }

  // --- Site General Settings & Visual templates ---
  getSettings(): Observable<Setting> {
    return this.http.get<Setting>(`${this.base}/Settings`);
  }

  updateSettings(payload: Setting): Observable<Setting> {
    return this.http.put<Setting>(`${this.base}/Settings`, payload);
  }

  getCertDesign(): Observable<CertificateDesign> {
    return this.http.get<CertificateDesign>(`${this.base}/Settings/certificate`);
  }

  updateCertDesign(payload: CertificateDesign): Observable<CertificateDesign> {
    return this.http.put<CertificateDesign>(`${this.base}/Settings/certificate`, payload);
  }

  // --- Press Cards & Accreditations ---

// applyAccreditation — يبعت FormData لأن الـ endpoint هو multipart/form-data
applyAccreditation(category: string, document?: File): Observable<Accreditation> {
  const fd = new FormData();
  fd.append('category', category);
  if (document) fd.append('document', document);
  return this.http.post<Accreditation>(`${this.base}/Accreditation/apply`, fd);
}

// getMyAccreditation — handle 404 as null
getMyAccreditation(): Observable<Accreditation | null> {
  return this.http.get<Accreditation | null>(`${this.base}/Accreditation/my-application`)
    .pipe(catchError(err => err.status === 404 ? of(null) : throwError(() => err)));
}

// reviewAccreditation — يبعت Status enum value
reviewAccreditation(id: number, status: number): Observable<Accreditation> {
  return this.http.put<Accreditation>(`${this.base}/Accreditation/${id}/review`, { status });
}

  getAllAccreditations(status?: string): Observable<Accreditation[]> {
    const url = status ? `${this.base}/Accreditation?status=${status}` : `${this.base}/Accreditation`;
    return this.http.get<Accreditation[]>(url);
  }



  verifyCard(cardNumber: string): Observable<any> {
    return this.http.get<any>(`${this.base}/Accreditation/verify/card/${encodeURIComponent(cardNumber)}`);
  }

  // --- Volunteers ---
  applyVolunteer(payload: any): Observable<Volunteer> {
    return this.http.post<Volunteer>(`${this.base}/Volunteers`, payload);
  }

  getMyVolunteer(): Observable<Volunteer | null> {
    return this.http.get<Volunteer | null>(`${this.base}/Volunteers/my-application`);
  }

  getVolunteers(): Observable<Volunteer[]> {
    return this.http.get<Volunteer[]>(`${this.base}/Volunteers`);
  }

  reviewVolunteer(id: number, status: number, adminNotes: string): Observable<Volunteer> {
    return this.http.put<Volunteer>(`${this.base}/Volunteers/${id}/status`, { status, adminNotes });
  }

  // --- Training Courses ---
  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.base}/Training/courses`);
  }

  createCourse(payload: any): Observable<Course> {
    return this.http.post<Course>(`${this.base}/Training/courses`, payload);
  }

  updateCourse(id: number, payload: any): Observable<Course> {
    return this.http.put<Course>(`${this.base}/Training/courses/${id}`, payload);
  }

  deleteCourse(id: number): Observable<any> {
    return this.http.delete<any>(`${this.base}/Training/courses/${id}`);
  }

  enrollCourse(courseId: number): Observable<Enrollment> {
    return this.http.post<Enrollment>(`${this.base}/Training/enroll`, { courseId });
  }

  getMyEnrollments(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.base}/Training/my-enrollments`);
  }

  getAllEnrollments(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.base}/Training/enrollments`);
  }

  reviewEnrollment(id: number, status: number, adminNotes: string): Observable<Enrollment> {
    return this.http.put<Enrollment>(`${this.base}/Training/enrollments/${id}/status`, { status, adminNotes });
  }

  // --- Financial Payments System ---
  submitPayment(payload: any): Observable<Payment> {
    return this.http.post<Payment>(`${this.base}/Payments`, payload);
  }

  getMyPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.base}/Payments/my-payments`);
  }

  getAllPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.base}/Payments`);
  }

reviewPayment(id: number, approve: boolean, adminNotes: string): Observable<Payment> {
  // approve=true => Status=1 (Paid), approve=false => Status=2 (Rejected)
  const status = approve ? 1 : 2;
  return this.http.put<Payment>(`${this.base}/Payments/${id}/review`, { status, adminNotes });
}
getPaymentById(id: number): Observable<Payment> {
  return this.http.get<Payment>(`${this.base}/Payments/${id}`);
}
uploadPaymentReceipt(file: File): Observable<any> {
  const fd = new FormData();
  fd.append('file', file);
  return this.http.post<any>(`${this.base}/Payments/upload-receipt`, fd);
}
  // --- E-Certificates Retrieval & Mechanical validation ---
  issueCertificate(payload: any): Observable<Certificate> {
    return this.http.post<Certificate>(`${this.base}/Certificates`, payload);
  }

  getMyCertificates(): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(`${this.base}/Certificates/my-certificates`);
  }

  getCertificates(): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(`${this.base}/Certificates`);
  }

  verifyCertificate(cardNumber: string): Observable<any> {
    return this.http.get<any>(`${this.base}/Certificates/verify/${encodeURIComponent(cardNumber)}`);
  }

  verifyCertificateFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.base}/Certificates/verify-file`, formData);
  }

  downloadCertificateUrl(id: number): string {
    return `${this.base}/Certificates/download/${id}`;
  }

  // --- General News and PR ---
  getNews(type?: number): Observable<NewsArticle[]> {
    const url = type !== undefined ? `${this.base}/News?type=${type}` : `${this.base}/News`;
    return this.http.get<NewsArticle[]>(url);
  }

  getNewsArticle(id: number): Observable<NewsArticle> {
    return this.http.get<NewsArticle>(`${this.base}/News/${id}`);
  }

  viewNewsArticle(id: number): Observable<any> {
    return this.http.post<any>(`${this.base}/News/${id}/view`, {});
  }

  createNews(payload: any): Observable<NewsArticle> {
    return this.http.post<NewsArticle>(`${this.base}/News`, payload);
  }

  updateNews(id: number, payload: any): Observable<NewsArticle> {
    return this.http.put<NewsArticle>(`${this.base}/News/${id}`, payload);
  }

  deleteNews(id: number): Observable<any> {
    return this.http.delete<any>(`${this.base}/News/${id}`);
  }

  // --- Strategic Partners Directory ---
  getPartners(): Observable<Partner[]> {
    return this.http.get<Partner[]>(`${this.base}/Partners`);
  }

  createPartner(payload: any): Observable<Partner> {
    return this.http.post<Partner>(`${this.base}/Partners`, payload);
  }

  deletePartner(id: number): Observable<any> {
    return this.http.delete<any>(`${this.base}/Partners/${id}`);
  }

  // --- Service Charges ---
  getFees(): Observable<ServiceFee[]> {
    return this.http.get<ServiceFee[]>(`${this.base}/ServiceFees`);
  }

  updateFee(code: string, amount: number): Observable<ServiceFee> {
    return this.http.put<ServiceFee>(`${this.base}/ServiceFees/${code}`, { amount });
  }

  // --- System Activity Logs & Dynamic Reports ---
  getAuditLogs(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.base}/AuditLogs`);
  }

  // Admin access to extract user roster
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/Auth/users`);
  }

  giveUserRole(userId: number, roleName: string): Observable<any> {
    return this.http.post<any>(`${this.base}/Auth/users/${userId}/roles`, { roleName });
  }

  removeUserRole(userId: number, roleName: string): Observable<any> {
    return this.http.delete<any>(`${this.base}/Auth/users/${userId}/roles?roleName=${encodeURIComponent(roleName)}`);
  }

  // Export report helpers
  getPaymentsReportUrl(): string {
    return `${this.base}/Reports/payments`;
  }

  getAuditLogsReportUrl(): string {
    return `${this.base}/Reports/auditlogs`;
  }

  getUsersReportUrl(): string {
    return `${this.base}/Reports/users`;
  }
}
