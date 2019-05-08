import { Routes } from '@angular/router';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LockscreenComponent } from './lockscreen/lockscreen.component';
import { signinComponent } from './signin/signin.component';
import { PasswordResetSuccessfulComponent } from './password-reset-successful/password-reset-successful.component';
import { ForgotPasswordSuccessfulComponent } from './password-reset-successful/forgot-password-successful.component';
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
	}, {
		path: 'forgot-password',
		component: ForgotPasswordComponent,
		data: { title: 'Forgot password' }
	}, {
		path: 'reset-password/:id',
		component: ResetPasswordComponent,
		data: { title: 'Reset password' }
	}, {
		path: 'forgot-password-success',
		component: ForgotPasswordSuccessfulComponent,
		data: { title: 'Forgot password thank you' }
	}, {
		path: 'password-reset-success',
		component: PasswordResetSuccessfulComponent,
		data: { title: 'Reset password thank you' }
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
	},
	{
	  path: '**',
	  redirectTo: '/llp-admin/error'
	}
];