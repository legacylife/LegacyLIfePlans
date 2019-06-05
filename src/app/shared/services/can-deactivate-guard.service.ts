import { Injectable} from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {  Observable, of } from 'rxjs';
// interface CanDeactivateGuard<T> { 
//   canDeactivate(component: T, 
//                 currentRoute: ActivatedRouteSnapshot,
//                 currentState: RouterStateSnapshot,
//                 nextState?: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean
// } 


export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable()
export class CanDeactivateGuard implements CanDeactivate<CanComponentDeactivate> {
  canDeactivate(component: CanComponentDeactivate, 
           route: ActivatedRouteSnapshot, 
           state: RouterStateSnapshot) {

     let url: string = state.url;
     console.log('Url: '+ url);

     return component.canDeactivate ? component.canDeactivate() : true;
  }
} 