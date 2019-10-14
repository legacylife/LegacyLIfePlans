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

  checkAvailableSpace = (userData={}, callback) => {
    console.log("here124234234",userData)
    this.subscription.checkSubscription( userData, ( returnArr )=> {
      console.log("returnArr",returnArr)

      let isPremiumExpired  = returnArr.isPremiumExpired,
          isSubscribePlan   = returnArr.isSubscribePlan,
          isAccountFree     = returnArr.isAccountFree,
          isGetAddOn        = localStorage.getItem('endUserSubscriptionAddon') && localStorage.getItem('endUserSubscriptionAddon') == 'yes' ? true : false,
          allotedSpace      = 1,
          defaultSpace      = Number(returnArr.defaultSpace),
          addOnSpace        = Number(returnArr.addOnSpace),
          totalUsedSpace    = Number(returnArr.totalUsedSpace) // In bytes

        if( isAccountFree && !isPremiumExpired ) {
          allotedSpace = returnArr.defaultSpace
        }
        else if( isSubscribePlan && !isPremiumExpired ) {
          allotedSpace = returnArr.defaultSpace
          if( isGetAddOn ) {
            allotedSpace = defaultSpace + addOnSpace
          }
        }

      let totalSpaceAlloted = (allotedSpace * 1073741824), //total alloted space in bytes i.e 1 GB = 1073741824 Bytes
          message           = "",
          remainingSpace    = ( totalSpaceAlloted - totalUsedSpace )

      if( totalUsedSpace < totalSpaceAlloted ) {
        // for - If remaining space less than equal to 500 MB
        let remainingSpaceInMB = (remainingSpace / 1048576).toFixed(2)
        if( remainingSpace >= 0 && remainingSpace <= 524288000 ) {
          message = 'Warning! Available space '+remainingSpaceInMB+' MB. Please upgrade your account from account settings by purchasing an add-on.'
        }
        callback( { remainingSpace: remainingSpace, message: message, totalUsedSpace: totalUsedSpace, totalSpaceAlloted: totalSpaceAlloted} )
      }
      else if( totalUsedSpace >= totalSpaceAlloted ) {
        message = 'You are exceed the limit for file upload. Please upgrade your account from account settings by purchasing an add-on if not purchased.'
        callback( { remainingSpace: remainingSpace, message: message, totalUsedSpace: totalUsedSpace, totalSpaceAlloted: totalSpaceAlloted} )
      }
      else {
        callback( { remainingSpace: remainingSpace, message: message, totalUsedSpace: totalUsedSpace, totalSpaceAlloted: totalSpaceAlloted} )
      }
    })
  }
}