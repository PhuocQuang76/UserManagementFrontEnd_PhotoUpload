import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { PageResponse } from '../models/page-response.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h2>User Management</h2>
      
      <div class="form-container">
        <h3>Add New User</h3>
        <form (ngSubmit)="addUser()" #userForm="ngForm">
          <div class="form-group">
            <label>Name:</label>
            <input 
              type="text" 
              [(ngModel)]="newUser.name" 
              name="name" 
              required 
              placeholder="Enter name"
            />
          </div>
          
          <div class="form-group">
            <label>Email:</label>
            <input 
              type="email" 
              [(ngModel)]="newUser.email" 
              name="email" 
              required 
              placeholder="Enter email"
            />
          </div>
          
          <div class="form-group">
            <label>Password:</label>
            <input 
              type="password" 
              [(ngModel)]="newUser.password" 
              name="password" 
              required 
              placeholder="Enter password"
            />
          </div>
          
          <button type="submit" [disabled]="!userForm.valid || isLoading">
            {{ isLoading ? 'Adding...' : 'Add User' }}
          </button>
          
          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          
          <div *ngIf="successMessage" class="success-message">
            {{ successMessage }}
          </div>
        </form>
      </div>

      <div class="users-list">
        <h3>Users List</h3>
        
        <div *ngIf="isLoading && users.length === 0" class="loading">
          Loading users...
        </div>
        
        <div *ngIf="!isLoading && users.length === 0" class="no-users">
          No users found. Add a new user to get started.
        </div>
        
        <table *ngIf="users.length > 0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>{{ user.id }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>
                <button (click)="viewUser(user.id)" class="view-btn">View</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination Controls -->
        <div class="pagination" *ngIf="totalPages > 0">
          <div class="pagination-info">
            Showing {{ users.length }} of {{ totalElements }} users 
            (Page {{ currentPage + 1 }} of {{ totalPages }})
          </div>
          
          <div class="pagination-controls">
            <button 
              class="page-btn" 
              (click)="goToPage(0)" 
              [disabled]="isFirst"
              title="First Page"
            >
              &laquo;
            </button>

            <button 
              class="page-btn" 
              (click)="goToPage(currentPage - 1)" 
              [disabled]="isFirst"
              title="Previous Page"
            >
              &lsaquo;
            </button>

            <button 
              *ngFor="let page of getPageNumbers()" 
              class="page-btn" 
              [class.active]="page === currentPage"
              (click)="goToPage(page)"
            >
              {{ page + 1 }}
            </button>

            <button 
              class="page-btn" 
              (click)="goToPage(currentPage + 1)" 
              [disabled]="isLast"
              title="Next Page"
            >
              &rsaquo;
            </button>

            <button 
              class="page-btn" 
              (click)="goToPage(totalPages - 1)" 
              [disabled]="isLast"
              title="Last Page"
            >
              &raquo;
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
    }

    h2 {
      color: #333;
      margin-bottom: 30px;
      text-align: center;
    }

    h3 {
      color: #555;
      margin-bottom: 20px;
    }

    .form-container {
      background: #f9f9f9;
      padding: 25px;
      border-radius: 8px;
      margin-bottom: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .form-group {
      margin-bottom: 15px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #333;
    }

    input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: #4CAF50;
    }

    button {
      background-color: #4CAF50;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-top: 10px;
    }

    button:hover:not(:disabled) {
      background-color: #45a049;
    }

    button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }

    .users-list {
      background: white;
      padding: 25px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .no-users, .loading {
      text-align: center;
      color: #999;
      padding: 20px;
    }

    .loading {
      color: #4CAF50;
    }

    .error-message {
      background-color: #ffebee;
      color: #c62828;
      padding: 10px;
      border-radius: 4px;
      margin-top: 10px;
    }

    .success-message {
      background-color: #e8f5e9;
      color: #2e7d32;
      padding: 10px;
      border-radius: 4px;
      margin-top: 10px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }

    th {
      background-color: #f2f2f2;
      font-weight: 600;
      color: #333;
    }

    tr:hover {
      background-color: #f5f5f5;
    }

    .view-btn {
      background-color: #2196F3;
      padding: 6px 16px;
      font-size: 13px;
      margin: 0;
    }

    .view-btn:hover {
      background-color: #0b7dda;
    }

    /* Pagination Styles */
    .pagination {
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
    }

    .pagination-info {
      color: #666;
      font-size: 14px;
    }

    .pagination-controls {
      display: flex;
      gap: 5px;
      align-items: center;
    }

    .page-btn {
      min-width: 36px;
      height: 36px;
      padding: 5px 10px;
      margin: 0;
      background-color: #f0f0f0;
      color: #333;
      border: 1px solid #ddd;
      font-size: 14px;
    }

    .page-btn:hover:not(:disabled) {
      background-color: #2196F3;
      color: white;
      border-color: #2196F3;
    }

    .page-btn.active {
      background-color: #2196F3;
      color: white;
      border-color: #2196F3;
    }

    .page-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background-color: #f0f0f0;
    }
  `]
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  newUser = {
    name: '',
    email: '',
    password: ''
  };
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Pagination properties
  currentPage = 0;
  pageSize = 3;
  totalElements = 0;
  totalPages = 0;
  isFirst = true;
  isLast = false;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers(this.currentPage, this.pageSize).subscribe({
      next: (response: PageResponse<User>) => {
        this.users = response.content;
        this.currentPage = response.number;
        this.pageSize = response.size;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.isFirst = response.first;
        this.isLast = response.last;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = 'Failed to load users. Make sure Spring Boot backend is running.';
        this.isLoading = false;
      }
    });
  }

  // Pagination method
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  // Generate page numbers for display
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(0, this.currentPage - 2);
    const endPage = Math.min(this.totalPages - 1, this.currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  addUser(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    this.userService.addUser(this.newUser).subscribe({
      next: (user) => {
        this.successMessage = 'User added successfully!';
        this.newUser = { name: '', email: '', password: '' };
        // Go to first page to see the new user (if sorted by id desc) or reload current
        this.currentPage = 0;
        this.loadUsers();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error adding user:', error);
        this.errorMessage = error.error?.message || 'Failed to add user';
        this.isLoading = false;
      }
    });
  }

  viewUser(id: number): void {
    this.router.navigate(['/user', id]);
  }
}