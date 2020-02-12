import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { MatSnackBar } from '@angular/material';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { egretAnimations } from "../../../shared/animations/egret-animations";
import { SubscriptionService } from 'app/shared/services/subscription.service';
import  * as moment  from 'moment'

@Component({
  selector: 'customerlist',
  templateUrl: './customerlist.component.html',
  styleUrls: ['./customerlist.component.scss'],
  animations: egretAnimations
})
export class customerlistComponent implements OnInit {
  userId: string;
  closeResult: string;
  userType: string = ""
  showOrgSugg: boolean = true
  public rows: any[];
  temp = [];
  aceessSection: any;
  my_messages: any;
  today: Date = moment().toDate()

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
  autoRenewalVal: boolean = false
  isPremiumExpired: boolean = false
  isSubscriptionCanceled: boolean = false
  userCreateOn: any
  userSubscriptionDate: any
  processing: boolean = false
  constructor(private api: APIService, private route: ActivatedRoute, private router: Router, private snack: MatSnackBar, private confirmService: AppConfirmService, private loader: AppLoaderService,
    private subscriptionservice: SubscriptionService) { }
  ngOnInit() {
    this.aceessSection = this.api.getUserAccess('usermanagement')
    this.my_messages = {
      'emptyMessage': 'No records Found'
    };

    this.getLists();
    //this.loader.open();
  }

  //function to get all events
  getLists = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ userType: "customer" }, query),
      order: { "createdOn": -1 },
    }
    this.loader.open();
    this.api.apiRequest('post', 'userlist/list', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      } else {
        this.rows = this.temp = result.data.userList.map(row => {
          if (row.userType != 'sysAdmin') {
            //let subscriptionData = {}
            this.subscriptionservice.checkSubscriptionAdminPanel({userId:row._id,userType:row.userType},( returnArr )=> {
              let subscriptionExpireDate = '';
              let subscriptionStatus = returnArr.planName+' Plan';
              let targetCount = returnArr.targetCount;
              if(returnArr.subscriptionExpireDate) {
                 console.log('returnArr>>>',returnArr.subscriptionExpireDate,'--',returnArr.paymentStatus,'-----',returnArr.planName)
                 subscriptionExpireDate = returnArr.subscriptionExpireDate                 
              }
              row['subscriptionData'] = {
                status: subscriptionStatus,
                targetCount: targetCount,
                endDate: subscriptionExpireDate ? subscriptionExpireDate : ''
              }
                // this.isPremiumExpired = returnArr.isPremiumExpired;
                // this.isSubscribePlan = returnArr.isSubscribePlan;
                // this.planName = returnArr.planName;
                // this.subscriptionExpireDate = returnArr.subscriptionExpireDate;
            });
            // let subscriptionData = this.subscriptionDetails(row);
            // row['subscriptionData'] = {
            //   status: subscriptionData.subscriptionStatus,
            //   endDate: subscriptionData.userSubscriptionEnddate ? subscriptionData.userSubscriptionEnddate : ''
            // }
          }
          return row;
        })
        this.processing = true;
      }
    }, (err) => {
      console.error(err)
    })
  }

  statusChange(row) {
    var statMsg = "Are you sure you want to re-activate this user, " + row.username + " Access to the website account for the customer, trustees and advisors will be re-opened as per the subscription status of this customer."
    if (row.status == 'Active') {
      statMsg = "Are you sure you want to deactivate this user, " + row.username + " Access to the website account will be locked for the customer, trustees and advisors. This does not affect the data uploaded by the customer."
    }
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          var query = {};
          const req_vars = {
            query: Object.assign({ _id: row._id }, query),
            fromId: localStorage.getItem('userId')
          }
          this.api.apiRequest('post', 'userlist/updatestatus', req_vars).subscribe(result => {
            this.loader.close();
            if (result.status == "error") {
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {
              this.getLists()
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            }
          }, (err) => {
            console.error(err)
            this.loader.close();
          })
        }
      })
  }

  //table
  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    var columns = Object.keys(this.temp[0]);
    // Removes last "$$index" from "column"
    columns.splice(columns.length - 1);

    // console.log(columns);
    if (!columns.length)
      return;

    const rows = this.temp.filter(function (d) {
      for (let i = 0; i <= columns.length; i++) {
        let column = columns[i];
        // console.log(d[column]);
        if (d[column] && d[column].toString().toLowerCase().indexOf(val) > -1) {
          return true;
        }
      }
    });

    this.rows = rows;
  }


  subscriptionDetails(row) {
    let userSubscriptionEnddate = '';
    if(row.userSubscriptionEnddate){
      userSubscriptionEnddate = row.userSubscriptionEnddate;
    }
    let planName = row.userType == 'advisor' ? 'Standard' : 'Legacy Life';
    let subscriptionStatus = "Paid";

    let subscriptions = row.subscriptionDetails ? row.subscriptionDetails : null;
    if (subscriptions && subscriptions.length > 0) {

      let currentSubscription = subscriptions[subscriptions.length - 1];
      if (currentSubscription.status == 'trialing') {
        subscriptionStatus = "Trialing";
        planName = 'Free';
      }
      else if (currentSubscription.status == 'canceled') {
        subscriptionStatus = "Canceled";
      }
      else {
        subscriptionStatus = "Paid";
      }
    }
    else {
      subscriptionStatus = "Trialing";
      planName = 'Free';
    }

    if (userSubscriptionEnddate && userSubscriptionEnddate != '') {
      let endDate = new Date(userSubscriptionEnddate)
      let today = new Date(this.today)
      if (endDate < today) {
        subscriptionStatus = "Expired";
      }
    }

    let subscriptionData = {
      "userSubscriptionEnddate" : userSubscriptionEnddate,
      "subscriptionStatus" : subscriptionStatus,
      "planName" : planName
    }

    return subscriptionData;

  }

}