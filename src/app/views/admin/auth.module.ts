import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';
import {
  MatProgressBarModule,
  MatButtonModule,
  MatInputModule,
  MatCardModule,
  MatCheckboxModule,
  MatIconModule,
  MatFormFieldModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatTooltipModule
} from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LockscreenComponent } from './lockscreen/lockscreen.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { signinComponent } from './signin/signin.component';
import { PasswordResetSuccessfulComponent } from './password-reset-successful/password-reset-successful.component';
import { ForgotPasswordSuccessfulComponent } from './password-reset-successful/forgot-password-successful.component';
import { AuthRoutes } from './auth.routing';
import { NotFoundComponent } from './not-found/not-found.component';
import { ErrorComponent } from './error/error.component';
import { PreAuthGuard } from '../../shared/services/auth/preauth.guard';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatCheckboxModule,
    MatIconModule,
    FlexLayoutModule,
    MatStepperModule,
    MatRadioModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    RouterModule.forChild(AuthRoutes)
  ],
  declarations: [ForgotPasswordComponent, LockscreenComponent, signinComponent,
    ResetPasswordComponent, NotFoundComponent, ErrorComponent, PasswordResetSuccessfulComponent,
    ForgotPasswordSuccessfulComponent],
  providers: [
    MatDatepickerModule,PreAuthGuard
  ]
})
export class AuthModule { }