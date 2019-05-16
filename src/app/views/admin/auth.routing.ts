import { Routes } from '@angular/router';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LockscreenComponent } from './lockscreen/lockscreen.component';
import { signinComponent } from './signin/signin.component';
import { PasswordResetSuccessfulComponent } from './password-reset-successful/password-reset-successful.component';
import { ForgotPasswordSuccessfulComponent } from './password-reset-successful/forgot-password-successful.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ErrorComponent } from './error/error.component';
import { PreAuthGuard } from '../../shared/services/auth/preauth.guard';

export const AuthRoutes: Routes = [
	{
		path: '',
		component: signinComponent,
		data: { title: 'SignIn' },
		canActivate: [ PreAuthGuard ],
	}, {
		path: 'signin',
		component: signinComponent,
		data: { title: 'SignIn' },
		canActivate: [ PreAuthGuard ],		
	}, {
		path: 'forgot-password',
		component: ForgotPasswordComponent,
		data: { title: 'Forgot password' },
		canActivate: [ PreAuthGuard ],
	}, {
		path: 'reset-password/:id',
		component: ResetPasswordComponent,
		data: { title: 'Reset password' },
		canActivate: [ PreAuthGuard ],
	}, {
		path: 'forgot-password-success',
		component: ForgotPasswordSuccessfulComponent,
		data: { title: 'Forgot password thank you' },
		canActivate: [ PreAuthGuard ],
	}, {
		path: 'password-reset-success',
		component: PasswordResetSuccessfulComponent,
		data: { title: 'Reset password thank you' },
		canActivate: [ PreAuthGuard ],
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