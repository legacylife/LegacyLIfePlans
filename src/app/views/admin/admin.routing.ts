import { Routes } from '@angular/router';
import { AppBlankComponent } from './app-blank/app-blank.component';
import { userlistComponent } from './userlist/userlist.component';
import { userviewComponent } from './userlist/userview.component';
import { customerlistComponent } from './customerlist/customerlist.component';
import { advisorlistComponent } from './advisorlist/advisorlist.component';
import { cmslistComponent } from './cms/cms.component';
import { cmseditComponent } from './cms/cmsedit.component';
import { ProfileComponent } from './profile/profile.component';
import { EmailTemplateComponent } from './email-template/email-template.component';
import { EmailTemplateEditComponent } from './email-template/email-template-edit.component';
import { MapComponent } from './map/map.component';
import { ReferralProgramComponent } from './referral-program/referral-program.component';
import { ActivityLogComponent } from './activity-log/activity-log.component';
import { AddManagementComponent } from './ad-management/ad-management.component';
import { DeceasedRequestsComponent } from './deceased-requests/deceased-requests.component';

export const AdminRoutes: Routes = [
  {
    path: '',
    component: AppBlankComponent,
    data: { title: 'Blank', breadcrumb: 'BLANK' }
  },{
    path: 'userlist',
    component: userlistComponent,
    data: { title: 'Admin Users List', breadcrumb: 'Admin Users List' }
  },{
    path: 'userview/:id',
    component: userviewComponent,
    data: { title: 'User Detail Page', breadcrumb: 'User Detail Page' }
  },{
    path: 'customerlist',
    component: customerlistComponent,
	  data: { title: 'Customers List', breadcrumb: 'Customers List'}
  },{
    path: 'advisorlist',
    component: advisorlistComponent,
    data: { title: 'Advisors List', breadcrumb: 'Advisors List' }
  },{
    path: 'cms',
    component: cmslistComponent,
	  data: { title: 'CMS Pages', breadcrumb: 'CMS Pages' }
  },{
    path: 'cmsedit/:id',
    component: cmseditComponent,
    data: { title: 'CMS Pages', breadcrumb: 'CMS Pages' }
  },{
    path: 'email-template',
    component: EmailTemplateComponent,
	  data: { title: 'Email Templates', breadcrumb: 'Email Templates' }
  },{
    path: 'email-template-edit/:id',
    component: EmailTemplateEditComponent,
    data: { title: 'Edit Email Template', breadcrumb: 'Edit Email Template' }
  },{
    path: 'map',
    component: MapComponent,
    data: { title: 'Zip Code Map', breadcrumb: 'Zip Code Map' }
  },
  {
	path: 'profile', 
	component: ProfileComponent,
	data: { title: 'Profile', breadcrumb: 'PROFILE'}
  },{
    path: 'referral-program',
    component: ReferralProgramComponent,
    data: { title: 'Referral program', breadcrumb: 'Referral program' }
  },{
    path: 'activity-log',
    component: ActivityLogComponent,
    data: { title: 'Activity Log', breadcrumb: 'Activity Log' }
  },{
    path: 'ad-management',
    component: AddManagementComponent,
    data: { title: 'Advertisement management', breadcrumb: 'Advertisement management' }
  },{
    path: 'deceased-requests',
    component: DeceasedRequestsComponent,
    data: { title: 'Deceased requests', breadcrumb: 'Deceased requests' }
  }
];