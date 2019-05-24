import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserAPIService } from './../../../userapi.service';
import { MatDialog,MatSnackBar, MatSidenav } from '@angular/material';

@Injectable()
export class UserPreAuthGuard implements CanActivate {
  public authToken;
  private isAuthenticated = false; // Set this value dynamically
  private userInfo: any
  
  constructor(private router: Router, private userapi: UserAPIService, private snack: MatSnackBar) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      this.userInfo = this.userapi.getUserInfo();

      const req_vars = { userId: this.userInfo.endUserId }
      this.userapi.apiRequest('post', 'auth/view', req_vars).subscribe(result => { 
        let userData = result.data;   
        if(userData && userData.userType == 'customer' && userData.status == 'Active'){
          this.router.navigateByUrl('/customer/dashboard'); 
          return false;
        } 
        if(userData && (userData.userType == 'customer' || userData.userType == 'advisor') && userData.status == 'In-Active'){
          this.snack.open("Your account has been inactivated by admin.", 'OK', { duration: 4000 })
          this.router.navigateByUrl('/signin'); 
          return false;
        }
        if (userData && userData.userType == 'advisor' && userData.status == 'Pending') {
          if(userData.profileSetup == 'yes'){
            this.router.navigateByUrl('/advisor/thank-you');
          }
          else {
            this.router.navigateByUrl('/advisor/business-info');
          }           
          return false;     
        }
        if (userData && userData.userType == 'advisor' && userData.status == 'Active') {
          this.router.navigateByUrl('/advisor/dashboard'); 
          return false;     
        }
        
      }, (err) => {
        console.error(err)
      })
     
    return true;
  }
}