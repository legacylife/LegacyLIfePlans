import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import {MatRadioModule} from '@angular/material/radio';
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

// import { CommonDirectivesModule } from './sdirectives/common/common-directives.module';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LockscreenComponent } from './lockscreen/lockscreen.component';
import { AuthRoutes } from './auth.routing';
import { NotFoundComponent } from './not-found/not-found.component';
import { ErrorComponent } from './error/error.component';
import { SigninComponent } from './signin/signin.component';
//import { BusinessInfoComponent } from './../advisor/business-info/business-info.component';
//import { UpdateProfileComponent } from './../customer/update-profile/update-profile.component';
//import { SetPasswordComponent } from './../advisor/set-password/set-password.component';
//import { ThankYouComponent } from './../advisor/thank-you/thank-you.component';
// BusinessInfoComponent, UpdateProfileComponent, SetPasswordComponent,ThankYouComponent,
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { PasswordResetSuccessfulComponent } from './password-reset-successful/password-reset-successful.component';


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
  declarations: [SigninComponent, ForgotPasswordComponent, LockscreenComponent,
    NotFoundComponent, ErrorComponent, ResetPasswordComponent, PasswordResetSuccessfulComponent],
    providers: [
      MatDatepickerModule,
    ]
})
export class AuthModule { }