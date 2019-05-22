import { Routes } from '@angular/router';
console.log('Landing Routing..')
import { HomeComponent } from './home/home.component';
import { CustAboutUsComponent } from './about-us/about-us.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsOfUseComponent } from './terms-of-use/terms-of-use.component';
import { LandingLayoutComponent } from './../../shared/components/layouts/landing-layout/landing-layout.component';

export const LandingRoutes: Routes = [
 /* {
    path: '',
    component: LandingLayoutComponent,
    children : [
      { 
        path: '',
        component: PrivacyPolicyComponent,
      }
    ]        
  },*/
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent,
    data: { title: 'PrivacyPolicy' }
  },
  {
    path: 'terms-of-use',
    component: TermsOfUseComponent,
    data: { title: 'Tearns Of Use' }
  },{
    path: 'aboutus',
    component: CustAboutUsComponent,
    data: { title: 'AdvisorHome' }
  }
  /*{
    path: '',
    component: HomeComponent,
    data: { title: 'Home' }
  },
  */
];
