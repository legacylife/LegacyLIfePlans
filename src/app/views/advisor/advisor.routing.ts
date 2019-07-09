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
        canActivate: [UserPreAuthGuard]
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
        canActivate: [UserPreAuthGuard]
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
        canActivate: [UserPreAuthGuard]
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
        canActivate: [UserPreAuthGuard]
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
        canActivate: [UserPreAuthGuard]
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
        canActivate: [UserAuthGuard]
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
        canActivate: [UserAuthGuard]
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
        canDeactivate: [CanDeactivateGuard]
      }
    ],
  },
  {
    path: 'legacies',
    component: AdvisorLayoutComponent,
    children: [
      {
        path: '',
        component: LegaciesComponent,
        canActivate: [UserAuthGuard]
      }
    ]
  },
  {
    path: 'leads',
    component: AdvisorLayoutComponent,
    children: [
      {
        path: '',
        component: AdvisorLeadsComponent,
        canActivate: [UserAuthGuard]
      }
    ]
  },
  {
    path: 'leads-details/:id',
    component: AdvisorLayoutComponent,
    children: [
      {
        path: '',
        component: AdvisorLeadsDetailsComponent,
        canActivate: [UserAuthGuard]
      }
    ]
  },
  {
    path: 'legacies-details',
    component: AdvisorLayoutComponent,
    children: [
      {
        path: '',
        component: AdvisorLegacyDetailsComponent,
        canActivate: [UserAuthGuard],
        children: [
          {
            path: 'user-legacies-detail',
            component: LegaciesDetailsLandingComponent
          }
        ]
      }
    ]
  },
  {
    path: 'to-dos',
    component: AdvisorLayoutComponent,
    children: [
      {
        path: '',
        component: TodosListingComponent       
      }
    ]
  },
  {
    path: 'get-featured',
    component: AdvisorLayoutComponent,
    children: [
      {
        path: '',
        component: GetFeaturedComponent,
        canActivate: [UserAuthGuard]
      }
    ]
  },
  {
    path: 'subscription',
    component: AdvisorLayoutComponent,
    children: [
      {
        path: '',
        component: AdvisorSubscriptionComponent,
        canActivate: [UserAuthGuard]
      }
    ]
  },

  {
    path: '**',
    redirectTo: 'dashboard'
  },
];