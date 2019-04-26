import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AdvisorHomeComponent } from './advisor-home/advisor-home.component';

export const LandingRoutes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: { title: 'Home' }
  },
  {
    path: 'advisor-home',
    component: AdvisorHomeComponent,
    data: { title: 'AdvisorHome' }
  }
];
