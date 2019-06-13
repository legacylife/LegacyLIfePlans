import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatStepperModule} from '@angular/material/stepper';
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
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatFormFieldModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatTooltipModule,
  MatExpansionModule,
  MatSliderModule,
  MatSnackBarModule,
  MatSidenavModule,
  MatDialogModule
} from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { FileUploadModule } from 'ng2-file-upload/ng2-file-upload';
import { SharedModule } from './../../shared/shared.module';
import { CustomerRoutes } from './customer.routing';
import { CustomerSignupComponent, FormatTimePipe } from './signup/signup.component';
import { UpdateProfileComponent } from './update-profile/update-profile.component';
import { CustomerHomeComponent } from './customer-home/customer-home.component';
import { CustomerAccountSettingComponent } from './customer-account-setting/customer-account-setting.component';
import { ChangePassComponent } from './customer-account-setting/change-pass/change-pass.component';
import { UserAuthGuard } from '../../shared/services/auth/userauth.guard';
import { UserPreAuthGuard } from '../../shared/services/auth/userpreauth.guard';
import { states } from '../../state';
import { CustomerSubscriptionComponent } from './customer-subscription/customer-subscription.component';
import { CustomerTrusteesComponent } from './customer-trustees/customer-trustees.component';
import { CustomerProfessionalComponent } from './customer-professionals/customer-professionals.component';
import { CustomerHomeEssentialComponent } from './customer-home/customer-essential/customer-home-essential.component';
import { CustomerDashboardComponent } from './customer-home/customer-dashboard/customer-dashboard.component';
import { CustomerDashboardDayOneComponent } from './customer-home/customer-dashboard-day-one/customer-dashboard-day-one.component';
import { CustomerEssentialDayOneComponent } from './customer-home/customer-essential-day-one/customer-essential-day-one.component';
import { CustomerEssentialDetailsComponent } from './customer-home/customer-essential-details/customer-essential-details.component';
import { EmergencyContactsDetailsComponent } from './customer-home/emergency-contacts-details/emergency-contacts-details.component';
import { CustomerEssentialDetailsIdboxComponent } from './customer-home/customer-essential-details-idbox/customer-essential-details-idbox.component';
import { CustomerSharedLegaciesComponent } from './customer-home/customer-shared-legacies/customer-shared-legacies.component';
import { EssenioalIdBoxComponent } from './customer-home/essenioal-id-box/essenioal-id-box.component';
import { PersonalProfileModalComponent } from './customer-home/personal-profile-modal/personal-profile-modal.component';
import { CustomerLegaciesDetailsComponent } from './customer-home/customer-legacies-details/customer-legacies-details.component';
import { MarkAsDeceasedComponent } from './customer-home/mark-as-deceased-modal/mark-as-deceased-modal.component';
import { CustomerMyPeopleComponent } from './customer-trustees/customer-my-people/customer-my-people.component';
import { CustomerMyTrusteeComponent } from './customer-trustees/customer-my-trustees/customer-my-trustees.component';
import { CustomerHiredAdvisorComponent } from './customer-trustees/customer-hired-advisors/customer-hired-advisors.component';
import { CustomerLegalStuffComponent } from './customer-home/customer-legal-stuff/customer-legal-stuff.component';
import { legalStuffModalComponent } from './customer-home/legal-stuff-modal/legal-stuff-modal.component';
import { addTrusteeModalComponent } from './customer-home/add-trustee-modal/add-trustee-modal.component';
import { EmergencyContactsComponent } from './customer-home/emergency-contacts/emergency-contacts.component';
import { essentialsMyProfessionalsComponent } from './customer-home/essentials-my-professionals/essentials-my-professionals.component';
import { EssentialsMyProfessionalsDetailsComponent } from './customer-home/essentials-my-professionals-details/essentials-my-professionals-details.component';
import { CanDeactivateGuard } from '../../shared/services/auth/can-deactivate.guard';
import { CountryEditCanDeactivateGuard } from '../../shared/services/country-edit-can-deactivate-guard.service';
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
    RouterModule.forChild(CustomerRoutes)
  ],
  declarations: [
    CustomerSignupComponent, UpdateProfileComponent,
    CustomerHomeComponent, FormatTimePipe, CustomerAccountSettingComponent, ChangePassComponent,
    CustomerSubscriptionComponent, CustomerTrusteesComponent, CustomerProfessionalComponent,
    CustomerHomeEssentialComponent, CustomerDashboardComponent, CustomerDashboardDayOneComponent, CustomerEssentialDayOneComponent,
    CustomerEssentialDetailsComponent, CustomerEssentialDetailsIdboxComponent, EssenioalIdBoxComponent,
    PersonalProfileModalComponent, CustomerSharedLegaciesComponent, CustomerLegaciesDetailsComponent, MarkAsDeceasedComponent,
    CustomerMyPeopleComponent, CustomerLegalStuffComponent, legalStuffModalComponent,
    addTrusteeModalComponent, essentialsMyProfessionalsComponent,EssentialsMyProfessionalsDetailsComponent,
    EmergencyContactsComponent, CustomerMyTrusteeComponent, CustomerHiredAdvisorComponent, EmergencyContactsDetailsComponent
  ], providers: [
    MatDatepickerModule, UserAuthGuard, UserPreAuthGuard, CanDeactivateGuard, CountryEditCanDeactivateGuard
  ], bootstrap: [CustomerSignupComponent], entryComponents: [ChangePassComponent, EssenioalIdBoxComponent,
    PersonalProfileModalComponent, MarkAsDeceasedComponent, legalStuffModalComponent,
    addTrusteeModalComponent,PersonalProfileModalComponent, MarkAsDeceasedComponent,
    legalStuffModalComponent,essentialsMyProfessionalsComponent],
  })
export class CustomerModule { }
