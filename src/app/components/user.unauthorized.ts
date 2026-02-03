import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-card">
        <div class="icon">🚫</div>
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
        <a routerLink="/" class="home-btn">Go to Home</a>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .unauthorized-card {
      background: white;
      padding: 50px;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      text-align: center;
      max-width: 400px;
    }

    .icon {
      font-size: 64px;
      margin-bottom: 20px;
    }

    h2 {
      color: #333;
      margin-bottom: 15px;
    }

    p {
      color: #666;
      margin-bottom: 30px;
    }

    .home-btn {
      display: inline-block;
      padding: 12px 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 5px;
      font-weight: 600;
    }

    .home-btn:hover {
      opacity: 0.9;
    }
  `]
})
export class UnauthorizedComponent {}