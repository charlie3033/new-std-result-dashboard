const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from './student.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';


@Component({
  selector: 'app-dash',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dash.html',
  styleUrls: ['./dash.css']
})
export class Dash implements OnInit {
  students: any[] = [];
  departments: any[] = [];
  filterDept: string = "";
  selectedTab: string = 'dashboard';

  // For Add Student
  newStudent: any = { name: '', department: '', semester: '' };

  //for add student popup
  showStudentPopup = false;
  addedStudent : any = null;

  // For Edit Student Info
  editInfoStudent: any = null;

  // For Stats
  stats = {
    totalStudents: 0,
    totalDepartments: 0,
    pendingGrades: 0
  };

  // For Edit Marks
  editMarksStudent: any = null;
  editResult: any = null;

  // For View Results
  resultStudent: any = null;
  studentResults: any[] = [];

  // For Activity Log
  activityLog: { message: string, time: Date, user: string }[] = [];

  // For Notification
  notifications: { message: string, type: 'success' | 'error' | 'info' }[] = [];

  loading = true;

  pendingStudents: any[] = [];

  isPendingEnabled: boolean = false;
  isAllPendingEnabled: boolean = false;

  courses: any[] = [];

  constructor(private studentService: StudentService, private cdr: ChangeDetectorRef,private http: HttpClient,private router: Router) {}



  ngOnInit() {
    this.loadActivityLog();
    this.computeStats();
    this.loadDepartments();
    this.loadStudents();
    this.pendingGrades();
    this.loadCourses();

    forkJoin({
      students: this.studentService.getAllStudents(),
      departments: this.studentService.getDepartments()
    }).subscribe(({ students, departments }) => {
      this.students = students || [];
      this.departments = departments || [];
      this.computeStats();
      this.loading = false;
      this.cdr.detectChanges();
    });

  }

  // ----------------- Students -----------------
  loadStudents() {
    this.studentService.getAllStudents().subscribe(data => {
      if (this.filterDept) {
        this.students = data.filter(s => s.department === this.filterDept);
      } else {
        this.students = data || [];
      }
      this.computeStats();
      this.cdr.detectChanges();
    });
  }

  // ----------------- Departments -----------------
  loadDepartments() {
    this.studentService.getDepartments().subscribe(data => {
      this.departments = data || [];
      this.computeStats();
    });
  }

  // ----------------- Add Student -----------------
  prepareAddStudent() {
    this.newStudent = { name: '', department: '', semester: '' };
    this.selectedTab = 'add';
  }

  addStudent() {
    if (!this.newStudent.name || !this.newStudent.department || !this.newStudent.semester) {
      this.showNotification("Name ,Department and semester are required", "error");
      return;
    }

    this.studentService.addStudent(this.newStudent).subscribe((res: any) => {
      this.loadStudents();
      this.computeStats();
      this.logActivity(`Added student ${this.newStudent.name} (${this.newStudent.department}) (sem-${this.newStudent.semester})`,`${localStorage.getItem('adminname')}`);
      this.showNotification("Student added successfully!", "success");

      //------------add student popup----------------
      this.addedStudent = res || this.newStudent;
      this.showStudentPopup = true;


      this.cancel();
    });
  }



  // ----------------- Edit Info -----------------
  openEditInfo(student: any) {
    this.editInfoStudent = { ...student };
    this.selectedTab = 'editInfo';
  }

  saveStudentInfo() {
    this.studentService.updateStudentByRoll(this.editInfoStudent.roll, this.editInfoStudent)
      .subscribe(() => {
        this.loadStudents();
        this.computeStats();
        this.logActivity(`Updated info for ${this.editInfoStudent.name}`,`${localStorage.getItem('adminname')}`);
        this.showNotification("Student info updated!", "success");
        this.cancel();
        this.cdr.detectChanges();
      });
  }

  // ----------------- Edit Marks -----------------
  openEditMarks(student: any) {
    this.studentService.getResultsByStudentId(student._id).subscribe(results => {
      if (results.length > 0) {
        this.editMarksStudent = student;
        this.editResult = { ...results[0] };
        this.selectedTab = 'grade';
        this.selectStudentForGrades(student);
        this.gradeSearchTerm = student.roll;
      } else {
        this.showNotification("No result found for this student", "error");
      }
      this.cdr.detectChanges();
    });
  }

  // ----------------- Delete -----------------
  deleteStudent(student: any) {
    if (confirm(`Delete ${student.name}?`)) {
      this.studentService.deleteStudentByRoll(student.roll).subscribe(() => {
        this.loadStudents();
        this.computeStats();
        this.logActivity(`Deleted student ${student.name}`,`${localStorage.getItem('adminname')}`);
        this.showNotification("Student deleted!", "success");
      });
    }
  }

