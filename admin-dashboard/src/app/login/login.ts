
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { get } from 'http';
import { Auth } from '@angular/fire/auth';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-login',
  imports: [FormsModule, HttpClientModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  username='';
  password='';

  showOtp: boolean = false;
  otp: string = '';
  tempUserId: string = '';
  adminPhone: string = '';
  auth = inject(Auth);
  confirmationResult: any;

  constructor(private http: HttpClient,private router: Router){}

  onSubmit(){
    const credentials = {
      username: this.username,
      password: this.password
    };

    this.http.post<any>(`${environment.apiUrl}/admin/login`, credentials).subscribe({
      next: res => {
        this.tempUserId = res.userId;
        this.adminPhone = res.phone;
        this.sendFirebaseOtp(res.phone);
      },error: ()=>{
        alert('Invalid credentials');
      }
    });
  }

  sendFirebaseOtp(phone: string) {
    const appVerifier = new RecaptchaVerifier(
      this.auth,
      'recaptcha-container',
      { size: 'normal' }
    );

    signInWithPhoneNumber(this.auth, '+91' + phone, appVerifier)
      .then(result => {
        this.confirmationResult = result;
        this.showOtp = true;
      })
      .catch(err => alert(err.message));
  }

  verifyFirebaseOtp() {
    this.confirmationResult.confirm(this.otp).then(() => {
      this.completeLogin();
    }).catch(() => alert("Invalid OTP"));
  }

  completeLogin() {
  this.http.post<any>(`${environment.apiUrl}/admin/otp-success`, { userId: this.tempUserId })
    .subscribe((res:any)=>{
      localStorage.setItem('token', res.token);
      localStorage.setItem('adminname',this.username);
      this.router.navigate(['/admin/dashboard']);
    });
}



}
