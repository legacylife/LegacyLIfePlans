import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
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
import { CustomerProfessionalsLandingComponent } from './customer-professionals-landing/customer-professionals-landing.component';
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
import { CustomerLegalStuffDetailsComponent } from './customer-home/customer-legal-stuff-details/customer-legal-stuff-details.component';
import { addTrusteeModalComponent } from './customer-home/add-trustee-modal/add-trustee-modal.component';
import { EmergencyContactsComponent } from './customer-home/emergency-contacts/emergency-contacts.component';
import { essentialsMyProfessionalsComponent } from './customer-home/essentials-my-professionals/essentials-my-professionals.component';
import { EssentialsMyProfessionalsDetailsComponent } from './customer-home/essentials-my-professionals-details/essentials-my-professionals-details.component';
import { CanDeactivateGuard } from '../../shared/services/auth/can-deactivate.guard';
import { CountryEditCanDeactivateGuard } from '../../shared/services/country-edit-can-deactivate-guard.service';
// Professional
import { CustomerProfDetailsComponent } from './customer-professionals/customer-professionals-details/customer-professionals-details.component';
import { SendAnEmailComponent } from './customer-professionals/send-an-email-modal/send-an-email-modal.component';
import { HireAdvisorComponent } from './hire-advisor-modal/hire-advisor-modal.component';
import { ProfAddTrusteeModalComponent } from './customer-professionals/prof-add-trustee-modal/prof-add-trustee-modal.component';
import { ProfAdvisorListingComponent } from './customer-professionals-landing/prof-advisor-listing/prof-advisor-listing.component';
//FinalWishes
import { FinalWishesComponent } from './customer-home/final-wishes/final-wishes-list/final-wishes-list.component';
import { FinalWishesFormModalComponent } from './customer-home/final-wishes/final-wishes-form-modal/final-wishes-form-modal.component';
import { FinalWishesDetailsComponent } from './customer-home/final-wishes/final-wishes-details/final-wishes-details.component';
//Pets
import { PetsListComponent } from './customer-home/pets/pets-list/pets-list.component';
import { PetsModalComponent } from './customer-home/pets/pets-modal/pets-modal.component';
import { PetsDetailsComponent } from './customer-home/pets/pets-details/pets-details.component';
//Time capsule
import { TimeCapsuleListComponent } from './customer-home/time-capsule/time-capsule-list/time-capsule-list.component';
import { TimeCapsuleMoalComponent } from './customer-home/time-capsule/time-capsule-modal/time-capsule-modal.component';
import { TimeCapsuleDetailsComponent } from './customer-home/time-capsule/time-capsule-details/time-capsule-details.component';
//Insurance Finance & Debt
import { InsuranceFinanceDebtListComponent } from './customer-home/insurance-finance-debt/insurance-finance-debt-list/insurance-finance-debt-list.component';
import { InsuranceModalComponent } from './customer-home/insurance-finance-debt/insurance-modal/insurance-modal.component';
import { InsuranceDetailsComponent } from './customer-home/insurance-finance-debt/insurance-details/insurance-details.component';
import { FinanceDetailsComponent } from './customer-home/insurance-finance-debt/finance-details/finance-details.component';
import { FinanceModalComponent } from './customer-home/insurance-finance-debt/finance-modal/finance-modal.component';
import { DebtDetailsComponent } from './customer-home/insurance-finance-debt/debt-details/debt-details.component';
import { DebtModalComponent } from './customer-home/insurance-finance-debt/debt-modal/debt-modal.component';

//passwords-digital-assets
import { PasswordsDigitalAssetsListComponent } from './customer-home/passwords-digital-assets/passwords-digital-assets-list/passwords-digital-assets-list.component';
import { DevicesModalComponent } from './customer-home/passwords-digital-assets/devices/devices-modal/devices-modal.component';

import { ProUserAuthGuard } from '../../shared/services/auth/prouserauth.guard';
//import { LyThemeModule, LY_THEME, LY_THEME_GLOBAL_VARIABLES } from '@alyle/ui';
/** Import the component modules */
// import { LyButtonModule } from '@alyle/ui/button';
// import { LyToolbarModule } from '@alyle/ui/toolbar';
// import { LyIconModule } from '@alyle/ui/icon';
//import { LyResizingCroppingImageModule } from '@alyle/ui/resizing-cropping-images';

