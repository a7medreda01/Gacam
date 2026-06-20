import { Routes } from '@angular/router';
import { OrderDetailComponent } from './features/orders/order-details';
import { CoursesComponent } from './features/courses/courses';
import { noAuthGuard } from './core/guards/noAuthGuard';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home').then(m => m.HomeComponent)
      },
      {
        path: 'about',
        loadComponent: () => import('./features/about/about').then(m => m.AboutComponent)
      },
      {
        path: 'services',
        loadComponent: () => import('./features/services/services').then(m => m.ServicesComponent)
      },
      {
        path: 'volunteer',
        loadComponent: () => import('./features/volunteer/volunteer').then(m => m.VolunteerComponent)
      },
      {
        path: 'news',
        loadComponent: () => import('./features/news/news').then(m => m.NewsComponent)
      },
      { path: 'courses', component: CoursesComponent },
      {
        path: 'verify-certificate',
        loadComponent: () =>
          import('./features/verify-certificate/verify-certificate')
            .then(m => m.VerifyCertificateComponent)
      },
      {
        path: 'verify-certificate/:number',
        loadComponent: () => import('./features/verify-certificate/verify-certificate').then(m => m.VerifyCertificateComponent)
      },
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login').then(m => m.LoginComponent),
        canActivate: [noAuthGuard]
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password').then(m => m.ForgotPasswordComponent)
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./features/auth/reset-password').then(m => m.ResetPasswordComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register').then(m => m.RegisterComponent),
        canActivate: [noAuthGuard]
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile').then(m => m.ProfileComponent)
      },
      {
        path: 'orders/:id',
        component: OrderDetailComponent 
      },
      {
        path: 'page/:slug',
        loadComponent: () => import('./features/page/page').then(m => m.PageComponent)
      }
    ]
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin').then(m => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        loadComponent: () => import('./admin/components/overview').then(m => m.AdminOverviewComponent)
      },
      {
        path: 'accreditations',
        loadComponent: () => import('./admin/components/accreditations').then(m => m.AdminAccreditationsComponent)
      },
      {
        path: 'accreditation-categories',
        loadComponent: () => import('./admin/components/accreditation-categories').then(m => m.AdminAccreditationCategoriesComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./admin/components/orders').then(m => m.AdminOrdersComponent)
      },
      {
        path: 'volunteers',
        loadComponent: () => import('./admin/components/volunteers').then(m => m.AdminVolunteersComponent)
      },
      {
        path: 'academy',
        loadComponent: () => import('./admin/components/academy').then(m => m.AdminAcademyComponent)
      },
      {
        path: 'payments',
        loadComponent: () => import('./admin/components/payments').then(m => m.AdminPaymentsComponent)
      },
      {
        path: 'cms',
        loadComponent: () => import('./admin/components/cms').then(m => m.AdminCmsComponent)
      },
      {
        path: 'audit',
        loadComponent: () => import('./admin/components/audit').then(m => m.AdminAuditComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./admin/components/settings').then(m => m.AdminSettingsComponent)
      },
      {
        path: 'fees',
        loadComponent: () => import('./admin/components/fees').then(m => m.AdminFeesComponent)
      },
      {
        path: 'news',
        loadComponent: () => import('./admin/components/news/news').then(m => m.AdminNewsComponent)
      },
            {
        path: 'users',
        loadComponent: () => import('./admin/components/userManagementComponent/user-management.component').then(m => m.UserManagementComponent)
      },
      {
        path: 'academy-enrollments',
        loadComponent: () => import('./admin/components/AcademyEnrollments/academy-enrollments').then(m => m.AdminAcademyEnrollmentsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
