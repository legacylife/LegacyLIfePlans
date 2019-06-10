import { Routes } from '@angular/router';
import { CustomerSignupComponent } from './signup/signup.component';
import { UpdateProfileComponent } from './update-profile/update-profile.component';
import { CustomerHomeComponent } from './customer-home/customer-home.component';
import { CustomerAccountSettingComponent } from './customer-account-setting/customer-account-setting.component';
import { CustomerLayoutComponent } from '../../shared/components/layouts/customer-layout/customer-layout.component';
import { AuthLayoutComponent } from '../../shared/components/layouts/auth-layout/auth-layout.component';
import { UserAuthGuard } from '../../shared/services/auth/userauth.guard';
import { UserPreAuthGuard } from '../../shared/services/auth/userpreauth.guard';
import { CanDeactivateGuard } from '../../shared/services/auth/can-deactivate.guard';
import { CountryEditCanDeactivateGuard } from '../../shared/services/country-edit-can-deactivate-guard.service';
import { CustomerSubscriptionComponent } from './customer-subscription/customer-subscription.component';
import { CustomerTrusteesComponent } from './customer-trustees/customer-trustees.component';
import { CustomerProfessionalComponent } from './customer-professionals/customer-professionals.component';

import { CustomerHomeEssentialComponent } from './customer-home/customer-essential/customer-home-essential.component';
import { CustomerDashboardComponent } from './customer-home/customer-dashboard/customer-dashboard.component';
import { CustomerDashboardDayOneComponent } from './customer-home/customer-dashboard-day-one/customer-dashboard-day-one.component';
import { CustomerEssentialDayOneComponent } from './customer-home/customer-essential-day-one/customer-essential-day-one.component';
import { CustomerEssentialDetailsComponent } from './customer-home/customer-essential-details/customer-essential-details.component';
import { CustomerEssentialDetailsIdboxComponent } from './customer-home/customer-essential-details-idbox/customer-essential-details-idbox.component';
import { CustomerSharedLegaciesComponent } from './customer-home/customer-shared-legacies/customer-shared-legacies.component';
import { CustomerLegaciesDetailsComponent } from './customer-home/customer-legacies-details/customer-legacies-details.component';

export const CustomerRoutes: Routes = [
  {
    path: 'signup',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        component: CustomerSignupComponent,
        canActivate: [UserPreAuthGuard]
      }
    ],
  },
  {
    path: 'dashboard',
    component: CustomerLayoutComponent,
    children: [
      {
        path: '',
        component: CustomerHomeComponent,
        canActivate: [UserAuthGuard],
        children: [
          {
            path: '',
            component: CustomerDashboardComponent
          },
          {
            path: 'customer-day-one',
            component: CustomerDashboardDayOneComponent
          },
          {
            path: 'customer-essential',
            component: CustomerHomeEssentialComponent
          },
          {
            path: 'essential-day-one',
            component: CustomerEssentialDayOneComponent
          },
          {
            path: 'essential-detail-view',
            component: CustomerEssentialDetailsComponent
          },
          {
            path: 'essential-detail-idbox',
            component: CustomerEssentialDetailsIdboxComponent
          },
          {
            path: 'shared-lagacies',
            component: CustomerSharedLegaciesComponent
          },
          {
            path: 'lagacies-details',
            component: CustomerLegaciesDetailsComponent
          }
        ]
      },
    ]
  }, {
    path: 'update-profile',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        component: UpdateProfileComponent,
        canActivate: [UserAuthGuard]
      }
    ]
  }, {
    path: 'account-setting',
    component: CustomerLayoutComponent,
    children: [
      {
        path: '',
        component: CustomerAccountSettingComponent,
        canActivate: [UserAuthGuard],
        canDeactivate: [ CanDeactivateGuard ]
      }
    ]
  }, {
    path: 'customer-subscription',
    component: CustomerLayoutComponent,
    children: [
      {
        path: '',
        component: CustomerSubscriptionComponent,
        canActivate: [UserAuthGuard]
      }
    ]
  }, {
    path: 'professionals',
    component: CustomerLayoutComponent,
    children: [
      {
        path: '',
        component: CustomerProfessionalComponent,
        canActivate: [UserAuthGuard]
      }
    ]
  }, {
    path: 'trustees',
    component: CustomerLayoutComponent,
    children: [
      {
        path: '',
        component: CustomerTrusteesComponent,
        canActivate: [UserAuthGuard]
      }
    ]
  }

];