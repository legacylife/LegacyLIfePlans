import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';

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
  MatProgressBarModule,
  MatTooltipModule,
  MatSelectModule
} from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { FileUploadModule } from 'ng2-file-upload/ng2-file-upload';
import { SharedModule } from './../../shared/shared.module';
import { AppBlankComponent } from './app-blank/app-blank.component';
import { AdminRoutes } from "./admin.routing";
import { LockscreenComponent } from './lockscreen/lockscreen.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ErrorComponent } from './error/error.component';
import { userlistComponent } from './userlist/userlist.component';
import { userviewComponent } from './userlist/userview.component';
import { customerlistComponent } from './customerlist/customerlist.component';
import { advisorlistComponent } from './advisorlist/advisorlist.component';
import { cmslistComponent } from './cms/cms.component';
import { cmseditComponent } from './cms/cmsedit.component';
import { fileUploadInstructionsListComponent } from './file-upload-instructions/file-upload-instructions.component';
import { fileUploadInstructionsEditComponent } from './file-upload-instructions/file-upload-instructions-edit.component';
import { EmailTemplateComponent } from './email-template/email-template.component';
import { EmailTemplateEditComponent } from './email-template/email-template-edit.component';
import { NgxTablePopupComponent } from './userlist/ngx-table-popup/ngx-table-popup.component';
import { AdvisorRejectPopupComponent } from './userlist/ngx-table-popup/advisor-reject-popup.component';
import { ProfileComponent } from './profile/profile.component';
import { AgmCoreModule } from '@agm/core';
import { AgmJsMarkerClustererModule } from '@agm/js-marker-clusterer';
import { AgmMarkerSpiderModule } from 'agm-oms';
import { MapComponent } from './map/map.component';
import { ReferralProgramComponent } from './referral-program/referral-program.component';
import { ActivityLogComponent } from './activity-log/activity-log.component';
import { AddManagementComponent } from './ad-management/ad-management.component';
import { DeceasedRequestsComponent } from './deceased-requests/deceased-requests.component';

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
    MatSelectModule,
    FlexLayoutModule,
    NgxDatatableModule,
    ChartsModule,
    FileUploadModule,
    SharedModule,
    QuillModule,
    MatTooltipModule,
    AgmCoreModule.forRoot({ apiKey: 'AIzaSyBNcjxo_35qnEG17dQvvftWa68eZWepYE0' }),
    AgmJsMarkerClustererModule,
    AgmMarkerSpiderModule,
    RouterModule.forChild(AdminRoutes)
  ],
  declarations: [
    AppBlankComponent, userlistComponent, userviewComponent, customerlistComponent, advisorlistComponent,
    NgxTablePopupComponent, AdvisorRejectPopupComponent, cmslistComponent, cmseditComponent, ProfileComponent, EmailTemplateComponent,
    EmailTemplateEditComponent, MapComponent, ReferralProgramComponent, ActivityLogComponent, AddManagementComponent,
    DeceasedRequestsComponent,fileUploadInstructionsListComponent,fileUploadInstructionsEditComponent
  ],
  entryComponents: [NgxTablePopupComponent,AdvisorRejectPopupComponent]
})
export class AdminModule { }
