/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  Volunteer,
  PagedResponse,
  AccreditationCategory,
  Order,
  OrderType,
  OrderStatus,
  OrderStatusHistory,
  UnifiedVerificationResponseDto,
  CreateOrderDto
} from '../../models/types';

// ── User Management DTOs ──────────────────────────────────────────────────────
export interface UserListDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lockoutEnd: string | null;
}

export interface CreateUserByAdminDto {
  email: string;
  firstName: string;
  lastName: string;
  role: 'Admin' | 'Employee';
}

@Injectable({
  providedIn: 'root'
})
export class GacamApiService {
  private http = inject(HttpClient);
  private base = (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) 
    ? '/api' 
    : environment.apiUrl;

  private buildParams(pageNumber?: number, pageSize?: number, search?: string, extra?: Record<string, any>): any {
    const params: any = {};
    if (pageNumber !== undefined) params.PageNumber = pageNumber;
    if (pageSize !== undefined) params.PageSize = pageSize;
    if (search !== undefined && search !== '') params.Search = search;
    if (extra) {
      for (const key of Object.keys(extra)) {
        if (extra[key] !== undefined && extra[key] !== null && extra[key] !== '') {
          params[key] = extra[key];
        }
      }
    }
    return params;
  }

  // --- Pages CMS ---
  getPages(pageNumber?: number, pageSize?: number, search?: string): Observable<PagedResponse<any>> {
    const params = this.buildParams(pageNumber, pageSize, search);
    return this.http.get<PagedResponse<any>>(`${this.base}/Pages`, { params });
  }

  getPage(slug: string): Observable<any> {
    return this.http.get<any>(`${this.base}/Pages/${slug}`);
  }

