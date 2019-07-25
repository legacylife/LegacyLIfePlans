import { Injectable } from '@angular/core';
import { UserAPIService } from 'app/userapi.service';
import { AppLoaderService } from './app-loader/app-loader.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import  * as moment  from 'moment'
import { MatSnackBar } from '@angular/material';

@Injectable()
export class SubscriptionService {
  userId: string
  usertype: string
  activeUrls:boolean;
  observableActiveUrls = new BehaviorSubject<boolean>(this.activeUrls);

  /**
   * Subscription variable declaration
   */
  planName: string = 'Free'
  autoRenewalStatus: string = 'off'
  subscriptionExpireDate: string = ''

  isAccountFree: boolean = true
  isSubscribePlan: boolean = false
  isSubscribedBefore: boolean = false
  autoRenewalFlag: boolean = false
  autoRenewalVal:boolean = false
  isPremiumExpired: boolean = false
  isSubscriptionCanceled:boolean = false
  userCreateOn: any
  userSubscriptionDate: any
  today: Date = moment().toDate()

  constructor( private userapi: UserAPIService, private loader: AppLoaderService, private snack: MatSnackBar ) {
    this.userId = localStorage.getItem("endUserId");
    this.usertype = localStorage.getItem("endUserType");
  }

  changeActiveHrUrl(){
    this.observableActiveUrls.next(true);
  }

  /**
   * Check the user subscription details
   */
  checkSubscription = (callback) => {
    
    let diff: any
    let expireDate: any
    let subscriptionDate      = localStorage.getItem("endUserSubscriptionStartDate")
    this.userCreateOn         = moment( localStorage.getItem("endUserCreatedOn") )
    this.isSubscribedBefore   = ( subscriptionDate !== 'undefined' && subscriptionDate !== null && subscriptionDate !== "") ? true : false
    
    if( !this.isSubscribedBefore ) {
      this.isAccountFree    = true
      this.isSubscribePlan  = false
      diff                  = this.getDateDiff( this.userCreateOn.toDate(), this.today )

      if( diff <= 30 ) {
        expireDate            = this.userCreateOn.add(30,"days")
        this.isPremiumExpired = false
        if(this.usertype == 'advisor') {
          this.planName         = 'Standard'
        }
        else{
          this.planName         = 'Legacy Life'
        }
        localStorage.setItem('endUserProSubscription', 'yes');
      }
      else {
        if( this.usertype == 'customer' ) {
          expireDate            = this.userCreateOn.add(60,"days")
        }
        else{
          expireDate            = this.userCreateOn.add(30,"days")
        }
        this.planName         = 'Free'
        localStorage.setItem('endUserProSubscription', 'no');
        this.isPremiumExpired = true
      }
      this.subscriptionExpireDate = expireDate.format("DD/MM/YYYY")
    }
    else if( this.isSubscribedBefore ) {
      this.isSubscriptionCanceled = ( localStorage.getItem("endUserSubscriptionStatus") && localStorage.getItem("endUserSubscriptionStatus") == 'canceled' ) ? true : false
      this.autoRenewalFlag = ( localStorage.getItem("endUserAutoRenewalStatus") && localStorage.getItem("endUserAutoRenewalStatus") == 'true' ) ? true : false
      this.autoRenewalVal = this.autoRenewalFlag
      this.autoRenewalStatus = this.autoRenewalVal ? 'on' : 'off'
      this.userSubscriptionDate = moment( localStorage.getItem("endUserSubscriptionEndDate") )
      this.isAccountFree    = false
      diff                  = this.getDateDiff( this.today, this.userSubscriptionDate.toDate() )
      
      if( diff >= 0 ) {
        expireDate            = this.userSubscriptionDate
        this.isPremiumExpired = false
        this.isSubscribePlan  = true
        if(this.usertype == 'advisor') {
          this.planName         = 'Standard'
        }
        else{
          this.planName         = 'Legacy Life'
        }
        
        localStorage.setItem('endUserProSubscription', 'yes');
      }
      else {
        if( this.usertype == 'customer' ) {
          expireDate          = this.userSubscriptionDate.add(30,"days")
        }
        else{
          expireDate            = this.userSubscriptionDate
        }
        localStorage.setItem('endUserProSubscription', 'no');
        this.isPremiumExpired = true
        this.isSubscribePlan  = false
        this.planName         = 'Free'
      }
      this.subscriptionExpireDate = expireDate.format("DD/MM/YYYY")
    }
    let returnArr = { userCreateOn:  this.userCreateOn,
                      isSubscribedBefore: this.isSubscribedBefore,
                      isSubscriptionCanceled : this.isSubscriptionCanceled,
                      autoRenewalFlag : this.autoRenewalFlag,
                      autoRenewalVal : this.autoRenewalVal,
                      autoRenewalStatus : this.autoRenewalStatus,
                      isAccountFree: this.isAccountFree,
                      isPremiumExpired : this.isPremiumExpired,
                      isSubscribePlan : this.isSubscribePlan,
                      planName : this.planName,
                      subscriptionExpireDate : this.subscriptionExpireDate
                    }
    callback(returnArr)
  }

