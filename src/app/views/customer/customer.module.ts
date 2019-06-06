import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatListModule,
  MatIconModule,
  MatButtonModule,
  MatCardModule,
  MatMenuModule,
  MatSlideToggleModule,
  MatGridListModule,
  MatChipsModule,
  MatCheckboxModule,
  MatRadioModule,
  MatTabsModule,
  MatInputModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatFormFieldModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatTooltipModule,
  MatExpansionModule,
  MatSliderModule,
  MatSnackBarModule,
  MatSidenavModule,
  MatDialogModule
} from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { FileUploadModule } from 'ng2-file-upload/ng2-file-upload';
import { SharedModule } from './../../shared/shared.module';
import { CustomerRoutes } from './customer.routing';
import { CustomerSignupComponent, FormatTimePipe } from './signup/signup.component';
import { UpdateProfileComponent } from './update-profile/update-profile.component';
import { CustomerHomeComponent } from './customer-home/customer-home.component';
import { CustomerAccountSettingComponent } from './customer-account-setting/customer-account-setting.component';
import { ChangePassComponent } from './customer-account-setting/change-pass/change-pass.component';
import { UserAuthGuard } from '../../shared/services/auth/userauth.guard';
import { UserPreAuthGuard } from '../../shared/services/auth/userpreauth.guard';
import { states } from '../../state';
import { CustomerSubscriptionComponent } from './customer-subscription/customer-subscription.component';
import { CustomerTrusteesComponent } from './customer-trustees/customer-trustees.component';
import { CustomerProfessionalComponent } from './customer-professionals/customer-professionals.component';
import { CustomerHomeEssentialComponent } from './customer-home/customer-essential/customer-home-essential.component';
import { CustomerDashboardComponent } from './customer-home/customer-dashboard/customer-dashboard.component';
import { CustomerDashboardDayOneComponent } from './customer-home/customer-dashboard-day-one/customer-dashboard-day-one.component';
import { CustomerEssentialDayOneComponent } from './customer-home/customer-essential-day-one/customer-essential-day-one.component';
import { CustomerEssentialDetailsComponent } from './customer-home/customer-essential-details/customer-essential-details.component';
import { CustomerEssentialDetailsIdboxComponent } from './customer-home/customer-essential-details-idbox/customer-essential-details-idbox.component';
import { EssenioalIdBoxComponent } from './customer-home/essenioal-id-box/essenioal-id-box.component';

import { CanDeactivateGuard } from '../../shared/services/can-deactivate-guard.service';
import { CountryEditCanDeactivateGuard } from '../../shared/services/country-edit-can-deactivate-guard.service';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatGridListModule,
    MatChipsModule,
    MatCheckboxModule,
    MatRadioModule,
    MatTabsModule,
    MatInputModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    FlexLayoutModule,
    NgxDatatableModule,
    ChartsModule,
    FileUploadModule,
    SharedModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatSelectModule,
    MatExpansionModule,
    MatSliderModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatDialogModule,
    RouterModule.forChild(CustomerRoutes)
  ],
  declarations: [
    CustomerSignupComponent, UpdateProfileComponent,
    CustomerHomeComponent, FormatTimePipe, CustomerAccountSettingComponent, ChangePassComponent,
    CustomerSubscriptionComponent, CustomerTrusteesComponent, CustomerProfessionalComponent,
    CustomerHomeEssentialComponent, CustomerDashboardComponent, CustomerDashboardDayOneComponent, CustomerEssentialDayOneComponent,
    CustomerEssentialDetailsComponent, CustomerEssentialDetailsIdboxComponent, EssenioalIdBoxComponent
  ], providers: [
    MatDatepickerModule, UserAuthGuard, UserPreAuthGuard, CanDeactivateGuard, CountryEditCanDeactivateGuard
  ], bootstrap: [CustomerSignupComponent], entryComponents: [ChangePassComponent, EssenioalIdBoxComponent],
})
export class CustomerModule { }
