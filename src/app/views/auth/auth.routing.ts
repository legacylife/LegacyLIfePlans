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

import { BusinessInfoComponent } from './advisor/business-info/business-info.component';

import { SigninComponent } from './signin/signin.component';
import { UpdateProfileComponent } from './customer/update-profile/update-profile.component';
import { SetPasswordComponent } from './advisor/set-password/set-password.component';
import { ThankYouComponent } from './advisor/thank-you/thank-you.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { PasswordResetSuccessfulComponent } from './password-reset-successful/password-reset-successful.component';

export const AuthRoutes: Routes = [
  {
    path: 'forgot-password',
      component: ForgotPasswordComponent,
      data: { title: 'Forgot password' }
  },
  {
    path: 'signin',
      component: SigninComponent,
      data: { title: 'SignIn' }
  },
  {
    path: 'reset-password',
      component: ResetPasswordComponent,
      data: { title: 'reset password' }
  },
  {
    path: 'password-reset-successful',
      component: PasswordResetSuccessfulComponent,
      data: { title: 'reset password' }
  },
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
      path: 'update-profile',
      component: UpdateProfileComponent,
      data: { title: 'Update Profile' }
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
      path: 'businessinfo',
      component: BusinessInfoComponent,
      data: { title: 'BusinessInfo' }
    }, {
      path: 'forgot-password',
      component: ForgotPasswordComponent,
      data: { title: 'Forgot password' }
    }, {
      path: 'set-password',
      component: SetPasswordComponent,
      data: { title: 'Set Password' }
    }, {
      path: 'thank-you',
      component: ThankYouComponent,
      data: { title: 'Thank You' }
    }]
  },

  {
    path: 'admin',
    children: [{
      path: 'signup',
      component: AdminSignupComponent,
      data: { title: 'Advisor Signup' }
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
    } ]
  }

];