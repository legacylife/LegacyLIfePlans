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
import { CanDeactivateGuard } from '../../shared/services/auth/can-deactivate.guard';
import { AuthLayoutComponent } from '../../shared/components/layouts/auth-layout/auth-layout.component';
import { AdvisorLandingLayoutComponent } from '../../shared/components/layouts/advisor-landing-layout/advisor-landing-layout.component';
import { HomeComponent } from './advisor-landing/home/home.component';
import { AdvisorLegacyDetailsComponent } from './advisor-legacy-details/advisor-legacy-details.component';
import { LegaciesDetailsLandingComponent } from './advisor-legacy-details/legacies-details-landing/legacies-details-landing.component';
import { GetFeaturedComponent } from './get-featured/get-featured.component';
import { AdvisorLeadsComponent } from './advisor-leads/advisor-leads.component';
import { AdvisorLeadsDetailsComponent } from './advisor-leads-details/advisor-leads-details.component';
import { TodosListingComponent } from '../todos-listing/todos-listing.component';
console.log('advisor---routing');
export const AdvisorRoutes: Routes = [
  {
    path: '',
    component: AdvisorLandingLayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
        canActivate: [UserPreAuthGuard]
      }
    ],
  },
  {
    path: 'signin',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        component: AdvisorSignupComponent,
        canActivate: [UserPreAuthGuard],
        data: { title: 'Advisor Singin' }
      }
    ],
  },
  {
    path: 'set-password/:id',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        component: SetPasswordComponent,
        canActivate: [UserPreAuthGuard],
        data: { title: 'Set Password' }
      }
    ],

  },
  {
    path: 'signup',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        component: AdvisorSignupComponent,
        canActivate: [UserPreAuthGuard],
        data: { title: 'Advisor Signup' }
      }
    ],

  },
  {
    path: 'business-info',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        component: BusinessInfoComponent,
        canActivate: [UserPreAuthGuard],
        data: { title: 'Business Info' }
      }
    ]
  },
  {
    path: 'thank-you',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        component: ThankYouComponent,
        canActivate: [UserPreAuthGuard],
        data: { title: 'Thank You' }
      }
    ]
  },
  {
    path: 'dashboard',
    component: AdvisorLayoutComponent,
    children: [
      {
        path: '',
        component: AdvisorDashboardComponent,
        canActivate: [UserAuthGuard],
        data: { title: 'Dashboard' }
      }
    ]
  },
  {
    path: 'dashboard-updates',
    component: AdvisorLayoutComponent,
    children: [
      {
        path: '',
        component: AdvisorDashboardUpdateComponent,
        canActivate: [UserAuthGuard],
        data: { title: 'Dashboard Updates' }
      }
    ]
  }, {
    path: 'account-setting',
    component: AdvisorLayoutComponent,
    children: [
      {
        path: '',
        component: AdvisorAccountSettingComponent,
        canActivate: [UserAuthGuard],
        canDeactivate: [CanDeactivateGuard],
        data: { title: 'Account Setting' }
      }
    ],
  },
  {
    path: 'legacies',
    component: AdvisorLayoutComponent,
    data: { title: 'Legacies List' },
    children: [
      {
        path: '',
        component: LegaciesComponent,
        canActivate: [UserAuthGuard],
        data: { title: 'Legacies List' }
      }
    ]
  },
  {
    path: 'leads',
    component: AdvisorLayoutComponent,
    data: { title: 'Leads List' },
    children: [
      {
        path: '',
        component: AdvisorLeadsComponent,
        canActivate: [UserAuthGuard],
        data: { title: 'Leads List' }
      }
    ]
  },
  {
    path: 'leads-details/:id',
    component: AdvisorLayoutComponent,
    data: { title: 'Leads Details' },
    children: [
      {
        path: '',
        component: AdvisorLeadsDetailsComponent,
        canActivate: [UserAuthGuard],
        data: { title: 'Leads Details' }
      }
    ]
  },
  {
    path: 'legacies-details',
    component: AdvisorLayoutComponent,   
    data: { title: ''},
    children: [
      {
        path: '',
        component: AdvisorLegacyDetailsComponent,
        canActivate: [UserAuthGuard],
        children: [
          {
            path: 'user-legacies-detail',
            component: LegaciesDetailsLandingComponent,
            data: { title: 'Legacies Details' }
          }
        ]
      }
    ]
  },
  {
    path: 'to-dos',
    component: AdvisorLayoutComponent,
    data: { title: 'Todo\'s' },
    children: [
      {
        path: '',
        component: TodosListingComponent,
        data: { title: 'Todo\'s' }
      }
    ]
  },
  {
    path: 'get-featured',
    component: AdvisorLayoutComponent,
    data: { title: 'Get Featured' },
    children: [
      {
        path: '',
        component: GetFeaturedComponent,
        canActivate: [UserAuthGuard],
        data: { title: 'Get Featured' }
      }
    ]
  },
  {
    path: 'subscription',
    component: AdvisorLayoutComponent,
    data: { title: 'Subscription' },
    children: [
      {
        path: '',
        component: AdvisorSubscriptionComponent,
        canActivate: [UserAuthGuard],
        data: { title: 'Subscription' }
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  },
];