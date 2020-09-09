import { Injectable } from '@angular/core';
import { CanActivate, CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
//import { ConfirmDialogModule, ConfirmationService, SharedModule } from 'primeng/primeng';

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable()
export class CanDeactivateGuard implements CanDeactivate<CanComponentDeactivate> {

  allowRedirect: boolean

  constructor(private confirmService: AppConfirmService) {
    this.allowRedirect = true
  }

  canDeactivate(component: CanComponentDeactivate,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ) {
    let url: string = state.url;
    // console.log('Url: ' + nextState);
    if (component.canDeactivate()) {
      return this.allowRedirect
    } else {
      
      return this.confirmService.confirm({ message: 'All the unsaved changes will be lost. Do you want to continue?' })

    }
  }
}