import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Dash } from './dash/dash';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {path:'',redirectTo:'login', pathMatch:'full'},
  {path:'login', component:Login},
  {path:'admin',component:Dash,
    children:[
      {path:'dashboard',component:Dash,data:{tab:'dashboard'}, canActivate:[authGuard]},
      {path:'',redirectTo:'dashboard',pathMatch:'full'}
    ]
  }
];
