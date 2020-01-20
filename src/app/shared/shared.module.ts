import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { RouterModule } from "@angular/router";
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { IconsModule } from '../icons/icons.module';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { 
  MatSidenavModule,
  MatListModule,
  MatTooltipModule,
  MatOptionModule,
  MatSelectModule,
  MatMenuModule,
  MatSnackBarModule,
  MatGridListModule,
  MatToolbarModule,
  MatIconModule,
  MatButtonModule,
  MatRadioModule,
  MatCheckboxModule,
  MatCardModule,
  MatProgressSpinnerModule,
  MatRippleModule,
  MatDialogModule,
  MatFormFieldModule,
  MatSlideToggleModule,
  MatChipsModule,
  MatTabsModule,
  MatInputModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatProgressBarModule,
  MatExpansionModule,
  MatSliderModule,
  MatStepperModule
} from '@angular/material';
// ONLY REQUIRED FOR **SIDE** NAVIGATION LAYOUT
import { HeaderSideComponent } from './components/header-side/header-side.component';
import { SidebarSideComponent } from './components/sidebar-side/sidebar-side.component';

// ONLY REQUIRED FOR **TOP** NAVIGATION LAYOUT
import { HeaderTopComponent } from './components/header-top/header-top.component';
import { customerHeaderTopComponent } from './components/customer-header/customer-header-top.component';
import { AdvisorHeaderTopComponent } from './components/advisor-header/advisor-header-top.component';
import { LandingAdvisorHeaderTopComponent } from './components/landing-advisor-header/landing-advisor-header-top.component';
import { LandingCustomerHeaderTopComponent } from './components/landing-customer-header/landing-customer-header-top.component';
import { SidebarTopComponent } from './components/sidebar-top/sidebar-top.component';

// ONLY FOR DEMO (Removable without changing any layout configuration)
import { CustomizerComponent } from './components/customizer/customizer.component';

// ALL TIME REQUIRED 
import { AdminLayoutComponent } from './components/layouts/admin-layout/admin-layout.component';
import { AdvisorLayoutComponent } from './components/layouts/advisor-layout/advisor-layout.component';
import { AuthLayoutComponent } from './components/layouts/auth-layout/auth-layout.component';
import { CustomerLayoutComponent } from './components/layouts/customer-layout/customer-layout.component';
import { LandingLayoutComponent } from './components/layouts/landing-layout/landing-layout.component';
import { AdvisorLandingLayoutComponent } from './components/layouts/advisor-landing-layout/advisor-landing-layout.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { AppComfirmComponent } from './services/app-confirm/app-confirm.component';
import { ReferNEarnPopUpComponent } from 'app/views/admin/userlist/ngx-table-popup/refer-n-earn-popup.component';
import { AppLoaderComponent } from './services/app-loader/app-loader.component';

// DIRECTIVES
import { FontSizeDirective } from './directives/font-size.directive';
import { ScrollToDirective } from './directives/scroll-to.directive';
import { AppDropdownDirective } from './directives/dropdown.directive';
import { DropdownAnchorDirective } from './directives/dropdown-anchor.directive';
import { DropdownLinkDirective } from './directives/dropdown-link.directive';
import { EgretSideNavToggleDirective } from './directives/egret-side-nav-toggle.directive';

// PIPES
import { RelativeTimePipe } from './pipes/relative-time.pipe';
import { ExcerptPipe } from './pipes/excerpt.pipe';
import { GetValueByKeyPipe } from './pipes/get-value-by-key.pipe';
import { ThousandSuffixesPipe } from './pipes/thousand-suffixes.pipe';

