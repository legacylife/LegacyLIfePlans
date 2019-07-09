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
        canActivate: [UserPreAuthGuard]
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
            component: CustomerDashboardDayOneComponent
          },
          {
            path: 'customer-day-two',
            component: CustomerDashboardComponent
          },
          {
            path: 'customer-essential',
            component: CustomerHomeEssentialComponent
          },
          {
            path: 'essential-day-one',
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
            path: 'shared-lagacies',
            component: CustomerSharedLegaciesComponent
          },
          {
            path: 'lagacies-details',
            component: CustomerLegaciesDetailsComponent
          },
          {
            path: 'legal-stuff',
            component: CustomerLegalStuffComponent
          },
          {
            path: 'emergency-contacts',
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
            path: 'real-estate-assets',
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
            path: 'final-wishes',
            component: FinalWishesComponent
          },
          {
            path: 'final-wishes-view/:id',
            component: FinalWishesDetailsComponent
          },
          {
            path: 'pets',
            component: PetsListComponent
          },
          {
            path: 'pets-view/:id',
            component: PetsDetailsComponent
          },   
          {
            path: 'time-capsule',
            component: TimeCapsuleListComponent
          },         
          {
            path: 'time-capsule-view/:id',
            component: TimeCapsuleDetailsComponent
          },
          {
            path: 'special-needs',
            component: SpecialNeedsListingComponent
          },
          {
            path: 'special-needs-view/:id',
            component: SpecialNeedsDetailsComponent
          },   
          {
            path: 'insurance-finance-debt',
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
            path: 'passwords-digital-assests',
            component: PasswordsDigitalAssetsListComponent
          },         
          {
            path: 'device-view/:id',
            component: DeviceDetailsComponent
          },
          {
            path: 'letters-messages',
            component: LettersMessagesListingComponent
          },         
          {
            path: 'letters-messages-view/:id',
            component: LettersMessagesDetailsComponent
          },
          {
            path: 'electronic-media-view/:id',
            component: ElectronicMediaDetailsComponent
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
        component: TodosListingComponent       
      }
    ]
  },
  {
    path: 'trustees',
    component: CustomerLayoutComponent,
    children: [
      {
        path: '',
        component: CustomerTrusteesComponent,
        canActivate: [UserAuthGuard],
        children: [
          {
            path: '',
            component: CustomerMyTrusteeComponent
          },
          {
            path: 'my-people',
            component: CustomerMyPeopleComponent
          },          
          {
            path: 'hired-advisor',
            component: CustomerHiredAdvisorComponent
          }
        ]
      },
    ]
  },

  {
    path: 'professionals2',
    component: CustomerLayoutComponent,
    children: [
      {      
        children: [
          {
            path: 'prof-details2/:id',
            component: CustomerProfessionalComponent
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
            component: ProfAdvisorListingComponent
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
        canActivate: [UserAuthGuard]
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
        canDeactivate: [CanDeactivateGuard]
      }
    ]
  }, {
    path: 'customer-subscription',
    component: CustomerLayoutComponent,
    children: [
      {
        path: '',
        component: CustomerSubscriptionComponent,
        canActivate: [UserAuthGuard]
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