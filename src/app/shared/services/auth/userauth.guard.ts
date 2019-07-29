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
      let currentUrl = state.url      
      let acceptedUrls = ['/'+this.userInfo.endUserType+'/account-setting','/'+this.userInfo.endUserType+'/'+this.userInfo.endUserType+'-subscription']
      
      console.log("currentUrl",currentUrl)
      console.log("acceptedUrls",acceptedUrls)
      
      /*if( !isProuser ) {
        if( currentUrl &&  acceptedUrls.indexOf(currentUrl) == -1/* ( currentUrl != '/'+this.userInfo.endUserType+'/account-setting' || currentUrl != '/'+this.userInfo.endUserType+'/'+this.userInfo.endUserType+'-subscription' )  ) {
          this.router.navigate(['/'+this.userInfo.endUserType+'/account-setting']);
          return false;
        }
      }*/
      if ((this.userInfo && this.userInfo.endUserType == '') ) {
        this.router.navigateByUrl('/signin');
        return false;
      }

      if ((this.userInfo.endUserType != '' && this.userUrlType != '' && this.userUrlType != 'signin' && this.userInfo.endUserType != this.userUrlType)) {
        this.router.navigateByUrl('/'+this.userInfo.endUserType+'/dashboard');
        return false;
      }
      
    return true;
  }
}