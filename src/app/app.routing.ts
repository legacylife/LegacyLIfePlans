import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './shared/components/layouts/admin-layout/admin-layout.component';
import { AdvisorLayoutComponent } from './shared/components/layouts/advisor-layout/advisor-layout.component';
import { AuthLayoutComponent } from './shared/components/layouts/auth-layout/auth-layout.component';
import { CustomerLayoutComponent } from './shared/components/layouts/customer-layout/customer-layout.component';
import { LandingLayoutComponent } from './shared/components/layouts/landing-layout/landing-layout.component';
import { AdvisorLandingLayoutComponent } from './shared/components/layouts/advisor-landing-layout/advisor-landing-layout.component';
import { AuthGuard } from './shared/services/auth/auth.guard';

export const rootRouterConfig: Routes = [
  {
    path: '',
    component: LandingLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: './views/landing/landing.module#LandingModule',
        data: { title: 'Landing'}
      }
    ]
  }, {
    path: '',
    component: AdvisorLandingLayoutComponent,
    children: [
      {
        path: 'pre-advisor',
        loadChildren: './views/advisor-landing/advisor-landing.module#AdvisorLandingModule',
        data: { title: 'Advisor Pre-login Landing'}
      }
    ]
  },
   {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'auth',
        loadChildren: './views/auth/auth.module#AuthModule',
        data: { title: 'Authentication'}
      }
    ]
  }, {
    path: 'customer',
    component: CustomerLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: './views/customer/customer.module#CustomerModule',
        data: { title: 'Customer'}
      }
    ]
  }, {
    path: '',
    component: AdvisorLayoutComponent,
    children: [
      {
        path: 'advisor',
        loadChildren: './views/advisor/advisor.module#AdvisorModule',
        data: { title: 'Customer'}
      }
    ]
  }, {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'admin/signin',
        loadChildren: './views/admin/auth.module#AuthModule',
        data: { title: 'Others', breadcrumb: 'OTHERS'}
      }
    ]
  },{
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'admin',
        loadChildren: './views/admin/admin.module#AdminModule',
        data: { title: 'Others', breadcrumb: 'OTHERS'}
      }
    ]
  }, {
    path: '**',
    redirectTo: 'auth/404'
  }
];