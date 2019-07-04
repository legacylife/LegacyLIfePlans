import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { UserAPIService } from 'app/userapi.service';
import { SpecialNeedsModelComponent } from '../special-needs-model/special-needs-model.component';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router, private dialog: MatDialog,
    private userapi: UserAPIService, private loader: AppLoaderService
  ) {

  }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.getyoungChildrenList();
    this.getcPDisabilityList();
    this.getfriendNeighborList();
    
  }

  getyoungChildrenList(query = {}, search = false) {
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" , folderName: "Young_Children" }, query),
      fields: {},
      offset: '',
      limit: '',
      order: { "modifiedOn": -1 },
    }
    this.userapi.apiRequest('post', 'specialNeeds/special-needs-list', req_vars).subscribe(result => {
       if (result.status == "error") {
        console.log(result.data)
      } else {
        this.youngChildrenList = result.data;
        if (result.data.length > 0) {
          this.showYoungChildrenListing = true;
        }
      }
    }, (err) => {
      console.error(err);
    })
  }

  getcPDisabilityList(query = {}, search = false) {
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active", folderName: "Child_Parent" }, query),
      fields: {},
      offset: '',
      limit: '',
      order: { "modifiedOn": -1 },
    }
    this.userapi.apiRequest('post', 'specialNeeds/special-needs-list', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.cPDisabilityList = result.data;
        if (result.data.length > 0) {
          this.showCPDisabilityListing = true;
        }
      }
    }, (err) => {
      console.error(err);
    })
  }


  getfriendNeighborList(query = {}, search = false) {
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active", folderName: "Friend_Neighbor" }, query),
      fields: {},
      offset: '',
      limit: '',
      order: { "modifiedOn": -1 },
    }
    this.userapi.apiRequest('post', 'specialNeeds/special-needs-list', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.friendNeighborList = result.data;
        if (result.data.length > 0) {
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
}