  // get product plan
  getProductDetails = (query = {}, callback):any => {
    this.loader.open();
    const req_vars = {
      query: Object.assign({ _id: this.userId, userType: this.usertype }, query)
    }
    
    this.userapi.apiRequest('post', 'userlist/getproductdetails', req_vars).subscribe(result => {
      if (result.status == "error") {
        this.loader.close();
      } else {
        const plans = result.data.plans
        let returnArr = {}
        if( plans && result.status=="success" && plans.data.length>0 ) {
          
          plans.data.forEach( obj => {
            if( this.usertype == 'customer' && obj.id == 'C_YEARLY' ) {
              returnArr = { productId: obj.product,
                                planId : obj.id,
                                planInterval : obj.interval,
                                planAmount : ( obj.amount / 100 ),
                                planCurrency : (obj.currency).toLocaleUpperCase(),
                                defaultSpace : obj.metadata.defaultSpace,
                                spaceDimension : obj.metadata.spaceDimension
                              }
            }
            else if( this.usertype == 'advisor' && obj.id == 'A_MONTHLY' ) {
              returnArr = { productId: obj.product,
                            planId : obj.id,
                            planInterval : obj.interval,
                            planAmount : ( obj.amount / 100 ),
                            planCurrency : (obj.currency).toLocaleUpperCase()
                          }
            }
          }) 
        }
        this.loader.close();
        callback(returnArr); 
      }
    }, (err) => {
      this.loader.close();
    })
  }

  // get plan details
  getPlanDetails = ( callback ):any => {
    
    const req_vars = {
      query: Object.assign({ _id: this.userId, userType: this.usertype }, {})
    }
    
    this.userapi.apiRequest('post', 'userlist/getplandetails', req_vars).subscribe(result => {
      
      const planDetails = result.data.plan
      let returnArr = {}
      if( result.status=="success" && planDetails ) {
          returnArr = planDetails
      }
      callback(returnArr);
    },
    (err) => { })
  }

  /**
   * update auto renewal status and localstorage variable
   * @param userId 
   * @param autoRenewalVal 
   */
  updateAutoRenewalStatus ( userId, autoRenewalVal:boolean ) : any {
    this.loader.open();
    const req_vars = {
      query: Object.assign({ _id: userId, userType: this.usertype, status: autoRenewalVal }, {})
    }
    
    this.userapi.apiRequest('post', 'userlist/autorenewalupdate', req_vars).subscribe(result => {
      if (result.status == "error") {
        this.loader.close();
        return false
      }
      else {
        let returnData = result.data
        localStorage.setItem('endUserAutoRenewalStatus', returnData.autoRenewalStatus);
        this.snack.open("Auto renewal status updated.", 'OK', { duration: 4000 })
        this.loader.close();
        return true
      }
    }, (err) => {
      this.loader.close();
      return false
    })
  }

  /**
   * cancel subscription and update localstorage cariable
   * @param userId 
   * @param isSubscriptionCanceled 
   */
  cancelSubscription ( userId, isSubscriptionCanceled:boolean ): any {
    if( !isSubscriptionCanceled ) {
      this.loader.open();
      const req_vars = {
        query: Object.assign({ _id: userId, userType: this.usertype }, {})
      }
      
      return this.userapi.apiRequest('post', 'userlist/cancelsubscription', req_vars).subscribe(result => {
        if (result.status == "error") {
          this.loader.close()
          return false
        } else {
          let cancelData = result.data
          localStorage.setItem('endUserSubscriptionStatus', cancelData.subscriptionStatus)
          this.snack.open("Subscription successfully canceled. Please check email for more info.", 'OK', { duration: 4000 })
          this.loader.close()
          return true
        }
      }, (err) => {
        this.loader.close()
        return false
      })
    }
    return false
  }

  /**
   * return date difference in days
   * @param startDate 
   * @param endDate 
   */
  getDateDiff( startDate:Date, endDate:Date ) {
    return moment.duration( 
        moment(endDate).diff( moment(startDate) ) 
      ).asDays()
  }
}