import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from "@angular/router";
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
  MatSelectModule
 } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';

// import { CommonDirectivesModule } from './sdirectives/common/common-directives.module';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LockscreenComponent } from './lockscreen/lockscreen.component';

import { AuthRoutes } from './auth.routing';
import { NotFoundComponent } from './not-found/not-found.component';
import { ErrorComponent } from './error/error.component';

import { SigninComponent } from './signin/signin.component';
import { AdvisorSigninComponent } from './advisor/signin/signin.component';
import { AdvisorSignupComponent } from './advisor/signup/signup.component';
import { CustomerSignupComponent } from './customer/signup/signup.component';
import { CustomerSigninComponent } from './customer/signin/signin.component';
import { AdminSignupComponent } from './admin/signup/signup.component';
import { AdminSigninComponent } from './admin/signin/signin.component';


import { BusinessInfoComponent } from './advisor/business-info/business-info.component';

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
    RouterModule.forChild(AuthRoutes)
  ],
  declarations: [SigninComponent, ForgotPasswordComponent, LockscreenComponent,
    NotFoundComponent, ErrorComponent, AdvisorSigninComponent, AdvisorSignupComponent,
    CustomerSignupComponent, CustomerSigninComponent, AdminSignupComponent, AdminSigninComponent, BusinessInfoComponent]
})
export class AuthModule { }