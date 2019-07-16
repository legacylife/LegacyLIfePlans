import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './shared/components/layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './shared/components/layouts/auth-layout/auth-layout.component';
import { AdvisorLandingLayoutComponent } from './shared/components/layouts/advisor-landing-layout/advisor-landing-layout.component';
//import { CustomerLayoutComponent } from './shared/components/layouts/customer-layout/customer-layout.component';
import { LandingLayoutComponent } from './shared/components/layouts/landing-layout/landing-layout.component';

import { AuthGuard } from './shared/services/auth/auth.guard';
console.log('App---routing');
export const rootRouterConfig: Routes = [
  /*{
    path: '',
    pathMatch: 'full', 
    component: AdvisorLandingLayoutComponent,
    loadChildren: './views/advisor-landing/advisor-landing.module#AdvisorLandingModule',
    data: { title: 'LLP'}
  },*/
  {
    path: '',
    component: LandingLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: './views/landing/landing.module#LandingModule',
        data: { title: 'LLP'}
      }
    ]
  },
  {
    path: '',
    pathMatch: 'prefix' ,
    component: AuthLayoutComponent,
    loadChildren: './views/auth/auth.module#AuthModule',
    data: { title: 'Signin'}
  },
 {
    path: 'customer',
    pathMatch: 'prefix' ,
    children: [{
      path: '',
      loadChildren: './views/customer/customer.module#CustomerModule',
      //data: { title: 'Customer Signup' }
    },
  ]
  }, 
  {
    path: 'advisor',
    pathMatch: 'prefix' ,
    children: [{
      path: '',
      loadChildren: './views/advisor/advisor.module#AdvisorModule',
      data: { title: 'Advisor Signup' }
    },
  ]
  },{
    path: 'llp-admin',
    pathMatch: 'prefix' ,
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: './views/admin/auth.module#AuthModule',
      }
    ]
  },{
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: './views/admin/admin.module#AdminModule',
        data: { title: 'Dashboard'}
      }
    ]
  },{
    path: '**',
    redirectTo: 'auth/404'
  }
];