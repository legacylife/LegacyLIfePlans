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
 

  advisorMenu: IMenuItem[] = [
    {
      name: 'ad 1',
      type: 'link',
      tooltip: 'Home',
      icon: 'home',
      state: 'home'
    },
    {
      name: 'ad 2',
      type: 'link',
      tooltip: 'Profile',
      icon: 'person',
      state: 'profile/overview'
    }
  ]

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
    }
  ]

  preAdvisorMenu: IMenuItem[] = [
    {
      name: 'Home',
      type: 'extLink',
      icon: 'library_books',
      state: '/home'
    },
    {
      name: 'About Us',
      type: 'extLink',
      icon: 'library_books',
      state: '/home '
    },{
      name: 'How LLP Hired',
      icon: 'library_books',
      type: 'extLink',
      state: '/home'
    },
    {
      name: 'Leads',
      type: 'extLink',
      icon: 'library_books',
      state: '/home '
    }, {
      name: 'Profile',
      type: 'extLink',
      icon: 'library_books',
      state: '/home'
    },
    {
      name: 'Testimonials',
      type: 'extLink',
      icon: 'library_books',
      state: '/home '
    }, {
      name: 'Contact Us',
      type: 'extLink',
      icon: 'library_books',
      state: '/home'
    },
    {
      name: 'For Customers',
      type: 'extLink',
      icon: 'library_books',
      state: '/home '
    }, {
      name: 'Sign Up',
      type: 'extLink',
      icon: 'library_books',
      state: '/home'
    },
    {
      name: 'Login',
      type: 'extLink',
      icon: 'library_books',
      state: '/home '
    }
  ]

  preCustomerMenu: IMenuItem[] = [
    {
      name: 'pre-cust-1',
      type: 'extLink',
      tooltip: 'Documentation',
      icon: 'library_books',
      state: '/home'
    },
    {
      name: 'pre-cust-2',
      type: 'extLink',
      tooltip: 'Documentation',
      icon: 'library_books',
      state: '/home '
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