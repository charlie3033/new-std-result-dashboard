import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { StudentService } from '../services/student.service';

@Component({
  selector: 'app-result',
  imports: [CommonModule],
  templateUrl: './result.html',
  styleUrl: './result.css',
})
export class Result {
  private service = inject(StudentService);
  result: any;

  ngOnInit() {
    this.service.getResult().subscribe(res => this.result = res);
  }

  printResult() {
    window.print();
  }
}
