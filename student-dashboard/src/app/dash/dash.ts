import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';



@Component({
  selector: 'app-dash',
  imports: [CommonModule,FormsModule],
  templateUrl: './dash.html',
  styleUrl: './dash.css',
})
export class Dash {
  selectedTab: 'profile' | 'result' = 'profile';
  student: any= {};
  courses: any[] = [];
  result: any;
  total = 0;
  maxTotal = 0;
  percentage = 0;
  uploadFlag = true;

  private baseUrl = 'https://result-server-po2j.onrender.com/api';
  constructor(private cdr: ChangeDetectorRef,private http: HttpClient,private router: Router){}

  ngOnInit(){
    const stored = localStorage.getItem('student');
    if(stored === null ){
      alert('Token expired. Please log in again.');
      this.router.navigate(['/login']);
      return;
    }
    this.student = JSON.parse(stored);
    // console.log('student',this.student);
    this.loadCourses();
    this.loadResult();
    this.loadPendingStatus();
  }

  loadCourses(){
    this.http.get<any[]>(`${this.baseUrl}/courses?department=${this.student.department}&semester=${this.student.semester}`)
    .subscribe({
      next: (data) => {
        this.courses = data ;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading courses:', err),

    });
  }

  loadResult(){
    this.http.get<any>(`${this.baseUrl}/results/${this.student.id}`)
      .subscribe({
        next: (data) => {
          this.result = data[0];
          // console.log(this.result);
          if(this.result){
            this.total = this.result.subjects.reduce((sum: number, s: any) => sum + s.marks, 0);
            this.maxTotal = this.result.subjects.reduce((sum: number, s: any) => sum + s.maxMarks, 0);
            this.percentage = parseFloat(((this.total / this.maxTotal) * 100).toFixed(2));
          }
          this.cdr.detectChanges();
        },error: (err)=>console.error('Error Loading result:', err)
      });
  }

  printResult(): void{
    const dashboard = document.getElementById('dashboard-container');
    const print = document.getElementById('print-page');
    const save = document.getElementById('save-page');
    if (dashboard) dashboard.style.display = 'none';
    if (save) save.style.display = 'none';
    if (print) print.style.display = 'block';
    window.print();
    setTimeout(()=>{
      if (save) save.style.display = '';
      if (dashboard) dashboard.style.display = '';
      if (print) print.style.display = 'none';

    }, 200);
  }

  logout(){
    localStorage.removeItem('student');
    this.router.navigate(['/login']);
  }

  getGrade(marks: number): string{
    if (marks >= 90) return 'A+';
    if (marks >= 80) return 'A';
    if (marks >= 70) return 'B';
    if (marks >= 50) return 'C';
    if (marks >= 36) return 'D';
    return 'F';
  }
  goBack(): void{
    this.selectedTab = 'profile';
  }
  async saveResult() {
    const element = document.getElementById('save-page');
    if (!element) return;
    element.style.display = 'block';
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true
    });
    const imgData = canvas.toDataURL('image/png');
    const pxToMm = 0.264583;
    const contentWidthMM = canvas.width * pxToMm;
    const contentHeightMM = canvas.height * pxToMm;
    const marginX = contentWidthMM * 0.1;
    const marginY = contentHeightMM * 0.5;
    const pdfWidth = contentWidthMM + marginX;
    const pdfHeight = contentHeightMM + marginY * 2;
    const pdf = new jsPDF({
      orientation: pdfWidth > pdfHeight ? 'l' : 'p',
      unit: 'mm',
      format: [pdfWidth, pdfHeight]
    });
    const x = (pdfWidth - contentWidthMM) / 2;
    const y = (pdfHeight - contentHeightMM) / 2;
    pdf.addImage(imgData, 'PNG', x, y, contentWidthMM, contentHeightMM);
    pdf.save(`${this.student.name}_Result.pdf`);
    element.style.display = 'none';
  }


  fullDept(dept: string): any{
    if(dept === 'IT') return 'Information Technology';
    if(dept === 'CIV') return 'Civil Engineering';
    if(dept === 'CSE') return 'Computer Science';
    if(dept === 'ME') return 'Mechanical Engineering';
    if(dept === 'ECE') return 'Electronics and Communication';
  }

  loadPendingStatus(){
    this.http.get<{totalPending: number; students: any[] }>(`https://result-server-po2j.onrender.com/api/pendingGrades`)
    .subscribe((res) => {
      const pendingList = res.students || [];
      const flag = pendingList.some((p: any) => p.studentId === this.student.id);
      setTimeout(()=>{
        this.uploadFlag = flag;
        this.cdr.detectChanges();
      });
    });
  }
}
