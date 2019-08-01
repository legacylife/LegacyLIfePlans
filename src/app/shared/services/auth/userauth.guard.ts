import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, ActivatedRoute } from '@angular/router';
import { UserAPIService } from './../../../userapi.service';
import { SubscriptionService } from '../../../shared/services/subscription.service';

@Injectable()
export class UserAuthGuard implements CanActivate {
  public authToken;
  private isAuthenticated = false; // Set this value dynamically
  private userInfo: any
  private urlData: any
  private userUrlType: any
  
  constructor(private router: Router, private userapi: UserAPIService,private route: ActivatedRoute, private subscriptionservice:SubscriptionService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      this.userInfo = this.userapi.getUserInfo()
      var pathArray = window.location.pathname.split('/');
      this.userUrlType = pathArray[1];
      let currentUrl = state.url
      let acceptedUsers = ['advisor','customer']

      if ((this.userInfo && this.userInfo.endUserType == '') ) {
        this.router.navigateByUrl('/signin');
        return false;
      }
      //console.log(acceptedUsers.indexOf(this.userInfo.endUserType))
      if( this.userInfo && this.userInfo.endUserType != '' && acceptedUsers.indexOf(this.userInfo.endUserType) >= 0 ) {
        this.subscriptionservice.checkSubscription( ( returnArr )=> {
          let isProuser = localStorage.getItem('endUserProSubscription') && localStorage.getItem('endUserProSubscription') == 'yes' ? true : false
          let isFreeProuser = localStorage.getItem('endUserProFreeSubscription') && localStorage.getItem('endUserProFreeSubscription') == 'yes' ? true : false
          //let acceptedUrls = ['/'+this.userInfo.endUserType+'/account-setting','/'+this.userInfo.endUserType+'/'+this.userInfo.endUserType+'-subscription']
          let acceptedUrls = ['/'+this.userInfo.endUserType+'/'+this.userInfo.endUserType+'-subscription']
          if( !isProuser ) {
            if( !isFreeProuser ) {
              if( currentUrl &&  acceptedUrls.indexOf(currentUrl) == -1 ) {
                //this.router.navigate(['/'+this.userInfo.endUserType+'/account-setting']);
                this.router.navigate(['/'+this.userInfo.endUserType+'/'+this.userInfo.endUserType+'-subscription']);
                return false;
              }
            }
          }
        })
      }

      if ((this.userInfo.endUserType != '' && this.userUrlType != ''  && this.userUrlType != 'subscription' && this.userUrlType != 'signin' && this.userInfo.endUserType != this.userUrlType)) {
        this.router.navigateByUrl('/'+this.userInfo.endUserType+'/dashboard');
        return false;
      }
      
    return true;
  }
}