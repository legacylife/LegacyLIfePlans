import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { APIService } from './../../../api.service';
import { MatDialog,MatSnackBar, MatSidenav } from '@angular/material';

@Injectable()
export class AuthGuard implements CanActivate {
  public authToken;
  private isAuthenticated = false; // Set this value dynamically
  private userInfo: any
  
  constructor(private router: Router, private api: APIService, private snack: MatSnackBar) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {

      this.userInfo = this.api.getUserInfo()
      if (!this.userInfo && this.userInfo.userType == '') {
        this.router.navigateByUrl('/llp-admin/signin');
        return false;
      }
      
      const req_vars = { userId: this.userInfo.userId }
      this.api.apiRequest('post', 'auth/view', req_vars).subscribe(result => { 
        let userData = result.data;   
        localStorage.setItem('sectionAccess', JSON.stringify(userData.sectionAccess))
        if(userData && (userData.status == 'Inactive' || userData.status == 'In-Active')){
          this.snack.open("Your account has been inactivated.", 'OK', { duration: 4000 })
          this.router.navigateByUrl('/llp-admin/signin'); 
          return false;
        }
        
      }, (err) => {
        //console.error(err)
      })

    return true;
  }
}