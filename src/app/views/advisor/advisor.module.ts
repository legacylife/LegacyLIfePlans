import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  MatDialogModule,
  MatSelectModule,
  MatSliderModule,
  MatExpansionModule,
  MatSnackBarModule,
  MatFormFieldModule,
  MatSidenavModule,
  MatRippleModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatTooltipModule
 } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { FileUploadModule } from 'ng2-file-upload/ng2-file-upload';
import { SharedModule } from './../../shared/shared.module';
import { AdvisorRoutes } from './advisor.routing';
import { AdvisorSignupComponent } from './signup/signup.component';
import { BusinessInfoComponent } from './business-info/business-info.component';
import { SetPasswordComponent } from './set-password/set-password.component';
import { AdvisorSigninComponent } from './signin/signin.component';
import { ThankYouComponent } from './thank-you/thank-you.component';

import { AdvisorChangePassComponent } from './advisor-account-setting/advisor-change-pass/advisor-change-pass.component';
import { AdvisorDashboardComponent } from './advisor-dashboard/advisor-dashboard.component';
import { LegaciesComponent } from './legacies/legacies.component';
import { AdvisorDashboardUpdateComponent } from './advisor-dashboard-update/advisor-dashboard-update.component';
import { AdvisorAccountSettingComponent } from './advisor-account-setting/advisor-account-setting.component';
import { AdvisorSubscriptionComponent } from './advisor-subscription/advisor-subscription.component';
import { AdvisorLayoutComponent } from './../../shared/components/layouts/advisor-layout/advisor-layout.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    MatTooltipModule,
    MatSelectModule,
    MatStepperModule,
    RouterModule.forChild(AdvisorRoutes)
  ],
  declarations: [
    AdvisorSignupComponent,BusinessInfoComponent,SetPasswordComponent,AdvisorSigninComponent,ThankYouComponent,AdvisorDashboardComponent,LegaciesComponent,AdvisorDashboardUpdateComponent,AdvisorAccountSettingComponent,AdvisorSubscriptionComponent,AdvisorChangePassComponent
  ],providers: [
    MatDatepickerModule,
  ],entryComponents: [AdvisorChangePassComponent],
})
export class AdvisorModule { }
