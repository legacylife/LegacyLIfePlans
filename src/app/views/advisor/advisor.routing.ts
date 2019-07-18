import { Routes } from '@angular/router';
import { AdvisorSignupComponent } from './signup/signup.component';
import { BusinessInfoComponent } from './business-info/business-info.component';
import { SetPasswordComponent } from './set-password/set-password.component';
import { ThankYouComponent } from './thank-you/thank-you.component';
import { AdvisorDashboardComponent } from './advisor-dashboard/advisor-dashboard.component';
import { LegaciesComponent } from './legacies/legacies.component';
import { AdvisorDashboardUpdateComponent } from './advisor-dashboard-update/advisor-dashboard-update.component';
import { AdvisorAccountSettingComponent } from './advisor-account-setting/advisor-account-setting.component';
import { AdvisorSubscriptionComponent } from './advisor-subscription/advisor-subscription.component';
import { AdvisorLayoutComponent } from './../../shared/components/layouts/advisor-layout/advisor-layout.component';
import { UserAuthGuard } from '../../shared/services/auth/userauth.guard';
import { UserPreAuthGuard } from '../../shared/services/auth/userpreauth.guard';
import { CanDeactivateGuard } from '../../shared/services/auth/can-deactivate.guard';
import { AuthLayoutComponent } from '../../shared/components/layouts/auth-layout/auth-layout.component';
import { AdvisorLandingLayoutComponent } from '../../shared/components/layouts/advisor-landing-layout/advisor-landing-layout.component';
import { HomeComponent } from './advisor-landing/home/home.component';
import { AdvisorLegacyDetailsComponent } from './advisor-legacy-details/advisor-legacy-details.component';
import { LegaciesDetailsLandingComponent } from './advisor-legacy-details/legacies-details-landing/legacies-details-landing.component';
import { GetFeaturedComponent } from './get-featured/get-featured.component';
import { AdvisorLeadsComponent } from './advisor-leads/advisor-leads.component';
import { AdvisorLeadsDetailsComponent } from './advisor-leads-details/advisor-leads-details.component';
import { TodosListingComponent } from '../todos-listing/todos-listing.component';
import { OurPlanComponent } from './our-plan/our-plan.component';
import { PetsListComponent } from '../customer/customer-home/pets/pets-list/pets-list.component';
import { PetsDetailsComponent } from '../customer/customer-home/pets/pets-details/pets-details.component';
import { AdvisorHomeComponent } from './advisor-home/advisor-home.component';
import { CustomerEssentialDayOneComponent } from '../customer/customer-home/customer-essential-day-one/customer-essential-day-one.component';
import { CustomerEssentialDetailsComponent } from '../customer/customer-home/customer-essential-details/customer-essential-details.component';
import { CustomerEssentialDetailsIdboxComponent } from '../customer/customer-home/customer-essential-details-idbox/customer-essential-details-idbox.component';
import { EssentialsMyProfessionalsDetailsComponent } from '../customer/customer-home/essentials-my-professionals-details/essentials-my-professionals-details.component';
import { SpecialNeedsListingComponent } from '../customer/customer-home/special-needs/special-needs-listing/special-needs-listing.component';
import { SpecialNeedsDetailsComponent } from '../customer/customer-home/special-needs/special-needs-details/special-needs-details.component';
import { PasswordsDigitalAssetsListComponent } from '../customer/customer-home/passwords-digital-assets/passwords-digital-assets-list/passwords-digital-assets-list.component';
import { DeviceDetailsComponent } from '../customer/customer-home/passwords-digital-assets/devices/device-details/device-details.component';
import { DebtDetailsComponent } from '../customer/customer-home/insurance-finance-debt/debt-details/debt-details.component';
import { ElectronicMediaDetailsComponent } from '../customer/customer-home/passwords-digital-assets/electronic-media/electronic-media-details/electronic-media-details.component';
import { EmergencyContactsComponent } from '../customer/customer-home/emergency-contacts/emergency-contacts.component';
import { EmergencyContactsDetailsComponent } from '../customer/customer-home/emergency-contacts-details/emergency-contacts-details.component';
import { ListingComponent } from '../customer/customer-home/real-estate-assets/listing/listing.component';
import { DetailsComponent } from '../customer/customer-home/real-estate-assets/details/details.component';
import { DetailsVehiclesComponent } from '../customer/customer-home/real-estate-assets/details-vehicles/details-vehicles.component';
import { DetailsAssetsComponent } from '../customer/customer-home/real-estate-assets/details-assets/details-assets.component';
import { TimeCapsuleListComponent } from '../customer/customer-home/time-capsule/time-capsule-list/time-capsule-list.component';
import { TimeCapsuleDetailsComponent } from '../customer/customer-home/time-capsule/time-capsule-details/time-capsule-details.component';
import { CustomerLegalStuffDetailsComponent } from '../customer/customer-home/customer-legal-stuff-details/customer-legal-stuff-details.component';
import { CustomerLegalStuffComponent } from '../customer/customer-home/customer-legal-stuff/customer-legal-stuff.component';
import { InsuranceFinanceDebtListComponent } from '../customer/customer-home/insurance-finance-debt/insurance-finance-debt-list/insurance-finance-debt-list.component';
import { InsuranceDetailsComponent } from '../customer/customer-home/insurance-finance-debt/insurance-details/insurance-details.component';
import { FinanceDetailsComponent } from '../customer/customer-home/insurance-finance-debt/finance-details/finance-details.component';
import { FinalWishesComponent } from '../customer/customer-home/final-wishes/final-wishes-list/final-wishes-list.component';
import { FinalWishesDetailsComponent } from '../customer/customer-home/final-wishes/final-wishes-details/final-wishes-details.component';
import { LettersMessagesListingComponent } from '../customer/customer-home/legacy-life-letters-messages/letters-messages-listing/letters-messages-listing.component';
import { LettersMessagesDetailsComponent } from '../customer/customer-home/legacy-life-letters-messages/letters-messages-details/letters-messages-details.component';
console.log('advisor---routing');
export const AdvisorRoutes: Routes = [
  {
    path: '',
    component: AdvisorLandingLayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
        canActivate: [UserPreAuthGuard]
      }
    ],
  },
  {
    path: 'our-plan',
    component: AdvisorLandingLayoutComponent,
    children: [
      {
        path: '',
        component: OurPlanComponent,
        canActivate: [UserPreAuthGuard]
      }
    ],
  },
  {
    path: 'signin',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        component: AdvisorSignupComponent,
        canActivate: [UserPreAuthGuard],
        data: { title: 'Advisor Singin' }
      }
    ],
  },
  {
    path: 'set-password/:id',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        component: SetPasswordComponent,
        canActivate: [UserPreAuthGuard],
        data: { title: 'Set Password' }
      }
    ],

  },
  {
    path: 'signup',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        component: AdvisorSignupComponent,
        canActivate: [UserPreAuthGuard],
        data: { title: 'Advisor Signup' }
      }
    ],

  },
  {
    path: 'business-info',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        component: BusinessInfoComponent,
        canActivate: [UserPreAuthGuard],
        data: { title: 'Business Info' }
      }
    ]
  },
  {
    path: 'thank-you',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        component: ThankYouComponent,
        canActivate: [UserPreAuthGuard],
        data: { title: 'Thank You' }
      }
    ]
  },
  {
    path: 'dashboard',
    component: AdvisorLayoutComponent,
    children: [
      {
        path: '',
        component: AdvisorDashboardComponent,
        canActivate: [UserAuthGuard],
        data: { title: 'Dashboard' }
      }
    ]
  },
  {
    path: 'dashboard-updates',
    component: AdvisorLayoutComponent,
    children: [
      {
        path: '',
        component: AdvisorDashboardUpdateComponent,
        canActivate: [UserAuthGuard],
        data: { title: 'Dashboard Updates' }
      }
    ]
  }, {
    path: 'account-setting',
    component: AdvisorLayoutComponent,
    data: { title: 'Account Setting' },
    children: [
      {
        path: '',
        component: AdvisorAccountSettingComponent,
        canActivate: [UserAuthGuard],
        canDeactivate: [CanDeactivateGuard],
        data: { title: 'Account Setting' }
      }
    ],
  },
  {
    path: 'shared-legacies',
    component: AdvisorLayoutComponent,
    data: { title: 'Legacies List' },
    children: [
      {
        path: '',
        component: LegaciesComponent,
        canActivate: [UserAuthGuard],
        data: { title: 'Legacies List' }
      }
    ]
  },
  {
    path: 'legacies',
    component: AdvisorLayoutComponent,
    children: [
      {
        path: '',
        component: AdvisorHomeComponent,
        canActivate: [UserAuthGuard],
        children: [
          {
            path: 'customer-day-one/:id',
            component: CustomerEssentialDayOneComponent
          },
          {
            path: 'customer-day-two/:id',
            component: CustomerEssentialDayOneComponent
          },
          {
            path: 'customer-essential/:id',
            component: CustomerEssentialDayOneComponent
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
            component: CustomerEssentialDayOneComponent // temp
          },
          {
            path: 'legacies-details/:id',
            component: CustomerEssentialDayOneComponent // temp
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
    path: 'leads',
    component: AdvisorLayoutComponent,
    data: { title: 'Leads List' },
    children: [
      {
        path: '',
        component: AdvisorLeadsComponent,
        canActivate: [UserAuthGuard],
        data: { title: 'Leads List' }
      }
    ]
  },
  {
    path: 'leads-details/:id',
    component: AdvisorLayoutComponent,
    data: { title: 'Leads Details' },
    children: [
      {
        path: '',
        component: AdvisorLeadsDetailsComponent,
        canActivate: [UserAuthGuard],
        data: { title: 'Leads Details' }
      }
    ]
  },
  {
    path: 'legacies-details',
    component: AdvisorLayoutComponent,   
    data: { title: ''},
    children: [
      {
        path: '',
        component: AdvisorLegacyDetailsComponent,
        canActivate: [UserAuthGuard],
        children: [
          {
            path: 'user-legacies-detail',
            component: LegaciesDetailsLandingComponent,
            data: { title: 'Legacies Details' }
          }
        ]
      }
    ]
  },
  {
    path: 'to-dos',
    component: AdvisorLayoutComponent,
    data: { title: 'Todo\'s' },
    children: [
      {
        path: '',
        component: TodosListingComponent,
        data: { title: 'Todo\'s' }
      }
    ]
  },
  {
    path: 'get-featured',
    component: AdvisorLayoutComponent,
    data: { title: 'Get Featured' },
    children: [
      {
        path: '',
        component: GetFeaturedComponent,
        canActivate: [UserAuthGuard],
        data: { title: 'Get Featured' }
      }
    ]
  },
  {
    path: 'subscription',
    component: AdvisorLayoutComponent,
    data: { title: 'Subscription' },
    children: [
      {
        path: '',
        component: AdvisorSubscriptionComponent,
        canActivate: [UserAuthGuard],
        data: { title: 'Subscription' }
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  },
];