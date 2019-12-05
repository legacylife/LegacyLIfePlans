import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { adminSections } from '../../../config';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { serverUrl, s3Details } from '../../../config';
import { SubscriptionService } from 'app/shared/services/subscription.service';
import { LayoutService } from 'app/shared/services/layout.service';
import { egretAnimations } from "../../../shared/animations/egret-animations";
import { AdminHireAdvisorComponent } from './hire-advisor-modal/hire-advisor-modal.component';
import { lockLegacyPeriodList } from '../../../selectList';
const filePath = s3Details.url+'/'+s3Details.profilePicturesPath;
@Component({
  selector: 'deceaseduserview',
  templateUrl: './deceased-requests-view.component.html',
  styleUrls: ['./deceased-requests-view.component.scss'],
  animations: egretAnimations
})
export class DeceasedRequestsViewComponent implements OnInit {
  layoutConf: any;
  userId: string
  successMessage: string = ""
  errorMessage: string = ""
  userType: string = ""
  row: any;
  dpPath: string = ""
  selectedUserId: string = "";
  docPath:string;
  legacyCustomerUsername:string;
  lockoutLegacyPeriod:string;
  adminSections = [];
  data:any;
  advisorsData:any;
  loggedInUserDetails: any;
  profilePicture: any = "assets/images/arkenea/default.jpg"
  fullname: string = ''
  deceasedId: string = ''
  customerFirstName: string = ''
  showPage:boolean = false
  showDeceased:boolean = false
  my_messages:any;
  executorData:any;
  revokeIdData:any;
  isAccountFree: boolean = true
  isSubscribePlan: boolean = false
  isSubscribedBefore: boolean = false
  autoRenewalFlag: boolean = false
  autoRenewalVal:boolean = false
  isPremiumExpired: boolean = false
  isSubscriptionCanceled:boolean = false
  userCreateOn: any
  userSubscriptionDate: any
  isExpired:boolean = false
  autoRenewalStatus: string = 'off'
  subscriptionExpireDate: string = ''
  lockLegacyList: any[] = lockLegacyPeriodList;
  planName: string = 'Free'
  subscriptionDetails:object = {
    planStatus:'Trial',
    expiryDate:'',
    planName: 'Free Plan'
  }
  constructor(
    private layout: LayoutService,
    private api: APIService, private route: ActivatedRoute, 
    private router: Router, private snack: MatSnackBar, private dialog: MatDialog,
    private confirmService: AppConfirmService, private loader: AppLoaderService,
    private subscriptionservice:SubscriptionService) { }
  ngOnInit() {
    this.layoutConf = this.layout.layoutConf;
    this.dpPath = filePath;
    const locationArray = location.href.split('/')
    this.selectedUserId = locationArray[locationArray.length - 1]
    this.loggedInUserDetails = this.api.getUser()
    this.adminSections = adminSections;
    this.userId = localStorage.getItem("userId");
    this.my_messages = {'emptyMessage': 'No records Found'};    
    this.getCustomerProfile();
  }

