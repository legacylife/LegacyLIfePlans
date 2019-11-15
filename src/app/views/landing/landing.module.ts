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
  MatFormFieldModule,
  MatProgressBarModule,
  MatTooltipModule
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
import { TermsOfUseComponent } from './terms-of-use/terms-of-use.component';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { CountUpModule } from 'countup.js-angular2';
import {MatExpansionModule} from '@angular/material/expansion';
import { VideoModalComponent } from './video-modal/video-modal.component';
console.log('Landing Module..')
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SlickCarouselModule,
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
    MatFormFieldModule,
    MatProgressBarModule,
    FlexLayoutModule,
    NgxDatatableModule,
    ChartsModule,
    FileUploadModule,
    SharedModule,
    CountUpModule,
    MatExpansionModule,
    MatTooltipModule,
    RouterModule.forChild(LandingRoutes)
  ],
  declarations: [
    HomeComponent,
    CustAboutUsComponent,
    PrivacyPolicyComponent,
    TermsOfUseComponent,
    VideoModalComponent
  ], 
  entryComponents: [VideoModalComponent]
})
export class LandingModule { }
