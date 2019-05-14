import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { CustAboutUsComponent } from './about-us/about-us.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TearnsOfUseComponent } from './tearns-of-use/tearns-of-use.component';

export const LandingRoutes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: { title: 'Home' }
  },
  {
    path: 'aboutus',
    component: CustAboutUsComponent,
    data: { title: 'AdvisorHome' }
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent,
    data: { title: 'PrivacyPolicy' }
  },
  {
    path: 'tearns-of-use',
    component: TearnsOfUseComponent,
    data: { title: 'Tearns Of Use' }
  }
];
