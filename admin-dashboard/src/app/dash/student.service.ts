import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private baseUrl = environment.apiUrl;

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
  deleteDepartment(deptCode: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/departments/${deptCode}`);
  }


  //get courses by department and semester
  getCoursesByDeptAndSem(dept: string, semester: number): Observable<any[]>{
    return this.http.get<any[]>(`${this.baseUrl}/courses?department=${dept}&semester=${semester}`);
  }

  getAllCourses(): Observable<any[]>{
    return this.http.get<any[]>(`${this.baseUrl}/courses/all`);
  }

  addDepartment(data: any): Observable<any>{
    return this.http.post(`${this.baseUrl}/departments`, data);
  }

  addCourse(data: any): Observable<any>{
    return this.http.post(`${this.baseUrl}/courses`, data);
  }

  updateCourse(id: string, course: any) {
    return this.http.put(`${this.baseUrl}/courses/${id}`, course);
  }

  deleteCourse(id: string) {
    return this.http.delete(`${this.baseUrl}/courses/${id}`);
  }

  getCoursesByDepartment(deptCode: string): Observable<any[]>{
    return this.http.get<any[]>(`${this.baseUrl}/courses/department/${deptCode}`);
  }
  //----------activity log---------------------------
  getActivityLogs(): Observable<any[]>{
    return this.http.get<any[]>(`${this.baseUrl}/activity-log`);
  }

  addActivityLog(message: string){
    return this.http.post(`${this.baseUrl}/activity-log`, {
      user: localStorage.getItem('adminname'),
      message: message
    });
  }

  //-----------pending Grades
  getTotalPendingGrades(){
    return this.http.get<{totalPending: number, students: any[]}>(`${this.baseUrl}/pendingGrades`);
  }



}
