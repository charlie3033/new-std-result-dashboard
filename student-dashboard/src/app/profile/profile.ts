import { Component, inject } from '@angular/core';
import { StudentService } from '../services/student.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private service = inject(StudentService);
  student: any;

  ngOnInit() {
    this.service.getProfile().subscribe(res => this.student = res);
  }
}
