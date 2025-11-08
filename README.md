# 📊 Student Result Dashboard  
A full-stack dashboard system built using **Angular** and **Node.js** for managing and viewing student academic results.  
It includes two separate interfaces:  
- **Admin Dashboard** – Upload, manage, and update student results  
- **Student Dashboard** – Students can securely view their own results  

---

## 🚀 Features

### ✅ Admin Dashboard
- Login authentication for admin  
- Add / update / delete student result records  
- Manage student details  
- Dashboard overview for results  
- Search & filter results by class/semester  

### ✅ Student Dashboard
- Secure student login  
- View personal details & academic results  
- Printable result view  
- Mobile-responsive UI  

### ✅ Backend / Server
- REST API built using Node.js & Express  
- CRUD operations for results & student data  
- Database-ready structure (MongoDB)  
- Input validation & error handling  
- Generated Duplicate Records using seed.js

---

## 🛠️ Tech Stack

### **Frontend**
- Angular  
- TypeScript  
- HTML / CSS  
- Bootstrap

### **Backend**
- Node.js  
- Express.js  
- Database: MongoDB 

---

## 📁 Project Structure
root/
│
├── admin-dashboard/ # Angular Admin UI
├── student-dashboard/ # Angular Student UI
└── server/ # Backend API (Node.js + Express)


---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/charlie3033/new-std-result-dashboard.git
cd new-std-result-dashboard

cd admin-dashboard
npm install

cd ../student-dashboard
npm install

ng serve --open

cd server
npm install
npm start

Create a .env file inside server/:
PORT=3000
DB_URL=your-mongodb-or-mysql-url
JWT_SECRET=your-secret-key

▶️ Usage Flow
Admin
  - Login
  - Manage student records
  - Add/update marks
  - View uploaded results
Student
  - Login using Roll No / credentials
  - View results in dashboard
  - Download/print report

## 🎥 UI Screenshots

### 🧑‍💼 Admin Dashboard  
```
<!-- Admin dashboard screenshots -->
<p align="center">
  <img src="./screenshots/admin/1.login.png" width="45%" alt="Admin Dashboard 1" />
  <img src="./screenshots/admin/2.dash.png" width="45%" alt="Admin Dashboard 2" />
</p>
<p align="center">
  <img src="./screenshots/admin/3.studMgmt.png" width="45%" alt="Admin Dashboard 3" />
  <img src="./screenshots/admin/4.studAdd.png" width="45%" alt="Admin Dashboard 4" />
</p>
<p align="center">
  <img src="./screenshots/admin/5.studEdit.png" width="45%" alt="Admin Dashboard 5" />
  <img src="./screenshots/admin/6.gradeMgmt.png" width="45%" alt="Admin Dashboard 6" />
</p>
<p align="center">
  <img src="./screenshots/admin/7.pendingGrade.png" width="45%" alt="Admin Dashboard 7" />
  <img src="./screenshots/admin/8.activityLog.png" width="45%" alt="Admin Dashboard 8" />
</p>
<p align="center">
  <img src="./screenshots/admin/9.checkResult.png" width="45%" alt="Admin Dashboard 9" />
  <img src="./screenshots/admin/10.result.png" width="45%" alt="Admin Dashboard 10" />
</p>
<p align="center">
  <img src="./screenshots/admin/11.deptCourse.png" width="45%" alt="Admin Dashboard 11" />
</p>

### 👨‍🎓 Student Dashboard  
<!-- Student dashboard screenshots -->
<p align="center">
  <img src="./screenshots/student/1.studLogin.png" width="45%" alt="Student Dashboard 1" />
  <img src="./screenshots/student/2.profile.png" width="45%" alt="Student Dashboard 2" />
</p>
<p align="center">
  <img src="./screenshots/student/3.pass.png" width="45%" alt="Student Dashboard 3" />
  <img src="./screenshots/student/4.pdf.png" width="45%" alt="Student Dashboard 4" />
</p>
<p align="center">
  <img src="./screenshots/student/5.print.png" width="45%" alt="Student Dashboard 5" />
  <img src="./screenshots/student/6.fail.png" width="45%" alt="Student Dashboard 6" />
</p>
<p align="center">
  <img src="./screenshots/student/7.pending.png" width="45%" alt="Student Dashboard 7" />
</p>


### Future Improvements
  - Role-based authentication guards
  - Export results as PDF
  - Bulk result upload via Excel
  - Dark mode UI
  - Deploy frontend + backend on cloud

### Author
Mohit Jariwala
Full-Stack (MEAN) Developer