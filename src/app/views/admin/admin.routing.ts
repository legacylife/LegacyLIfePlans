import { Routes } from '@angular/router';
import { AppBlankComponent } from './app-blank/app-blank.component';
import { userlistComponent } from './userlist/userlist.component';
import { userviewComponent } from './userlist/userview.component';
import { customerlistComponent } from './customerlist/customerlist.component';
import { advisorlistComponent } from './advisorlist/advisorlist.component';
import { cmslistComponent } from './cms/cms.component';
import { cmseditComponent } from './cms/cmsedit.component';
import { ProfileComponent } from './profile/profile.component';
export const AdminRoutes: Routes = [
  {
    path: '',
    component: AppBlankComponent,
    data: { title: 'Blank', breadcrumb: 'BLANK' }
  },{
    path: 'userlist',
    component: userlistComponent
  },{
    path: 'userview/:id',
    component: userviewComponent
  },{
    path: 'customerlist',
    component: customerlistComponent
  },{
    path: 'advisorlist',
    component: advisorlistComponent
  },{
    path: 'cms',
    component: cmslistComponent,
	data: { title: 'NgX Table', breadcrumb: 'NgX Table' }
  },{
    path: 'cmsedit/:id',
    component: cmseditComponent
  },{
	path: 'profile', 
	component: ProfileComponent,
	data: { title: 'Profile', breadcrumb: 'PROFILE'}
  }
];