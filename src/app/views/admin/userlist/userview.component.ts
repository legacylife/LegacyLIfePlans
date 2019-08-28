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
import { LayoutService } from 'app/shared/services/layout.service';
const filePath = s3Details.url+'/'+s3Details.profilePicturesPath;
@Component({
  selector: 'userview',
  templateUrl: './userview.component.html',
  styleUrls: ['./userlist.component.scss']
})
export class userviewComponent implements OnInit {
  layoutConf: any;
  userId: string
  successMessage: string = ""
  errorMessage: string = ""
  userType: string = ""
  row: any;
  dpPath: string = ""
  selectedUserId: string = "";
  docPath:string;
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
  fullname: string = ''
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
  showPage:boolean = false
  isExpired:boolean = false
 // websites:any;
  constructor(
    private layout: LayoutService,
    private api: APIService, private route: ActivatedRoute, 
    private router: Router, private snack: MatSnackBar, private dialog: MatDialog,
    private confirmService: AppConfirmService, private loader: AppLoaderService,
    private subscriptionservice:SubscriptionService) { }
  ngOnInit() {
    this.userId = localStorage.getItem('userId')
    this.layoutConf = this.layout.layoutConf;
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
    this.loader.open()
    const req_vars = {
      query: Object.assign({ _id: this.selectedUserId }, query)
    }

    this.api.apiRequest('post', 'userlist/viewall', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
        this.loader.close()
        this.showPage = true
      } else {
        this.row = result.data;
        this.fullname = '';
        if(this.row.firstName && this.row.firstName!=='undefined' && this.row.lastName && this.row.lastName!=='undefined'){
          this.fullname = this.row.firstName+' '+this.row.lastName;
        }
        if(result.data.profilePicture){
           this.profilePicture = s3Details.url + "/" + s3Details.profilePicturesPath + result.data.profilePicture;
        }
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
            /* if( new Date(this.subscriptionExpireDate) < new Date() ) {
              this.isExpired = true
            } */
          })
          
        }
        this.loader.close()
        this.showPage = true
      }
    }, (err) => {
      console.error(err)
      this.loader.close()
      this.showPage = true
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
            userType : 'advisor',
            fromId:this.userId
          }
          this.api.apiRequest('post', 'advisor/activateadvisor', req_vars).subscribe(result => {
            this.loader.close();
            if (result.status == "error") {
              this.snack.open(result.data.message, 'OK', { duration: 4000 });
            } else {
              this.getUser()
              this.snack.open(result.data.message, 'OK', { duration: 4000 });
            }
          }, (err) => {
            console.error(err);
            this.snack.open(err, 'OK', { duration: 4000 });
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

  async reactivateReferEarn(row) {
    
    let title = '', status = 'activate'
    if( row.subscriptionDetails && row.subscriptionDetails.length > 0 ) {
      title = 'Information'
      status = 'notactivate'
      this.statMsg = "The Refer and Earn program cannot be applied to the advisor since the user has opted for Paid subscription."  
    }
    else{
      let returnArr = await this.api.apiRequest('get', 'referearnsettings/getdetails', {}).toPromise()
      let referEarnSettingsArr  = returnArr.data,
          referEarnStatus       = referEarnSettingsArr.status == 'On' ? true : false,
          referEarnTargetCount  = 0,
          referEarnExtendedDays = 0;
      //if( referEarnStatus ) {
        referEarnTargetCount  = referEarnSettingsArr.targetCount
        referEarnExtendedDays = referEarnSettingsArr.extendedDays
     // }
      
      title   = 'Confirm'
      status  = 'activate'
      this.statMsg = "Initiating the Refer and Earn program for the advisor will assign the currently active target "+referEarnTargetCount+" referrals for "+referEarnExtendedDays+" days to the advisor. Are you sure you want to proceed?"
    }
    
    this.confirmService.reactivateReferEarnPopup({ title: title, message: this.statMsg, status: status }).subscribe(res => {
      if (res) {
        this.loader.open();
        var query = {};
        const req_vars = {
          query: Object.assign({ _id: row._id }, query),
          userType : 'advisor',
          status: status,
          fromId:this.userId
        }
        this.api.apiRequest('post', 'advisor/reactivatereferearn', req_vars).subscribe(result => {
          this.loader.close();
          if (result.status == "error") {
            this.snack.open(result.data.message, 'OK', { duration: 4000 });
          }
          else {
            this.getUser()
            this.snack.open(result.data.message, 'OK', { duration: 4000 });
          }
        }, (err) => {
          this.snack.open(err, 'OK', { duration: 4000 });
        })
      }
    })
  }

  downloadFile = (filename) => {   
    const filePath = this.selectedUserId+'/'+s3Details.advisorsDocumentsPath;
    this.docPath = filePath; 
    let query = {};
    let req_vars = {
      query: Object.assign({ docPath: this.docPath, filename: filename }, query),
      fromId:this.userId,
      toId:this.selectedUserId,
      folderName:s3Details.advisorsDocumentsPath,
      subFolderName:''
    }
    this.snack.open("Downloading file is in process, Please wait some time!", 'OK');
    this.api.download('documents/downloadDocument', req_vars).subscribe(res => {
      var newBlob = new Blob([res])
      var downloadURL = window.URL.createObjectURL(newBlob);
      let filePath = downloadURL;
      var link = document.createElement('a');
      link.href = filePath;
      link.download = filename;
      document.body.appendChild(link);
      link.click(); 
      this.snack.dismiss();
    });
  }
  
  toggleSidenav() {
    if(this.layoutConf.sidebarStyle === 'closed') {      
      return this.layout.publishLayoutChange({
        sidebarStyle: 'full'
      })
    }
    this.layout.publishLayoutChange({
      sidebarStyle: 'closed'
    })
  }
}