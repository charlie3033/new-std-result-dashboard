import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private baseUrl = ' https://result-server-po2j.onrender.com/api';

  constructor(private http: HttpClient){}

  //---------------students--------------
  getAllStudents():Observable<any[]>{
    return this.http.get<any[]>(`${this.baseUrl}/students`);
  }

  getStudentByRoll(roll: string): Observable<any>{
    return this.http.get<any>(`${this.baseUrl}/students/roll/${roll}`);
  }

  //add student with auto roll/email/password/result
  addStudent(data: any): Observable<any>{
    return this.http.post(`${this.baseUrl}/students/auto`, data);
  }

  updateStudentByRoll(roll: string, data: any): Observable<any>{
    return this.http.put(`${this.baseUrl}/students/roll/${roll}`,data);
  }

  deleteStudentByRoll(roll: string): Observable<any>{
    return this.http.delete(`${this.baseUrl}/students/roll/${roll}`);
  }

  //---------------results----------------
  getResultsByStudentId(studentId: string): Observable<any[]>{
    return this.http.get<any[]>(`${this.baseUrl}/results/${studentId}`);
  }

  addResult(data: any): Observable<any>{
    return this.http.post(`${this.baseUrl}/results` , data);
  }

  updateResult(resultId: string, data: any): Observable<any>{
    return this.http.put(`${this.baseUrl}/results/${resultId}`, data);
  }

  //update marks by roll (reCalculate automatically in backend)
  updateMarksByRoll(roll: string, subjects: any[]): Observable<any>{
    return this.http.put(`${this.baseUrl}/students/roll/${roll}/marks`, { subjects });
  }

  //----------------departments--------------
  getDepartments(): Observable<any[]>{
    return this.http.get<any[]>(`${this.baseUrl}/departments`);
  }

  //get courses by department and semester
  getCoursesByDeptAndSem(dept: string, semester: number): Observable<any[]>{
    return this.http.get<any[]>(`${this.baseUrl}/courses?department=${dept}$semester=${semester}`);
  }

  getAllCourses(): Observable<any[]>{
    return this.http.get<any[]>(`${this.baseUrl}/courses/all`);
  }

  //activity log
  getActivityLogs(): Observable<any[]>{
    return this.http.get<any[]>(`${this.baseUrl}/activity-log`);
  }

  addActivityLog(message: string,user: string){
    return this.http.post(`${this.baseUrl}/activity-log`, {message,user});
  }

  //pending Grades
  getTotalPendingGrades(){
    return this.http.get<{totalPending: number, students: any[]}>(`${this.baseUrl}/pendingGrades`);
  }
}
