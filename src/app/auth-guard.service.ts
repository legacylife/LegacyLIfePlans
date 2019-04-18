import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { APIService } from './api.service';

@Injectable()
export class AuthGuardService implements CanActivate {

  constructor(private auth: APIService, private router: Router) {}

  canActivate() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/');
      return false;
    }
    return true;
  }
}
