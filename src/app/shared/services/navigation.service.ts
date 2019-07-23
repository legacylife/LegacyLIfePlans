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
      state: '/advisor/dashboard'
    },
    {
      name: 'Legacies',
      type: 'link',
      icon: 'people',
      state: '/advisor/shared-legacies'
    },
    {
      name: 'Leads',
      type: 'link',
      icon: 'person',
      state: '/advisor/leads'
    },
    {
      name: 'To dos ad',
      type: 'button',
      icon: 'list',
      state: '/advisor'
    },
    {
      name: 'Coachs Corner',
      type: 'link',
      icon: 'book',
      state: '/advisor/dashboard'
    },
    {
      name: 'Invite ad',
      type: 'button',
      icon: 'markunread',
      state: '/advisor/dashboard'
    },
    {
      name: 'Log Out',
      type: 'extLink',
      icon: 'assignment_return',
      state: '/advisor/dashboard '
    }
  ];

  customerMenu: IMenuItem[] = [
    {
      name: 'Home',
      type: 'link',
      icon: 'home',
      state: '/customer/dashboard'
    },
    {
      name: 'Trustees',
      type: 'link',
      icon: 'people',
      state: '/customer/my-peoples'
    },
    {
      name: 'Professionals',
      type: 'link',
      icon: 'perm_identity',
      state: '/customer/professionals-landing/prof-advisor-listing'
    },
    {
      name: 'To dos',
      type: 'button',
      icon: 'list ',
      state: '/customer/to-dos'
    },
    {
      name: 'Coach’s Corner',
      type: 'link',
      icon: 'book',
      state: '/customer/dashboard'
    },
    {
      name: 'Invite',
      type: 'button',
      icon: 'markunread',
      state: '/customer/dashboard'
    },
    {
      name: 'Log Out',
      type: 'extLink',
      icon: 'assignment_return',
      state: '/customer/dashboard '
    }
  ];

  preAdvisorMenu: IMenuItem[] = [

    {
      name: 'About Us',
      type: 'extLink',
      icon: 'image_aspect_ratio',
      state: '#ad-about-us '
    }, {
      name: 'How LLP Works',
      icon: 'show_chart',
      type: 'extLink',
      state: '#ad-how-help'
    },
    {
      name: 'Leads',
      type: 'extLink',
      icon: 'nature',
      state: '#ad-leads'
    }, {
      name: 'Profile',
      type: 'extLink',
      icon: 'person',
      state: '#ad-profile'
    },
    {
      name: 'Testimonials',
      type: 'extLink',
      icon: 'nature_people',
      state: '#ad-testimonials'
    }, {
      name: 'Contact Us',
      type: 'extLink',
      icon: 'phone',
      state: '#ad-contactus'
    },
    {
      name: 'For Customers',
      type: 'extLink',
      icon: 'person_pin',
      state: '/'
    }, {
      name: 'Sign Up',
      type: 'extLink',
      icon: 'assignment_returned',
      state: '/customer/signup'
    },
    {
      name: 'Login',
      type: 'extLink',
      icon: 'assignment_return',
      state: '/signin '
    }
  ];

  preCustomerMenu: IMenuItem[] = [
    { 
      name: 'About Us',
      type: 'extLink',
      icon: 'image_aspect_ratio',
      state: '#about-us'
    }, {
      name: 'How LLP Works',
      icon: 'show_chart',
      type: 'extLink',
      state: '#how-llp-works'
    },
    {
      name: 'Testimonials',
      type: 'extLink',
      icon: 'nature_people',
      state: '#testimonialss'
    },
    {
      name: 'Pricing Plans',
      type: 'extLink',
      icon: 'monetization_on',
      state: '#pricing-plan '
    },
    {
      name: 'Contact Us',
      type: 'extLink',
      icon: 'phone',
      state: '#contact-us'
    },
    {
      name: 'For Advisor',
      type: 'extLink',
      icon: 'person_pin',
      state: '/advisor'
    }, {
      name: 'Sign Up',
      type: 'extLink',
      icon: 'assignment_returned',
      state: '/advisor/signup'
    },
    {
      name: 'Login',
      type: 'extLink',
      icon: 'assignment_return',
      state: '/signin '
    }
  ];

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
    let loginUserId =  localStorage.getItem('endUserId');
    switch (menuType) {
      case 'admin':
        this.menuItems.next(this.adminMenu);
        break;
      case 'customer':
          if(loginUserId){
            this.menuItems.next(this.customerMenu);
           }else{
            this.menuItems.next(this.preCustomerMenu);
           }      
        break;

      case 'advisor':
       if(loginUserId){
        this.menuItems.next(this.advisorMenu);
       }else{
        this.menuItems.next(this.preAdvisorMenu);       
       }      
        break;
      default:
        this.menuItems.next(this.preAdvisorMenu);
    }
  }
}