  // ----------------- View Results -----------------
  openResults(student: any) {
    this.resultStudent = student;
    this.studentService.getResultsByStudentId(student._id).subscribe(results => {
      this.studentResults = results;
      this.selectedTab = 'results';
      this.cdr.detectChanges();
    });
  }
  //----------------View all results-------------------
  prepareAllResult() {
    this.selectedTab = 'AllResultTable';
  }

  // ----------------- Cancel -----------------
  cancel() {
    this.selectedTab = 'student';
    this.editInfoStudent = null;
    this.editMarksStudent = null;
    this.resultStudent = null;
    this.newStudent = { name: '', department: '', semester: '' };
  }
  cancelAll() {
    this.selectedTab = 'AllResultTable';
    this.editInfoStudent = null;
    this.editMarksStudent = null;
    this.resultStudent = null;
    this.newStudent = { name: '', department: '', semester: '' };
  }

  //---------------Clear Filter Controls------------
  clearFilter(){
    this.searchTerm = "";
    this.filterDept = "";
    this.loadStudents();
  }
  // ----------------- Search + Sort -----------------
  searchTerm: string = "";
  sortField: string = "roll";
  sortDirection: 'asc' | 'desc' = 'asc';

  get filteredStudents() {
    let data = [...this.students];

    // Search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      data = data.filter(
        s =>
          s.name.toLowerCase().includes(term) ||
          s.roll.toLowerCase().includes(term)
      );
    }

    // Sorting
    data.sort((a, b) => {
      let valA = a[this.sortField];
      let valB = b[this.sortField];

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return this.sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return this.sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }

  setSort(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
    } else {
      this.sortField = field;
      this.sortDirection = "asc";
    }
  }

  // ----------------- Export -----------------
  private saveExcel(data: any[], fileName: string) {
    if (!data || data.length === 0) {
      this.showNotification("No data to export!", "error");
      return;
    }

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");

    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
    saveAs(blob, fileName + ".xlsx");

    this.showNotification(`${fileName}.xlsx exported successfully`, "success");
  }

  exportAllStudents() {
    this.saveExcel(this.students, "all-students");
  }

  exportFilteredStudents() {
    this.saveExcel(this.filteredStudents, "filtered-students");
  }

  // ----------------- Stats -----------------
  private computeStats() {
    const list = [...this.students];
    this.stats.totalStudents = list.length;
    this.stats.totalDepartments = new Set(list.map(s => s.department)).size;
    this.pendingGrades();
  }

  // ----------------- Activity Log -----------------
    loadActivityLog() {
      this.studentService.getActivityLogs().subscribe(data => {
        this.activityLog = data || [];
      });
    }

    // Save log
    private logActivity(message: string,user : string) {
      this.studentService.addActivityLog(message,user).subscribe(() => {
        this.loadActivityLog(); // refresh UI after adding
      });
    }

  // ----------------- Notifications -----------------
  private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const note = { message, type };
    this.notifications.push(note);
    setTimeout(() => {
      this.notifications = this.notifications.filter(n => n !== note);
    }, 3500);
  }

  // ----------------- Grade Management -----------------
gradeSearchTerm: string = '';
gradeSearchDept: string = '';
gradeSearchResults: any[] = [];
selectedStudentForGrade: any = null;


// Search students by roll, name, department
get searchStudents() {
  let results = [...this.students];
  const term = this.gradeSearchTerm.trim().toLowerCase();
  const dept = this.gradeSearchDept.trim();
    // Search filter
    if (term) {
      results= results.filter(
        s =>
          s.name.toLowerCase().includes(term) ||
          s.roll.toLowerCase().includes(term)
      );
    }

    if(dept && dept !== 'All'){
      results = results.filter(s => s.department === dept);
    }

    if(this.isPendingEnabled){
      results = results.filter(s => this.isGradePending(s));
    }
    return results;

}

// Clear search fields
clearSearch() {
  this.gradeSearchTerm = "";
  this.gradeSearchDept = "";
  this.isPendingEnabled = false;
  // this.loadStudents();
}

// Select student to edit grades
selectStudentForGrades(student: any) {
  this.selectedStudentForGrade = student;
  this.studentService.getResultsByStudentId(student._id).subscribe(results => {
    if (results.length > 0) {
      this.editResult = { ...results[0] };
    } else {
      this.editResult = { subjects: [] }; // Or populate default subjects
    }
    this.cdr.detectChanges();
  });
}

