import { Routes } from '@angular/router';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LockscreenComponent } from './lockscreen/lockscreen.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ErrorComponent } from './error/error.component';
//import { BusinessInfoComponent } from './../advisor/business-info/business-info.component';
import { SigninComponent } from './signin/signin.component';
//import { UpdateProfileComponent } from './../customer/update-profile/update-profile.component';
//import { SetPasswordComponent } from './../advisor/set-password/set-password.component';
//import { ThankYouComponent } from './../advisor/thank-you/thank-you.component';
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
  }

];