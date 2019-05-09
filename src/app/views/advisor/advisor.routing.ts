import { Routes } from '@angular/router';

import { AdvisorDashboardComponent } from './advisor-dashboard/advisor-dashboard.component';
import { LegaciesComponent } from './legacies/legacies.component';

export const AdviserRoutes: Routes = [
  {
    path: '',
    component: AdvisorDashboardComponent
  },
  {
    path: 'legacies',
    component: LegaciesComponent
  }
];