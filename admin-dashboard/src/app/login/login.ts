import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  imports: [FormsModule,CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  username='';
  password='';
  constructor(private http: HttpClient,private router: Router){}

  onSubmit(){
    const credentials = {
      username: this.username,
      password: this.password
    };

    this.http.post<any>('http://localhost:3000/api/admin/login', credentials).subscribe({
      next: res => {
        localStorage.setItem('token', res.token);
        this.router.navigate(['/admin/dashboard']);
      },error: ()=>{
        alert('Invalid credentials');
      }
    });
  }
}
