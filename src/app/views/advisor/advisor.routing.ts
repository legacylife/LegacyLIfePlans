import { Routes } from '@angular/router';
import { AdvisorSignupComponent } from './signup/signup.component';
import { BusinessInfoComponent } from './business-info/business-info.component';
import { SetPasswordComponent } from './set-password/set-password.component';
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
import { AdvisorLandingLayoutComponent } from '../../shared/components/layouts/advisor-landing-layout/advisor-landing-layout.component';
import { HomeComponent } from './advisor-landing/home/home.component';
console.log('advisor---routing');
export const AdvisorRoutes: Routes = [
  /*{
    path: '',
    pathMatch: 'prefix', 
    component: AdvisorLandingLayoutComponent,
    loadChildren: './views/advisor/advisor-landing/advisor-landing.module#AdvisorLandingModule',
    data: { title: 'LLP'}
  },
  {
    path: '',
    //pathMatch: 'prefix' ,
    children: [{
      path: '',
      loadChildren: './views/advisor/advisor-landing/advisor-landing.module#AdvisorLandingModule',
      data: { title: 'Advisor Signup' }
    },
  ]
  },*/
  {
    path: '',
    component: AdvisorLandingLayoutComponent,
    children : [
      { 
        path: '',
        component: HomeComponent
      }
    ],
  },
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
    path: 'set-password/:id',
    component: AuthLayoutComponent,
    children : [
      { 
        path: '',
        component: SetPasswordComponent, 
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
    component: AuthLayoutComponent,
    children : [
      { 
        path: '',
        component: BusinessInfoComponent,
        canActivate: [ UserPreAuthGuard ] 
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
        canActivate: [ UserPreAuthGuard ] 
      }
    ]
  },{
    //path: '',
    //component: AdvisorDashboardComponent
    path: 'dashboard',
    component: AdvisorLayoutComponent,
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
  },
  {
    path: 'legacies',
    component: AdvisorLayoutComponent,
    children : [
      { 
        path: '',
        component: LegaciesComponent,
        canActivate: [ UserAuthGuard ] 
      }
    ]
  },{
    path: 'subscription',
    component: AdvisorSubscriptionComponent
  },{
    path: '**',
    redirectTo: 'dashboard'
  }
];