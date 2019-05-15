import { Routes } from '@angular/router';

import { CustomerSignupComponent } from './signup/signup.component';
import { UpdateProfileComponent } from './update-profile/update-profile.component';
import { CustomerHomeComponent } from './customer-home/customer-home.component';
import { CustomerAccountSettingComponent } from './customer-account-setting/customer-account-setting.component';
import { CustomerLayoutComponent } from '../../shared/components/layouts/customer-layout/customer-layout.component';
import { AuthLayoutComponent } from '../../shared/components/layouts/auth-layout/auth-layout.component';
console.log('customer---routing');
export const CustomerRoutes: Routes = [
  {
    path: 'signup',
    component: AuthLayoutComponent,
    data: { title: 'Blank', breadcrumb: 'BLANK' },
    children : [
      { 
        path: '',
        component: CustomerSignupComponent, 
      }
    ],
  },{
    path: '',
    component: AuthLayoutComponent,
    loadChildren: './auth/auth.module#AuthModule',
    data: { title: 'Blank', breadcrumb: 'BLANK' },    
  },{
    path: 'dashboard',
    component: CustomerLayoutComponent,
    data: { title: 'Customer Dashboard', breadcrumb: 'DASHBOARD' },
    children : [
      { 
        path: '',
        component: CustomerHomeComponent,
      }
    ],    
  },{
    path: 'update-profile',
    component: AuthLayoutComponent,
    data: { title: 'Blank', breadcrumb: 'BLANK' },
    children : [
      { 
        path: '',
        component: UpdateProfileComponent, 
      }
    ],
  },{
    path: 'account-setting',
    component: CustomerLayoutComponent,
    data: { title: 'Account Setting', breadcrumb: 'Customer' },
    children : [
      { 
        path: '',
        component: CustomerAccountSettingComponent, 
      }
    ],
  }
];