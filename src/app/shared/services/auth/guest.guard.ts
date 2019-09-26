import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, ActivatedRoute, Router } from '@angular/router';
import { routerNgProbeToken } from '@angular/router/src/router_module';

@Injectable()
export class GuestGaurd implements CanActivate {
  userId: string
  userType: string

  constructor(private router: Router) {
    this.userId = localStorage.getItem("endUserId");
    this.userType = localStorage.getItem("endUserType");
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if ( this.userId && this.userId != "" ) {          
      this.router.navigate(['/coach-corner-details/'+route.params['aliasName']]);
    }
    else{
      return true
    }
  }
}