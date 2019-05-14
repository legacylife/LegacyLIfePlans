import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  MatProgressBarModule
 } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { FileUploadModule } from 'ng2-file-upload/ng2-file-upload';
import { SharedModule } from './../../shared/shared.module';

import { LandingRoutes } from './landing.routing';
import { HomeComponent } from './home/home.component';
import { CustAboutUsComponent } from './about-us/about-us.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TearnsOfUseComponent } from './tearns-of-use/tearns-of-use.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
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
    FlexLayoutModule,
    NgxDatatableModule,
    ChartsModule,
    FileUploadModule,
    SharedModule,
    RouterModule.forChild(LandingRoutes)
  ],
  declarations: [
    HomeComponent,
    CustAboutUsComponent,
    PrivacyPolicyComponent,
    TearnsOfUseComponent
  ]
})
export class LandingModule { }
