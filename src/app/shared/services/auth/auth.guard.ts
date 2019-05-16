import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { APIService } from './../../../api.service';

@Injectable()
export class AuthGuard implements CanActivate {
  public authToken;
  private isAuthenticated = false; // Set this value dynamically
  private userInfo: any
  
  constructor(private router: Router, private api: APIService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      this.userInfo = this.api.getUserInfo()
      if (!this.userInfo && this.userInfo.userType == '') {
        this.router.navigateByUrl('/llp-admin/signin');
        return false;
      }
    return true;
  }
}