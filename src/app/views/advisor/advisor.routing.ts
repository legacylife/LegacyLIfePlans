import { Routes } from '@angular/router';
import { AdvisorSignupComponent } from './signup/signup.component';
import { BusinessInfoComponent } from './business-info/business-info.component';
import { SetPasswordComponent } from './set-password/set-password.component';
import { AdvisorSigninComponent } from './signin/signin.component';
import { ThankYouComponent } from './thank-you/thank-you.component';

export const AdvisorRoutes: Routes = [
  {
    path: 'signin',
    component: AdvisorSignupComponent,
    data: { title: 'Blank', breadcrumb: 'BLANK' }
  },{
    path: 'signup',
    component: AdvisorSignupComponent,
    data: { title: 'Blank', breadcrumb: 'BLANK' }
  }
  ,{
    path: 'business-info',
    component: BusinessInfoComponent,
    data: { title: 'Blank', breadcrumb: 'BLANK' }
  }
];