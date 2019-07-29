import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { UserAPIService } from 'app/userapi.service';
import { SpecialNeedsModelComponent } from '../special-needs-model/special-needs-model.component';
import { ManageTrusteeModalComponent } from '../../manage-trustee-modal/manage-trustee-modal.component';
@Component({
  selector: 'app-special-needs-listing',
  templateUrl: './special-needs-listing.component.html',
  styleUrls: ['./special-needs-listing.component.scss']
})
export class SpecialNeedsListingComponent implements OnInit {

  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  userId: string;

  youngChildrenList: any = [];
  showYoungChildrenListing = false;

  cPDisabilityList: any = [];
  showCPDisabilityListing = false;

  friendNeighborList: any = [];
  friendNeighborListing = false;
  dynamicRoute:string;
  selectedLegaciesId: string;
  customerLegacyType:string='customer';
  trusteeLegaciesAction:boolean=true;
  showTrusteeCnt:boolean=true;
  urlData:any={};
  trusteeFriendNeighborCnt :any={}; trusteeChildParentCnt:any={}; trusteeYoungChildCnt:any={};
  YoungChildrenManagementSection:string='now';
  ChildParentDisabilityManagementSection:string='now';
  FriendNeighborCareManagementSection:string='now';
  LegacyPermissionError:string="You don't have permission of this section";

  constructor(
    private route: ActivatedRoute,
    private router: Router, private dialog: MatDialog,
    private userapi: UserAPIService, private loader: AppLoaderService
  ) {
  }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.urlData = this.userapi.getURLData();
    this.dynamicRoute = this.urlData.dynamicRoute;
    this.trusteeLegaciesAction = this.urlData.trusteeLegaciesAction

    if (this.urlData.lastThird == "legacies") {
      this.userId = this.urlData.lastOne;
      this.userapi.getUserAccess(this.userId, (userAccess) => {
        this.YoungChildrenManagementSection = userAccess.YoungChildrenManagement
        this.ChildParentDisabilityManagementSection= userAccess.ChildParentDisabilityManagement
        this.FriendNeighborCareManagementSection= userAccess.FriendNeighborCareManagement
      });
      this.showTrusteeCnt = false;
    }
    this.getyoungChildrenList();
    this.getcPDisabilityList();
    this.getfriendNeighborList();
  }
  @HostListener('document:click', ['$event']) clickedOutside(event){
    if(event.srcElement.outerText=='Send an Invite'){
      this.getyoungChildrenList();
      this.getcPDisabilityList();
      this.getfriendNeighborList();
    }
  }
  getyoungChildrenList(query = {}, search = false) {
    let trusteeQuery = {};
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" , folderName: "Young_Children" }, query),
      trusteeQuery: Object.assign({ customerId: this.userId,"userAccess.YoungChildrenManagement" : "now", status:"Active" }, trusteeQuery),
      fields: {},
      offset: '',
      limit: '',
      order: { "modifiedOn": -1 },
    }
    this.userapi.apiRequest('post', 'specialNeeds/special-needs-list', req_vars).subscribe(result => {
       if (result.status == "error") {
        console.log(result.data)
      } else {
        this.youngChildrenList = result.data.specialNeedsList;        
        this.trusteeYoungChildCnt = result.data.totalTrusteeRecords;   
        if (result.data.specialNeedsList.length > 0) {
          this.showYoungChildrenListing = true;
        }
      }
    }, (err) => {
      console.error(err);
    })
  }

  getcPDisabilityList(query = {}, search = false) {
    let trusteeQuery = {}; 
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active", folderName: "Child_Parent" }, query),
      trusteeQuery: Object.assign({ customerId: this.userId,"userAccess.ChildParentDisabilityManagement" : "now", status:"Active" }, trusteeQuery),
      fields: {},
      offset: '',
      limit: '',
      order: { "modifiedOn": -1 },
    }
    this.userapi.apiRequest('post', 'specialNeeds/special-needs-list', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.cPDisabilityList = result.data.specialNeedsList;
        this.trusteeChildParentCnt = result.data.totalTrusteeRecords;   
        if (result.data.specialNeedsList.length > 0) {
          this.showCPDisabilityListing = true;
        }
      }
    }, (err) => {
      console.error(err);
    })
  }  

  getfriendNeighborList(query = {}, search = false) {
    let trusteeQuery = {}; 
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active", folderName: "Friend_Neighbor" }, query),
      trusteeQuery: Object.assign({ customerId: this.userId,"userAccess.FriendNeighborCareManagement" : "now", status:"Active" }, trusteeQuery),
      fields: {},
      offset: '',
      limit: '',
      order: { "modifiedOn": -1 },
    }
    this.userapi.apiRequest('post', 'specialNeeds/special-needs-list', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.friendNeighborList = result.data.specialNeedsList;
        this.trusteeFriendNeighborCnt = result.data.totalTrusteeRecords;   
        if (result.data.specialNeedsList.length > 0) {
          this.friendNeighborListing = true;
        }
      }
    }, (err) => {
      console.error(err);
    })
  }

  openModal(modelName, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(SpecialNeedsModelComponent, {
      data:{
        folderName:modelName
      },
      width: '720px',
      disableClose: true,
    })
    dialogRef.afterClosed()
      .subscribe(res => {        
        if (modelName == "Young_Children") {
          this.getyoungChildrenList()
        } else if (modelName == "Child_Parent") {
          this.getcPDisabilityList()
        } else {
          this.getfriendNeighborList()
        }         
        if (!res) {
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
        if(code=='YoungChildrenManagement'){
          this.getyoungChildrenList();
        }else if(code=='ChildParentDisabilityManagement'){
          this.getcPDisabilityList();
        }else if(code=='FriendNeighborCareManagement'){
          this.getfriendNeighborList();
        }
      if (!res) {
        // If user press cancel
        return;
      }
    })
   }
}