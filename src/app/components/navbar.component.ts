import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthUser } from '../models/auth.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <a routerLink="/">User Management System</a>
      </div>

      <div class="navbar-menu">
        <!-- Show when logged in -->
        <ng-container *ngIf="currentUser">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            Users
          </a>

          <div class="user-info">
            <span class="user-name">👤 {{ currentUser.name }}</span>
            <span class="user-role">({{ currentUser.role }})</span>
          </div>

          <!-- LOGOUT BUTTON -->
          <button class="logout-btn" (click)="logout()" [disabled]="isLoggingOut">
            {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
          </button>
        </ng-container>

        <!-- Show when not logged in -->
        <ng-container *ngIf="!currentUser">
          <a routerLink="/login" routerLinkActive="active">Login</a>
          <a routerLink="/register" routerLinkActive="active" class="register-link">Register</a>
        </ng-container>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 15px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .navbar-brand a {
      color: white;
      text-decoration: none;
      font-size: 22px;
      font-weight: bold;
    }

    .navbar-menu {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .navbar-menu a {
      color: white;
      text-decoration: none;
      font-weight: 500;
      padding: 8px 15px;
      border-radius: 5px;
      transition: background-color 0.3s;
    }

    .navbar-menu a:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .navbar-menu a.active {
      background-color: rgba(255, 255, 255, 0.3);
    }

    .register-link {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .user-info {
      color: white;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 15px;
      border-left: 1px solid rgba(255, 255, 255, 0.3);
      border-right: 1px solid rgba(255, 255, 255, 0.3);
    }

    .user-name {
      font-weight: 600;
    }

    .user-role {
      font-size: 12px;
      opacity: 0.8;
    }

    .logout-btn {
      background-color: #ff4757;
      color: white;
      border: none;
      padding: 8px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.3s;
    }

    .logout-btn:hover:not(:disabled) {
      background-color: #ff6b7a;
    }

    .logout-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class NavbarComponent implements OnInit {
  currentUser: AuthUser | null = null;
  isLoggingOut = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe to user changes
    this.authService.currentUser$.subscribe((user: any) => {
      this.currentUser = user;
    });
  }

  // LOGOUT METHOD
  logout(): void {
    this.isLoggingOut = true;
    this.authService.logout();
  }
}