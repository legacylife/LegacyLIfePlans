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


  invitedMembersCount: number
  remainingDays: number

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
  checkSubscription = async (callback) => {
    this.userId = localStorage.getItem("endUserId");
    this.usertype = localStorage.getItem("endUserType");
    const req_vars = {
      query: Object.assign({ _id: this.userId, userType: this.usertype }, {})
    }
    
    let returnArr = await this.userapi.apiRequest('get', 'freetrialsettings/getdetails', {}).toPromise(),
        freeTrialPeriodSettings = returnArr.data,
        customerFreeTrialStatus = freeTrialPeriodSettings.customerStatus == 'On'? true : false,
        advisorFreeTrialStatus  = freeTrialPeriodSettings.advisorStatus == 'On'? true : false

    await this.userapi.apiRequest('post', 'userlist/getprofile', req_vars).subscribe( async (result) => {
      
      let bfrSubCustPremiumAccess = Number(freeTrialPeriodSettings.customerFreeAccessDays), // Before subscription customer's premium access days
          bfrSubCustFreeAccess    = Number(freeTrialPeriodSettings.customerAftrFreeAccessDays), // Before subscription customer's free access days
          bfrSubAdvPremiumAccess  = Number(freeTrialPeriodSettings.advisorFreeDays)  // Before subscription adviser's premium access days

      let aftRegistrationDaysDiff = this.usertype == 'customer' ? bfrSubCustPremiumAccess : bfrSubAdvPremiumAccess

      let userData      = result.data.userProfile
      let defaultSpace  = 1,
          addOnSpace    = 0;
      let subscriptionDetails   = userData.subscriptionDetails ? userData.subscriptionDetails : null
      let subscriptionStartDate = "",
          subscriptionEndDate   = "",
          subscriptionStatus    = "",
          autoRenewal = "",
          addOnGiven  = 'no',
          isReferAndEarnStatus= userData.IamIntrested && userData.IamIntrested == 'Yes' ? 'Yes' :  'No',
          extendedReferEarnDate = '',
          totalUsedSpace      = userData.s3Size && userData.s3Size != 0 ? userData.s3Size : 0;
      
      if( subscriptionDetails != null && subscriptionDetails.length > 0 ) {
        isReferAndEarnStatus = 'No'
        subscriptionStartDate = subscriptionDetails[(subscriptionDetails.length-1)]['startDate']
        subscriptionEndDate = subscriptionDetails[(subscriptionDetails.length-1)]['endDate']
        subscriptionStatus = subscriptionDetails[(subscriptionDetails.length-1)]['status']
        defaultSpace = subscriptionDetails[(subscriptionDetails.length-1)]['defaultSpace']
        autoRenewal = subscriptionDetails[(subscriptionDetails.length-1)]['autoRenewal'] ? subscriptionDetails[(subscriptionDetails.length-1)]['autoRenewal'] : false
        let addOnDetails = subscriptionDetails[(subscriptionDetails.length-1)]['addOnDetails']
        //if subscription ends do not sends addon details
        if( new Date(subscriptionEndDate) > new Date() ) {
          addOnGiven = subscriptionDetails[(subscriptionDetails.length-1)]['addOnDetails'] && subscriptionDetails[(subscriptionDetails.length-1)]['addOnDetails']['status'] == 'paid' ? 'yes' : 'no'
          addOnSpace = addOnGiven == 'yes' ? addOnDetails['spaceAlloted'] : 0
        }
      }
      else if( isReferAndEarnStatus == 'Yes' ) {
        let extendedReferEarnProgram = userData.refereAndEarnSubscriptionDetail
        if( Object.keys(extendedReferEarnProgram).length > 0 && extendedReferEarnProgram.status == 'Active') {
          extendedReferEarnDate = extendedReferEarnProgram.endDate
        }
      }
      /**
       * Reset all locastorage variables to check wheater the subscription ends or not
       */
      localStorage.setItem("endUserCreatedOn", userData.createdOn)
      localStorage.setItem("endUserSubscriptionStartDate", subscriptionStartDate)
      localStorage.setItem("endUserSubscriptionEndDate", subscriptionEndDate)
      localStorage.setItem("endUserSubscriptionStatus", subscriptionStatus)
      localStorage.setItem("endUserAutoRenewalStatus", autoRenewal)
      localStorage.setItem("endUserProSubscription", 'no')
      localStorage.setItem("endUserSubscriptionAddon", addOnGiven)
      localStorage.setItem("endisReferAndEarn", isReferAndEarnStatus)

      /**
       * Setting all variables for displaying the subscription details on account setting page
       */
      let diff: any
      let expireDate: any
      let subscriptionDate      = localStorage.getItem("endUserSubscriptionStartDate")
      this.userCreateOn         = moment( localStorage.getItem("endUserCreatedOn") )
      this.isSubscribedBefore   = ( subscriptionDate !== 'undefined' && subscriptionDate !== null && subscriptionDate !== "") ? true : false
      let isReferAndEarn        = localStorage.getItem("endisReferAndEarn") && localStorage.getItem("endisReferAndEarn") == 'Yes' ? true : false
      let isProFreeAdviser = true;
      //If user not taken any paid subscription
      if( !this.isSubscribedBefore ) {
        this.isAccountFree    = true
        this.isSubscribePlan  = false
        diff                  = this.getDateDiff( this.userCreateOn.toDate(), this.today )
        
        //check if user completed or not free 30 days (i.e aftRegistrationDaysDiff) for registration
        if( diff <= aftRegistrationDaysDiff ) {
          defaultSpace = 7
          //check if the advisor participate into refer and earn program and he acheived the monthly invitation sent target
          if( isReferAndEarn && this.usertype == 'advisor') {
            let result        = await this.getInviteMembersCount(),
                extendedDays  = result.data.extendedDays
            if( result.data.count >= result.data.targetCount ) {
              extendedDays     = bfrSubAdvPremiumAccess + (extendedDays * (result.data.completedMonths > 1 ? result.data.completedMonths : 1))
              isProFreeAdviser = true
              expireDate       = this.userCreateOn.add(extendedDays,"days")
            }
            else{
              let isReferEarnExpire = extendedReferEarnDate != '' ? this.getDateDiff( this.today, moment(extendedReferEarnDate).toDate() ) : ''
                
              if( extendedReferEarnDate != '' && isReferEarnExpire >= 0 ) {
                isProFreeAdviser = true
                expireDate       = moment(extendedReferEarnDate)
              }
              else{
                expireDate            = this.userCreateOn.add(bfrSubAdvPremiumAccess,"days")
                isProFreeAdviser = false
              }
            }
          }
          else{
            expireDate            = this.userCreateOn.add(bfrSubCustPremiumAccess,"days")
          }
          this.isPremiumExpired = false

          if(this.usertype == 'advisor') {
            this.planName         = 'Standard'
            if( isProFreeAdviser ) {
              localStorage.setItem('endUserProSubscription', 'yes');
              localStorage.setItem('endUserProFreeSubscription', 'yes');
            }
            else{
              localStorage.setItem('endUserProSubscription', 'yes');
              localStorage.setItem('endUserProFreeSubscription', 'no');
            }
          }
          else{
            this.planName         = 'Legacy Life'
            localStorage.setItem('endUserProSubscription', 'yes');
            localStorage.setItem('endUserProFreeSubscription', 'yes');
          }
        }
        else {
          if( this.usertype == 'customer' ) {
            let totalFreeAccessDays = (bfrSubCustFreeAccess+bfrSubCustPremiumAccess)
            expireDate  = this.userCreateOn.add(totalFreeAccessDays,"days")
            if( diff <= totalFreeAccessDays ) {
              localStorage.setItem('endUserProFreeSubscription', 'yes');
              localStorage.setItem('endUserProSubscription', 'no');
            }
            else{
              localStorage.setItem('endUserProFreeSubscription', 'no');
              localStorage.setItem('endUserProSubscription', 'no');
            }
          }
          else{
            if( isReferAndEarn && this.usertype == 'advisor' ) {
              let result        = await this.getLastInviteMembersCount(),
                  extendedDays  = result.data.extendedDays
                
              if( result.data.count >= result.data.targetCount ) {
                extendedDays     = bfrSubAdvPremiumAccess + (extendedDays * (result.data.completedMonths > 1 ? result.data.completedMonths : 1))
                isProFreeAdviser = true
                expireDate       = this.userCreateOn.add(extendedDays,"days")
              }
              else{
                let isReferEarnExpire = extendedReferEarnDate != '' ? this.getDateDiff( this.today, moment(extendedReferEarnDate).toDate() ) : ''
                
                if( extendedReferEarnDate != '' && isReferEarnExpire >= 0 ) {
                  isProFreeAdviser = true
                  expireDate       = moment(extendedReferEarnDate)
                }
                else{
                  expireDate       = this.userCreateOn.add(bfrSubAdvPremiumAccess,"days")
                  isProFreeAdviser = false
                }
              }              
              
              if( isProFreeAdviser ) {
                localStorage.setItem('endUserProFreeSubscription', 'yes');
                localStorage.setItem('endUserProSubscription', 'yes');
              }
              else{
                localStorage.setItem('endUserProFreeSubscription', 'no');
                localStorage.setItem('endUserProSubscription', 'no');
              }
            }
            else{
              expireDate  = this.userCreateOn.add(bfrSubAdvPremiumAccess,"days")
              localStorage.setItem('endUserProFreeSubscription', 'no');
              localStorage.setItem('endUserProSubscription', 'no');
            }
          }
          this.planName         = 'Free'
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
          localStorage.setItem('endUserProFreeSubscription', 'yes');
          localStorage.setItem('endUserProSubscription', 'yes');
        }
        else {
          if( this.usertype == 'customer' ) {
            expireDate          = this.userSubscriptionDate.add(bfrSubCustFreeAccess,"days")
            let freeAccessDiff  = this.getDateDiff( this.today, expireDate.toDate() )
            if( freeAccessDiff >= 0 ) {
              localStorage.setItem('endUserProFreeSubscription', 'yes');
            }
            else {
              localStorage.setItem('endUserProFreeSubscription', 'no');
            }
          }
          else{
            expireDate            = this.userSubscriptionDate
            localStorage.setItem('endUserProFreeSubscription', 'no');
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
                        subscriptionExpireDate : this.subscriptionExpireDate,
                        totalUsedSpace: totalUsedSpace,
                        defaultSpace: Number( defaultSpace ),
                        addOnSpace: Number( addOnSpace )
                      }
      callback(returnArr)
    })
  }

  async getInviteMembersCount() {
    const params = {
      inviteById: this.userId,
      inviteType: 'advisor'
    }
    let extendedDays = 30
    let result = await this.userapi.apiRequest('post', 'invite/get-invite-members-count', params).toPromise()
    return result
    /* if( result.data.count > 5 ) {
      let completedMonths = extendedDays * (result.data.completedMonths > 1 ? result.data.completedMonths : 1)
      return completedMonths
    }
    else{
      return extendedDays
    } */
  }

  async getLastInviteMembersCount() {
    const params = {
      inviteById: this.userId,
      inviteType: 'advisor'
    }
    let extendedDays = 30
    let result = await this.userapi.apiRequest('post', 'invite/get-last-invite-members-count', params).toPromise()
    return result
  }

  checkSubscriptionAdminPanel = (userDetails,callback) => {
    let returnArr = {}
    if(userDetails.userType != 'sysAdmin') {
      let subscriptions = userDetails.subscriptionDetails ? userDetails.subscriptionDetails : null
      if( subscriptions != null ) {
        let currentSubscription = subscriptions[subscriptions.length-1]
        let diff: any
        let expireDate: any
        let subscriptionDate      = currentSubscription && currentSubscription.startDate ? currentSubscription.startDate : null
        this.userCreateOn         = moment( userDetails.createdOn )
        this.isSubscribedBefore   = ( subscriptionDate !== 'undefined' && subscriptionDate !== null && subscriptionDate !== "") ? true : false
        
        if( !this.isSubscribedBefore ) {
          this.isAccountFree    = true
          this.isSubscribePlan  = false
          diff                  = this.getDateDiff( this.userCreateOn.toDate(), this.today )

          if( diff <= 30 ) {
            expireDate            = this.userCreateOn.add(30,"days")
            this.isPremiumExpired = false
          }
          else {
            if( userDetails.userType == 'customer' ) {
              expireDate            = this.userCreateOn.add(60,"days")
            }
            else{
              expireDate            = this.userCreateOn.add(30,"days")
            }  
            let freeAccessDiff  = this.getDateDiff( this.today, expireDate.toDate() )
            if( freeAccessDiff >= 0 ) {
              this.isAccountFree    = true
            }
            else{
              this.isAccountFree    = false
            }      
            this.isPremiumExpired = true
          }
          this.subscriptionExpireDate = expireDate.format("DD/MM/YYYY")
        }
        else if( this.isSubscribedBefore ) {
          this.isSubscriptionCanceled = ( currentSubscription.status && currentSubscription.status == 'canceled' ) ? true : false
          this.autoRenewalFlag = ( currentSubscription.autoRenewal && currentSubscription.autoRenewal == 'true' ) ? true : false
          this.autoRenewalVal = this.autoRenewalFlag
          this.autoRenewalStatus = this.autoRenewalVal ? 'on' : 'off'
          this.userSubscriptionDate = moment( currentSubscription.endDate )
          this.isAccountFree    = false
          diff                  = this.getDateDiff( this.today, this.userSubscriptionDate.toDate() )
          
          if( diff >= 0 ) {
            expireDate            = this.userSubscriptionDate
            this.isPremiumExpired = false
            this.isSubscribePlan  = true
            if( userDetails.userType == 'advisor' ) {
              this.planName         = 'Standard'
            }
            else{
              this.planName         = 'Legacy Life'
            }
          }
          else {
            if( userDetails.userType == 'customer' ) {
              expireDate          = this.userSubscriptionDate.add(30,"days")
            }
            else{
              expireDate            = this.userSubscriptionDate
            }

            let freeAccessDiff  = this.getDateDiff( this.today, expireDate.toDate() )
            if( freeAccessDiff >= 0 ) {
              this.isAccountFree    = true
            }
            else{
              this.isAccountFree    = false
            }
            this.isPremiumExpired = true
            this.isSubscribePlan  = false
            this.planName         = 'Free'
          }
          this.subscriptionExpireDate = expireDate.format("DD/MM/YYYY")
        }

        returnArr = { userCreateOn:  this.userCreateOn,
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
      }
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
  cancelSubscription ( userId, isSubscriptionCanceled:boolean,cb ): any {
    if( !isSubscriptionCanceled ) {
      this.loader.open();
      const req_vars = {
        query: Object.assign({ _id: userId, userType: this.usertype }, {})
      }
      
      return this.userapi.apiRequest('post', 'userlist/cancelsubscription', req_vars).subscribe(result => {
        if (result.status == "error") {
          this.loader.close()
          cb(false)

        } else {
          let cancelData = result.data
          localStorage.setItem('endUserSubscriptionStatus', cancelData.subscriptionStatus)
          this.snack.open("Subscription successfully canceled. Please check email for more info.", 'OK', { duration: 4000 })
          this.loader.close()
          cb(true)
        }
      }, (err) => {
        this.loader.close()
        cb(false)
      })
    }
    cb(false)
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