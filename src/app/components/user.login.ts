import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoginRequest } from '../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Login</h2>

        <div *ngIf="sessionExpired" class="warning-message">
          Your session has expired. Please login again.
        </div>

        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div *ngIf="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              [(ngModel)]="credentials.email"
              name="email"
              required
              email
              placeholder="Enter your email"
              #emailInput="ngModel"
            />
            <div *ngIf="emailInput.invalid && emailInput.touched" class="field-error">
              Please enter a valid email
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              [(ngModel)]="credentials.password"
              name="password"
              required
              minlength="6"
              placeholder="Enter your password"
              #passwordInput="ngModel"
            />
            <div *ngIf="passwordInput.invalid && passwordInput.touched" class="field-error">
              Password must be at least 6 characters
            </div>
          </div>

          <button
            type="submit"
            [disabled]="loginForm.invalid || isLoading"
            class="login-btn"
          >
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <div class="register-link">
          Don't have an account? <a routerLink="/register">Register here</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      width: 100%;
      max-width: 400px;
    }

    h2 {
      text-align: center;
      color: #333;
      margin-bottom: 30px;
      font-size: 28px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      color: #555;
      font-weight: 500;
    }

    input {
      width: 100%;
      padding: 12px 15px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 16px;
      box-sizing: border-box;
      transition: border-color 0.3s;
    }

    input:focus {
      outline: none;
      border-color: #667eea;
    }

    input.ng-invalid.ng-touched {
      border-color: #f44336;
    }

    .field-error {
      color: #f44336;
      font-size: 12px;
      margin-top: 5px;
    }

    .login-btn {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.3s;
    }

    .login-btn:hover:not(:disabled) {
      opacity: 0.9;
    }

    .login-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error-message {
      background-color: #ffebee;
      color: #c62828;
      padding: 12px;
      border-radius: 5px;
      margin-bottom: 20px;
      text-align: center;
    }

    .success-message {
      background-color: #e8f5e9;
      color: #2e7d32;
      padding: 12px;
      border-radius: 5px;
      margin-bottom: 20px;
      text-align: center;
    }

    .warning-message {
      background-color: #fff3e0;
      color: #e65100;
      padding: 12px;
      border-radius: 5px;
      margin-bottom: 20px;
      text-align: center;
    }

    .register-link {
      text-align: center;
      margin-top: 25px;
      color: #666;
    }

    .register-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .register-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent implements OnInit {
  credentials: LoginRequest = {
    email: '',
    password: ''
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  sessionExpired = false;
  returnUrl = '/';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }

    // Get return URL from query params
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    // Check if session expired
    this.sessionExpired = this.route.snapshot.queryParams['sessionExpired'] === 'true';

    // Check for registration success
    if (this.route.snapshot.queryParams['registered'] === 'true') {
      this.successMessage = 'Registration successful! Please login.';
    }
  }

  onSubmit(): void {
    if (!this.credentials.email || !this.credentials.password) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = error.error?.message || 'Invalid email or password';
        this.isLoading = false;
      }
    });
  }
}