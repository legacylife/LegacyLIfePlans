import { Routes } from '@angular/router';

import { CustomerTrusteesComponent } from './customer-trustees/customer-trustees.component';
import { CustomerHomeComponent } from './customer-home/customer-home.component';
import { CustomerProfessionalComponent } from './customer-professionals/customer-professionals.component';


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
  }
];