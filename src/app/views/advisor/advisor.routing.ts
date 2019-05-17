import { Routes } from '@angular/router';
import { AdvisorSignupComponent } from './signup/signup.component';
import { BusinessInfoComponent } from './business-info/business-info.component';
import { SetPasswordComponent } from './set-password/set-password.component';
import { AdvisorSigninComponent } from './signin/signin.component';
import { ThankYouComponent } from './thank-you/thank-you.component';
import { AdvisorDashboardComponent } from './advisor-dashboard/advisor-dashboard.component';
import { LegaciesComponent } from './legacies/legacies.component';
import { AdvisorDashboardUpdateComponent } from './advisor-dashboard-update/advisor-dashboard-update.component';
import { AdvisorAccountSettingComponent } from './advisor-account-setting/advisor-account-setting.component';
import { AdvisorSubscriptionComponent } from './advisor-subscription/advisor-subscription.component';
import { AdvisorLayoutComponent } from './../../shared/components/layouts/advisor-layout/advisor-layout.component';

console.log('advisor---routing');
export const AdvisorRoutes: Routes = [
  {
    path: 'signin',
    component: AdvisorSignupComponent,
  },{
    path: 'signup',
    component: AdvisorSignupComponent,
  }
  ,{
    path: 'business-info',
    component: BusinessInfoComponent,
  },{
    path: 'thank-you',
    component: ThankYouComponent,
  },{
    path: '',
    component: AdvisorDashboardComponent
  },{
    path: 'dashboard-updates',
    component: AdvisorDashboardUpdateComponent
  },{
    path: 'account-setting',
    component: AdvisorLayoutComponent,
    children : [
      { 
        path: '',
        component: AdvisorAccountSettingComponent,
      }
    ],    
  },{
    path: 'legacies',
    component: LegaciesComponent
  },{
    path: 'subscription',
    component: AdvisorSubscriptionComponent
  }
];