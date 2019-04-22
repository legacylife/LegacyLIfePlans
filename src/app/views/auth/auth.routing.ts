import { Routes } from '@angular/router';

import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LockscreenComponent } from './lockscreen/lockscreen.component';

import { NotFoundComponent } from './not-found/not-found.component';
import { ErrorComponent } from './error/error.component';

import { AdvisorSigninComponent } from './advisor/signin/signin.component';
import { AdvisorSignupComponent } from './advisor/signup/signup.component';

import { CustomerSignupComponent } from './customer/signup/signup.component';
import { CustomerSigninComponent } from './customer/signin/signin.component';

import { AdminSignupComponent } from './admin/signup/signup.component';
import { AdminSigninComponent } from './admin/signin/signin.component';

export const AuthRoutes: Routes = [
  {
    path: 'customer',
    children: [{
      path: 'signup',
      component: CustomerSignupComponent,
      data: { title: 'Customer Signup' }
    }, {
      path: 'signin',
      component: CustomerSigninComponent,
      data: { title: 'Customer Signin' }
    }, {
      path: 'forgot-password',
      component: ForgotPasswordComponent,
      data: { title: 'Forgot password' }
    }, {
      path: 'lockscreen',
      component: LockscreenComponent,
      data: { title: 'Lockscreen' }
    }, {
      path: '404',
      component: NotFoundComponent,
      data: { title: 'Not Found' }
    }, {
      path: 'error',
      component: ErrorComponent,
      data: { title: 'Error' }
    }]
  }, 
  
  {
    path: 'advisor',
    children: [{
      path: 'signup',
      component: AdvisorSignupComponent,
      data: { title: 'Advisor Signup' }
    }, {
      path: 'signin',
      component: AdvisorSigninComponent,
      data: { title: 'Advisor Signin' }
    }, {
      path: 'forgot-password',
      component: ForgotPasswordComponent,
      data: { title: 'Forgot password' }
    }, {
      path: 'lockscreen',
      component: LockscreenComponent,
      data: { title: 'Lockscreen' }
    }, {
      path: '404',
      component: NotFoundComponent,
      data: { title: 'Not Found' }
    }, {
      path: 'error',
      component: ErrorComponent,
      data: { title: 'Error' }
    }]
  },

  {
    path: 'admin',
    children: [{
      path: 'signup',
      component: AdminSignupComponent,
      data: { title: 'Advisor Signup' }
    }, {
      path: 'signin',
      component: AdminSigninComponent,
      data: { title: 'Advisor Signin' }
    }, {
      path: 'forgot-password',
      component: ForgotPasswordComponent,
      data: { title: 'Forgot password' }
    }, {
      path: 'lockscreen',
      component: LockscreenComponent,
      data: { title: 'Lockscreen' }
    }, {
      path: '404',
      component: NotFoundComponent,
      data: { title: 'Not Found' }
    }, {
      path: 'error',
      component: ErrorComponent,
      data: { title: 'Error' }
    }]
  }

];