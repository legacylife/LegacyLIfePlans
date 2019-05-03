import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { 
  MatIconModule,
  MatButtonModule,
  MatCardModule,
  MatMenuModule,
  MatSlideToggleModule,
  MatChipsModule,
  MatCheckboxModule,
  MatRadioModule,
  MatTabsModule,
  MatInputModule,
  MatSelectModule,
  MatSliderModule,
  MatExpansionModule,
  MatSnackBarModule,
  MatFormFieldModule,
  MatListModule,
  MatSidenavModule,
  MatRippleModule,
  MatGridListModule,
  MatProgressBarModule
 } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { FileUploadModule } from 'ng2-file-upload/ng2-file-upload';
import { SharedModule } from './../../shared/shared.module';

import { CustomerHomeComponent } from './customer-home/customer-home.component';
import { CustomerTrusteesComponent } from './customer-trustees/customer-trustees.component';
import { CustomerProfessionalComponent } from './customer-professionals/customer-professionals.component';
import { CustomerRoutes } from './customer.routing';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
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
    FlexLayoutModule,
    NgxDatatableModule,
    ChartsModule,
    FileUploadModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatSliderModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatSelectModule,
    MatRippleModule,
    RouterModule.forChild(CustomerRoutes)
  ],
  declarations: [
    CustomerTrusteesComponent,
    CustomerHomeComponent,
    CustomerProfessionalComponent
  ]
})
export class CustomerModule { }
