import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserAPIService } from './../../../userapi.service';

@Injectable()
export class ProUserAuthGuard implements CanActivate {
  userId: string
  userType: string

  constructor(private router: Router, private userapi: UserAPIService) {
    this.userId = localStorage.getItem("endUserId");
    this.userType = localStorage.getItem("endUserType");
  }

  canActivate(route?: ActivatedRouteSnapshot, state?:RouterStateSnapshot) {
    let isProUser = localStorage.getItem('endUserProSubscription') && localStorage.getItem('endUserProSubscription') == 'yes' ? true : false
    //const expectedRole = route.data.expectedRole
    if (this.userId != null && this.userId != "") {          
      if( isProUser && this.userType && this.userType == 'customer' ) {
        return true
      }
      else {
        this.router.navigate(['/customer/dashboard/customer-day-one'])
      }
    }
    else{
      this.userapi.userLogout();
    }
    return true
  }
}