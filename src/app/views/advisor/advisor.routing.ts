import { Routes } from '@angular/router';

import { AppBlankComponent } from './app-blank/app-blank.component';
import { LegaciesComponent } from './legacies/legacies.component';

export const AdviserRoutes: Routes = [
  {
    path: '',
    component: AppBlankComponent
  },
  {
    path: 'legacies',
    component: LegaciesComponent
  }
];