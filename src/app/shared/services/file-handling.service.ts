import { Injectable } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, ActivatedRouteSnapshot, Params, PRIMARY_OUTLET } from "@angular/router";
import { SubscriptionService } from './subscription.service';

interface IRoutePart {
  title: string,
  breadcrumb: string,
  params?: Params,
  url: string,
  urlSegments: any[]
}

@Injectable()
export class FileHandlingService {

  constructor(private router: Router, private subscription: SubscriptionService) {}

  checkAvailableSpace = async (callback) => {
    this.subscription.checkSubscription( ( returnArr )=> {
      let defaultSpace      = returnArr.defaultSpace,
          addOnSpace        = returnArr.addOnSpace,
          totalUsedSpace    = returnArr.totalUsedSpace, // In bytes
          totalSpaceAlloted = (( defaultSpace + addOnSpace ) * 1073741824), //total alloted space in bytes i.e 1 GB = 1073741824 Bytes
          message           = "",
          remainingSpace  = (totalUsedSpace - totalSpaceAlloted)
      
      if( totalUsedSpace < totalSpaceAlloted ) {
        // If remaining space less than equal to 500 MB
        if( remainingSpace >= 0 && remainingSpace <= 524288000 ) {
          let remainingSpaceInMB = (remainingSpace / 1048576)
          message = 'Waring! Available space '+remainingSpaceInMB+' MB. Please upgrade your account space from account settings by purchasing an add-on.'
        }
        callback( { remainingSpace: remainingSpace, message: message} )
      }
      else {
        callback( { remainingSpace: remainingSpace, message: message} )
      }
    })
  }
}