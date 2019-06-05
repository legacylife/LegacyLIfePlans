import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot }  from '@angular/router';
import { CustomerAccountSettingComponent } from './../../views/customer/customer-account-setting/customer-account-setting.component';
import { AppConfirmService } from '../../shared/services/app-confirm/app-confirm.service';
//import { DialogService } from './dialog.service';

@Injectable()
export class CountryEditCanDeactivateGuard implements CanDeactivate<CustomerAccountSettingComponent> {
  
  constructor(private confirmService: AppConfirmService) { }

  canDeactivate(
    component: CustomerAccountSettingComponent,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    
    //  let url: string = state.url;console.log('Url: '+ url);

      if (!component.isUpdating && component.ProfileForm.dirty) {
        component.isUpdating = false;
        this.confirmService.confirm({ message: "Discard changes for Person?" }).subscribe(res => {
          if (res) {
            
       
          }
        })
      }
      return true;
  }
}