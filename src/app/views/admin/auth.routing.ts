import { Routes } from '@angular/router';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LockscreenComponent } from './lockscreen/lockscreen.component';
import { signinComponent } from './signin/signin.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ErrorComponent } from './error/error.component';

export const AuthRoutes: Routes = [
   {
    path: '',
      component: signinComponent,
      data: { title: 'SignIn' }
    }, {
    path: 'signin',
      component: signinComponent,
      data: { title: 'SignIn' }
    },{
    path: 'forgot-password',
	  component: ForgotPasswordComponent,
	  data: { title: 'Forgot password' }
	}, {
	path: 'reset-password/:id',
	  component: ResetPasswordComponent,
	  data: { title: 'Reset password' }
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
	}
];