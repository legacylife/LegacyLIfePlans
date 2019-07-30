import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
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
  MatTooltipModule,
  MatBottomSheetModule
} from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { FileUploadModule } from 'ng2-file-upload/ng2-file-upload';
import { SharedModule } from './../../shared/shared.module';
import { AdvisorRoutes } from './advisor.routing';
import { AdvisorSignupComponent, FormatTimePipe } from './signup/signup.component';
import { BusinessInfoComponent } from './business-info/business-info.component';
import { SetPasswordComponent } from './set-password/set-password.component';
import { ThankYouComponent } from './thank-you/thank-you.component';
import { ChangePassComponent } from './advisor-account-setting/change-pass/change-pass.component';
import { AdvisorDashboardComponent } from './advisor-dashboard/advisor-dashboard.component';
import { LegaciesComponent } from './legacies/legacies.component';
import { AdvisorLeadsComponent } from './advisor-leads/advisor-leads.component';
import { AdvisorLeadsDetailsComponent } from './advisor-leads-details/advisor-leads-details.component';
import { AdvisorDashboardUpdateComponent } from './advisor-dashboard-update/advisor-dashboard-update.component';
import { AdvisorAccountSettingComponent } from './advisor-account-setting/advisor-account-setting.component';
import { AdvisorSubscriptionComponent } from './advisor-subscription/advisor-subscription.component';
import { ProspectPeoplesModalComponent } from './advisor-leads-details/prospect-peoples-modal/prospect-peoples-modal.component';
import { AdvisorLegacyDetailsComponent } from './advisor-legacy-details/advisor-legacy-details.component';
import { LegaciesDetailsLandingComponent } from './advisor-legacy-details/legacies-details-landing/legacies-details-landing.component';
import { GetFeaturedComponent } from './get-featured/get-featured.component';
import { SubmitEnquiryModalComponent } from './get-featured/submit-enquiry-modal/submit-enquiry-modal.component';
import { MarkAsDeceasedComponent } from './advisor-legacy-details/mark-as-deceased-modal/mark-as-deceased-modal.component';
import { AdvisorLayoutComponent } from './../../shared/components/layouts/advisor-layout/advisor-layout.component';
import { states } from '../../state';
import { yearsOfServiceList, businessTypeList, industryDomainList } from '../../selectList';
import { UserAuthGuard } from '../../shared/services/auth/userauth.guard';
import { UserPreAuthGuard } from '../../shared/services/auth/userpreauth.guard';
import { CanDeactivateGuard } from '../../shared/services/auth/can-deactivate.guard';
import { ProfilePicService } from 'app/shared/services/profile-pic.service';
import { HomeComponent } from './advisor-landing/home/home.component';
import { ReferAndEarnModalComponent } from './legacies/refer-and-earn-modal/refer-and-earn-modal.component';

import { SlickCarouselModule } from 'ngx-slick-carousel';
import { CountUpModule } from 'countup.js-angular2';
/** Import Alyle UI */
// import { LyThemeModule, LY_THEME, LY_THEME_GLOBAL_VARIABLES } from '@alyle/ui';
/** Import the component modules */
// import { LyButtonModule } from '@alyle/ui/button';
// import { LyToolbarModule } from '@alyle/ui/toolbar';
// import { LyIconModule } from '@alyle/ui/icon';

import { LyResizingCroppingImageModule } from '@alyle/ui/resizing-cropping-images';
/** Import themes */
import { MinimaLight, MinimaDark } from '@alyle/ui/themes/minima';
import { OurPlanComponent } from './our-plan/our-plan.component';
import { AdvisorHomeComponent } from './advisor-home/advisor-home.component';
import { ErrorComponent } from './../error/error.component';
export class GlobalVariables {
  testVal = '#00bcd4';
  Quepal = {
    default: `linear-gradient(135deg,#11998e 0%,#38ef7d 100%)`,
    contrast: '#fff',
    shadow: '#11998e'
  };
  SublimeLight = {
    default: `linear-gradient(135deg,#FC5C7D 0%,#6A82FB 100%)`,
    contrast: '#fff',
    shadow: '#B36FBC'
  };
  Amber = {
    default: '#ffc107',
    contrast: 'rgba(0, 0, 0, 0.87)'
  };
}



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
    HttpModule,
    SlickCarouselModule,
    MatBottomSheetModule,
    RouterModule.forChild(AdvisorRoutes),
    CountUpModule,

    // LyThemeModule.setTheme('minima-light'),
    // LyButtonModule,
    // LyToolbarModule,
    // LyResizingCroppingImageModule,
    // LyIconModule
  ],
  declarations: [
    AdvisorSignupComponent, BusinessInfoComponent, SetPasswordComponent,
    FormatTimePipe, ThankYouComponent, AdvisorDashboardComponent, LegaciesComponent,
    AdvisorDashboardUpdateComponent, AdvisorAccountSettingComponent, AdvisorSubscriptionComponent,
    ChangePassComponent, HomeComponent, ReferAndEarnModalComponent, AdvisorLegacyDetailsComponent,
    LegaciesDetailsLandingComponent, MarkAsDeceasedComponent,
    GetFeaturedComponent, SubmitEnquiryModalComponent, AdvisorLeadsComponent, AdvisorLeadsDetailsComponent, 
    ProspectPeoplesModalComponent, OurPlanComponent, AdvisorHomeComponent,ErrorComponent
  ], providers: [
    // { provide: LY_THEME, useClass: MinimaLight, multi: true },
    // { provide: LY_THEME, useClass: MinimaDark, multi: true },
    // { provide: LY_THEME_GLOBAL_VARIABLES, useClass: GlobalVariables },
    MatDatepickerModule, UserAuthGuard, UserPreAuthGuard, ProfilePicService, CanDeactivateGuard
  ], entryComponents: [ChangePassComponent, ReferAndEarnModalComponent, MarkAsDeceasedComponent, SubmitEnquiryModalComponent, 
    ProspectPeoplesModalComponent],
})
export class AdvisorModule { }
