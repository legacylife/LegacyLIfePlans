import { Routes } from '@angular/router';

import { AppGalleryComponent } from './app-gallery/app-gallery.component';
import { AppPricingComponent } from './app-pricing/app-pricing.component';
import { AppUsersComponent } from './app-users/app-users.component';
import { AppBlankComponent } from './app-blank/app-blank.component';
import { Nested1Component } from './nested1/nested1.component';
import { Nested2Component } from './nested2/nested2.component';
import { Nested3Component } from './nested3/nested3.component';

export const CustomerRoutes: Routes = [
  {
    path: '',
    component: AppBlankComponent,
    data: { title: 'Blank', breadcrumb: 'BLANK' }
  }, {
    path: 'gallery',
    component: AppGalleryComponent,
    data: { title: 'gallery', breadcrumb: 'gallery' }
  }, {
    path: 'nested1',
    component: Nested1Component,
    data: { title: 'Nested1', breadcrumb: 'NESTED1' }
  }, {
    path: 'pricing',
    component: AppPricingComponent,
    data: { title: 'Nested1', breadcrumb: 'NESTED1' }
  }, {
    path: 'users',
    component: AppUsersComponent,
    data: { title: 'Nested1', breadcrumb: 'NESTED1' }
  }
];