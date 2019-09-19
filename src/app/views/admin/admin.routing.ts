import { Routes } from '@angular/router';
import { AppBlankComponent } from './app-blank/app-blank.component';
import { userlistComponent } from './userlist/userlist.component';
import { userviewComponent } from './userlist/userview.component';
import { customerlistComponent } from './customerlist/customerlist.component';
import { advisorlistComponent } from './advisorlist/advisorlist.component';
import { cmslistComponent } from './cms/cms.component';
import { cmseditComponent } from './cms/cmsedit.component';
import { fileUploadInstructionsListComponent } from './file-upload-instructions/file-upload-instructions.component';
import { fileUploadInstructionsEditComponent } from './file-upload-instructions/file-upload-instructions-edit.component';
import { ProfileComponent } from './profile/profile.component';
import { EmailTemplateComponent } from './email-template/email-template.component';
import { EmailTemplateEditComponent } from './email-template/email-template-edit.component';
import { MapComponent } from './map/map.component';
import { ReferralProgramComponent } from './referral-program/referral-program.component';
import { ActivityLogComponent } from './activity-log/activity-log.component';
import { AddManagementComponent } from './ad-management/ad-management.component';
import { DeceasedRequestsComponent } from './deceased-requests/deceased-requests.component';
import { DeceasedRequestsViewComponent } from './deceased-requests/deceased-requests-view.component';
import { ErrorComponent } from './error/error.component';
import { AuthGuard } from '../../shared/services/auth/auth.guard';
import { FreeTrialPeriodManagementComponent } from './free-trial-period-management/free-trial-period-management.component';
import { CoachCornerCategoryManagementComponent } from './coach-corner-category-management/coach-corner-category-management.component';
import { CoachCornerListingManagementComponent } from './coach-corner-listing/coach-corner-listing-management.component';
import { AddManagementViewComponent } from './ad-management/ad-management-view.component';
import { customercmsComponent } from './cms/customercms.component';
import { customercmsformComponent } from './cms/customercmsform.component';
import { advisorcmsformComponent } from './cms/advisorcmsform.component';
export const AdminRoutes: Routes = [
  {
    path: 'dashboard',
    component: AppBlankComponent,
    data: { title: 'Dashboard', breadcrumb: 'DASHBOARD' },
    canActivate: [ AuthGuard ],
  }, {
    path: 'userlist',
    component: userlistComponent,
    data: { title: 'Admin Users List', breadcrumb: 'Admin Users List' },
    canActivate: [ AuthGuard ],
  }, {
    path: 'userview/:id',
    component: userviewComponent,
    data: { title: 'User Detail Page', breadcrumb: 'User Detail Page' },
    canActivate: [ AuthGuard ],
  }, {
    path: 'customerlist',
    component: customerlistComponent,
    data: { title: 'Customers List', breadcrumb: 'Customers List' },
    canActivate: [ AuthGuard ],
  },{
    path: 'advisorlist',
    component: advisorlistComponent,
    data: { title: 'Advisors List', breadcrumb: 'Advisors List' },
    canActivate: [ AuthGuard ],
  },{
    path: 'cms',
    component: cmslistComponent,
    data: { title: 'CMS Pages', breadcrumb: 'CMS Pages' },
    canActivate: [ AuthGuard ],
  },{
    path: 'cmsedit/:id',
    component: cmseditComponent,
    data: { title: 'CMS Pages', breadcrumb: 'CMS Pages' }
  },{
    path: 'file-upload-instructions',
    component: fileUploadInstructionsListComponent,
    data: { title: 'File Upload Instructions', breadcrumb: 'File Upload Instructions' },
    canActivate: [ AuthGuard ],
  },{
    path: 'file-upload-instructions-edit/:id',
    component: fileUploadInstructionsEditComponent,
    data: { title: 'CMS Pages', breadcrumb: 'CMS Pages' }
  },{
    path: 'customerCms',
    component: customercmsComponent,
    data: { title: 'Customer Home Page', breadcrumb: 'Customer Home Page' },
    canActivate: [ AuthGuard ],
  },{
    path: 'customercmscreate',
    component: customercmsformComponent,
    data: { title: 'Customer Create Page', breadcrumb: 'Customer Create Page' }
  },{
    path: 'customercmsedit/:id',
    component: customercmsformComponent,
    data: { title: 'Customer Home Page', breadcrumb: 'Customer Home Page' }
  },{
    path: 'advisorcmscreate',
    component: advisorcmsformComponent,
    data: { title: 'Advisor Create Page', breadcrumb: 'Advisor Create Page' }
  },{
    path: 'advisorcmsedit/:id',
    component: advisorcmsformComponent,
    data: { title: 'Advisor Home Page', breadcrumb: 'Advisor Home Page' }
  },{
    path: 'email-template',
    component: EmailTemplateComponent,
    data: { title: 'Email Templates', breadcrumb: 'Email Templates' },
    canActivate: [ AuthGuard ],
  }, {
    path: 'email-template-edit/:id',
    component: EmailTemplateEditComponent,
    data: { title: 'Edit Email Template', breadcrumb: 'Edit Email Template' },
    canActivate: [ AuthGuard ],
  }, {
    path: 'map',
    component: MapComponent,
    data: { title: 'Zip Code Map', breadcrumb: 'Zip Code Map' }
  },
  {
    path: 'profile',
    component: ProfileComponent,
    data: { title: 'Profile', breadcrumb: 'PROFILE' },
    canActivate: [ AuthGuard ],
  }, {
    path: 'referral-program',
    component: ReferralProgramComponent,
    data: { title: 'Referral Program', breadcrumb: 'Referral Program' },
    canActivate: [ AuthGuard ],
  },{
    path: 'free-trial-period-management',
    component: FreeTrialPeriodManagementComponent,
    data: { title: 'Free Trial Period Management', breadcrumb: 'Free Trial Period Management' },
    canActivate: [ AuthGuard ],
  }, {
    path: 'coach-corner-category-management',
    component: CoachCornerCategoryManagementComponent,
    data: { title: 'Coach Corner Category Management', breadcrumb: 'Coach Corner Category Management' },
    canActivate: [ AuthGuard ],
  },{
    path: 'coach-corner-post',
    component: CoachCornerListingManagementComponent,
    data: { title: 'Coach Corner Post Management', breadcrumb: 'Coach Corner Post Management' },
    canActivate: [ AuthGuard ],
  }, {
    path: 'activity-log',
    component: ActivityLogComponent,
    data: { title: 'Activity Log', breadcrumb: 'Activity Log' },
    canActivate: [ AuthGuard ],
  }, {
    path: 'ad-management',
    component: AddManagementComponent,
    data: { title: 'Advertisement Management', breadcrumb: 'Advertisement Management' },
    canActivate: [ AuthGuard ],
  },
  {
    path: 'ad-management/ad-management-view/:id',
    component: AddManagementViewComponent,
    data: { title: 'Advertisement Management view', breadcrumb: 'Advertisement Management view' },
    canActivate: [ AuthGuard ],
  }, {
    path: 'deceased-requests',
    component: DeceasedRequestsComponent,
    data: { title: 'Deceased Requests', breadcrumb: 'Deceased Requests' },
    canActivate: [ AuthGuard ],
  }, {
    path: 'deceased-requests/view/:id',
    component: DeceasedRequestsViewComponent,
    data: { title: 'Deceased Requests Details', breadcrumb: 'Deceased Requests Details' },
    canActivate: [ AuthGuard ],
  },
  {
    path: '**',
    redirectTo: '/llp-admin/error'
  }
];