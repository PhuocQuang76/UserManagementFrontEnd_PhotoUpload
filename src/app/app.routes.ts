import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

// Import components
import { LoginComponent } from './components/user.login';
import { RegisterComponent } from './components/user.register';
import { UserListComponent } from './components/user-list.component';
import { UserDetailComponent } from './components/user-detail.component';
import { UnauthorizedComponent } from './components/user.unauthorized';

export const routes: Routes = [
  // =====================
  // PUBLIC ROUTES (No authentication required)
  // =====================
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent
  },

  // =====================
  // PROTECTED ROUTES (Authentication required)
  // =====================
  {
    path: '',
    component: UserListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'users',
    component: UserListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'user/:id',
    component: UserDetailComponent,
    canActivate: [AuthGuard]
  },

  // =====================
  // ADMIN ONLY ROUTES (Example)
  // =====================
  // {
  //   path: 'admin',
  //   component: AdminDashboardComponent,
  //   canActivate: [AuthGuard],
  //   data: { roles: ['ADMIN'] }
  // },

  // =====================
  // WILDCARD - Redirect unknown routes to home
  // =====================
  {
    path: '**',
    redirectTo: ''
  }
];