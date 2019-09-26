import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, ActivatedRoute, Router } from '@angular/router';
import { routerNgProbeToken } from '@angular/router/src/router_module';

@Injectable()
export class LoginGaurd implements CanActivate {
  userId: string
  userType: string

  constructor(private router: Router) {
    this.userId = localStorage.getItem("endUserId");
    this.userType = localStorage.getItem("endUserType");
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if ( this.userId && this.userId != "" ) {          
      return true
    }
    else{
      this.router.navigate(['/guest/coach-corner-details/'+route.params['aliasName']]);
    }
    return false
  }
}