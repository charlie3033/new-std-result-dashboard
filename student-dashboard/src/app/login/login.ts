import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../services/student.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule,FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private service = inject(StudentService);
  private router = inject(Router);

  email = '';
  password = '';
  error = '';

  login() {
    this.service.loginStudent({ email: this.email, password: this.password })
      .subscribe({
        next: res => {
          localStorage.setItem('studentToken', res.token);
          this.router.navigate(['/profile']);
        },
        error: err => this.error = err.error?.message || 'Login failed'
      });
  }
}
