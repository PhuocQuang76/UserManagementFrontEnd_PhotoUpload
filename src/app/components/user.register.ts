import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RegisterRequest } from '../models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="register-container">
      <div class="register-card">
        <h2>Create Account</h2>

        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input
              type="text"
              id="name"
              [(ngModel)]="userData.name"
              name="name"
              required
              placeholder="Enter your full name"
              #nameInput="ngModel"
            />
            <div *ngIf="nameInput.invalid && nameInput.touched" class="field-error">
              Name is required
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              [(ngModel)]="userData.email"
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
              [(ngModel)]="userData.password"
              name="password"
              required
              minlength="6"
              placeholder="Enter password (min 6 characters)"
              #passwordInput="ngModel"
            />
            <div *ngIf="passwordInput.invalid && passwordInput.touched" class="field-error">
              Password must be at least 6 characters
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              [(ngModel)]="confirmPassword"
              name="confirmPassword"
              required
              placeholder="Confirm your password"
              #confirmInput="ngModel"
            />
            <div *ngIf="confirmPassword && userData.password !== confirmPassword" class="field-error">
              Passwords do not match
            </div>
          </div>

          <button
            type="submit"
            [disabled]="registerForm.invalid || isLoading || userData.password !== confirmPassword"
            class="register-btn"
          >
            {{ isLoading ? 'Creating Account...' : 'Register' }}
          </button>
        </form>

        <div class="login-link">
          Already have an account? <a routerLink="/login">Login here</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .register-card {
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

    .register-btn {
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

    .register-btn:hover:not(:disabled) {
      opacity: 0.9;
    }

    .register-btn:disabled {
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

    .login-link {
      text-align: center;
      margin-top: 25px;
      color: #666;
    }

    .login-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .login-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent implements OnInit {
  userData: RegisterRequest = {
    name: '',
    email: '',
    password: ''
  };
  confirmPassword = '';

  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  onSubmit(): void {
    if (this.userData.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.userData).subscribe({
      next: () => {
        // Registration successful - user is auto logged in
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        this.isLoading = false;
      }
    });
  }
}