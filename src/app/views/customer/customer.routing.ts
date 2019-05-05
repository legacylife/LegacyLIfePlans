import { Routes } from '@angular/router';

import { CustomerTrusteesComponent } from './customer-trustees/customer-trustees.component';
import { CustomerHomeComponent } from './customer-home/customer-home.component';
import { CustomerProfessionalComponent } from './customer-professionals/customer-professionals.component';
import { CustomerAccountSettingComponent } from './customer-account-setting/customer-account-setting.component';

export const CustomerRoutes: Routes = [
  {
    path: '',
    component: CustomerHomeComponent,
    data: { title: 'Home',  breadcrumb: 'Customer' }
  }, {
    path: 'trustees',
    component: CustomerTrusteesComponent,
    data: { title: 'trustees', breadcrumb: 'Customer' }
  }, {
    path: 'professionals',
    component: CustomerProfessionalComponent,
    data: { title: 'Professionals', breadcrumb: 'Customer' }
  }, {
    path: 'account-setting',
    component: CustomerAccountSettingComponent,
    data: { title: 'Account Setting', breadcrumb: 'Customer' }
  }
];