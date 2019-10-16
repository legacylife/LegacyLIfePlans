import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { APIService } from './../../../api.service';

@Injectable()
export class PreAuthGuard implements CanActivate {
  public authToken;
  private isAuthenticated = false; // Set this value dynamically
  private userInfo: any
  
  constructor(private router: Router, private api: APIService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      this.userInfo = this.api.getUserInfo();
      if (this.userInfo && this.userInfo.userType == 'sysadmin') {
        //this.api.logout();
       // const locationArray = location.href.split('/');
      //  console.log('Preauth---',locationArray,"=2nd",locationArray[locationArray.length - 2],' 3rd---',locationArray[locationArray.length - 3],' 4th---',locationArray[locationArray.length - 4]);
       // if(locationArray[locationArray.length - 3]!='admin' || locationArray[locationArray.length - 4]!='admin'){
          this.router.navigateByUrl('/admin/dashboard');
        //}

        return false;     
      }
    return true;
  }
}