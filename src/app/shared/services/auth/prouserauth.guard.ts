import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserAPIService } from './../../../userapi.service';
import { SubscriptionService } from '../subscription.service';

@Injectable()
export class ProUserAuthGuard implements CanActivate {
  userId: string
  userType: string

  constructor(private router: Router, private userapi: UserAPIService, private subscriptionservice:SubscriptionService) {
    this.userId = localStorage.getItem("endUserId");
    this.userType = localStorage.getItem("endUserType");
  }

  canActivate(route?: ActivatedRouteSnapshot, state?:RouterStateSnapshot) {
    this.subscriptionservice.checkSubscription( '',( returnArr )=> {
      let isProUser = localStorage.getItem('endUserProSubscription') && localStorage.getItem('endUserProSubscription') == 'yes' ? true : false
      let isFreeProuser = localStorage.getItem('endUserProFreeSubscription') && localStorage.getItem('endUserProFreeSubscription') == 'yes' ? true : false

      // let userlegacySetting = localStorage.getItem('endUserlegacySetting') && localStorage.getItem('endUserlegacySetting') == 'yes' ? true : false
      // if(!userlegacySetting && this.userType && this.userType == 'customer'){
      //   isFreeProuser = false;

      // }

      //const expectedRole = route.data.expectedRole
      if (this.userId != null && this.userId != "") {          
        if( (isProUser || isFreeProuser) && this.userType && this.userType == 'customer' ) {
          return true
        }
        else {
          this.router.navigate(['/customer/account-setting'])
        }
      }
      else{
        this.userapi.userLogout();
      }
    })
    return true
  }
}