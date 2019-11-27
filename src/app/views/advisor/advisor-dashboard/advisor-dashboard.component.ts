import { Component, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { UserAPIService } from './../../../userapi.service';
import { s3Details } from '../../../config';
import { ReferAndEarnModalComponent } from 'app/views/refer-and-earn-modal/refer-and-earn-modal.component';
import { SubscriptionService } from 'app/shared/services/subscription.service';
//import { ReferAndEarnModalComponent } from '../legacies/refer-and-earn-modal/refer-and-earn-modal.component';

const profileFilePath = s3Details.url + '/' + s3Details.profilePicturesPath;

@Component({
  selector: 'app-advisor-dashboard',
  templateUrl: './advisor-dashboard.component.html',
  styleUrls: ['./advisor-dashboard.component.scss']
})
export class AdvisorDashboardComponent implements OnInit {

  recentLogs: boolean = true;
  userId: string;
  recentActivityLogList: any;
  profileFilePath: string = profileFilePath;
  invitedMembersCount: any = 0
  remainingDays:any = 0
  LeadsCount: any = 0
  invitedMembersCountDefault:string='5'

  /**
   * Subscription variable declaration
   */
  planName: string = 'free'
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

  targetCount:Number = 0
  extendedDays:Number = 0
  subscriptionData :any 

  constructor(
    private userapi: UserAPIService,
    private router: Router, private dialog: MatDialog,
    private snack: MatSnackBar, private confirmService: AppConfirmService,
    private loader: AppLoaderService,
    private subscriptionservice:SubscriptionService
  ) { }

  
  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.getAdvisorActivityLogList();
    this.getInviteMembersCount();
    this.getLeadsCount();

    if(this.userId){
      const req_vars = { userId: this.userId }    
      this.userapi.apiRequest('post', 'auth/view', req_vars).subscribe(result => {  
        this.subscriptionData = [];
        if(result.data.subscriptionDetails){
          this.subscriptionData = result.data.subscriptionDetails;
        }
      }, (err) => {
        console.error(err)
      })
    }


  }

  checkSubscription() {
    this.subscriptionservice.checkSubscription( '', ( returnArr )=> {
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
  }

  @HostListener('document:click', ['$event']) clickedOutside(event){
    if(event.srcElement.outerText=='Invite'){
      setTimeout(()=>{     
        this.getInviteMembersCount();    
      },2000);     
    } 
  }

  getInviteMembersCount() {
    const params = {
      inviteById: this.userId,
      inviteType: 'advisor'
    }
    this.userapi.apiRequest('post', 'invite/get-invite-members-count', params).subscribe(result => {
      this.invitedMembersCount = result.data.count
      this.remainingDays = result.data.remainingDays
      this.targetCount = result.data.targetCount
      this.extendedDays = result.data.extendedDays
    })
  }

  getLeadsCount() {
    const params = {
      advisorId: this.userId
    }
    this.userapi.apiRequest('post', 'lead/get-leads-count', params).subscribe(result => {
      this.LeadsCount = result.data.count
    })
  }

  getAdvisorActivityLogList = (query = {}, search = false) => {

    const req_vars = {
      query: Object.assign({ advisorId: this.userId }, query),
      fields: {},
      offset: 0,
      limit: "",
      order: { "modifiedOn": -1 },
    }
    this.userapi.apiRequest('post', 'advisor/recentupdatelist', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.recentActivityLogList = result.data.logList;
        if (result.data.totalRecords > 0) {
          this.recentLogs = true;
        }
        else {
          this.recentLogs = false;
        }
      }
    }, (err) => {
      console.error(err);
    })
  }

  hireAdvisor(hiredAdvisorRefId, actionName, actionTaken, ids) {
    let statMsg = 'Are you sure you want to reject hire request?'
    let hirestatus = actionTaken;
    if (actionName == 'confirmHire') {
      statMsg = 'Are you sure you want to confirm hire request?';
      hirestatus = 'Active';
    }
    if (actionName == 'rejectHire') {
      hirestatus = 'Rejected';
    }

    this.confirmService.confirm({ message: statMsg }).subscribe(res => {
      if (res) {
        this.loader.open();
        let query = {};
        let proquery = { status: hirestatus };
        let extraFields = { advFname: localStorage.getItem("endUserFirstName"), advLname: localStorage.getItem("endUserLastName") }

        const req_vars = {
          query: Object.assign({ _id: hiredAdvisorRefId }),
          proquery: Object.assign(proquery),
          from: Object.assign({ logId: ids }),
          extraFields: Object.assign(extraFields)
        }
        this.userapi.apiRequest('post', 'advisor/hireadvisor', req_vars).subscribe(result => {
          this.loader.close();
          if (result.status == "error") {
            this.snack.open(result.data.message, 'OK', { duration: 4000 })
          } else {
            this.getAdvisorActivityLogList();
            this.snack.open(result.data.message, 'OK', { duration: 4000 })
          }
        }, (err) => {
          console.error(err)
          this.loader.close();
        })
      }
    })
  }

  openInviteModal(data: any = {}, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(ReferAndEarnModalComponent, {
      width: '720px',
      disableClose: true,
    })

    dialogRef.afterClosed()
      .subscribe(res => {
        this.getInviteMembersCount();
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }
}
