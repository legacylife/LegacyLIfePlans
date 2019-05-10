import { Routes } from '@angular/router';

import { AdvisorDashboardComponent } from './advisor-dashboard/advisor-dashboard.component';
import { LegaciesComponent } from './legacies/legacies.component';
import { AdvisorDashboardUpdateComponent } from './advisor-dashboard-update/advisor-dashboard-update.component';

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
    path: 'legacies',
    component: LegaciesComponent
  }
];