// SERVICES
import { ThemeService } from './services/theme.service';
import { LayoutService } from './services/layout.service';
import { DataSharingService } from './services/data-sharing.service';
import { NavigationService } from './services/navigation.service';
import { AdvisorNavigationService } from './services/pre-login-advisor.service';
import { CustNavService } from './services/customer-nav-links.service';
import { AdvisorNavService } from './services/advisor-nav-links.service';
import { LandingAdvisorNavService } from './services/pre-login-advisor-landing-nav-links.service';
import { LandingCustomerNavService } from './services/pre-login-cust-landing-nav-links.service';
import { RoutePartsService } from './services/route-parts.service';
import { AuthGuard } from './services/auth/auth.guard';
import { AppConfirmService } from './services/app-confirm/app-confirm.service';
import { AppLoaderService } from './services/app-loader/app-loader.service';
import { ProfilePicService } from 'app/shared/services/profile-pic.service';
import { TodosListingComponent } from './../views/todos-listing/todos-listing.component';
import { TodosComponent } from './../views/todos/todos.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { CardDetailsComponent } from './components/card-details-modal/card-details-modal.component';
import { AdvertisementPaymentModalComponent } from './components/advertisement-payment-modal/advertisement-payment-modal.component';
import { InviteComponent } from './components/header-top/invite-modal/invite-modal.component';
import { SubscriptionService } from './services/subscription.service';
import { PetsListComponent } from 'app/views/customer/customer-home/pets/pets-list/pets-list.component';
import { PetsDetailsComponent } from 'app/views/customer/customer-home/pets/pets-details/pets-details.component';
import { PetsModalComponent } from 'app/views/customer/customer-home/pets/pets-modal/pets-modal.component';
import { legacySettingPageComponent } from 'app/views/customer/customer-home/legacy-setting/legacy-setting-page/legacy-setting-page.component';
import { legacySettingModalComponent } from 'app/views/customer/customer-home/legacy-setting/legacy-setting-modal/legacy-setting-modal.component';
import { FileUploadModule } from 'ng2-file-upload';
import { CustomerEssentialDayOneComponent } from 'app/views/customer/customer-home/customer-essential-day-one/customer-essential-day-one.component';
import { PersonalProfileModalComponent } from 'app/views/customer/customer-home/personal-profile-modal/personal-profile-modal.component';
import { CustomerEssentialDetailsComponent } from 'app/views/customer/customer-home/customer-essential-details/customer-essential-details.component';
import { CustomerEssentialDetailsIdboxComponent } from 'app/views/customer/customer-home/customer-essential-details-idbox/customer-essential-details-idbox.component';
import { EssenioalIdBoxComponent } from 'app/views/customer/customer-home/essenioal-id-box/essenioal-id-box.component';
import { essentialsMyProfessionalsComponent } from 'app/views/customer/customer-home/essentials-my-professionals/essentials-my-professionals.component';
import { EssentialsMyProfessionalsDetailsComponent } from 'app/views/customer/customer-home/essentials-my-professionals-details/essentials-my-professionals-details.component';
import { SpecialNeedsModelComponent } from 'app/views/customer/customer-home/special-needs/special-needs-model/special-needs-model.component';
import { SpecialNeedsListingComponent } from 'app/views/customer/customer-home/special-needs/special-needs-listing/special-needs-listing.component';
import { SpecialNeedsDetailsComponent } from 'app/views/customer/customer-home/special-needs/special-needs-details/special-needs-details.component';
import { DeviceDetailsComponent } from 'app/views/customer/customer-home/passwords-digital-assets/devices/device-details/device-details.component';
import { ElectronicMediaDetailsComponent } from 'app/views/customer/customer-home/passwords-digital-assets/electronic-media/electronic-media-details/electronic-media-details.component';
import { DigitalPublicationsDetailsComponent } from 'app/views/customer/customer-home/passwords-digital-assets/digital-publications/digital-publications-details/digital-publications-details.component';
import { PasswordsDigitalAssetsListComponent } from 'app/views/customer/customer-home/passwords-digital-assets/passwords-digital-assets-list/passwords-digital-assets-list.component';
import { DevicesModalComponent } from 'app/views/customer/customer-home/passwords-digital-assets/devices/devices-modal/devices-modal.component';
import { ElectronicMediaModalComponent } from 'app/views/customer/customer-home/passwords-digital-assets/electronic-media/electronic-media-modal/electronic-media-modal.component';
import { DigitalPublicationsModalComponent } from 'app/views/customer/customer-home/passwords-digital-assets/digital-publications/digital-publications-modal/digital-publications-modal.component';
import { DebtDetailsComponent } from 'app/views/customer/customer-home/insurance-finance-debt/debt-details/debt-details.component';
import { EmergencyContactsComponent } from 'app/views/customer/customer-home/emergency-contacts/emergency-contacts.component';
import { EmergencyContactsDetailsComponent } from 'app/views/customer/customer-home/emergency-contacts-details/emergency-contacts-details.component';
import { ListingComponent } from 'app/views/customer/customer-home/real-estate-assets/listing/listing.component';
import { DetailsComponent } from 'app/views/customer/customer-home/real-estate-assets/details/details.component';
import { DetailsVehiclesComponent } from 'app/views/customer/customer-home/real-estate-assets/details-vehicles/details-vehicles.component';
import { DetailsAssetsComponent } from 'app/views/customer/customer-home/real-estate-assets/details-assets/details-assets.component';
import { AssetsModelComponent } from 'app/views/customer/customer-home/real-estate-assets/assets-model/assets-model.component';
import { VehicleModelComponent } from 'app/views/customer/customer-home/real-estate-assets/vehicle-model/vehicle-model.component';
import { RealEstateModelComponent } from 'app/views/customer/customer-home/real-estate-assets/real-estate-model/real-estate-model.component';
import { TimeCapsuleListComponent } from 'app/views/customer/customer-home/time-capsule/time-capsule-list/time-capsule-list.component';
import { TimeCapsuleMoalComponent } from 'app/views/customer/customer-home/time-capsule/time-capsule-modal/time-capsule-modal.component';
import { TimeCapsuleDetailsComponent } from 'app/views/customer/customer-home/time-capsule/time-capsule-details/time-capsule-details.component';
import { legalStuffModalComponent } from 'app/views/customer/customer-home/legal-stuff-modal/legal-stuff-modal.component';
import { CustomerLegalStuffComponent } from 'app/views/customer/customer-home/customer-legal-stuff/customer-legal-stuff.component';
import { CustomerLegalStuffDetailsComponent } from 'app/views/customer/customer-home/customer-legal-stuff-details/customer-legal-stuff-details.component';
import { InsuranceFinanceDebtListComponent } from 'app/views/customer/customer-home/insurance-finance-debt/insurance-finance-debt-list/insurance-finance-debt-list.component';
import { InsuranceDetailsComponent } from 'app/views/customer/customer-home/insurance-finance-debt/insurance-details/insurance-details.component';
import { FinanceDetailsComponent } from 'app/views/customer/customer-home/insurance-finance-debt/finance-details/finance-details.component';
import { InsuranceModalComponent } from 'app/views/customer/customer-home/insurance-finance-debt/insurance-modal/insurance-modal.component';
import { FinanceModalComponent } from 'app/views/customer/customer-home/insurance-finance-debt/finance-modal/finance-modal.component';
import { DebtModalComponent } from 'app/views/customer/customer-home/insurance-finance-debt/debt-modal/debt-modal.component';
import { FinalWishesComponent } from 'app/views/customer/customer-home/final-wishes/final-wishes-list/final-wishes-list.component';
import { FinalWishesDetailsComponent } from 'app/views/customer/customer-home/final-wishes/final-wishes-details/final-wishes-details.component';
import { ObituaryDetailsComponent } from 'app/views/customer/customer-home/final-wishes/final-wishes-details/obituary-details.component';
import { CelebrationDetailsComponent } from 'app/views/customer/customer-home/final-wishes/final-wishes-details/celebration-details.component';
import { FuneralPlansDetailsComponent } from 'app/views/customer/customer-home/final-wishes/final-wishes-details/funeral-plans-details.component';
import { ExpenseDetailsComponent } from 'app/views/customer/customer-home/final-wishes/final-wishes-details/expense-details.component';
import { FinalWishesFormModalComponent } from 'app/views/customer/customer-home/final-wishes/final-wishes-form-modal/final-wishes-form-modal.component';
import { LettersMessagesListingComponent } from 'app/views/customer/customer-home/legacy-life-letters-messages/letters-messages-listing/letters-messages-listing.component';
import { LettersMessagesDetailsComponent } from 'app/views/customer/customer-home/legacy-life-letters-messages/letters-messages-details/letters-messages-details.component';
import { LettersMessagesModelComponent } from 'app/views/customer/customer-home/legacy-life-letters-messages/letters-messages-model/letters-messages-model.component';
import { AdvisorLegacyDetailsComponent } from 'app/views/advisor-legacy-details/advisor-legacy-details.component';
import { ErrorComponent } from 'app/views/error/error.component';
import { CoachsCornerComponent } from './components/coachs-corner/coachs-corner.component';
import { CcRightPanelComponent } from './components/cc-right-panel/cc-right-panel.component';
import { CcDetailedViewComponent } from './components/cc-detailed-view/cc-detailed-view.component';
import { CcShareViaEmailModelComponent } from './components/cc-share-via-email-model/cc-share-via-email-model.component';
import { AdvertisementPaymentComponent } from './components/advertisement-payment/advertisement-payment.component';
import { FileHandlingService } from './services/file-handling.service';
import { ChatService } from './services/chat.service';
//import { AppChatsModule } from './components/app-chats/app-chats.module';
import { AppChatsComponent } from './components/app-chats/app-chats.component';
import { ChatLeftSidenavComponent } from './components/app-chats/chat-left-sidenav/chat-left-sidenav.component';
import { ChatContentsComponent } from './components/app-chats/chat-contents/chat-contents.component';

