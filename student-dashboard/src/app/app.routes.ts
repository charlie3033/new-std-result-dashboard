import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Dash } from './dash/dash';
import { authGuard } from './guard/auth-guard';
import { Result } from './result/result';
import { Profile } from './profile/profile';

export const routes: Routes = [
  { path:'',redirectTo:'login',pathMatch:'full'},
  {path:'login',component:Login},
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'result', component: Result, canActivate: [authGuard] },
];
