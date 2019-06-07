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
  //constructor() { }

  adminMenu: IMenuItem[] = [
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
      name: 'REFERRAL PROGRAM',
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

  advisorMenu: IMenuItem[] = [
    {
      name: 'Home',
      type: 'link',
      icon: 'home',
      state: 'home'
    },
    {
      name: 'Legacies',
      type: 'link',
      icon: 'people',
      state: 'home'
    },
    {
      name: 'Leads',
      type: 'link',
      icon: 'person',
      state: 'home'
    },
    {
      name: 'To dos',
      type: 'link',
      icon: 'list',
      state: 'home'
    },
    {
      name: 'Coachs Corner',
      type: 'link',
      icon: 'book',
      state: 'home'
    },
    {
      name: 'Invite',
      type: 'link',
      icon: 'markunread',
      state: 'home'
    }
  ];

  customerMenu: IMenuItem[] = [
    {
      name: 'Home',
      type: 'link',
      icon: 'home',
      state: 'home'
    },
    {
      name: 'Trustees',
      type: 'link',
      icon: 'people',
      state: 'home'
    },
    {
      name: 'Professionals',
      type: 'link',
      icon: 'perm_identity',
      state: 'home'
    },
    {
      name: 'To dos ',
      type: 'link',
      icon: 'list ',
      state: 'home'
    },
    {
      name: 'Coach’s Corner',
      type: 'link',
      icon: 'book',
      state: 'home'
    },
    {
      name: 'Invite',
      type: 'link',
      icon: 'markunread',
      state: 'home'
    }
  ]

  preAdvisorMenu: IMenuItem[] = [
    // {
    //   name: 'Home',
    //   type: 'extLink',
    //   icon: 'library_books',
    //   state: '/home'
    // },
    {
      name: 'About Us',
      type: 'extLink',
      icon: 'library_books',
      state: '#ad-about-us '
    },{
      name: 'How LLP Works',
      icon: 'library_books',
      type: 'extLink',
      state: '#ad-how-help'
    },
    {
      name: 'Leads',
      type: 'extLink',
      icon: 'library_books',
      state: '#ad-leads'
    }, {
      name: 'Profile',
      type: 'extLink',
      icon: 'library_books',
      state: '#ad-profile'
    },
    {
      name: 'Testimonials',
      type: 'extLink',
      icon: 'library_books',
      state: '#ad-testimonials'
    }, {
      name: 'Contact Us',
      type: 'extLink',
      icon: 'library_books',
      state: '/advisor'
    },
    {
      name: 'For Customers',
      type: 'extLink',
      icon: 'library_books',
      state: '/'
    }, {
      name: 'Sign Up',
      type: 'extLink',
      icon: 'library_books',
      state: '/customer/signup'
    },
    {
      name: 'Login',
      type: 'extLink',
      icon: 'library_books',
      state: '/signin '
    }
  ];

  preCustomerMenu: IMenuItem[] = [
    // {
    //   name: 'Home',
    //   type: 'extLink',
    //   icon: 'library_books',
    //   state: '/home'
    // },
    {
      name: 'About Us',
      type: 'extLink',
      icon: 'library_books',
      state: '#about-us'
    },{
      name: 'How LLP Works',
      icon: 'library_books',
      type: 'extLink',
      state: '#how-llp-works'
    },
    {
      name: 'Testimonials',
      type: 'extLink',
      icon: 'library_books',
      state: '#testimonialss'
    },
    {
      name: 'Pricing Plans',
      type: 'extLink',
      icon: 'library_books',
      state: '#pricing-plan '
    },
    {
      name: 'Contact Us',
      type: 'extLink',
      icon: 'library_books',
      state: 'contact-us'
    },
    {
      name: 'For Advisor',
      type: 'extLink',
      icon: 'library_books',
      state: '/advisor'
    }, {
      name: 'Sign Up',
      type: 'extLink',
      icon: 'library_books',
      state: '/advisor/signup'
    },
    {
      name: 'Login',
      type: 'extLink',
      icon: 'library_books',
      state: '/signin '
    }
  ]

  // Icon menu TITLE at the very top of navigation.
  // This title will appear if any icon type item is present in menu.
  iconTypeMenuTitle: string = 'Frequently Accessed';
  // sets iconMenu as default;
  menuItems = new BehaviorSubject<IMenuItem[]>(this.preCustomerMenu);
  // navigation component has subscribed to this Observable
  menuItems$ = this.menuItems.asObservable();
  constructor() { }
  // Customizer component uses this method to change menu.
  // You can remove this method and customizer component.
  // Or you can customize this method to supply different menu for
  // different user type.
  publishNavigationChange(menuType: string) {
    switch (menuType) {
      case 'admin':
        this.menuItems.next(this.adminMenu);
        break;      
      case 'customer':
        this.menuItems.next(this.customerMenu);
        break;
      case 'advisor':
        this.menuItems.next(this.advisorMenu);
        break;
        case 'pre-advisor':
        this.menuItems.next(this.preAdvisorMenu);
        break;
      default:
        this.menuItems.next(this.preCustomerMenu);
    }
  }
}