  updatePage(slug: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.base}/Pages/${slug}`, payload);
  }

  createPage(payload: any): Observable<any> {
    return this.http.post<any>(`${this.base}/Pages`, payload);
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

  uploadLogo(file: File): Observable<{ relativePath: string, absoluteUrl: string }> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<{ relativePath: string, absoluteUrl: string }>(`${this.base}/Settings/upload-logo`, fd);
  }

  uploadSignature(file: File): Observable<{ relativePath: string, absoluteUrl: string }> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<{ relativePath: string, absoluteUrl: string }>(`${this.base}/Settings/certificate/upload-signature`, fd);
  }

  uploadBackground(file: File): Observable<{ relativePath: string, absoluteUrl: string }> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<{ relativePath: string, absoluteUrl: string }>(`${this.base}/Settings/certificate/upload-background`, fd);
  }

  removeBackground(): Observable<any> {
    return this.http.delete<any>(`${this.base}/Settings/certificate/background`);
  }

  // --- Press Cards & Accreditations (Categories & Applications) ---
  getAccreditationCategories(pageNumber?: number, pageSize?: number, search?: string): Observable<PagedResponse<AccreditationCategory>> {
    const params = this.buildParams(pageNumber, pageSize, search);
    return this.http.get<PagedResponse<AccreditationCategory>>(`${this.base}/accreditation-categories`, { params });
  }

  createAccreditationCategory(payload: Partial<AccreditationCategory>): Observable<AccreditationCategory> {
    return this.http.post<AccreditationCategory>(`${this.base}/accreditation-categories`, payload);
  }

  updateAccreditationCategory(id: number, payload: Partial<AccreditationCategory>): Observable<AccreditationCategory> {
    return this.http.put<AccreditationCategory>(`${this.base}/accreditation-categories/${id}`, payload);
  }

  deleteAccreditationCategory(id: number): Observable<any> {
    return this.http.delete<any>(`${this.base}/accreditation-categories/${id}`);
  }

  applyAccreditation(category: string, document?: File): Observable<Accreditation> {
    const fd = new FormData();
    fd.append('category', category);
    fd.append('AccreditationCategoryId', category);
    if (document) {
      fd.append('document', document);
      fd.append('Document', document);
    }
    return this.http.post<Accreditation>(`${this.base}/Accreditation/apply`, fd);
  }

  getMyAccreditation(): Observable<Accreditation | null> {
    return this.http.get<Accreditation | null>(`${this.base}/Accreditation/my-application`)
      .pipe(catchError(err => err.status === 404 ? of(null) : throwError(() => err)));
  }

  reviewAccreditation(id: number, status: number): Observable<Accreditation> {
    return this.http.put<Accreditation>(`${this.base}/Accreditation/${id}/review`, { status });
  }

  getAllAccreditations(status?: string, pageNumber?: number, pageSize?: number, search?: string): Observable<PagedResponse<Accreditation>> {
    const extra: any = {};
    if (status !== undefined) extra.status = status;
    const params = this.buildParams(pageNumber, pageSize, search, extra);
    return this.http.get<PagedResponse<Accreditation>>(`${this.base}/Accreditation`, { params });
  }

  verifyCard(cardNumber: string): Observable<any> {
    return this.http.get<any>(`${this.base}/Accreditation/verify/card/${encodeURIComponent(cardNumber)}`);
  }

  // --- Volunteers ---
  applyVolunteer(payload: any): Observable<Volunteer> {
    return this.http.post<Volunteer>(`${this.base}/Volunteers`, payload);
  }

  getMyVolunteer(): Observable<Volunteer | null> {
    return this.http.get<Volunteer | null>(`${this.base}/Volunteers/my-application`)
      .pipe(catchError(err => err.status === 404 ? of(null) : throwError(() => err)));
  }

  getVolunteers(): Observable<Volunteer[]> {
    return this.http.get<Volunteer[]>(`${this.base}/Volunteers`);
  }

  reviewVolunteer(id: number, status: number, adminNotes: string): Observable<Volunteer> {
    return this.http.put<Volunteer>(`${this.base}/Volunteers/${id}/status`, { status, adminNotes });
  }

  // --- Training Courses ---
  getCourses(pageNumber?: number, pageSize?: number, search?: string): Observable<PagedResponse<Course>> {
    const params = this.buildParams(pageNumber, pageSize, search);
    return this.http.get<PagedResponse<Course>>(`${this.base}/Training/courses`, { params });
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

  getAllEnrollments(pageNumber?: number, pageSize?: number, search?: string): Observable<PagedResponse<Enrollment>> {
    const params = this.buildParams(pageNumber, pageSize, search);
    return this.http.get<PagedResponse<Enrollment>>(`${this.base}/Training/enrollments`, { params });
  }

  reviewEnrollment(id: number, status: number, adminNotes: string): Observable<Enrollment> {
    return this.http.put<Enrollment>(`${this.base}/Training/enrollments/${id}/status`, { status, adminNotes });
  }

  // --- Financial Payments System ---
  submitPayment(payload: any): Observable<Payment> {
    return this.http.post<Payment>(`${this.base}/Payments`, payload);
  }

  getMyPayments(pageNumber?: number, pageSize?: number, search?: string): Observable<PagedResponse<Payment>> {
    const params = this.buildParams(pageNumber, pageSize, search);
    return this.http.get<PagedResponse<Payment>>(`${this.base}/Payments/my-payments`, { params });
  }

  getAllPayments(pageNumber?: number, pageSize?: number, search?: string, status?: number): Observable<PagedResponse<Payment>> {
    const extra: any = {};
    if (status !== undefined) extra.status = status;
    const params = this.buildParams(pageNumber, pageSize, search, extra);
    return this.http.get<PagedResponse<Payment>>(`${this.base}/Payments`, { params });
  }

  reviewPayment(id: number, approve: boolean, adminNotes: string): Observable<Payment> {
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

  getServiceFees(): Observable<ServiceFee[]> {
    return this.http.get<ServiceFee[]>(`${this.base}/ServiceFees`);
  }

  // --- E-Certificates Retrieval & Mechanical validation ---
  issueCertificate(payload: any): Observable<Certificate> {
    return this.http.post<Certificate>(`${this.base}/Certificates`, payload);
  }

  getMyCertificates(pageNumber?: number, pageSize?: number, search?: string): Observable<PagedResponse<Certificate>> {
    const params = this.buildParams(pageNumber, pageSize, search);
    return this.http.get<PagedResponse<Certificate>>(`${this.base}/Certificates/my-certificates`, { params });
  }

  getCertificates(pageNumber?: number, pageSize?: number, search?: string): Observable<PagedResponse<Certificate>> {
    const params = this.buildParams(pageNumber, pageSize, search);
    return this.http.get<PagedResponse<Certificate>>(`${this.base}/Certificates`, { params });
  }

  getCertificateById(id: number): Observable<Certificate> {
    return this.http.get<Certificate>(`${this.base}/Certificates/${id}`);
  }

  verifyCertificate(cardNumber: string): Observable<any> {
    return this.http.get<any>(`${this.base}/Certificates/verify/${encodeURIComponent(cardNumber)}`);
  }

  verifyCertificateFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.base}/Verification/verify-files`, formData);
  }

  downloadCertificateUrl(id: number): string {
    return `${this.base}/Certificates/download/${id}`;
  }

  verify(code: string): Observable<any> {
    return this.http.get(`${this.base}/verification/${code}`);
  }

  // --- General News and PR ---
  getNews(type?: number, pageNumber?: number, pageSize?: number, search?: string): Observable<PagedResponse<NewsArticle>> {
    const extra: any = {};
    if (type !== undefined) extra.type = type;
    const params = this.buildParams(pageNumber, pageSize, search, extra);
    return this.http.get<PagedResponse<NewsArticle>>(`${this.base}/News`, { params });
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
  getPartners(pageNumber?: number, pageSize?: number, search?: string): Observable<PagedResponse<Partner>> {
    const params = this.buildParams(pageNumber, pageSize, search);
    return this.http.get<PagedResponse<Partner>>(`${this.base}/Partners`, { params });
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

  updateServiceFee(codeOrOrderType: string | number, payload: { unitPrice: number; shippingFee: number; isActive: boolean }): Observable<ServiceFee> {
    return this.http.put<ServiceFee>(`${this.base}/ServiceFees/${codeOrOrderType}`, payload);
  }

  // --- System Activity Logs & Dynamic Reports ---
  getAuditLogs(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.base}/AuditLogs`);
  }

  // Admin access to extract user roster
  getUsers(pageNumber?: number, pageSize?: number, search?: string): Observable<PagedResponse<User>> {
    const params = this.buildParams(pageNumber, pageSize, search);
    return this.http.get<PagedResponse<User>>(`${this.base}/Auth/users`, { params });
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

  // --- Orders ---
  createOrder(payload: CreateOrderDto): Observable<Order> {
    return this.http.post<Order>(`${this.base}/Orders`, payload);
  }

  getOrders(pageNumber?: number, pageSize?: number, search?: string, status?: number): Observable<PagedResponse<Order>> {
    const extra: any = {};
    if (status !== undefined) extra.status = status;
    const params = this.buildParams(pageNumber, pageSize, search, extra);
    return this.http.get<PagedResponse<Order>>(`${this.base}/Orders`, { params });
  }

  getMyOrders(pageNumber?: number, pageSize?: number, search?: string, status?: number): Observable<PagedResponse<Order>> {
    const extra: any = {};
    if (status !== undefined) extra.status = status;
    const params = this.buildParams(pageNumber, pageSize, search, extra);
    return this.http.get<PagedResponse<Order>>(`${this.base}/Orders/my-orders`, { params });
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.base}/Orders/${id}`);
  }

  updateOrder(id: number, payload: { quantity: number; notes?: string; trackingNumber?: string }): Observable<Order> {
    return this.http.put<Order>(`${this.base}/Orders/${id}`, payload);
  }

  deleteOrder(id: number): Observable<any> {
    return this.http.delete<any>(`${this.base}/Orders/${id}`);
  }

  updateOrderStatus(id: number, status: OrderStatus, notes?: string): Observable<Order> {
    return this.http.put<Order>(`${this.base}/Orders/${id}/status`, { orderStatus: status, notes });
  }

  getOrderTimeline(id: number): Observable<OrderStatusHistory[]> {
    return this.http.get<OrderStatusHistory[]>(`${this.base}/Orders/${id}/timeline`);
  }

  linkOrderPayment(id: number, paymentId: number): Observable<any> {
    return this.http.post<any>(`${this.base}/Orders/${id}/link-payment/${paymentId}`, {});
  }

  getDocumentUrl(relativeUrl?: string): string {
    if (!relativeUrl) return '';
    const base = environment.apiUrl.replace(/\/api\/?$/, '');
    return relativeUrl.startsWith('http') ? relativeUrl : `${base}${relativeUrl}`;
  }

  // ── User Management (Admin) ───────────────────────────────────────────────
  // GET    /api/UserManagement?role=...   — جلب كل المستخدمين مع فلتر اختياري
  // GET    /api/UserManagement/{id}       — مستخدم بالـ ID
  // POST   /api/UserManagement            — إنشاء مستخدم (Admin/Employee) وإرسال إيميل دعوة
  // PUT    /api/UserManagement/{id}/role        — تغيير الدور
  // PUT    /api/UserManagement/{id}/toggle-active — تفعيل / تعطيل
  // DELETE /api/UserManagement/{id}       — حذف المستخدم

  getUserManagementList(role?: string): Observable<UserListDto[]> {
    let params = new HttpParams();
    if (role) params = params.set('role', role);
    return this.http.get<UserListDto[]>(`${this.base}/UserManagement`, { params });
  }

  getUserManagementById(id: number): Observable<UserListDto> {
    return this.http.get<UserListDto>(`${this.base}/UserManagement/${id}`);
  }

  createManagedUser(dto: CreateUserByAdminDto): Observable<UserListDto> {
    return this.http.post<UserListDto>(`${this.base}/UserManagement`, dto);
  }

  changeManagedUserRole(id: number, role: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.base}/UserManagement/${id}/role`, { role });
  }

  toggleManagedUserActive(id: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.base}/UserManagement/${id}/toggle-active`, {});
  }

  deleteManagedUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/UserManagement/${id}`);
  }

  // ── Dashboard Summary API ──────────────────────────────────────────────────
getDashboardSummary(dto: {
  Period?: number;
  period?: number;
  From?: string;
  To?: string;
  from?: string;
  to?: string;
} = {}): Observable<{
    paymentsCount?: number;
    PaymentsCount?: number;
    coursesCount?: number;
    CoursesCount?: number;
    accreditationsCount?: number;
    AccreditationsCount?: number;
    ordersCount?: number;
    OrdersCount?: number;
    partnersCount?: number;
    PartnersCount?: number;
    volunteersCount?: number;
    VolunteersCount?: number;
    totalRevenue?: number;
    TotalRevenue?: number;
  }> {
const payload = {
  Period: dto.Period ?? dto.period ?? 0,
  From: dto.From ?? dto.from,
  To: dto.To ?? dto.to,
  period: dto.period ?? dto.Period ?? 0,
  from: dto.from ?? dto.From,
  to: dto.to ?? dto.To
};
    return this.http.post<{
      paymentsCount?: number;
      PaymentsCount?: number;
      coursesCount?: number;
      CoursesCount?: number;
      accreditationsCount?: number;
      AccreditationsCount?: number;
      ordersCount?: number;
      OrdersCount?: number;
      partnersCount?: number;
      PartnersCount?: number;
      volunteersCount?: number;
      VolunteersCount?: number;
      totalRevenue?: number;
      TotalRevenue?: number;
    }>(`${this.base}/dashboard/summary`, payload);
  }
  getAccreditationById(id: number): Observable<any> {
  return this.http.get<any>(`${this.base}/Accreditation/${id}`);
}
}
