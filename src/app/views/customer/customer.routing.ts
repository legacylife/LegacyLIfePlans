import { Routes } from '@angular/router';

import { CustomerSignupComponent } from './signup/signup.component';
import { UpdateProfileComponent } from './update-profile/update-profile.component';
export const CustomerRoutes: Routes = [
  {
    path: 'signup',
    component: CustomerSignupComponent,
    data: { title: 'Blank', breadcrumb: 'BLANK' }
  },{
    path: 'update-profile',
    component: UpdateProfileComponent,
    data: { title: 'Blank', breadcrumb: 'BLANK' }
  }
];