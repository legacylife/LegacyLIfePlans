import { Component, OnInit, OnDestroy, ViewChild,HostListener } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { egretAnimations } from '../../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../../userapi.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { TimeCapsuleMoalComponent } from './../time-capsule-modal/time-capsule-modal.component';
import { ManageTrusteeModalComponent } from '../../manage-trustee-modal/manage-trustee-modal.component';
import { DataSharingService } from 'app/shared/services/data-sharing.service';
@Component({
  selector: 'app-customer-home',
  templateUrl: './time-capsule-list.component.html',
  styleUrls: ['./time-capsule-list.component.scss'],
  animations: [egretAnimations]
})
export class TimeCapsuleListComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  showTimeCapsuleListing = true;
  showTimeCapsuleListingCnt: any;  
  userId: string;
  timeCapsuleListing:any = [];
  modifiedDate:any;
  trusteeTimeCapsuleCnt:any;
  dynamicRoute:string;  
  customerLegaciesId: string;
  customerLegacyType:string='customer';
  trusteeLegaciesAction:boolean=true;
  showTrusteeCnt:boolean=true;
  urlData:any={};
  TimeCapsuleManagementSection:string='now';
  LegacyPermissionError:string="You don't have access to this section";
  instruction_data:any;
  instruction_data_flag:boolean=false;  
  shareLegacFlag:boolean=false;  
  constructor(private route: ActivatedRoute,private router: Router, private dialog: MatDialog,private userapi: UserAPIService, private loader: AppLoaderService,private sharedata: DataSharingService) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");    
    this.urlData = this.userapi.getURLData();
    this.customerLegaciesId = this.urlData.lastOne;
    this.dynamicRoute = this.urlData.dynamicRoute;
    this.trusteeLegaciesAction = this.urlData.trusteeLegaciesAction
    if (this.urlData.lastThird == "legacies") {
      this.userId = this.urlData.lastOne;
      this.userapi.getUserAccess(this.userId, (userAccess,userDeathFilesCnt,userLockoutPeriod,userDeceased) => { 
        if(userLockoutPeriod || userDeceased){
          this.trusteeLegaciesAction = false;
        }
        this.sharedata.shareLegacyDeathfileCountData(userDeathFilesCnt);
        this.TimeCapsuleManagementSection = userAccess.TimeCapsuleManagement 
      });
      this.showTrusteeCnt = false; this.shareLegacFlag = true;
    }else{      
      this.userapi.getFolderInstructions('time_capsule', (returnData) => {
        this.instruction_data = returnData;
        if(this.instruction_data){this.instruction_data_flag = true;}
      });
    } 
    this.getTimecapsuleList();
  }
  @HostListener('document:click', ['$event']) clickedOutside(event){
    if(event.srcElement.textContent=='Send an Invite'){
      console.log("TimeCapsuleList here !!! ")     
      setTimeout(()=>{
        this.getTimecapsuleList();
      },2000);           
    }
  }

  getTimecapsuleList = (query = {}) => {
    let trusteeQuery = {};
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" }, query),
      trusteeQuery: Object.assign({ customerId: this.userId,"userAccess.TimeCapsuleManagement" : "now", status:"Active" }, trusteeQuery),
      fields: {},
      order: {"createdOn": -1},
    }
    this.userapi.apiRequest('post', 'timecapsule/timeCapsuleListing', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.timeCapsuleListing = result.data.timeCapsuleList;

        if(this.shareLegacFlag){
          let timeCapsuleList = '';
          if(this.TimeCapsuleManagementSection=='now'){
            timeCapsuleList = this.timeCapsuleListing;
          }
          let shareTimeCapsuleList = {timeCapsuleList: timeCapsuleList };        
          this.sharedata.shareLegacyData(shareTimeCapsuleList);
        }
        this.showTimeCapsuleListingCnt = this.timeCapsuleListing.length;  
        this.trusteeTimeCapsuleCnt = result.data.totalTrusteeRecords;  
        if (this.showTimeCapsuleListingCnt>0) {
          this.showTimeCapsuleListing = true;
        }
        else {
          this.showTimeCapsuleListing = false;
        }
      }
    }, (err) => {
      console.error(err);
    })
  }

  openTimeCapsuleModal() {
    let dialogRef: MatDialogRef<any> = this.dialog.open(TimeCapsuleMoalComponent, {     
      width: '720px',
      disableClose: true,
    });
    dialogRef.afterClosed()
    .subscribe(res => {
      this.getTimecapsuleList();
      if (!res) {
        // If user press cancel
        return;
      }
    })
  }

  openManageTrusteeModal(title,code,isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(ManageTrusteeModalComponent, {
      width: '720px',
      disableClose: true, 
      data: {
        title: title,
        code:code
      }
    }) 
    dialogRef.afterClosed()
    .subscribe(res => {
      this.getTimecapsuleList();
      if (!res) {
        // If user press cancel
        return;
      }
    })
   }
}