import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError, catchError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
// ─── DTOs (matching backend exactly) ──────────────────────────────────────────

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserDto {
  id: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  roles: string[];
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresAt: Date;
  user: UserDto;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  userId: string;
  email: string;
  role: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  phoneNumber?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AssignRoleRequest {
  roleName: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email:           string;
  token:           string;
  newPassword:     string;
  confirmPassword: string;  // ← زود ده
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface PagedRequestDto {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ─── Storage Keys ──────────────────────────────────────────────────────────────

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';
const USER_KEY = 'current_user';

// ─── Service ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private currentUserSubject = new BehaviorSubject<UserDto | null>(this.loadUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  // ── Auth ────────────────────────────────────────────────────────────────────

  register(request: RegisterRequest): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.baseUrl}/register`, request);
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, request).pipe(
      tap((response) => {
        this.saveTokens(response.token, response.refreshToken, response.expiresAt);
        this.saveUser(response.user);
      })
    );
  }

  logout(): void {
    this.revokeToken().subscribe({ error: () => {} });
    this.clearSession();
    this.router.navigate(['/login']);
  }

  // ── Profile ─────────────────────────────────────────────────────────────────

  getProfile(): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.baseUrl}/profile`).pipe(
      tap((user) => this.saveUser(user))
    );
  }

  updateProfile(request: UpdateProfileRequest): Observable<UserDto> {
    return this.http.put<UserDto>(`${this.baseUrl}/profile`, request).pipe(
      tap((user) => this.saveUser(user))
    );
  }

  uploadProfileImage(file: File): Observable<UserDto> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UserDto>(`${this.baseUrl}/profile/image`, formData).pipe(
      tap((user) => this.saveUser(user))
    );
  }

  // ── Password ─────────────────────────────────────────────────────────────────

  changePassword(request: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/change-password`, request);
  }

  forgotPassword(dto: ForgotPasswordDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/forgot-password`, dto);
  }

  resetPassword(dto: ResetPasswordDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/reset-password`, dto);
  }

  // ── Tokens ───────────────────────────────────────────────────────────────────

  refreshToken(): Observable<AuthResponseDto> {
    const token = this.getRefreshToken();
    if (!token) return throwError(() => new Error('No refresh token'));

    return this.http
      .post<AuthResponseDto>(`${this.baseUrl}/refresh-token`, { refreshToken: token } as RefreshTokenRequestDto)
      .pipe(
        tap((response) => {
          this.saveTokens(response.accessToken, response.refreshToken, response.expiresAt);
        }),
        catchError((err) => {
          this.clearSession();
          this.router.navigate(['/login']);
          return throwError(() => err);
        })
      );
  }

  revokeToken(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/revoke-token`, {});
  }

  // ── Admin / Users ─────────────────────────────────────────────────────────────

  getAllUsers(request: PagedRequestDto = {}): Observable<PagedResponse<UserDto>> {
    let params = new HttpParams();
    if (request.pageNumber != null) params = params.set('pageNumber', request.pageNumber);
    if (request.pageSize != null) params = params.set('pageSize', request.pageSize);
    if (request.search) params = params.set('search', request.search);

    return this.http.get<PagedResponse<UserDto>>(`${this.baseUrl}/users`, { params });
  }

  assignRole(userId: number, roleName: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/users/${userId}/roles`,
      { roleName } as AssignRoleRequest
    );
  }

  removeRole(userId: number, roleName: string): Observable<{ message: string }> {
    const params = new HttpParams().set('roleName', roleName);
    return this.http.delete<{ message: string }>(
      `${this.baseUrl}/users/${userId}/roles`,
      { params }
    );
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  getAccessToken(): string | null {
    return this.storage.getItem(ACCESS_TOKEN_KEY);
  }

  token(): string | null {
    return this.getAccessToken();
  }

  getRefreshToken(): string | null {
    return this.storage.getItem(REFRESH_TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  isTokenExpired(): boolean {
    const expiry = this.storage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiry) return true;
    return new Date(expiry) <= new Date();
  }

  getCurrentUser(): UserDto | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    return this.getCurrentUser()?.roles.includes(role) ?? false;
  }

  isAdmin(): boolean {
    return this.hasRole('Admin');
  }

  isEmployee(): boolean {
    return this.hasRole('Employee');
  }

  isStaff(): boolean {
    return this.isAdmin() || this.isEmployee();
  }

  // ── Private ──────────────────────────────────────────────────────────────────

  /** localStorage wrapper — آمن في SSR */
  private get storage(): Storage {
    if (this.isBrowser) return localStorage;
    // SSR fallback: in-memory store وهمي
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0,
    } as unknown as Storage;
  }

  private saveTokens(accessToken: string, refreshToken: string, expiresAt: Date): void {
    this.storage.setItem(ACCESS_TOKEN_KEY, accessToken);
    this.storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    this.storage.setItem(TOKEN_EXPIRY_KEY, new Date(expiresAt).toISOString());
  }

  private saveUser(user: UserDto): void {
    this.storage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private loadUser(): UserDto | null {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  private clearSession(): void {
    this.storage.removeItem(ACCESS_TOKEN_KEY);
    this.storage.removeItem(REFRESH_TOKEN_KEY);
    this.storage.removeItem(TOKEN_EXPIRY_KEY);
    this.storage.removeItem(USER_KEY);
    this.currentUserSubject.next(null);
  }
}