/** Import themes */
import { MinimaLight, MinimaDark } from '@alyle/ui/themes/minima';
import { ListingComponent } from './customer-home/real-estate-assets/listing/listing.component';
import { DetailsComponent } from './customer-home/real-estate-assets/details/details.component';
import { RealEstateModelComponent } from './customer-home/real-estate-assets/real-estate-model/real-estate-model.component';
import { VehicleModelComponent } from './customer-home/real-estate-assets/vehicle-model/vehicle-model.component';
import { AssetsModelComponent } from './customer-home/real-estate-assets/assets-model/assets-model.component';
import { DetailsVehiclesComponent } from './customer-home/real-estate-assets/details-vehicles/details-vehicles.component';
import { DetailsAssetsComponent } from './customer-home/real-estate-assets/details-assets/details-assets.component';
import { SpecialNeedsListingComponent } from './customer-home/special-needs/special-needs-listing/special-needs-listing.component';
import { SpecialNeedsDetailsComponent } from './customer-home/special-needs/special-needs-details/special-needs-details.component';
import { SpecialNeedsModelComponent } from './customer-home/special-needs/special-needs-model/special-needs-model.component';
import { DeviceDetailsComponent } from './customer-home/passwords-digital-assets/devices/device-details/device-details.component';
//letters-messages-listing
import { LettersMessagesListingComponent } from './customer-home/legacy-life-letters-messages/letters-messages-listing/letters-messages-listing.component';
import { LettersMessagesDetailsComponent } from './customer-home/legacy-life-letters-messages/letters-messages-details/letters-messages-details.component';
import { LettersMessagesModelComponent } from './customer-home/legacy-life-letters-messages/letters-messages-model/letters-messages-model.component';
import { ElectronicMediaModalComponent } from './customer-home/passwords-digital-assets/electronic-media/electronic-media-modal/electronic-media-modal.component';
import { ElectronicMediaDetailsComponent } from './customer-home/passwords-digital-assets/electronic-media/electronic-media-details/electronic-media-details.component';
//import { TodosComponent } from '../todos/todos.component';
//import { TodosListingComponent } from '../todos-listing/todos-listing.component';
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
    addTrusteeModalComponent, essentialsMyProfessionalsComponent, EssentialsMyProfessionalsDetailsComponent,
    EmergencyContactsComponent, CustomerMyTrusteeComponent, CustomerHiredAdvisorComponent,
    EmergencyContactsDetailsComponent, CustomerLegalStuffDetailsComponent,
    CustomerProfDetailsComponent, SendAnEmailComponent, HireAdvisorComponent, ProfAddTrusteeModalComponent,
    CustomerProfessionalsLandingComponent, ProfAdvisorListingComponent, FinalWishesComponent,
    FinalWishesFormModalComponent, FinalWishesDetailsComponent,
    PetsListComponent, PetsDetailsComponent, PetsModalComponent,
    ListingComponent, DetailsComponent, RealEstateModelComponent,
    VehicleModelComponent, AssetsModelComponent,
    SpecialNeedsListingComponent, SpecialNeedsDetailsComponent,
    SpecialNeedsModelComponent, DetailsVehiclesComponent, DetailsAssetsComponent,
    TimeCapsuleListComponent, TimeCapsuleMoalComponent, TimeCapsuleDetailsComponent, InsuranceFinanceDebtListComponent,
    InsuranceModalComponent, InsuranceDetailsComponent, FinanceModalComponent, FinanceDetailsComponent, DebtDetailsComponent,
    DebtModalComponent, PasswordsDigitalAssetsListComponent, DevicesModalComponent,DeviceDetailsComponent,LettersMessagesListingComponent,LettersMessagesDetailsComponent,
    LettersMessagesModelComponent,ElectronicMediaModalComponent,ElectronicMediaDetailsComponent
  ], providers: [
    MatDatepickerModule, UserAuthGuard, UserPreAuthGuard, CanDeactivateGuard, CountryEditCanDeactivateGuard,ProUserAuthGuard
    // { provide: LY_THEME, useClass: MinimaLight, multi: true },
    // { provide: LY_THEME, useClass: MinimaDark, multi: true },
    // { provide: LY_THEME_GLOBAL_VARIABLES, useClass: GlobalVariables },
  ], bootstrap: [CustomerSignupComponent],
  entryComponents: [ChangePassComponent, EssenioalIdBoxComponent,
    addTrusteeModalComponent, PersonalProfileModalComponent, MarkAsDeceasedComponent,
    legalStuffModalComponent, essentialsMyProfessionalsComponent, SendAnEmailComponent,
    HireAdvisorComponent, FinalWishesFormModalComponent, PetsModalComponent, AssetsModelComponent,
    SpecialNeedsModelComponent, RealEstateModelComponent, VehicleModelComponent, TimeCapsuleMoalComponent,
    InsuranceModalComponent, FinanceModalComponent, DebtModalComponent, DevicesModalComponent, ProfAddTrusteeModalComponent,
    LettersMessagesModelComponent,ElectronicMediaModalComponent
  ]
})
export class CustomerModule { }
