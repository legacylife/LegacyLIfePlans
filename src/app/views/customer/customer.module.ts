import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatListModule,MatIconModule,MatButtonModule,MatCardModule,MatMenuModule,MatSlideToggleModule,MatGridListModule,MatChipsModule,MatCheckboxModule,MatRadioModule,MatTabsModule,MatInputModule,MatSelectModule,MatDatepickerModule,
  MatNativeDateModule,MatFormFieldModule,MatProgressBarModule,MatProgressSpinnerModule,MatTooltipModule,MatExpansionModule,MatSliderModule,MatSnackBarModule,MatSidenavModule,MatDialogModule,MatStepperModule
} from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SharedModule } from './../../shared/shared.module';
import { CustomerRoutes } from './customer.routing';
import { CustomerSignupComponent, FormatTimePipe } from './signup/signup.component';
import { CustomerHomeComponent } from './customer-home/customer-home.component';
import { UserAuthGuard } from '../../shared/services/auth/userauth.guard';
import { UserPreAuthGuard } from '../../shared/services/auth/userpreauth.guard';
import { CustomerSubscriptionComponent } from './customer-subscription/customer-subscription.component';
import { CustomerTrusteesComponent } from './customer-trustees/customer-trustees.component';
import { CustomerHomeEssentialComponent } from './customer-home/customer-essential/customer-home-essential.component';
import { CustomerDashboardComponent } from './customer-home/customer-dashboard/customer-dashboard.component';
import { CustomerDashboardDayOneComponent } from './customer-home/customer-dashboard-day-one/customer-dashboard-day-one.component';
import { CustomerSharedLegaciesComponent } from './customer-home/customer-shared-legacies/customer-shared-legacies.component';
import { CustomerLegaciesDetailsComponent } from './customer-home/customer-legacies-details/customer-legacies-details.component';
import { ProUserAuthGuard } from '../../shared/services/auth/prouserauth.guard';


import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { FileUploadModule } from 'ng2-file-upload/ng2-file-upload';
import { UpdateProfileComponent } from './update-profile/update-profile.component';
import { CustomerAccountSettingComponent } from './customer-account-setting/customer-account-setting.component';
import { ChangePassComponent } from './customer-account-setting/change-pass/change-pass.component';
import { states } from '../../state';
import { CustomerProfessionalsLandingComponent } from './customer-professionals-landing/customer-professionals-landing.component';
import { CustomerProfessionalComponent } from './customer-professionals/customer-professionals.component';
import { CustomerMyPeopleComponent } from './customer-trustees/customer-my-people/customer-my-people.component';
import { CustomerMyTrusteeComponent } from './customer-trustees/customer-my-trustees/customer-my-trustees.component';
import { CustomerHiredAdvisorComponent } from './customer-trustees/customer-hired-advisors/customer-hired-advisors.component';
import { addTrusteeModalComponent } from './customer-home/add-trustee-modal/add-trustee-modal.component';
import { ManageTrusteeModalComponent } from './customer-home/manage-trustee-modal/manage-trustee-modal.component';
import { CanDeactivateGuard } from '../../shared/services/auth/can-deactivate.guard';
// Professional
import { CustomerProfDetailsComponent } from './customer-professionals/customer-professionals-details/customer-professionals-details.component';
import { SendAnEmailComponent } from './customer-professionals/send-an-email-modal/send-an-email-modal.component';
import { HireAdvisorComponent } from './hire-advisor-modal/hire-advisor-modal.component';
import { ProfAddTrusteeModalComponent } from './customer-professionals/prof-add-trustee-modal/prof-add-trustee-modal.component';
import { ProfAdvisorListingComponent } from './customer-professionals-landing/prof-advisor-listing/prof-advisor-listing.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
console.log("Customer module .....");
/** Import themes */
import { MinimaLight, MinimaDark } from '@alyle/ui/themes/minima';
import { FuneralServiceModalComponent } from './customer-home/final-wishes/funeral-service-modal/funeral-service-modal.component';
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
    MatProgressSpinnerModule,
    FlexLayoutModule,
    NgxDatatableModule,
    ChartsModule,
    FileUploadModule,
    SharedModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatSelectModule,
    MatExpansionModule,
    MatSliderModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatDialogModule,
    MatStepperModule,     
    InfiniteScrollModule,  
    RouterModule.forChild(CustomerRoutes)
  ],
  declarations: [
    CustomerSignupComponent,UpdateProfileComponent,CustomerHomeComponent,FormatTimePipe,
    CustomerAccountSettingComponent,ChangePassComponent,CustomerSubscriptionComponent,CustomerTrusteesComponent,
    CustomerProfessionalComponent,CustomerHomeEssentialComponent,CustomerDashboardComponent,CustomerDashboardDayOneComponent,
    CustomerSharedLegaciesComponent,CustomerLegaciesDetailsComponent,CustomerMyPeopleComponent,addTrusteeModalComponent,
    CustomerMyTrusteeComponent,CustomerHiredAdvisorComponent,CustomerProfDetailsComponent, SendAnEmailComponent,HireAdvisorComponent, 
    ProfAddTrusteeModalComponent,CustomerProfessionalsLandingComponent,ProfAdvisorListingComponent,ManageTrusteeModalComponent, 
    FuneralServiceModalComponent
  ], providers: [
    MatDatepickerModule,UserAuthGuard,UserPreAuthGuard, CanDeactivateGuard,ProUserAuthGuard
  ], bootstrap: [CustomerSignupComponent],
  entryComponents: [ChangePassComponent,addTrusteeModalComponent, SendAnEmailComponent, 
    HireAdvisorComponent,ProfAddTrusteeModalComponent,ManageTrusteeModalComponent, FuneralServiceModalComponent
  ]
})
export class CustomerModule { }