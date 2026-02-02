import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  imports: [CommonModule,FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private router = inject(Router);
  private http = inject(HttpClient);

  email = '';
  password = '';
  error = '';

  showForgot = false;
  fp_email = "";
  otp = "";
  newPass = "";
  confirmPass = "";
  step = 1;

  login() {
    this.http.post(`${environment.apiUrl}/students/login`, {
        email: this.email.trim(),
        password: this.password.trim()
    })
    .subscribe({
        next: (res: any) => {
          console.log("Login Response:", res);

          localStorage.setItem('student', JSON.stringify(res.student));

          this.router.navigate(['/dash']);
        },
        error: (err) => {
          console.log(err);
          alert("Invalid email or password!");
          this.error = err?.message || 'Login failed. Please try again.';
        }
    });
  }

  openForgot() {
    this.showForgot = true;
    this.step = 1;
  }

  closeForgot() {
    this.showForgot = false;
  }

  sendOtp() {
    this.http.post(`${environment.apiUrl}/otp/send-otp`, { email: this.fp_email })
      .subscribe(() => {
        alert("OTP sent to email!");
        this.step = 2;
      });
  }

  verifyOtp() {
    this.http.post(`${environment.apiUrl}/otp/verify-otp`, { email: this.fp_email, otp: this.otp })
      .subscribe((res: any) => {
        if(res.valid) {
          this.step = 3;
        } else { alert("Invalid OTP"); }
      });
  }

  changePassword() {
    if(this.newPass !== this.confirmPass) return alert("Passwords do not match");

    this.http.post(`${environment.apiUrl}/otp/reset-password`, { email: this.fp_email, password: this.newPass })
      .subscribe(() => {
        alert("Password Updated!");
        this.closeForgot();
      });
  }

}
