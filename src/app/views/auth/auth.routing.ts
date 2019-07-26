import { Routes } from '@angular/router';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LockscreenComponent } from './lockscreen/lockscreen.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ErrorComponent } from './error/error.component';
import { SigninComponent } from './signin/signin.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { PasswordResetSuccessfulComponent } from './password-reset-successful/password-reset-successful.component';
import { ForgotPasswordSuccessfulComponent } from './password-reset-successful/forgot-password-successful.component';
import { UserPreAuthGuard } from '../../shared/services/auth/userpreauth.guard';
import { SubscriptionComponent } from './subscription/subscription.component';

console.log('Auth---routing');
export const AuthRoutes: Routes = [
  {
    path: 'forgot-password',
      component: ForgotPasswordComponent,
      data: { title: 'Forgot password' },
      canActivate: [ UserPreAuthGuard ]
  },
  {
    path: 'signin',
      component: SigninComponent,
      data: { title: 'Signin' },
      canActivate: [ UserPreAuthGuard ]
  },
  {
      path: 'reset-password/:id',
      component: ResetPasswordComponent,
      data: { title: 'Reset Password' },
      canActivate: [ UserPreAuthGuard ]
  },
  {
    path: 'password-reset-success',
      component: PasswordResetSuccessfulComponent,
      data: { title: 'Reset Password' },
      canActivate: [ UserPreAuthGuard ]
  }, {
    path: 'forgot-password-success',
    component: ForgotPasswordSuccessfulComponent,
    data: { title: 'Thank You' },
    canActivate: [ UserPreAuthGuard ]
  },
  {
    path: 'subscription',
    component: SubscriptionComponent,
    data: { title: 'Subscription' }
  }

];