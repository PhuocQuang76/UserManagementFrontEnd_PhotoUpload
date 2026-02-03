import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h2>User Details</h2>
      
      <div *ngIf="isLoading && !user" class="loading">
        Loading user details...
      </div>
      
      <div *ngIf="!isLoading && !user" class="error">
        User not found!
        <button (click)="goBack()">Back to List</button>
      </div>

      <div *ngIf="user" class="user-detail">
        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        
        <div *ngIf="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <!-- Main Content: Details on Left, Photo on Right -->
        <div class="content-wrapper">
          
          <!-- Left Side: User Details -->
          <div class="details-section">
            <div *ngIf="!isEditing" class="view-mode">
              <div class="detail-item">
                <label>ID:</label>
                <span>{{ user.id }}</span>
              </div>
              
              <div class="detail-item">
                <label>Name:</label>
                <span>{{ user.name }}</span>
              </div>
              
              <div class="detail-item">
                <label>Email:</label>
                <span>{{ user.email }}</span>
              </div>
              
              <div class="detail-item">
                <label>Password:</label>
                <span>{{ '•'.repeat(user.password.length) }}</span>
              </div>
            </div>

            <div *ngIf="isEditing" class="edit-mode">
              <form (ngSubmit)="updateUser()" #editForm="ngForm">
                <div class="form-group">
                  <label>Name:</label>
                  <input 
                    type="text" 
                    [(ngModel)]="editedUser.name" 
                    name="name" 
                    required 
                    placeholder="Enter name"
                  />
                </div>
                
                <div class="form-group">
                  <label>Email:</label>
                  <input 
                    type="email" 
                    [(ngModel)]="editedUser.email" 
                    name="email" 
                    required 
                    placeholder="Enter email"
                  />
                </div>
                
                <div class="form-group">
                  <label>Password:</label>
                  <input 
                    type="password" 
                    [(ngModel)]="editedUser.password" 
                    name="password" 
                    required 
                    placeholder="Enter password"
                  />
                </div>

                <div class="button-group">
                  <button type="submit" [disabled]="!editForm.valid || isLoading" class="save-btn">
                    {{ isLoading ? 'Saving...' : 'Save' }}
                  </button>
                  <button type="button" (click)="cancelEdit()" class="cancel-btn" [disabled]="isLoading">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Right Side: Photo Section -->
          <div class="photo-section">
            <div class="photo-container">
              <img 
                *ngIf="user.photoUrl" 
                [src]="user.photoUrl" 
                alt="User Photo"
                class="user-photo"
              />
              <div *ngIf="!user.photoUrl" class="no-photo">
                <span class="photo-icon">👤</span>
                <span>No Photo</span>
              </div>
            </div>

            <div class="photo-actions">
              <input 
                type="file" 
                #fileInput 
                (change)="onFileSelected($event)"
                accept="image/*"
                style="display: none"
              />
              <button 
                class="upload-btn" 
                (click)="fileInput.click()" 
                [disabled]="isUploading"
              >
                {{ isUploading ? 'Uploading...' : (user.photoUrl ? 'Change Photo' : 'Upload Photo') }}
              </button>
              <button 
                *ngIf="user.photoUrl" 
                class="delete-photo-btn" 
                (click)="deletePhoto()"
                [disabled]="isUploading"
              >
                Remove
              </button>
            </div>

            <div *ngIf="photoMessage" class="photo-message" [class.success]="photoSuccess">
              {{ photoMessage }}
            </div>
          </div>
        </div>

        <!-- Bottom Buttons (only in view mode) -->
        <div *ngIf="!isEditing" class="button-group">
          <button (click)="enableEdit()" class="edit-btn" [disabled]="isLoading">
            Edit
          </button>
          <button (click)="deleteUser()" class="delete-btn" [disabled]="isLoading">
            {{ isLoading ? 'Deleting...' : 'Delete' }}
          </button>
          <button (click)="goBack()" class="back-btn">Back</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 700px;
      margin: 0 auto;
      padding: 20px;
    }

    h2 {
      color: #333;
      margin-bottom: 30px;
      text-align: center;
    }

    .loading {
      text-align: center;
      color: #4CAF50;
      padding: 20px;
      font-size: 16px;
    }

    .error {
      background: #ffebee;
      color: #c62828;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }

    .error-message {
      background-color: #ffebee;
      color: #c62828;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 15px;
    }

    .success-message {
      background-color: #e8f5e9;
      color: #2e7d32;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 15px;
    }

    .user-detail {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    /* Content Wrapper - Flexbox for side by side layout */
    .content-wrapper {
      display: flex;
      gap: 30px;
      margin-bottom: 20px;
    }

    /* Left Side - Details */
    .details-section {
      flex: 1;
    }

    /* Right Side - Photo */
    .photo-section {
      width: 180px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .photo-container {
      width: 150px;
      height: 150px;
      border-radius: 8px;
      overflow: hidden;
      border: 2px solid #ddd;
      margin-bottom: 15px;
      background-color: #f5f5f5;
    }

    .user-photo {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .no-photo {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #999;
    }

    .photo-icon {
      font-size: 48px;
      margin-bottom: 5px;
    }

    .photo-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }

    .upload-btn {
      background-color: #2196F3;
      color: white;
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      width: 100%;
    }

    .upload-btn:hover:not(:disabled) {
      background-color: #1976D2;
    }

    .upload-btn:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .delete-photo-btn {
      background-color: #ff5722;
      color: white;
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      width: 100%;
    }

    .delete-photo-btn:hover:not(:disabled) {
      background-color: #e64a19;
    }

    .photo-message {
      margin-top: 10px;
      padding: 6px 10px;
      border-radius: 4px;
      font-size: 12px;
      text-align: center;
      background-color: #ffebee;
      color: #c62828;
    }

    .photo-message.success {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .detail-item {
      margin-bottom: 20px;
      display: flex;
      align-items: center;
    }

    .detail-item label {
      font-weight: 600;
      color: #555;
      width: 120px;
      margin-right: 20px;
    }

    .detail-item span {
      color: #333;
      font-size: 16px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #555;
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

    .button-group {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }

    button {
      flex: 1;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.3s;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .edit-btn, .save-btn {
      background-color: #4CAF50;
      color: white;
    }

    .edit-btn:hover, .save-btn:hover:not(:disabled) {
      background-color: #45a049;
    }

    .delete-btn {
      background-color: #f44336;
      color: white;
    }

    .delete-btn:hover {
      background-color: #da190b;
    }

    .back-btn, .cancel-btn {
      background-color: #757575;
      color: white;
    }

    .back-btn:hover, .cancel-btn:hover {
      background-color: #616161;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .content-wrapper {
        flex-direction: column-reverse;
      }

      .photo-section {
        width: 100%;
        margin-bottom: 20px;
      }
    }
  `]
})
export class UserDetailComponent implements OnInit {
  user?: User;
  editedUser = {
    name: '',
    email: '',
    password: ''
  };
  isEditing = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  userId!: number;

  // Photo upload properties
  isUploading = false;
  photoMessage = '';
  photoSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId = +id;
      this.loadUser();
    }
  }

  loadUser(): void {
    this.isLoading = true;
    this.userService.getUserById(this.userId).subscribe({
      next: (data) => {
        this.user = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.errorMessage = 'User not found';
        this.isLoading = false;
      }
    });
  }

  enableEdit(): void {
    if (this.user) {
      this.editedUser = {
        name: this.user.name,
        email: this.user.email,
        password: this.user.password
      };
      this.isEditing = true;
      this.errorMessage = '';
      this.successMessage = '';
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  updateUser(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    this.userService.updateUser(this.userId, this.editedUser).subscribe({
      next: (data) => {
        this.user = data;
        this.isEditing = false;
        this.isLoading = false;
        this.successMessage = 'User updated successfully!';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.errorMessage = error.error?.message || 'Failed to update user';
        this.isLoading = false;
      }
    });
  }

  deleteUser(): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.isLoading = true;
      this.userService.deleteUser(this.userId).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.errorMessage = 'Failed to delete user';
          this.isLoading = false;
        }
      });
    }
  }

  // Photo upload methods
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0 && this.user) {
      const file = input.files[0];

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.photoMessage = 'File size must be less than 5MB';
        this.photoSuccess = false;
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.photoMessage = 'Please select an image file';
        this.photoSuccess = false;
        return;
      }

      this.uploadPhoto(file);
    }
  }

  uploadPhoto(file: File): void {
    if (!this.user) return;

    this.isUploading = true;
    this.photoMessage = '';

    this.userService.uploadPhoto(this.user.id, file).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.photoMessage = 'Photo uploaded successfully!';
        this.photoSuccess = true;
        this.isUploading = false;
        setTimeout(() => this.photoMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error uploading photo:', error);
        this.photoMessage = 'Failed to upload photo';
        this.photoSuccess = false;
        this.isUploading = false;
      }
    });
  }

  deletePhoto(): void {
    if (!this.user || !confirm('Are you sure you want to remove this photo?')) return;

    this.isUploading = true;
    this.userService.deletePhoto(this.user.id).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.photoMessage = 'Photo removed successfully!';
        this.photoSuccess = true;
        this.isUploading = false;
        setTimeout(() => this.photoMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error deleting photo:', error);
        this.photoMessage = 'Failed to remove photo';
        this.photoSuccess = false;
        this.isUploading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}