import { Routes } from '@angular/router';

import { CustomerSignupComponent } from './signup/signup.component';
import { UpdateProfileComponent } from './update-profile/update-profile.component';
import { CustomerHomeComponent } from './customer-home/customer-home.component';
import { CustomerAccountSettingComponent } from './customer-account-setting/customer-account-setting.component';

export const CustomerRoutes: Routes = [
  {
    path: 'dashboard',
    component: CustomerHomeComponent,
    data: { title: 'Blank', breadcrumb: 'BLANK' }
  },{
    path: 'signup',
    component: CustomerSignupComponent,
    data: { title: 'Blank', breadcrumb: 'BLANK' }
  },{
    path: 'update-profile',
    component: UpdateProfileComponent,
    data: { title: 'Blank', breadcrumb: 'BLANK' }
  },{
    path: 'account-setting',
    component: CustomerAccountSettingComponent,
    data: { title: 'Account Setting', breadcrumb: 'Customer' }
  }
];