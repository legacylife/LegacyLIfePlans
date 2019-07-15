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
import { CountryEditCanDeactivateGuard } from '../../shared/services/country-edit-can-deactivate-guard.service';
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


export const CustomerRoutes: Routes = [
  {
    path: 'signup',
    component: AuthLayoutComponent,
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
            path: 'shared-lagacies',
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
            data: { title: 'Real Estates' }
          },
          {
            path: 'real-estate-detail-view/:id',
            component: DetailsComponent,
            data: { title: 'Real Estate Detail' }
          },
          {
            path: 'real-estate-vehicle-detail-view/:id',
            component: DetailsVehiclesComponent,
            data: { title: 'Real Estate Vehicle Detail' }
          },
          {
            path: 'real-estate-assets-detail-view/:id',
            component: DetailsAssetsComponent,
            data: { title: 'Real Assets Detail' }
          }, {
            path: 'final-wishes',
            component: FinalWishesComponent,
            data: { title: 'Final Wishes' }
          },
          {
            path: 'final-wishes-view/:id',
            component: FinalWishesDetailsComponent,
            data: { title: 'Final Wishes Details' }
          },
          {
            path: 'pets',
            component: PetsListComponent,
            data: { title: 'Pets List' }
          },
          {
            path: 'pets-view/:id',
            component: PetsDetailsComponent,
            data: { title: 'Pets View' }
          },   
          {
            path: 'time-capsule',
            component: TimeCapsuleListComponent,
            data: { title: 'Time Capsule List' }
          },         
          {
            path: 'time-capsule-view/:id',
            component: TimeCapsuleDetailsComponent,
            data: { title: 'Time Capsule Details' }
          },
          {
            path: 'special-needs',
            component: SpecialNeedsListingComponent,
            data: { title: 'Special Needs List' }
          },
          {
            path: 'special-needs-view/:id',
            component: SpecialNeedsDetailsComponent,
            data: { title: 'Special Needs Details' }
          },   
          {
            path: 'insurance-finance-debt',
            component: InsuranceFinanceDebtListComponent,
            data: { title: 'Insurance-Finance-Debt List' }
          },
          {
            path: 'insurance-view/:id',
            component: InsuranceDetailsComponent,
            data: { title: 'Insurance Details' }
          },
          {
            path: 'finance-view/:id',
            component: FinanceDetailsComponent,
            data: { title: 'Finance Details' }
          }, 
          {
            path: 'debt-view/:id',
            component: DebtDetailsComponent,
            data: { title: 'Debt Details' }
          },  
          {
            path: 'passwords-digital-assests',
            component: PasswordsDigitalAssetsListComponent,
            data: { title: 'Passwords Digital Assests List' }
          },         
          {
            path: 'device-view/:id',
            component: DeviceDetailsComponent,
            data: { title: 'Digital Devices' }
          },
          {
            path: 'letters-messages',
            component: LettersMessagesListingComponent,
            data: { title: 'Letters Messages List' }
          },         
          {
            path: 'letters-messages-view/:id',
            component: LettersMessagesDetailsComponent,
            data: { title: 'Letters Messages Details' }
          },
          {
            path: 'electronic-media-view/:id',
            component: ElectronicMediaDetailsComponent,
            data: { title: 'Electronic Media Details' }
          },
        ]
      },
    ]
  },
  {
    path: 'to-dos',
    component: CustomerLayoutComponent,
    children: [
      {
        path: '',
        component: TodosListingComponent,
        data: { title: 'To-Do\'s' }       
      }
    ]
  },
  {
    path: 'trustees',
    component: CustomerLayoutComponent,
    data: { title: '' },
    children: [
      {
        path: '',
        component: CustomerTrusteesComponent,
        canActivate: [UserAuthGuard],
        data: { title: 'Trustees List' },
        children: [
          {
            path: '',
            component: CustomerMyTrusteeComponent,
            data: { title: 'Trustees List' }
          },
          {
            path: 'my-people',
            component: CustomerMyPeopleComponent
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