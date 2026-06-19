/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';

import { LoginResponse, User } from '../../models/types';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Core authenticated states
  currentUser = signal<User | null>(null);
  token = signal<string | null>(null);
  isAuthenticated = computed(() => this.currentUser() !== null);

  // Get user roles robustly from flat list or EF Core relation nested inside userRoles
  getUserRoles(): string[] {
    const user = this.currentUser() as any;
    if (!user) return [];
    
    const list: string[] = [];
    if (Array.isArray(user.roles)) {
      list.push(...user.roles);
    }
    if (Array.isArray(user.Roles)) {
      list.push(...user.Roles);
    }
    if (Array.isArray(user.userRoles)) {
      user.userRoles.forEach((ur: any) => {
        if (ur && ur.role && typeof ur.role.name === 'string') {
          list.push(ur.role.name);
        } else if (ur && ur.role && typeof ur.role.Name === 'string') {
          list.push(ur.role.Name);
        } else if (ur && typeof ur.roleName === 'string') {
          list.push(ur.roleName);
        } else if (ur && typeof ur.RoleName === 'string') {
          list.push(ur.RoleName);
        } else if (ur && ur.role && typeof ur.role === 'string') {
          list.push(ur.role);
        } else if (ur && typeof ur === 'string') {
          list.push(ur);
        }
      });
    }
    if (Array.isArray(user.UserRoles)) {
      user.UserRoles.forEach((ur: any) => {
        if (ur && ur.role && typeof ur.role.name === 'string') {
          list.push(ur.role.name);
        } else if (ur && ur.role && typeof ur.role.Name === 'string') {
          list.push(ur.role.Name);
        } else if (ur && typeof ur.roleName === 'string') {
          list.push(ur.roleName);
        } else if (ur && typeof ur.RoleName === 'string') {
          list.push(ur.RoleName);
        } else if (ur && ur.role && typeof ur.role === 'string') {
          list.push(ur.role);
        } else if (ur && typeof ur === 'string') {
          list.push(ur);
        }
      });
    }
    return list;
  }

  isAdmin = computed(() => {
    const roles = this.getUserRoles();
    return roles.some(r => r.toLowerCase() === 'admin');
  });

  isStaff = computed(() => {
    const roles = this.getUserRoles();
    return roles.some(r => r.toLowerCase() === 'admin' || r.toLowerCase() === 'employee' || r.toLowerCase() === 'staff');
  });

  constructor() {
    this.restoreSession();
  }

  private restoreSession() {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('gacam_token');
      const savedUser = localStorage.getItem('gacam_user');
      if (savedToken && savedUser) {
        this.token.set(savedToken);
        try {
          this.currentUser.set(JSON.parse(savedUser));
        } catch {
          this.logout();
        }
      }
    }
  }

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<any>(`${environment.apiUrl}/Auth/login`, credentials).pipe(
      tap(res => {
        const anyRes = res as any;
        const tokenVal = anyRes.token || anyRes.Token;
        const emailVal = anyRes.email || anyRes.Email;
        const fullNameVal = anyRes.fullName || anyRes.FullName;
        const rolesVal = anyRes.roles || anyRes.Roles || [];

        this.token.set(tokenVal);
        const placeholderUser: User = {
          id: 0, 
          email: emailVal,
          fullName: fullNameVal,
          isActive: true,
          roles: Array.isArray(rolesVal) ? rolesVal : [rolesVal]
        };
        this.currentUser.set(placeholderUser);

        if (typeof window !== 'undefined') {
          localStorage.setItem('gacam_token', tokenVal || '');
          localStorage.setItem('gacam_user', JSON.stringify(placeholderUser));
        }

        // Immediately fetch actual detailed profiles to retrieve correct user ID
        this.fetchProfile().subscribe();
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/Auth/register`, userData);
  }

  fetchProfile(): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${environment.apiUrl}/profile`, { headers }).pipe(
      tap(res => {
        const user: User = {
          id: res.id ?? res.Id ?? 0,
          email: res.email || res.Email,
          fullName: res.fullName || res.FullName,
          isActive: res.isActive ?? res.IsActive ?? true,
          roles: res.roles || res.Roles || [],
          country: res.country || res.Country || '',
          organization: res.organization || res.Organization || '',
          profileImageUrl: res.profileImageUrl ?? res.ProfileImageUrl ?? ''
        };
        
        const rawRoles = res.roles || res.Roles || [];
        const userRolesList = res.userRoles || res.UserRoles || [];
        (user as any).roles = Array.isArray(rawRoles) ? rawRoles : [];
        (user as any).userRoles = Array.isArray(userRolesList) ? userRolesList : [];

        this.currentUser.set(user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('gacam_user', JSON.stringify(user));
        }
      }),
      catchError(err => {
        if (err && err.status === 401) {
          this.logout();
        }
        return throwError(() => err);
      })
    );
  }

  updateProfile(fullName: string, phoneNumber: string): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.put<any>(`${environment.apiUrl}/profile`, { fullName, phoneNumber }, { headers }).pipe(
      tap(res => {
        this.fetchProfile().subscribe();
      })
    );
  }

  uploadProfileImage(file: File): Observable<any> {
    const headers = this.getAuthHeaders();
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<any>(`${environment.apiUrl}/profile/upload-image`, fd, { headers }).pipe(
      tap(() => {
        this.fetchProfile().subscribe();
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/Auth/forgot-password`, { email });
  }

  resetPassword(payload: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/Auth/reset-password`, payload);
  }

  getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const tokenVal = this.token();
    if (tokenVal) {
      headers = headers.set('Authorization', `Bearer ${tokenVal}`);
    }
    return headers;
  }


  logout() {
    this.token.set(null);
    this.currentUser.set(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gacam_token');
      localStorage.removeItem('gacam_user');
    }
    this.router.navigate(['/']);
  }
}