import { FuneralServiceModalComponent } from 'app/views/customer/customer-home/final-wishes/funeral-service-modal/funeral-service-modal.component';  
import { CelebrationofLifeComponent } from 'app/views/customer/customer-home/final-wishes/celebrationof-life/celebrationof-life.component';
import { ObituaryModalComponent } from 'app/views/customer/customer-home/final-wishes/obituary-modal/obituary-modal.component';
import { FuneralExpensesModalComponent } from 'app/views/customer/customer-home/final-wishes/funeral-expenses-modal/funeral-expenses-modal.component';
/* 
  Only Required if you want to use Angular Landing
  (https://themeforest.net/item/angular-landing-material-design-angular-app-landing-page/21198258)
*/

const classesToInclude = [
  HeaderTopComponent,
  customerHeaderTopComponent,
  AdvisorHeaderTopComponent,
  LandingAdvisorHeaderTopComponent,
  LandingCustomerHeaderTopComponent,
  SidebarTopComponent,
  SidenavComponent,
  NotificationsComponent,
  SidebarSideComponent,
  HeaderSideComponent,
  AdminLayoutComponent,
  AdvisorLayoutComponent,
  AuthLayoutComponent,
  CustomerLayoutComponent,
  LandingLayoutComponent,
  AdvisorLandingLayoutComponent,
  BreadcrumbComponent,
  AppComfirmComponent,
  ReferNEarnPopUpComponent,
  AppLoaderComponent,
  CustomizerComponent,
  FontSizeDirective,
  ScrollToDirective,
  AppDropdownDirective,
  DropdownAnchorDirective,
  DropdownLinkDirective,
  EgretSideNavToggleDirective,
  RelativeTimePipe,
  ExcerptPipe,
  GetValueByKeyPipe,
  ThousandSuffixesPipe,
  TodosListingComponent,
  TodosComponent,
  CardDetailsComponent,
  AdvertisementPaymentModalComponent,
  InviteComponent,
  PetsListComponent,
  PetsDetailsComponent,
  legacySettingPageComponent,
  PetsModalComponent,
  legacySettingModalComponent,
  CustomerEssentialDayOneComponent,
  PersonalProfileModalComponent,
  CustomerEssentialDetailsComponent,
  CustomerEssentialDetailsIdboxComponent,
  EssenioalIdBoxComponent,
  essentialsMyProfessionalsComponent,
  EssentialsMyProfessionalsDetailsComponent,
  SpecialNeedsListingComponent,
  SpecialNeedsDetailsComponent,
  SpecialNeedsModelComponent,
  DeviceDetailsComponent,
  ElectronicMediaDetailsComponent,
  DigitalPublicationsDetailsComponent,
  PasswordsDigitalAssetsListComponent,
  DevicesModalComponent,
  ElectronicMediaModalComponent,
  DigitalPublicationsModalComponent,
  DebtDetailsComponent,
  EmergencyContactsComponent,
  EmergencyContactsDetailsComponent,
  ListingComponent,
  DetailsComponent,
  DetailsVehiclesComponent,
  DetailsAssetsComponent,
  AssetsModelComponent,
  VehicleModelComponent,
  RealEstateModelComponent,
  TimeCapsuleListComponent,
  TimeCapsuleMoalComponent,
  TimeCapsuleDetailsComponent,
  legalStuffModalComponent,
  CustomerLegalStuffComponent,
  CustomerLegalStuffDetailsComponent,
  InsuranceFinanceDebtListComponent,
  InsuranceDetailsComponent,
  FinanceDetailsComponent,
  DebtDetailsComponent,
  InsuranceModalComponent,
  FinanceModalComponent,
  DebtModalComponent,
  FuneralServiceModalComponent, 
  CelebrationofLifeComponent,
  ObituaryModalComponent, 
  FuneralExpensesModalComponent,
  FinalWishesComponent,
  FinalWishesDetailsComponent,
  ObituaryDetailsComponent,
  CelebrationDetailsComponent,
  FuneralPlansDetailsComponent,
  ExpenseDetailsComponent,
  FinalWishesFormModalComponent,
  LettersMessagesListingComponent,
  LettersMessagesDetailsComponent,
  LettersMessagesModelComponent,
  AdvisorLegacyDetailsComponent,
  ErrorComponent,
  CoachsCornerComponent,
  CcRightPanelComponent,
  CcDetailedViewComponent,
  CcShareViaEmailModelComponent,
  AdvertisementPaymentComponent,AppChatsComponent,ChatLeftSidenavComponent,ChatContentsComponent
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    FlexLayoutModule,
    TranslateModule,
    MatSidenavModule,
    MatListModule,
    MatTooltipModule,
    MatOptionModule,
    MatSelectModule,
    MatMenuModule,
    MatSnackBarModule,
    MatGridListModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatRadioModule,
    MatCheckboxModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatDialogModule,
    PerfectScrollbarModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatTabsModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatSliderModule,
    DragDropModule,
    FileUploadModule,
    MatStepperModule,
    IconsModule,
    PickerModule
    //AppChatsModule
  ],
  entryComponents: [
    AppComfirmComponent, AppLoaderComponent,TodosComponent, CardDetailsComponent,ReferNEarnPopUpComponent,
    PetsModalComponent,legacySettingModalComponent,PersonalProfileModalComponent,EssenioalIdBoxComponent,essentialsMyProfessionalsComponent,SpecialNeedsModelComponent,
    DevicesModalComponent,ElectronicMediaModalComponent,DigitalPublicationsModalComponent,AssetsModelComponent,
    VehicleModelComponent,RealEstateModelComponent,TimeCapsuleMoalComponent,legalStuffModalComponent,InsuranceModalComponent,
    FinanceModalComponent,DebtModalComponent,FinalWishesFormModalComponent,LettersMessagesModelComponent, InviteComponent, CcShareViaEmailModelComponent,
    AdvertisementPaymentModalComponent,AppChatsComponent,ChatLeftSidenavComponent, ChatContentsComponent, FuneralServiceModalComponent, CelebrationofLifeComponent,
    ObituaryModalComponent, FuneralExpensesModalComponent
  ],
  providers: [
    ThemeService,
    LayoutService,
    DataSharingService,
    NavigationService,
    AdvisorNavigationService,
    CustNavService,
    AdvisorNavService,
    LandingAdvisorNavService,
    LandingCustomerNavService,
    RoutePartsService,
    AuthGuard,
    ProfilePicService,
    AppConfirmService,
    AppLoaderService,
    SubscriptionService,
    FileHandlingService,
    ChatService
    // LandingPageService    
  ],
  declarations: classesToInclude,
  exports: classesToInclude
})
export class SharedModule { }
