import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, ActivatedRoute } from '@angular/router';
import { UserAPIService } from './../../../userapi.service';

@Injectable()
export class UserAuthGuard implements CanActivate {
  public authToken;
  private isAuthenticated = false; // Set this value dynamically
  private userInfo: any
  private urlData: any
  private userUrlType: any
  
  constructor(private router: Router, private userapi: UserAPIService,private route: ActivatedRoute) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      this.userInfo = this.userapi.getUserInfo()
      let isProuser = localStorage.getItem('endUserProSubscription') && localStorage.getItem('endUserProSubscription') == 'yes' ? true : false
      var pathArray = window.location.pathname.split('/');
      this.userUrlType = pathArray[1];
      console.log("this.userUrlType",pathArray[2],"asdasdasda",this.userInfo.endUserType,"isProuser",isProuser)
      /* if( this.userInfo.endUserType == 'advisor' && !isProuser ) {
        if( pathArray[2] && pathArray[2] != 'account-setting') {
          this.router.navigate(['/'+this.userInfo.endUserType+'/account-setting']);
          return false;
        }
        else{
          this.router.navigate(['/'+this.userInfo.endUserType+'/account-setting']);
          return false;
        }
      } */
      if ((this.userInfo && this.userInfo.endUserType == '') || (this.userUrlType != 'signin' && this.userInfo.endUserType != this.userUrlType)) {
        this.router.navigateByUrl('/signin');
        return false;
      }
      
    return true;
  }
}