// Save updated grades
saveStudentMarks() {
  if (!this.selectedStudentForGrade || !this.editResult) return;

  this.studentService.updateMarksByRoll(
    this.selectedStudentForGrade.roll,
    this.editResult.subjects
  ).subscribe(() => {
    this.loadStudents();
    this.computeStats();
    this.logActivity(`Updated grades for ${this.selectedStudentForGrade.name}`,`${localStorage.getItem('adminname')}`);
    this.showNotification("Grades updated successfully!", "success");
    this.cancelGradeUpdate();
  });
}

// Cancel grade update
cancelGradeUpdate() {
  this.selectedStudentForGrade = null;
  this.editResult = null;
}


// ----------------- All Result Management -----------------
resultSearchTerm: string = '';
resultSearchDept: string = '';
selectedResultStudent: any = null;
selectedResultData: any = null;

get filteredResults() {
  let data = [...this.students];
  const term = this.resultSearchTerm.trim().toLowerCase();
  const dept = this.resultSearchDept.trim();

  if (term) {
    data = data.filter(
      s =>
        s.name.toLowerCase().includes(term) ||
        s.roll.toLowerCase().includes(term)
    );
  }

  if (dept && dept !== '') {
    data = data.filter(s => s.department === dept);
  }

  if(this.isAllPendingEnabled){
    data = data.filter(s => this.isGradePending(s));
  }
  return data;
}

clearResultFilters() {
  this.resultSearchTerm = '';
  this.resultSearchDept = '';
  this.isAllPendingEnabled = false;
}

viewResult(student: any) {
  this.selectedResultStudent = student;
  this.studentService.getResultsByStudentId(student._id).subscribe(results => {
    if (results.length > 0) {
      this.selectedResultData = results[0];
      this.selectedTab = 'selectedResultStudent';
    } else {
      this.selectedResultData = { subjects: [] };
      this.showNotification("No result found for this student", "info");
    }
    this.cdr.detectChanges();
  });
}

closeResultView() {
  this.selectedResultStudent = null;
  this.selectedResultData = null;
  this.selectedTab = 'AllResultTable';
}
closeSingleResultView() {
  this.selectedResultStudent = null;
  this.selectedResultData = null;
  this.selectedTab = 'student';
}

// Calculate total marks
totalMarks(subjects: any[]) {
  return subjects?.reduce((sum, s) => sum + (s.marks || 0), 0);
}

// Calculate percentage
percentage(subjects: any[]) {
  if (!subjects || subjects.length === 0) return 0;
  const total = this.totalMarks(subjects);
  return ((total / (subjects.length * 100)) * 100).toFixed(2);
}

// Get grade for subject
getGrade(marks: number) {
  if (marks >= 90) return 'A+';
  if (marks >= 80) return 'A';
  if (marks >= 70) return 'B';
  if (marks >= 60) return 'C';
  if (marks >= 50) return 'D';
  return 'F';
}

// status pass/fail
getStatus(subjects: any[]) {
  if(!subjects || subjects.length === 0) return 'No Data';
  const failed = subjects.some(sub => sub.marks < 35);
  return failed ? 'Fail' : 'Pass';
}

statusClass(subjects: any[]){
  return this.getStatus(subjects) === 'Pass' ? 'status-pass' : 'status-fail';
}

viewSingleResult(student: any) {
  this.selectedResultStudent = student;
  this.studentService.getResultsByStudentId(student._id).subscribe(results => {
    if (results.length > 0) {
      this.selectedResultData = results[0];
      this.selectedTab = 'selectedSingleResultStudent';
    } else {
      this.selectedResultData = { subjects: [] };
      this.showNotification("No result found for this student", "info");
    }
    this.cdr.detectChanges();
  });
}


//logout button
logout(){
  localStorage.removeItem('token');

  this.showNotification("Logged out successfully!","info");

  setTimeout(()=>{
        this.router.navigate(['/login']);
  },1000);
}

//pending-grades
pendingGrades(){
  this.studentService.getTotalPendingGrades().subscribe(data => {
    this.stats.pendingGrades = data.totalPending;
    this.pendingStudents = data.students;
  })
}

isGradePending(student: any): boolean {
  return this.pendingStudents.some(s => s.studentId === student._id);
}
//pending toggle button
toggleStatus() {
  this.cdr.detectChanges();
}
toggleAllStatus(){
  this.cdr.detectChanges();
}

// department-courses
loadCourses(){
  this.studentService.getAllCourses().subscribe(data => {
    this.courses = data || [];
    // console.log(this.courses);
  });
}

getCoursesByDeptAndSem(dept: string, sem: number){
  return this.courses.filter(
    c => c.department === dept && c.semester === sem);
}
}


