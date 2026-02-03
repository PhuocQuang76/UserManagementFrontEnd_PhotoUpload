import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoginRequest, LoginResponse, RegisterRequest, AuthUser } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://44.201.239.239/api/auth';
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  // BehaviorSubject to track authentication state
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Login user
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          this.storeAuthData(response);
        })
      );
  }

  /**
   * Register new user
   */
  register(userData: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap(response => {
          this.storeAuthData(response);
        })
      );
  }

  /**
   * Logout user - Calls backend to invalidate token, then clears local storage
   */
  logout(): void {
    const token = this.getToken();

    if (token) {
      // Call backend to invalidate token
      this.http.post(`${this.apiUrl}/logout`, {}).pipe(
        catchError(error => {
          console.error('Logout API error:', error);
          // Continue with local logout even if API fails
          return of(null);
        })
      ).subscribe({
        next: (response) => {
          console.log('Logout successful:', response);
          this.clearLocalAuth();
        },
        error: () => {
          // Clear local storage even if API call fails
          this.clearLocalAuth();
        }
      });
    } else {
      this.clearLocalAuth();
    }
  }

  /**
   * Clear local authentication data and redirect to login
   */
  private clearLocalAuth(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Get stored JWT token
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    // Check if token is expired
    return !this.isTokenExpired(token);
  }

  /**
   * Get current user
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  /**
   * Store authentication data
   */
  private storeAuthData(response: LoginResponse): void {
    localStorage.setItem(this.tokenKey, response.token);

    const user: AuthUser = {
      id: response.id,
      name: response.name,
      email: response.email,
      role: response.role,
      token: response.token
    };

    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Get stored user from localStorage
   */
  private getStoredUser(): AuthUser | null {
    const userJson = localStorage.getItem(this.userKey);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Check if JWT token is expired
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      return Date.now() > expiry;
    } catch {
      return true;
    }
  }

  /**
   * Validate token with backend (optional)
   */
  validateToken(): Observable<any> {
    return this.http.get(`${this.apiUrl}/validate`);
  }
}