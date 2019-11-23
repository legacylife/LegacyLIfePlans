import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserAPIService } from './../../../userapi.service';
import { MatDialog, MatSnackBar, MatSidenav } from '@angular/material';

@Injectable()
export class UserPreAuthGuard implements CanActivate {
  public authToken;
  private isAuthenticated = false; // Set this value dynamically
  private userInfo: any;
  private userUrlType: any;
  private pageUrl: any;

  constructor(private router: Router, private userapi: UserAPIService, private snack: MatSnackBar) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    this.userInfo = this.userapi.getUserInfo();

    var pathArray = window.location.pathname.split('/');
    this.userUrlType = pathArray[1];
    if (pathArray[2]) {
      this.pageUrl = pathArray[2];
    }

    //alert("this.userUrlType >>>>" + this.userUrlType + " <<<<<<<<< " + this.pageUrl)

    /*if (this.userUrlType == "customer" && this.pageUrl && this.pageUrl == 'signup') {
      this.userapi.userLogout("customer-signup");
      //this.router.navigateByUrl('/customer/signup');
      return true;
    }

    if (this.userUrlType == "advisor" && this.pageUrl && this.pageUrl == 'signup') {
      this.userapi.userLogout("advisor-signup");
      //this.router.navigateByUrl('/advisor/signup');
      return true;
    }

    if (this.userUrlType == "advisor" && !this.pageUrl && (this.pageUrl == '' || this.pageUrl == undefined)) {
      return true;
    }*/


    if (typeof this.userInfo.endUserId !== "undefined" && this.userInfo.endUserId) {
      const req_vars = { userId: this.userInfo.endUserId }
      this.userapi.apiRequest('post', 'auth/view', req_vars).subscribe(result => {
        let userData = result.data;
        if (userData && userData.userType == 'customer' && userData.status == 'Active') {
          if (userData.profileSetup == 'yes') {
            this.router.navigateByUrl('/customer/dashboard');
          }
          else {
            this.router.navigateByUrl('/customer/update-profile');
          }
          return false;
        }
        if (userData && (userData.userType == 'customer' || userData.userType == 'advisor') && userData.status == 'Inactive') {
          this.snack.open("Your account has been inactivated by admin.", 'OK', { duration: 4000 })
          this.userapi.userLogout();
          return false;
        }
        /*if (userData && userData.userType == 'advisor' && userData.status == 'Pending') {
          if (userData.profileSetup == 'yes') {
            this.router.navigateByUrl('/advisor/thank-you');
          }
          else {
            this.router.navigateByUrl('/advisor/business-info');
          }
          return false;
        }*/
        if (userData && userData.userType == 'advisor' && userData.status == 'Active') {
          this.router.navigateByUrl('/advisor/dashboard');
          return false;
        }

      }, (err) => {
        //console.error(err)
      })

      return true;
    } else {
      return true;
    }
  }
}