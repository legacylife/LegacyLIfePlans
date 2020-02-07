import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { MatSnackBar, MatSidenav, MatDialogRef, MatDialog, } from '@angular/material';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../userapi.service';
import { addTrusteeModalComponent } from '../add-trustee-modal/add-trustee-modal.component';
import { serverUrl, s3Details } from '../../../../config';
import { Router, ActivatedRoute } from '@angular/router';
import { legacySettingModalComponent } from './../legacy-setting/legacy-setting-modal/legacy-setting-modal.component';
@Component({
  selector: 'app-customer-home',
  templateUrl: './customer-dashboard-day-one.component.html',
  styleUrls: ['./customer-dashboard-day-one.component.scss'],
  animations: [egretAnimations]
})
export class CustomerDashboardDayOneComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  recentlyAccessedFiles : boolean = true;
  userId: string;
  trustyListing:any = [];
  fileActivityLogList:any;
  showTrustyListing = true;
  showTrustyListingCnt: any;
  advisorListing:any = [];
  showAdvisorListing= true;
  showAdvisorListingCnt: any;
  isProUser = false;
  isFreeProuser = false;
  urlData : any;
  selectedProfileId : any;

  profileUrl = s3Details.url+'/profilePictures/';
  constructor(private router: Router,private fb: FormBuilder, private dialog: MatDialog,private snackBar: MatSnackBar,private userapi: UserAPIService) { }
  ngOnInit() { 
    //console.log("received redirection"+ (new Date()))
    this.userId = localStorage.getItem("endUserId");
    this.isProUser = localStorage.getItem('endUserProSubscription') && localStorage.getItem('endUserProSubscription') == 'yes' ? true : false
    this.isFreeProuser = localStorage.getItem('endUserProFreeSubscription') && localStorage.getItem('endUserProFreeSubscription') == 'yes' ? true : false

    this.getFileActivityLogList();
    this.getTrusteeList();
    this.getAdvisorList();
  }
  @HostListener('document:click', ['$event']) clickedOutside(event){
    if(event.srcElement.textContent=='Send an Invite'){
      setTimeout(()=>{
      this.getFileActivityLogList();
      this.getTrusteeList();
      this.getAdvisorList();
      },2000);     
    }
  }
  getTrusteeList = (query = {}) => {
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: { $nin: ['Deleted'] } }, query),//, status: "Active"
      fields: {},
      limit: 3,
      order: {"createdOn": -1},
    }
    this.userapi.apiRequest('post', 'trustee/listing', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.trustyListing = result.data.trustList;
        this.showTrustyListingCnt = this.trustyListing.length;  
        if (this.showTrustyListingCnt>0) {
          this.showTrustyListing = true;
        }
        else {
          this.showTrustyListing = false;
        }
      }
    }, (err) => {
      console.error(err);
    })
  }


  getAdvisorList = (query = {}) => {
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: { $nin: ['Deleted', 'Rejected'] } }, query),//, status: "Active"
      fields: {},
      limit: 3,
      order: {"modifiedOn": -1},
    }
    this.userapi.apiRequest('post', 'advisor/hireAdvisorListing', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.advisorListing = result.data.advisorList;
        
        this.showAdvisorListingCnt = this.advisorListing.length;  
        if (this.showAdvisorListingCnt>0) {
          this.showAdvisorListing = true;
        }
        else {
          this.showAdvisorListing = false;
        }
      }
    }, (err) => {
      console.error(err);
    })
  }

  getFileActivityLogList = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ customerId: this.userId }, query),
      fields: {},
      offset: 0,
      limit: 6,
      order: {"modifiedOn": -1},
    }   
    this.userapi.apiRequest('post', 'customer/file-activity-log-list', req_vars).subscribe(result => {  
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.fileActivityLogList = result.data.activityLogList;        
        if(result.data.totalRecords > 0){
          this.recentlyAccessedFiles = true;
        } 
        else {
          this.recentlyAccessedFiles = false;
        }       
      }
    }, (err) => {
      console.error(err);
    })
  }


  getIconNUrl(logData){
    return this.userapi.getFileIconNUrl(logData);
  }

  toggleSideNav() {
    this.sideNav.opened = !this.sideNav.opened;
  }

  viewDetailsPage(pageUrl){     
    this.urlData = this.userapi.getURLData();
    this.selectedProfileId = this.urlData.lastOne;
    let firstParam = pageUrl[0];
    if (!this.isProUser && !this.isFreeProuser) {
      let dialogRef: MatDialogRef<any> = this.dialog.open(legacySettingModalComponent, {     
        width: '720px',
        disableClose: true,
      });
      dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
      })
    }else{
      this.isProUser = localStorage.getItem('endUserProSubscription') == 'yes' ? true : false
      if(this.isProUser)
        this.router.navigate(pageUrl)
      else
      {
        if(firstParam == '/customer/dashboard/essential-detail-idbox' || firstParam == '/customer/dashboard/essential-detail-view' || firstParam == '/customer/dashboard/essential-professionals-detail' ||
        firstParam == '/customer/dashboard/legal-detail-view' || firstParam == '/customer/dashboard/emergency-contacts-details'){
          this.router.navigate(pageUrl)
        }
        else {
          this.snackBar.open("Currently you don't have access to this folder you have been downgraded to a free account.", 'OK', { duration: 8000 })
        }
      }
    } 

  }

  checkLegacySetting(path) {
    if (!this.isProUser && !this.isFreeProuser) {
      let dialogRef: MatDialogRef<any> = this.dialog.open(legacySettingModalComponent, {     
        width: '720px',
        disableClose: true,
      });
      dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
      })
    }else{
      this.router.navigate([path])
    }
  }

  openAddTrusteeModal(id, isNew?) {  
   
    if (!this.isProUser && !this.isFreeProuser) {
      let dialogRef: MatDialogRef<any> = this.dialog.open(legacySettingModalComponent, {     
        width: '720px',
        disableClose: true,
      });
      dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
      })
    }else{
      let dialogRef: MatDialogRef<any> = this.dialog.open(addTrusteeModalComponent, {     
        width: '720px',
        disableClose: true,
        data: {
          id: id,
        }
      });
      dialogRef.afterClosed()
      .subscribe(res => {
        this.getTrusteeList();
        if (!res) {
          return;
        }
      })
    }
  }
}

