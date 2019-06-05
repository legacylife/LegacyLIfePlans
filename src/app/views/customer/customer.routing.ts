import { Routes } from '@angular/router';
import { CustomerSignupComponent } from './signup/signup.component';
import { UpdateProfileComponent } from './update-profile/update-profile.component';
import { CustomerHomeComponent } from './customer-home/customer-home.component';
import { CustomerAccountSettingComponent } from './customer-account-setting/customer-account-setting.component';
import { CustomerLayoutComponent } from '../../shared/components/layouts/customer-layout/customer-layout.component';
import { AuthLayoutComponent } from '../../shared/components/layouts/auth-layout/auth-layout.component';
import { UserAuthGuard } from '../../shared/services/auth/userauth.guard';
import { UserPreAuthGuard } from '../../shared/services/auth/userpreauth.guard';
import { CanDeactivateGuard } from '../../shared/services/can-deactivate-guard.service';
import { CountryEditCanDeactivateGuard } from '../../shared/services/country-edit-can-deactivate-guard.service';
import { CustomerSubscriptionComponent } from './customer-subscription/customer-subscription.component';
import { CustomerTrusteesComponent } from './customer-trustees/customer-trustees.component';
import { CustomerProfessionalComponent } from './customer-professionals/customer-professionals.component';
export const CustomerRoutes: Routes = [
  {
    path: 'signup',
    component: AuthLayoutComponent,
    children : [
      { 
        path: '',
        component: CustomerSignupComponent, 
        canActivate: [ UserPreAuthGuard ]
      }
    ],
  },/*{
    path: '',
    component: AuthLayoutComponent,
    loadChildren: './auth/auth.module#AuthModule',
  },*/
  {
    path: 'dashboard',
    component: CustomerLayoutComponent,
    children : [
      { 
        path: '',
        component: CustomerHomeComponent,
        canActivate: [ UserAuthGuard ]
        
      }
    ] 
       
  },{
    path: 'update-profile',
    component: AuthLayoutComponent,
    children : [
      { 
        path: '',
        component: UpdateProfileComponent,
        canActivate: [ UserAuthGuard ]
      }
    ]
  },{
    path: 'account-setting',
    component: CustomerLayoutComponent,
    children : [
      { 
        path: '',
        component: CustomerAccountSettingComponent,
        canActivate: [ UserAuthGuard ],
        canDeactivate: [CountryEditCanDeactivateGuard]    
      }
    ]
  },{
    path: 'customer-subscription',
    component: CustomerLayoutComponent,
    children : [
      { 
        path: '',
        component: CustomerSubscriptionComponent,
        canActivate: [ UserAuthGuard ]
      }
    ]
  },{
    path: 'professionals',
    component: CustomerLayoutComponent,
    children : [
      { 
        path: '',
        component: CustomerProfessionalComponent,
        canActivate: [ UserAuthGuard ]
      }
    ]
  },{
    path: 'trustees',
    component: CustomerLayoutComponent,
    children : [
      { 
        path: '',
        component: CustomerTrusteesComponent,
        canActivate: [ UserAuthGuard ]
      }
    ]
  }

];