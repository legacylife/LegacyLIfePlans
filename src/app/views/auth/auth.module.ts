import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from "@angular/router";
import { 
  MatProgressBarModule,
  MatButtonModule,
  MatInputModule,
  MatCardModule,
  MatCheckboxModule,
  MatIconModule
 } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';

// import { CommonDirectivesModule } from './sdirectives/common/common-directives.module';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LockscreenComponent } from './lockscreen/lockscreen.component';

import { AuthRoutes } from "./auth.routing";
import { NotFoundComponent } from './not-found/not-found.component';
import { ErrorComponent } from './error/error.component';

import { AdvisorSigninComponent } from './advisor/signin/signin.component';
import { AdvisorSignupComponent } from './advisor/signup/signup.component';
import { CustomerSignupComponent } from './customer/signup/signup.component';
import { CustomerSigninComponent } from './customer/signin/signin.component';
import { AdminSignupComponent } from './admin/signup/signup.component';
import { AdminSigninComponent } from './admin/signin/signin.component';

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
    RouterModule.forChild(AuthRoutes)
  ],
  declarations: [ForgotPasswordComponent, LockscreenComponent,
    NotFoundComponent, ErrorComponent, AdvisorSigninComponent, AdvisorSignupComponent,
    CustomerSignupComponent, CustomerSigninComponent, AdminSignupComponent, AdminSigninComponent]
})
export class AuthModule { }