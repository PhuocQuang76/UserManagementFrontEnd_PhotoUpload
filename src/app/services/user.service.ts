import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { PageResponse } from '../models/page-response.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://44.201.239.239/api/users';

  constructor(private http: HttpClient) {}

  getUsers(
    page: number = 0,
    size: number = 5,
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Observable<PageResponse<User>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<PageResponse<User>>(this.apiUrl, { params });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  addUser(user: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: number, updatedUser: Omit<User, 'id'>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, updatedUser);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // 👇 New methods for photo upload
  uploadPhoto(userId: number, file: File): Observable<User> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<User>(`${this.apiUrl}/${userId}/photo`, formData);
  }

  deletePhoto(userId: number): Observable<User> {
    return this.http.delete<User>(`${this.apiUrl}/${userId}/photo`);
  }
}