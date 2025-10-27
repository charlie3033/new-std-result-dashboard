import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api/students';

  loginStudent(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data);
  }

  getProfile(): Observable<any> {
    const token = localStorage.getItem('studentToken');
    return this.http.get(`${this.baseUrl}/profile`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    });
  }

  getResult(): Observable<any> {
    const token = localStorage.getItem('studentToken');
    return this.http.get(`${this.baseUrl}/result`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    });
  }
}
