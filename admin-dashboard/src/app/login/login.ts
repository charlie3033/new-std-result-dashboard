
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component,ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { error } from 'console';


@Component({
  selector: 'app-login',
  imports: [FormsModule, HttpClientModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  username='';
  password='';
  showOtp=false;
  otp:string='';
  email:string ='';
  maskemail:string ='';
  resendTimer:number=0;
  timerInterval:any;
  isLoading=false;
  isResending = false;


  constructor(private http: HttpClient,private router: Router,private cdr: ChangeDetectorRef){}

  onSubmit(){
    if(this.isLoading) return;
    this.isLoading=true;

    const credentials = {
      username: this.username,
      password: this.password
    };

    this.http.post<any>(`${environment.apiUrl}/admin/login`, credentials).subscribe({
      next: res => {
        this.showOtp=true;
        this.email=res.email;
        this.maskemail=res.maskemail;
        this.startResendTimer();
        this.cdr.detectChanges();
        // localStorage.setItem('token', res.token);
        // localStorage.setItem('adminname',this.username);
        // this.router.navigate(['/admin/dashboard']);
      },error: ()=>{
        alert('Invalid credentials');
        this.isLoading=false;
        this.showOtp=false;
        this.cdr.detectChanges();
      }
    });
  }

  sendOtp(){
    if(this.resendTimer>0 || this.isResending) return;

    this.isResending = true;
    this.http.post<any>(`${environment.apiUrl}/admin/send-otp`, {email: this.email})
    .subscribe({
      next: () => {
        this.startResendTimer();
        this.isResending = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isResending = false;
        this.cdr.detectChanges();
      }
    });
  }

  verifyOtp(){
    const data = {
      email: this.email,
      otp: this.otp
    };
    this.http.post<any>(`${environment.apiUrl}/admin/verify-otp`, data).subscribe({
      next: res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('adminname',this.username);
        this.router.navigate(['/admin/dashboard']);
        this.cdr.detectChanges();
      },error: ()=>{
        alert('Invalid OTP');
      }
    });
  }

  startResendTimer() {
    this.resendTimer = 30;

    this.timerInterval = setInterval(() => {
      this.resendTimer--;
      this.cdr.detectChanges();
      if (this.resendTimer <= 0) {
        clearInterval(this.timerInterval);
        this.cdr.detectChanges();
      }
    }, 1000);
  }

  goBack() {
    this.showOtp = false;
    this.otp = '';        // clear OTP field
    this.isLoading = false; // reset loading state
    clearInterval(this.timerInterval);
    this.cdr.detectChanges();
    window.location.reload();
  }



}
