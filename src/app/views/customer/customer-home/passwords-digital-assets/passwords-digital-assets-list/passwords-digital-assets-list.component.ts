import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { egretAnimations } from '../../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../../userapi.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { DevicesModalComponent } from './../devices/devices-modal/devices-modal.component';
import { ElectronicMediaModalComponent } from './../electronic-media/electronic-media-modal/electronic-media-modal.component';
import { ElectronicMediaLists } from '../../../../../selectList';
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
  showElectronicMediaListing = false;
  showElectronicMediaListingCnt: any;
  electronicMediaListing:any = [];
  typeOfList:any = [];
  modifiedDate:any;

  constructor(private route: ActivatedRoute,private router: Router, private dialog: MatDialog,private userapi: UserAPIService, private loader: AppLoaderService) { }
  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.getDevicesList();
    this.getElectronicMediaList();
  }

  getDevicesList = (query = {}) => {
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" }, query),
      fields: {},
      order: {"createdOn": -1},
    }
    this.userapi.apiRequest('post', 'passwordsDigitalAssets/deviceListing', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.devicesListing = result.data.deviceList;
        this.showDevicesListingCnt = this.devicesListing.length;  
        if (this.showDevicesListingCnt>0) {
          this.showDevicesListing = true;
        }
      }
    }, (err) => {
      console.error(err);
    })
  }

  getElectronicMediaList = (query = {}) => {
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" }, query),
      fields: {},
      order: {"createdOn": -1},
    }
    this.userapi.apiRequest('post', 'passwordsDigitalAssets/electronicMediaListing', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.electronicMediaListing = result.data.electronicMediaList;
        this.showElectronicMediaListingCnt = this.electronicMediaListing.length;  
        if (this.showElectronicMediaListingCnt>0) {
          this.showElectronicMediaListing = true;
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

  openElectronicMediaModal() {
    let dialogRef: MatDialogRef<any> = this.dialog.open(ElectronicMediaModalComponent, {     
      width: '720px',
      disableClose: true,
    });
    dialogRef.afterClosed()
    .subscribe(res => {
      this.getElectronicMediaList();
      if (!res) {
        // If user press cancel
        return;
      }
    })
  }


  getType(key) {
    this.typeOfList = ElectronicMediaLists;
    let filteredTyes = this.typeOfList.filter(dtype => {
      return dtype.opt_code === key
    }).map(el => el.opt_name)[0]
    return filteredTyes
  }

  
}