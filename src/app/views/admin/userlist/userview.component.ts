import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { adminSections } from '../../../config';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { AdvisorRejectPopupComponent } from './ngx-table-popup/advisor-reject-popup.component';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { serverUrl, s3Details } from '../../../config';
import { SubscriptionService } from 'app/shared/services/subscription.service';
import  * as moment  from 'moment'
const filePath = s3Details.url+'/'+s3Details.profilePicturesPath;
@Component({
  selector: 'userview',
  templateUrl: './userview.component.html',
  styleUrls: ['./userlist.component.scss']
})
export class userviewComponent implements OnInit {
  userId: string
  successMessage: string = ""
  errorMessage: string = ""
  userType: string = ""
  row: any;
  dpPath: string = ""
  selectedUserId: string = "";
  adminSections = [];
  loggedInUserDetails: any;
  profilePicture: any = "assets/images/arkenea/default.jpg"
  statMsg = "";
  subscriptionDetails:object = {
    planStatus:'Trial',
    expiryDate:'',
    planName: 'Free Plan'
  }
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

 // websites:any;
  constructor(
    private api: APIService, private route: ActivatedRoute, 
    private router: Router, private snack: MatSnackBar, private dialog: MatDialog,
    private confirmService: AppConfirmService, private loader: AppLoaderService,
    private subscriptionservice:SubscriptionService) { }
  ngOnInit() {
    this.dpPath = filePath;
    const locationArray = location.href.split('/')
    this.selectedUserId = locationArray[locationArray.length - 1]
    this.loggedInUserDetails = this.api.getUser()
    this.adminSections = adminSections;
    //this.websites = '';
    this.getUser()
  }

  //function to get all events
  getUser = (query = {}, search = false) => {

    const req_vars = {
      query: Object.assign({ _id: this.selectedUserId }, query)
    }

    this.api.apiRequest('post', 'userlist/viewall', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.row = result.data
        this.profilePicture = s3Details.url + "/" + s3Details.profilePicturesPath + result.data.profilePicture;
        
        if(this.row.userType != 'sysAdmin') {
          this.subscriptionservice.checkSubscriptionAdminPanel( this.row, ( returnArr )=> {
            this.userCreateOn = returnArr.userCreateOn
            this.isSubscribedBefore = returnArr.isSubscribedBefore
            this.isSubscriptionCanceled = returnArr.isSubscriptionCanceled
            this.autoRenewalFlag = returnArr.autoRenewalFlag
            this.autoRenewalVal = returnArr.autoRenewalVal
            this.autoRenewalStatus = returnArr.autoRenewalStatus
            this.isAccountFree = returnArr.isAccountFree
            this.isPremiumExpired = returnArr.isPremiumExpired
            this.isSubscribePlan = returnArr.isSubscribePlan
            this.planName = returnArr.planName
            this.subscriptionExpireDate = returnArr.subscriptionExpireDate
          })
          /* let subscriptions = this.row.subscriptionDetails ? this.row.subscriptionDetails : null
          if( subscriptions != null ) {
            let currentSubscription = subscriptions[subscriptions.length-1]
            let diff: any
            let expireDate: any
            let subscriptionDate      = currentSubscription && currentSubscription.startDate ? currentSubscription.startDate : null
            this.userCreateOn         = moment( this.row.createdOn )
            this.isSubscribedBefore   = ( subscriptionDate !== 'undefined' && subscriptionDate !== null && subscriptionDate !== "") ? true : false
            
            if( !this.isSubscribedBefore ) {
              this.isAccountFree    = true
              this.isSubscribePlan  = false
              diff                  = this.subscriptionservice.getDateDiff( this.userCreateOn.toDate(), this.today )

              if( diff <= 30 ) {
                expireDate            = this.userCreateOn.add(30,"days")
                this.isPremiumExpired = false
              }
              else {
                if( this.row.usertype == 'customer' ) {
                  expireDate            = this.userCreateOn.add(60,"days")
                }
                else{
                  expireDate            = this.userCreateOn.add(30,"days")
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
              diff                  = this.subscriptionservice.getDateDiff( this.today, this.userSubscriptionDate.toDate() )
              
              if( diff >= 0 ) {
                expireDate            = this.userSubscriptionDate
                this.isPremiumExpired = false
                this.isSubscribePlan  = true
                if(this.row.usertype == 'advisor') {
                  this.planName         = 'Standard'
                }
                else{
                  this.planName         = 'Legacy Life'
                }
              }
              else {
                if( this.row.usertype == 'customer' ) {
                  expireDate          = this.userSubscriptionDate.add(30,"days")
                }
                else{
                  expireDate            = this.userSubscriptionDate
                }
                this.isPremiumExpired = true
                this.isSubscribePlan  = false
                this.planName         = 'Free'
              }
              this.subscriptionExpireDate = expireDate.format("DD/MM/YYYY")
            }
          } */
        }
      }
    }, (err) => {
      console.error(err)
      //this.showLoading = false
    })


  }

  statusChange(row) {
    this.statMsg = "Are you sure you want to activate this user, " + row.username + " Access to the website account for the customers and trustees will be opened as per the subscription status of this advisor."
    this.confirmService.confirm({ message: this.statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          var query = {};
          const req_vars = {
            query: Object.assign({ _id: row._id }, query),
            userType : 'advisor'
          }
          this.api.apiRequest('post', 'advisor/activateadvisor', req_vars).subscribe(result => {
            if (result.status == "error") {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {
              this.getUser()
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            }
          }, (err) => {
            console.error(err)
            this.loader.close();
          })
        }
      })
  }

  rejectPopUp(data: any = {}, isNew?) {
    let title = 'Advisor Rejection';
    let dialogRef: MatDialogRef<any> = this.dialog.open(AdvisorRejectPopupComponent, {
      width: '720px',
      disableClose: true,
      data: { title: title, payload: data }
    })
    dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
        this.loader.open();
        this.getUser()
        this.loader.close();
        this.snack.open('Advisor has been rejected successfully!', 'OK', { duration: 4000 })
      })
  }

}