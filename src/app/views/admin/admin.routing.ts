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
  }
];