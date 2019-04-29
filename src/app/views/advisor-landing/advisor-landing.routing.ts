import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AdvAboutUsComponent } from './adv-about-us/adv-about-us.component';

export const AdvisorLandingRoutes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: { title: 'Home' }
  },{
    path: 'aboutus',
    component: AdvAboutUsComponent,
    data: { title: 'Home' }
  },
];
