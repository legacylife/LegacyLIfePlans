import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';

export const AdvisorLandingRoutes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: { title: 'Home' }
  },
];
