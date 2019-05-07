import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface IMenuItem {
  type: string,       // Possible values: link/dropDown/icon/separator/extLink
  name?: string,      // Used as display text for item and title for separator type
  state?: string,     // Router state
  icon?: string,      // Material icon name
  tooltip?: string,   // Tooltip text 
  disabled?: boolean, // If true, item will not be appeared in sidenav.
  sub?: IChildItem[], // Dropdown items
  badges?: IBadge[]
}
interface IChildItem {
  type?: string,
  name: string,       // Display text
  state?: string,     // Router state
  icon?: string,
  sub?: IChildItem[]
}

interface IBadge {
  color: string;      // primary/accent/warn/hex color codes(#fff000)
  value: string;      // Display text
}

@Injectable()
export class NavigationService {
  constructor() { }

  iconMenu: IMenuItem[] = [
    /*{
      name: 'HOME',
      type: 'icon',
      tooltip: 'Home',
      icon: 'home',
      state: 'home'
    },
    {
      name: 'PROFILE',
      type: 'icon',
      tooltip: 'Profile',
      icon: 'person',
      state: 'profile/overview'
    },
    {
      name: 'TOUR',
      type: 'icon',
      tooltip: 'Tour',
      icon: 'flight_takeoff',
      state: 'tour'
    },
    {
      type: 'separator',
      name: 'Main Items'
    },*/
    {
      name: 'USER MANAGEMENT',
      type: 'dropDown',
      tooltip: 'Profile',
      icon: 'person',
      state: 'admin',
      sub: [
        { name: 'ADMIN USERS', state: 'userlist' },
        { name: 'ADVISORS', state: 'advisorlist' },
        { name: 'CUSTOMERS', state: 'customerlist' },
        
      ]
    },
    {
      name: 'CMS',
      type: 'link',
      tooltip: 'Content Management System',
      icon: 'pages',
      state: 'admin/cms'
    },
    {
      name: 'REFERRAL PROGRAME',
      type: 'link',
      tooltip: 'Referral program',
      icon: 'card_giftcard',
      state: 'admin/referral-program'
    },
    {
      name: 'ACTIVITY LOG',
      type: 'link',
      tooltip: 'Activity Log',
      icon: 'pages',
      state: 'admin/activity-log'
    },   
    {
      name: 'ADVERTISEMENT MANAGEMENT',
      type: 'link',
      tooltip: 'Advertisement management',
      icon: 'business',
      state: 'admin/ad-management'
    }, 
	  {
      name: 'ZIP CODE MAP',
      type: 'link',
      tooltip: 'Zip Code map',
      icon: 'map',
      state: 'admin/map'
    },
    {
      name: 'DECEASED REQUESTS',
      type: 'link',
      tooltip: 'Deceased requests',
      icon: 'add_location',
      state: 'admin/deceased-requests'
    },
	  {
      name: 'EMAIL TEMPLATES',
      type: 'link',
      tooltip: 'Email Templates Management System',
      icon: 'email',
      state: 'admin/email-template'
    }	
  ]

  // Icon menu TITLE at the very top of navigation.
  // This title will appear if any icon type item is present in menu.
  iconTypeMenuTitle: string = 'Frequently Accessed';
  // sets iconMenu as default;
  menuItems = new BehaviorSubject<IMenuItem[]>(this.iconMenu);
  // navigation component has subscribed to this Observable
  menuItems$ = this.menuItems.asObservable();

  // Customizer component uses this method to change menu.
  // You can remove this method and customizer component.
  // Or you can customize this method to supply different menu for
  // different user type.
  publishNavigationChange(menuType: string) {
    switch (menuType) {
      // case 'separator-menu':
      //   this.menuItems.next(this.separatorMenu);
      //   break;
      // case 'icon-menu':
      //   this.menuItems.next(this.iconMenu);
      //   break;
      default:
        this.menuItems.next(this.iconMenu);
    }
  }
}