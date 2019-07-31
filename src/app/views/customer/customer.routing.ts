import { Routes } from '@angular/router';
import { CustomerSignupComponent } from './signup/signup.component';
import { UpdateProfileComponent } from './update-profile/update-profile.component';
import { CustomerHomeComponent } from './customer-home/customer-home.component';
import { CustomerAccountSettingComponent } from './customer-account-setting/customer-account-setting.component';
import { CustomerLayoutComponent } from '../../shared/components/layouts/customer-layout/customer-layout.component';
import { AuthLayoutComponent } from '../../shared/components/layouts/auth-layout/auth-layout.component';
import { UserAuthGuard } from '../../shared/services/auth/userauth.guard';
import { UserPreAuthGuard } from '../../shared/services/auth/userpreauth.guard';
import { CanDeactivateGuard } from '../../shared/services/auth/can-deactivate.guard';
//import { CountryEditCanDeactivateGuard } from '../../shared/services/country-edit-can-deactivate-guard.service';
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
import { EssentialsMyProfessionalsDetailsComponent } from './customer-home/essentials-my-professionals-details/essentials-my-professionals-details.component';
import { CustomerSharedLegaciesComponent } from './customer-home/customer-shared-legacies/customer-shared-legacies.component';
import { CustomerLegaciesDetailsComponent } from './customer-home/customer-legacies-details/customer-legacies-details.component';
import { CustomerLegalStuffComponent } from './customer-home/customer-legal-stuff/customer-legal-stuff.component';
import { CustomerLegalStuffDetailsComponent } from './customer-home/customer-legal-stuff-details/customer-legal-stuff-details.component';
import { EmergencyContactsComponent } from './customer-home/emergency-contacts/emergency-contacts.component';
// trustees
import { CustomerMyPeopleComponent } from './customer-trustees/customer-my-people/customer-my-people.component';
import { CustomerMyTrusteeComponent } from './customer-trustees/customer-my-trustees/customer-my-trustees.component';
import { CustomerHiredAdvisorComponent } from './customer-trustees/customer-hired-advisors/customer-hired-advisors.component';
// Professional
import { CustomerProfessionalsLandingComponent } from './customer-professionals-landing/customer-professionals-landing.component';
import { CustomerProfDetailsComponent } from './customer-professionals/customer-professionals-details/customer-professionals-details.component';
import { ProfAdvisorListingComponent } from './customer-professionals-landing/prof-advisor-listing/prof-advisor-listing.component';
import { ListingComponent } from './customer-home/real-estate-assets/listing/listing.component';
import { DetailsComponent } from './customer-home/real-estate-assets/details/details.component';
import { DetailsAssetsComponent } from './customer-home/real-estate-assets/details-assets/details-assets.component';
import { DetailsVehiclesComponent } from './customer-home/real-estate-assets/details-vehicles/details-vehicles.component';
//final-wishes
import { FinalWishesComponent } from './customer-home/final-wishes/final-wishes-list/final-wishes-list.component';
import { FinalWishesDetailsComponent } from './customer-home/final-wishes/final-wishes-details/final-wishes-details.component';
//Pets
import { PetsListComponent } from './customer-home/pets/pets-list/pets-list.component';
import { PetsDetailsComponent } from './customer-home/pets/pets-details/pets-details.component';
//Time capsule
import { TimeCapsuleListComponent } from './customer-home/time-capsule/time-capsule-list/time-capsule-list.component';
import { TimeCapsuleDetailsComponent } from './customer-home/time-capsule/time-capsule-details/time-capsule-details.component';
import { SpecialNeedsDetailsComponent } from './customer-home/special-needs/special-needs-details/special-needs-details.component';
import { SpecialNeedsListingComponent } from './customer-home/special-needs/special-needs-listing/special-needs-listing.component';
//Insurance-Finance-Debt
import { InsuranceFinanceDebtListComponent } from './customer-home/insurance-finance-debt/insurance-finance-debt-list/insurance-finance-debt-list.component';
import { InsuranceDetailsComponent } from './customer-home/insurance-finance-debt/insurance-details/insurance-details.component';
import { FinanceDetailsComponent } from './customer-home/insurance-finance-debt/finance-details/finance-details.component';
import { DebtDetailsComponent } from './customer-home/insurance-finance-debt/debt-details/debt-details.component';
//passwords-digital-assets
import { PasswordsDigitalAssetsListComponent } from './customer-home/passwords-digital-assets/passwords-digital-assets-list/passwords-digital-assets-list.component';
import { DeviceDetailsComponent } from './customer-home/passwords-digital-assets/devices/device-details/device-details.component';
import { LettersMessagesListingComponent } from './customer-home/legacy-life-letters-messages/letters-messages-listing/letters-messages-listing.component';
import { LettersMessagesDetailsComponent } from './customer-home/legacy-life-letters-messages/letters-messages-details/letters-messages-details.component';
import { ElectronicMediaDetailsComponent } from './customer-home/passwords-digital-assets/electronic-media/electronic-media-details/electronic-media-details.component';
import { TodosListingComponent } from '../todos-listing/todos-listing.component';
import { ProUserAuthGuard as ProUserGuard } from '../../shared/services/auth/prouserauth.guard';
import { ErrorComponent } from './../error/error.component';
import { LandingLayoutComponent } from '../../shared/components/layouts/landing-layout/landing-layout.component';
console.log("cutostomer routing...")
export const CustomerRoutes: Routes = [
  {
    path: '',
    component: LandingLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: './views/landing/landing.module#LandingModule',
        data: { title: 'LLP'}
      }
    ]
  },
  {
    path: 'signup',
    component: AuthLayoutComponent,
    data: { title: '' },
    children: [
      {
        path: '',
        component: CustomerSignupComponent,
        canActivate: [UserPreAuthGuard],
        data: { title: 'Customer Signup' }
      }
    ],
  },
  {
    path: 'dashboard',
    component: CustomerLayoutComponent,
    children: [
      {
        path: '',
        component: CustomerHomeComponent,
        canActivate: [UserAuthGuard],
        children: [
          {
            path: '',
            // component: CustomerDashboardComponent
            component: CustomerDashboardDayOneComponent
          },
          {
            path: 'customer-day-one',
            component: CustomerDashboardDayOneComponent,
            data: { title: 'Dashboard' }
          },
          {
            path: 'customer-day-two',
            component: CustomerDashboardComponent,
            data: { title: 'Dashboard' }
          },
          {
            path: 'customer-essential',
            component: CustomerHomeEssentialComponent,
            data: { title: 'Essentials' }
          },
          {
            path: 'essential-day-one',
            component: CustomerEssentialDayOneComponent,
            data: { title: 'My Essentials' }
          },
          {
            path: 'essential-detail-view/:id',
            component: CustomerEssentialDetailsComponent,
            data: { title: 'My Essentials Detail' }
          },
          {
            path: 'essential-detail-idbox/:id',
            component: CustomerEssentialDetailsIdboxComponent,
            data: { title: 'My Essentials Detail' }
          },
          {
            path: 'essential-professionals-detail/:id',
            component: EssentialsMyProfessionalsDetailsComponent,
            data: { title: 'Professionals Detail' }
          },
          {
            path: 'shared-legacies',
            component: CustomerSharedLegaciesComponent,
            data: { title: 'Shared Lagacies' }
          },
          {
            path: 'lagacies-details',
            component: CustomerLegaciesDetailsComponent,
            data: { title: 'Lagacies Details' }
          },
          {
            path: 'legal-stuff',
            component: CustomerLegalStuffComponent,
            data: { title: 'Legal-Stuff List' }
          },
	        {
            path: 'legal-detail-view/:id',
            component: CustomerLegalStuffDetailsComponent,
            data: { title: 'Legal-Stuff Detail' }
          },
          {
            path: 'emergency-contacts',
            component: EmergencyContactsComponent,
            data: { title: 'Emergency Contacts' }
          },
          {
            path: 'emergency-contacts-details/:id',
            component: EmergencyContactsDetailsComponent,
            data: { title: 'Emergency Contacts Details' }
          },
          {
            path: 'real-estate-assets',
            component: ListingComponent,
            canActivate: [ProUserGuard],
            data: { title: 'Real Estates' }
          },
          {
            path: 'real-estate-detail-view/:id',
            component: DetailsComponent,
            canActivate: [ProUserGuard],
            data: { title: 'Real Estate Detail' }
          },
          {
            path: 'real-estate-vehicle-detail-view/:id',
            component: DetailsVehiclesComponent,
            canActivate: [ProUserGuard],
            data: { title: 'Real Estate Vehicle Detail' }
          },
          {
            path: 'real-estate-assets-detail-view/:id',
            component: DetailsAssetsComponent,
            canActivate: [ProUserGuard],
            data: { title: 'Real Assets Detail' }
          }, {
            path: 'final-wishes',
            component: FinalWishesComponent,
            canActivate: [ProUserGuard],
            data: { title: 'Final Wishes' }
          },
          {
            path: 'final-wishes-view/:id',
            component: FinalWishesDetailsComponent,
            canActivate: [ProUserGuard],
            data: { title: 'Final Wishes Details' }
          },
          {
            path: 'pets',
            component: PetsListComponent,
            canActivate: [ProUserGuard],
            data: { title: 'Pets List' }
          },
          {
            path: 'pets-view/:id',
            component: PetsDetailsComponent,
            canActivate: [ProUserGuard],
            data: { title: 'Pets View' }
          },   
          {
            path: 'time-capsule',
            component: TimeCapsuleListComponent,
            canActivate: [ProUserGuard],
            data: { title: 'Time Capsule List' }
          },         
          {
            path: 'time-capsule-view/:id',
            component: TimeCapsuleDetailsComponent,
            canActivate: [ProUserGuard],
            data: { title: 'Time Capsule Details' }
          },
          {
            path: 'special-needs',
            component: SpecialNeedsListingComponent,
            canActivate: [ProUserGuard],
            data: { title: 'Special Needs List' }
          },
          {
            path: 'special-needs-view/:id',
            component: SpecialNeedsDetailsComponent,
            canActivate: [ProUserGuard],
            data: { title: 'Special Needs Details' }
          },   
          {
            path: 'insurance-finance-debt',
            component: InsuranceFinanceDebtListComponent,
            canActivate: [ProUserGuard],
            data: { title: 'Insurance-Finance-Debt List' }
          },
          {
            path: 'insurance-view/:id',
            component: InsuranceDetailsComponent,
            canActivate: [ProUserGuard],
            data: { title: 'Insurance Details' }
          },
          {
            path: 'finance-view/:id',
            component: FinanceDetailsComponent,
            canActivate: [ProUserGuard],
            data: { title: 'Finance Details' }
          }, 
          {
            path: 'debt-view/:id',
            component: DebtDetailsComponent,
            canActivate: [ProUserGuard],
            data: { title: 'Debt Details' }
          },  
          {
            path: 'passwords-digital-assests',
            component: PasswordsDigitalAssetsListComponent,
            canActivate: [ProUserGuard],
            data: { title: 'Passwords Digital Assests List' }
          },         
          {
            path: 'device-view/:id',
            component: DeviceDetailsComponent,
            canActivate: [ProUserGuard],
            data: { title: 'Digital Devices' }
          },
          {
            path: 'letters-messages',
            component: LettersMessagesListingComponent,
            canActivate: [ProUserGuard],
            data: { title: 'Letters Messages List' }
          },         
          {
            path: 'letters-messages-view/:id',
            component: LettersMessagesDetailsComponent,
            canActivate: [ProUserGuard],
            data: { title: 'Letters Messages Details' }
          },
          {
            path: 'electronic-media-view/:id',
            component: ElectronicMediaDetailsComponent,
            canActivate: [ProUserGuard],
            data: { title: 'Electronic Media Details' }
          },
        ]
      },
    ]
  },
  {
    path: 'legacies',
    component: CustomerLayoutComponent,
    children: [
      {
        path: '',
        component: CustomerHomeComponent,
        canActivate: [UserAuthGuard],
        children: [
          {
            path: 'customer-day-one/:id',
            component: CustomerDashboardDayOneComponent
          },
          {
            path: 'customer-day-two/:id',
            component: CustomerDashboardComponent
          },
          {
            path: 'customer-essential/:id',
            component: CustomerHomeEssentialComponent
          },
          {
            path: 'essential-day-one/:id',
            component: CustomerEssentialDayOneComponent
          },
          {
            path: 'essential-detail-view/:id',
            component: CustomerEssentialDetailsComponent
          },
          {
            path: 'essential-detail-idbox/:id',
            component: CustomerEssentialDetailsIdboxComponent
          },
          {
            path: 'essential-professionals-detail/:id',
            component: EssentialsMyProfessionalsDetailsComponent
          },
          {
            path: 'shared-legacies',
            component: CustomerSharedLegaciesComponent
          },
          {
            path: 'legacies-details/:id',
            component: CustomerLegaciesDetailsComponent
          },
          {
            path: 'legal-stuff/:id',
            component: CustomerLegalStuffComponent
          },
          {
            path: 'emergency-contacts/:id',
            component: EmergencyContactsComponent
          },
	        {
            path: 'legal-detail-view/:id',
            component: CustomerLegalStuffDetailsComponent
          },
          {
            path: 'emergency-contacts-details/:id',
            component: EmergencyContactsDetailsComponent
          },
          {
            path: 'real-estate-assets/:id',
            component: ListingComponent
          },
          {
            path: 'real-estate-detail-view/:id',
            component: DetailsComponent
          },
          {
            path: 'real-estate-vehicle-detail-view/:id',
            component: DetailsVehiclesComponent
          },
          {
            path: 'real-estate-assets-detail-view/:id',
            component: DetailsAssetsComponent
          }, {
            path: 'final-wishes/:id',
            component: FinalWishesComponent
          },
          {
            path: 'final-wishes-view/:id',
            component: FinalWishesDetailsComponent
          },
          {
            path: 'pets/:id',
            component: PetsListComponent
          },
          {
            path: 'pets-view/:id',
            component: PetsDetailsComponent
          },   
          {
            path: 'time-capsule/:id',
            component: TimeCapsuleListComponent
          },         
          {
            path: 'time-capsule-view/:id',
            component: TimeCapsuleDetailsComponent
          },
          {
            path: 'special-needs/:id',
            component: SpecialNeedsListingComponent
          },
          {
            path: 'special-needs-view/:id',
            component: SpecialNeedsDetailsComponent
          },   
          {
            path: 'insurance-finance-debt/:id',
            component: InsuranceFinanceDebtListComponent
          },
          {
            path: 'insurance-view/:id',
            component: InsuranceDetailsComponent
          },
          {
            path: 'finance-view/:id',
            component: FinanceDetailsComponent
          }, 
          {
            path: 'debt-view/:id',
            component: DebtDetailsComponent
          },  
          {
            path: 'passwords-digital-assests/:id',
            component: PasswordsDigitalAssetsListComponent
          },         
          {
            path: 'device-view/:id',
            component: DeviceDetailsComponent
          },
          {
            path: 'letters-messages/:id',
            component: LettersMessagesListingComponent
          },         
          {
            path: 'letters-messages-view/:id',
            component: LettersMessagesDetailsComponent
          },
          {
            path: 'electronic-media-view/:id',
            component: ElectronicMediaDetailsComponent
          }
        ]
      },
    ]
  },
  {
    path: 'to-dos',
    component: CustomerLayoutComponent,
    canActivate: [UserAuthGuard],
    children: [
      {
        path: '',
        component: TodosListingComponent,
        data: { title: 'To-Do\'s' }       
      }
    ]
  },
  {
    path: 'my-peoples',//path: 'trustees',
    component: CustomerLayoutComponent,
    canActivate: [UserAuthGuard],
    // data: { title: '' },
    children: [
      {
        path: '',
        component: CustomerTrusteesComponent,
        
        // data: { title: 'Trustees List' },
        children: [
          {
            path: 'trustees',
            component: CustomerMyTrusteeComponent,
            data: { title: 'Trustees List' }
          },
          {
            path: '',
            component: CustomerMyPeopleComponent,
            data: { title: 'My Peoples List' }
          },          
          {
            path: 'hired-advisor',
            component: CustomerHiredAdvisorComponent,
            data: { title: 'Hired Advisor List' }
          }
        ]
      },
    ]
  }, 
  {
    path: 'professionals',
    component: CustomerLayoutComponent,
    canActivate: [UserAuthGuard],
    children: [
      {
        path: 'prof-details/:id',
        component: CustomerProfessionalComponent,
        data: { title: 'Professionals List' }
        // canActivate: [UserAuthGuard],
        // children: [
        //   {
        //     path: 'prof-details/:id',
        //     component: CustomerProfDetailsComponent
        //   }
        // ]
      }
    ]
  },
  {
    path: 'professionals-landing',
    component: CustomerLayoutComponent,
    children: [
      {
        path: '',
        component: CustomerProfessionalsLandingComponent,
        canActivate: [UserAuthGuard],
        children: [
          {
            path: 'prof-advisor-listing',
            component: ProfAdvisorListingComponent,
            data: { title: 'Advisor listing' }
          }
        ]
      }
    ]
  },
  {
    path: 'update-profile',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        component: UpdateProfileComponent,
        canActivate: [UserAuthGuard],
        data: { title: 'Update Profile' }
      }
    ]
  }, {
    path: 'account-setting',
    component: CustomerLayoutComponent,
    children: [
      {
        path: '',
        component: CustomerAccountSettingComponent,
        canActivate: [UserAuthGuard],
        canDeactivate: [CanDeactivateGuard],
        data: { title: 'Account Setting' }
      }
    ]
  }, {
    path: 'customer-subscription',
    component: CustomerLayoutComponent,
    data: { title: 'Subscription' },
    children: [
      {
        path: '',
        component: CustomerSubscriptionComponent,
        canActivate: [UserAuthGuard],
        data: { title: 'Subscription' }
      }
    ]
  },
  {
    path: 'error',
    component: ErrorComponent,
    data: { title: 'Error Page' },
    children: [
      {
        path: '',
        component: CustomerLayoutComponent,
        data: { title: 'Error Page' }
      }
    ]
  },
  // {
  //   path: '**',
  //   redirectTo: '/customer/error'
  // }
  // {
  //   path: 'professionals',
  //   component: CustomerLayoutComponent,
  //   children: [
  //     {
  //       path: '',
  //       component: CustomerProfessionalComponent,
  //       canActivate: [UserAuthGuard]
  //     }
  //   ]
  // }

];