   //function to get all events
   getCustomerProfile = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({_id:this.selectedUserId}, query)
    }

    this.api.apiRequest('post', 'deceased/customerView', req_vars).subscribe(result => {
      if(result.status == "error"){
        console.log(result.data)
        this.loader.close()
        this.showPage = true
      } else {
        this.row = result.data;
        if(this.row.lockoutLegacyPeriod){
          this.lockLegacyList.forEach((element: any, index) => {          
            if(element.opt_code==this.row.lockoutLegacyPeriod){
              this.lockoutLegacyPeriod = element.opt_name;
            }
          })
        }
    
        this.fullname = '';
        if(this.row.firstName && this.row.firstName!=='undefined' && this.row.lastName && this.row.lastName!=='undefined'){
          this.customerFirstName = this.row.firstName;
          this.fullname = this.row.firstName+' '+this.row.lastName;
        }
        if(this.row.username){
          this.legacyCustomerUsername = this.row.username;
        }
        if(result.data.profilePicture){
           this.profilePicture = s3Details.url + "/" + s3Details.profilePicturesPath + result.data.profilePicture;
        }
        this.showPage = true

        if(this.row.deceased.status=='Active'){
          this.showDeceased = true;
        }
        
        // else{
        //   this.row.deceased.deceasedinfo.forEach((element: any, index) => {          
        //     if(element.adminId && element.status=='Active'){
        //       this.showDeceased = true;
        //     }
        //   })
        // }

        if(this.row.deceased && this.row.deceased.revokeId){
         this.revokeIdData = this.row.deceased.revokeId;
        }
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
        this.getMarkDeceasedUser(true);
      }
    }, (err) => {
      console.error(err)
      this.loader.close()
      this.showPage = true
      //this.showLoading = false
    })
  }

  //function to get all events
  getMarkDeceasedUser = (getExecutors) => {
    let query = {}; let adminQuery = {};
    const req_vars = {
      query: Object.assign({customerId:this.selectedUserId}, query),
      adminQuery: Object.assign({userType:'sysadmin'}, query),
      fields: {},      
      order: { "modifiedOn": -1 },
    }
    this.loader.open()
    this.api.apiRequest('post', 'deceased/deceaseView', req_vars).subscribe(result => {
      this.loader.close()
      if (result.status == "error") {
        console.log(result.data)
        this.showPage = true
      } else {
        if(getExecutors){
          this.getExecutorsList();
        }
        this.data = result.data.deceasedData;    
        if(this.data[0]){
          this.row = this.data[0].customerId;
         
        }else{
          this.row = this.data.customerId;        
        }
        const adminData = [];
         this.data.forEach((element: any, index) => {          
          if(element.userType=='sysadmin'){
            adminData.push(element);
          }
        })

        if(adminData[0]){
          this.deceasedId = adminData[0]._id;
        }

        if(adminData.length>0){
          if(adminData[0].status=='Active'){
            this.showDeceased = true;
          }
        }

        this.advisorsData = result.data.advisorsList;
        this.loader.close();
      }
    }, (err) => {
      console.error(err)
      this.showPage = true
    })
  }

  getExecutorsList = (query = {}, search = false) => { 
    let req_vars = {
      query: Object.assign({  customerId: this.selectedUserId,status:"Active" })
    }
    this.api.apiRequest('post', 'deceased/deceaseExecutor', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if(result.data.executorData){
          if(result.data.executorData.trustId){
            this.executorData = result.data.executorData.trustId;            
          } else if(result.data.executorData.advisorId){
            this.executorData = result.data.executorData.advisorId;            
          }
        }
      }
    }, (err) => {
      console.error(err);
    })
  }  

 
  downloadFile = (filename) => {   
    const filePath = s3Details.deceasedFilessPath+this.selectedUserId+'/';
    this.docPath = filePath; 
    let query = {};
    let req_vars = {
      query: Object.assign({ docPath: this.docPath, filename: filename }, query),
      fromId:this.userId,
      toId:this.selectedUserId,
      folderName:'',
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

  openAdminHireAdvisorModal(customerId: any = {},profileId: any = {},advisorId: any = {},update: any = {}, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(AdminHireAdvisorComponent, {
      width: '950px',
      disableClose: true,
      data: {
        customerId: customerId,
        profileId: profileId,
        advisorId: advisorId,
        legacyHolderFirstName: this.customerFirstName,
        legacyHolderName: this.fullname,
        legacyCustomerEmail: this.legacyCustomerUsername,
        update: update
      },
    }); 
    dialogRef.afterClosed()
    .subscribe(res => {
      this.getCustomerProfile(false);
      if (!res) {
        // If user press cancel
        return;
      }
    })
  }

  markAsDeceased(){
    let profileIds = '';
    var statMsg = 'Marking the user as deceased will notify all the user\'s trustees and the users legacy will be locked. Once the legacy is locked it will release "After death" files to the users respective trustees based on the access given. Do you want mark the user as deceased?'
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          let deceasedFromName = localStorage.getItem("firstName")+' '+localStorage.getItem("lastName");
          let req_vars = {_id:profileIds,
                          adminId:this.userId,
                          customerId:this.selectedUserId,
                          userType:localStorage.getItem("userType"),
                          legacyHolderFirstName:this.customerFirstName,
                          legacyHolderName:this.fullname,
                          deceasedFromName:deceasedFromName,
                          fromId:this.userId,
                          toId:this.selectedUserId,
                          folderName:'',
                          subFolderName:''
                        }
          this.loader.open();   
          this.api.apiRequest('post', 'deceased/markAsDeceased', req_vars).subscribe(result => { 
          this.loader.close();
          this.getCustomerProfile();
            this.snack.open(result.data.message, 'OK', { duration: 8000 })
          }, (err) => {
            console.error(err)
            this.loader.close();
          })  
      }
    })
  }

  revokeAsDeceased(){
   // if(!this.deceasedId){
    //  this.snack.open("Something wrong, Please try again", 'OK', { duration: 4000 })
  //  }else{
  var statMsg = 'Marking the user revoke as deceased will notify all the user\'s trustees and the users legacy will be unlocked. Once the legacy is unlocked it will lock "After death" files to the users respective trustees based on the access given. Do you want revoke the user as deceased?'
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          var query = {};var criteria = {};
          if(this.deceasedId){
            criteria = {_id:this.deceasedId};
          }else{
            criteria = {customerId:this.selectedUserId,status:'Active'};
          }
          const req_vars = {
            query: Object.assign({customerId:this.selectedUserId}, query),
            revokeId:this.userId,
            userType:localStorage.getItem("userType"),
            deceasedFromName:localStorage.getItem("firstName") + " " + localStorage.getItem("lastName"),
            fromId:this.userId,
            toId:this.selectedUserId,
            folderName:'',
            subFolderName:''
          }
      this.loader.open();   
      this.api.apiRequest('post', 'deceased/revokeAsDeceased', req_vars).subscribe(result => {
        this.loader.close();
        this.snack.open(result.data.message, 'OK', { duration: 6000 })
        this.router.navigate(['/', 'admin', 'deceased-requests'])
        }, (err) => {
          console.error(err)
          this.loader.close();
        })  
      }
    })
  // }
  }

  executorCron(){
    const req_vars = {};
    this.api.apiRequest('post', 'cronjobs/deceased-customers-reminders', req_vars).subscribe(result => {
      this.snack.open("DONE DONA DONE", 'OK', { duration: 6000 })
      }, (err) => {
        console.error(err)
        this.loader.close();
      })  
   }

   removeAdvisor(customerId,id,advisorId){
      var statMsg = "Are you sure you want remove?";
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          let req_vars = {};
          req_vars = {customerId:customerId, advisorId:advisorId, userType : 'advisor'}
          this.api.apiRequest('post', 'customer/legacy-user-remove', req_vars).subscribe(result => {
            this.loader.close();
            this.getCustomerProfile();
            this.snack.open(result.data.message, 'OK', { duration: 6000 })
          }, (err) => {
            console.error(err)
            this.loader.close();
          })
           
        }
      })       
  }


}