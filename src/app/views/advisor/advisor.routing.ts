import { Routes } from '@angular/router';

import { AdvisorDashboardComponent } from './advisor-dashboard/advisor-dashboard.component';
import { LegaciesComponent } from './legacies/legacies.component';
import { AdvisorDashboardUpdateComponent } from './advisor-dashboard-update/advisor-dashboard-update.component';
import { AdvisorAccountSettingComponent } from './advisor-account-setting/advisor-account-setting.component';
import { AdvisorSubscriptionComponent } from './advisor-subscription/advisor-subscription.component';

export const AdviserRoutes: Routes = [
  {
    path: '',
    component: AdvisorDashboardComponent
  },
  {
    path: 'dashboard-updates',
    component: AdvisorDashboardUpdateComponent
  },
  {
    path: 'account-setting',
    component: AdvisorAccountSettingComponent
  },
  {
    path: 'legacies',
    component: LegaciesComponent
  },
  {
    path: 'subscription',
    component: AdvisorSubscriptionComponent
  }
];