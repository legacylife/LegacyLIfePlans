import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './shared/components/layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './shared/components/layouts/auth-layout/auth-layout.component';
import { AdvisorLandingLayoutComponent } from './shared/components/layouts/advisor-landing-layout/advisor-landing-layout.component';
//import { CustomerLayoutComponent } from './shared/components/layouts/customer-layout/customer-layout.component';
import { LandingLayoutComponent } from './shared/components/layouts/landing-layout/landing-layout.component';
import { ErrorComponent } from 'app/views/error/error.component';
import { AuthGuard } from './shared/services/auth/auth.guard';
import { CcDetailedViewComponent } from './shared/components/cc-detailed-view/cc-detailed-view.component';
console.log('App---routing');
export const rootRouterConfig: Routes = [
  {
    path: '',
    component: LandingLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full', //Newly added
        loadChildren: './views/landing/landing.module#LandingModule',
        data: { title: 'LLP Customer'}
      },
      {
        path: 'customer',
        pathMatch: 'full', //Newly added
        loadChildren: './views/landing/landing.module#LandingModule',
        data: { title: 'LLP Customer'}
      },   
    ],
  },
  {
    path: '',         
    component: AdvisorLandingLayoutComponent,
    children: [{
        path: 'advisor',   
        pathMatch: 'full',     
        loadChildren: './views/advisor/advisor.module#AdvisorModule',
        data: { title: 'Advisor Dashboard'}
      },        
    ],
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
      data: { title: 'Advisor Dashboard' }
      },
    ]
  }, 
  {
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
  },
  {
    path: 'coach-corner-details/:aliasName',
    component: AdvisorLandingLayoutComponent,
    data: { title: 'Coachs Corner' },
    children: [
      {
        path: '',
        component: CcDetailedViewComponent,
      }
    ]
  },
  {
    path: 'error',
    component: ErrorComponent,
    loadChildren: './views/auth/auth.module#AuthModule',
    data: { title: 'Error Page'}
  },{
    path: '**',
    redirectTo: 'error'//error
  }
];