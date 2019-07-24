import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSnackBar, MatSidenav, MatDialogRef, MatDialog, } from '@angular/material';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../userapi.service';
import { addTrusteeModalComponent } from '../add-trustee-modal/add-trustee-modal.component';
import { serverUrl, s3Details } from '../../../../config';

@Component({
  selector: 'app-customer-home',
  templateUrl: './customer-dashboard-day-one.component.html',
  styleUrls: ['./customer-dashboard-day-one.component.scss'],
  animations: [egretAnimations]
})
export class CustomerDashboardDayOneComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  recentlyAccessedFiles : boolean = false;
  userId: string;
  trustyListing:any = [];
  fileActivityLogList:any;
  showTrustyListing = false;
  showTrustyListingCnt: any;
  advisorListing:any = [];
  showAdvisorListing= false;
  showAdvisorListingCnt: any;

  profileUrl = s3Details.url+'/profilePictures/';
  constructor(private fb: FormBuilder, private dialog: MatDialog,private snackBar: MatSnackBar,private userapi: UserAPIService) { }
  ngOnInit() { 
    this.userId = localStorage.getItem("endUserId");

    this.getFileActivityLogList();
    this.getTrusteeList();
    this.getAdvisorList();
  }

  getTrusteeList = (query = {}) => {
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: { $ne: 'Deleted'} }, query),//, status: "Active"
      fields: {},
      limit: 6,
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
      }
    }, (err) => {
      console.error(err);
    })
  }


  getAdvisorList = (query = {}) => {
    const req_vars = {
      query: Object.assign({ customerId: this.userId }, query),//, status: "Active"
      fields: {},
      limit: 6,
      order: {"createdOn": -1},
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


  openAddTrusteeModal(id, isNew?) {  
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

