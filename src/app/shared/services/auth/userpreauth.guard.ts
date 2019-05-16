import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserAPIService } from './../../../userapi.service';

@Injectable()
export class UserPreAuthGuard implements CanActivate {
  public authToken;
  private isAuthenticated = false; // Set this value dynamically
  private userInfo: any
  
  constructor(private router: Router, private userapi: UserAPIService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      this.userInfo = this.userapi.getUserInfo();
      if (this.userInfo && this.userInfo.endUserType == 'customer') {
        this.router.navigateByUrl('/customer/dashboard'); 
        return false;     
      }
      if (this.userInfo && this.userInfo.endUserType == 'advisor') {
        this.router.navigateByUrl('/advisor/dashboard'); 
        return false;     
      }
    return true;
  }
}