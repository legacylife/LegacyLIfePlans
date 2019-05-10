import { Routes } from '@angular/router';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LockscreenComponent } from './lockscreen/lockscreen.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ErrorComponent } from './error/error.component';
import { SigninComponent } from './signin/signin.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { PasswordResetSuccessfulComponent } from './password-reset-successful/password-reset-successful.component';
import { ForgotPasswordSuccessfulComponent } from './password-reset-successful/forgot-password-successful.component';

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
      path: 'reset-password/:id',
      component: ResetPasswordComponent,
      data: { title: 'reset password' }
  },
  {
    path: 'password-reset-success',
      component: PasswordResetSuccessfulComponent,
      data: { title: 'reset password' }
  }, {
    path: 'forgot-password-success',
    component: ForgotPasswordSuccessfulComponent,
    data: { title: 'Forgot password thank you' }
  }

];