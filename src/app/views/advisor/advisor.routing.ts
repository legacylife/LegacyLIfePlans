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
import { UserAuthGuard } from '../../shared/services/auth/userauth.guard';
import { UserPreAuthGuard } from '../../shared/services/auth/userpreauth.guard';
import { AuthLayoutComponent } from '../../shared/components/layouts/auth-layout/auth-layout.component';

console.log('advisor---routing');
export const AdvisorRoutes: Routes = [
  {
    //path: 'signin',
    //component: AdvisorSignupComponent,

    path: 'signin',
    component: AuthLayoutComponent,
    children : [
      { 
        path: '',
        component: AdvisorSignupComponent, 
        canActivate: [ UserPreAuthGuard ]
      }
    ],

  },{
    //path: 'signup',
    //component: AdvisorSignupComponent,

    path: 'signup',
    component: AuthLayoutComponent,
    children : [
      { 
        path: '',
        component: AdvisorSignupComponent, 
        canActivate: [ UserPreAuthGuard ]
      }
    ],

  },{
    //path: 'business-info',
    //component: BusinessInfoComponent,

    path: 'business-info',
    component: AdvisorDashboardComponent,
    children : [
      { 
        path: '',
        component: BusinessInfoComponent,
        canActivate: [ UserAuthGuard ] 
      }
    ]


  },{
    //path: 'thank-you',
    //component: ThankYouComponent,

    path: 'thank-you',
    component: AuthLayoutComponent,
    children : [
      { 
        path: '',
        component: ThankYouComponent,
        canActivate: [ UserAuthGuard ] 
      }
    ]


  },{
    //path: '',
    //component: AdvisorDashboardComponent

    path: 'dashboard',
    component: AuthLayoutComponent,
    children : [
      { 
        path: '',
        component: AdvisorDashboardComponent,
        canActivate: [ UserAuthGuard ] 
      }
    ]


  },{
    //path: 'dashboard-updates',
    //component: AdvisorDashboardUpdateComponent

    path: 'dashboard-updates',
    component: AdvisorLayoutComponent,
    children : [
      { 
        path: '',
        component: AdvisorDashboardUpdateComponent,
        canActivate: [ UserAuthGuard ] 
      }
    ]

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