import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  MatListModule,
  MatIconModule,
  MatButtonModule,
  MatCardModule,
  MatMenuModule,
  MatSlideToggleModule,
  MatGridListModule,
  MatChipsModule,
  MatCheckboxModule,
  MatRadioModule,
  MatTabsModule,
  MatInputModule,
  MatProgressBarModule,


  MatSelectModule,
  MatSliderModule,
  MatExpansionModule,
  MatSnackBarModule,
  MatFormFieldModule,
  MatSidenavModule,
  MatRippleModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatDialogModule


 } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { FileUploadModule } from 'ng2-file-upload/ng2-file-upload';
import { SharedModule } from './../../shared/shared.module';

import { AdvisorAccountSettingComponent } from './advisor-account-setting/advisor-account-setting.component';
import { AdvisorChangePassComponent } from './advisor-account-setting/advisor-change-pass/advisor-change-pass.component';
import { AdvisorSubscriptionComponent } from './advisor-subscription/advisor-subscription.component';
import { AdvisorDashboardComponent } from './advisor-dashboard/advisor-dashboard.component';
import { AdvisorDashboardUpdateComponent } from './advisor-dashboard-update/advisor-dashboard-update.component';
import { LegaciesComponent } from './legacies/legacies.component';
import { AdviserRoutes } from './advisor.routing';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatGridListModule,
    MatChipsModule,
    MatCheckboxModule,
    MatRadioModule,
    MatTabsModule,
    MatInputModule,
    MatProgressBarModule,
    FlexLayoutModule,
    NgxDatatableModule,
    ChartsModule,
    FileUploadModule,
    SharedModule,
    MatSelectModule,
    MatSliderModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatSidenavModule,
    MatRippleModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatNativeDateModule,
    MatDialogModule,
    RouterModule.forChild(AdviserRoutes)
  ],
  declarations: [
    AdvisorDashboardComponent,
    LegaciesComponent,
    AdvisorDashboardUpdateComponent,
    AdvisorAccountSettingComponent,
    AdvisorSubscriptionComponent,
    AdvisorChangePassComponent
  ],
  entryComponents: [AdvisorChangePassComponent],
})
export class AdvisorModule { }
