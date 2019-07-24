import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserAPIService } from './../../../userapi.service';

@Injectable()
export class UserAuthGuard implements CanActivate {
  public authToken;
  private isAuthenticated = false; // Set this value dynamically
  private userInfo: any
  private urlData: any
  private userUrlType: any
  
  constructor(private router: Router, private userapi: UserAPIService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      this.userInfo = this.userapi.getUserInfo()

      var pathArray = window.location.pathname.split('/');
      this.userUrlType = pathArray[1];
      
      if ((this.userInfo && this.userInfo.endUserType == '')) {
        this.router.navigateByUrl('/signin');
        return false;
      }
    return true;
  }
}