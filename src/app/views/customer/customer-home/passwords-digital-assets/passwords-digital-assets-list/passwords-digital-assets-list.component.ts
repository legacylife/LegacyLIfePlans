import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { egretAnimations } from '../../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../../userapi.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { DevicesModalComponent } from './../devices-modal/devices-modal.component';

@Component({
  selector: 'app-customer-home',
  templateUrl: './passwords-digital-assets-list.component.html',
  styleUrls: ['./passwords-digital-assets-list.component.scss'],
  animations: [egretAnimations]
})
export class PasswordsDigitalAssetsListComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  showDevicesListing = false;
  showDevicesListingCnt: any;
  userId: string;
  devicesListing:any = [];
  modifiedDate:any;

  constructor(private route: ActivatedRoute,private router: Router, private dialog: MatDialog,private userapi: UserAPIService, private loader: AppLoaderService) { }
  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.getDevicesList();
  }

  getDevicesList = (query = {}) => {
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" }, query),
      fields: {},
      order: {"createdOn": -1},
    }
    this.userapi.apiRequest('post', 'pets/petsListing', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.devicesListing = result.data.petList;
        this.showDevicesListingCnt = this.devicesListing.length;  
        if (this.showDevicesListingCnt>0) {
          this.showDevicesListing = true;
        }
      }
    }, (err) => {
      console.error(err);
    })
  }

  openDevicesModal() {
    let dialogRef: MatDialogRef<any> = this.dialog.open(DevicesModalComponent, {     
      width: '720px',
      disableClose: true,
    });
    dialogRef.afterClosed()
    .subscribe(res => {
      this.getDevicesList();
      if (!res) {
        // If user press cancel
        return;
      }
    })
  }
}