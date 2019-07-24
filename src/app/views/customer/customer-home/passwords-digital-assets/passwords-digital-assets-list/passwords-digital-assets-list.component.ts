import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { egretAnimations } from '../../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../../userapi.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { DevicesModalComponent } from './../devices/devices-modal/devices-modal.component';
import { ElectronicMediaModalComponent } from './../electronic-media/electronic-media-modal/electronic-media-modal.component';
import { ElectronicMediaLists } from '../../../../../selectList';
import { ManageTrusteeModalComponent } from '../../manage-trustee-modal/manage-trustee-modal.component';
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
  trusteeDeviceCnt:any;  trusteeElectonicCnt:any;
  dynamicRoute:string;
  trusteeLegaciesAction:boolean=true;
  urlData:any={};
  customerLegaciesId: string;
  customerLegacyType:string='customer';
  showTrusteeCnt:boolean=true;
  DevicesManagementSection:string='now';
  ElectronicMediaManagementSection:string='now';
  LegacyPermissionError:string="You don't have permission of this section";

  constructor(private route: ActivatedRoute,private router: Router, private dialog: MatDialog,private userapi: UserAPIService, private loader: AppLoaderService) { }
  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.urlData = this.userapi.getURLData();
    this.dynamicRoute = this.urlData.dynamicRoute;
    this.trusteeLegaciesAction = this.urlData.trusteeLegaciesAction
    if (this.urlData.lastThird == "legacies") {
      this.userId = this.urlData.lastOne;
      this.userapi.getUserAccess(this.userId, (userAccess) => {
        this.DevicesManagementSection = userAccess.DevicesManagement
        this.ElectronicMediaManagementSection= userAccess.ElectronicMediaManagement
      });
      this.showTrusteeCnt = false;
    }
    this.getDevicesList();
    this.getElectronicMediaList();
  }

  getDevicesList = (query = {}) => {
    let trusteeQuery = {};
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" }, query),
      trusteeQuery: Object.assign({ customerId: this.userId,"userAccess.DevicesManagement" : "now", status:"Active" }, trusteeQuery),
      fields: {},
      order: {"createdOn": -1},
    }
    this.userapi.apiRequest('post', 'passwordsDigitalAssets/deviceListing', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.devicesListing = result.data.deviceList;
        this.showDevicesListingCnt = this.devicesListing.length; 
        this.trusteeDeviceCnt = result.data.totalTrusteeRecords;  
        if (this.showDevicesListingCnt>0) {
          this.showDevicesListing = true;
        }
      }
    }, (err) => {
      console.error(err);
    })
  }

  getElectronicMediaList = (query = {}) => {
    let trusteeQuery = {};
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" }, query),
      trusteeQuery: Object.assign({ customerId: this.userId,"userAccess.ElectronicMediaManagement" : "now", status:"Active" }, trusteeQuery),
      fields: {},
      order: {"createdOn": -1},
    }
    this.userapi.apiRequest('post', 'passwordsDigitalAssets/electronicMediaListing', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.electronicMediaListing = result.data.electronicMediaList;
        this.showElectronicMediaListingCnt = this.electronicMediaListing.length;  
        this.trusteeElectonicCnt = result.data.totalTrusteeRecords; 
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
        if(code=='DevicesManagement'){
          this.getDevicesList();
        }else if(code=='ElectronicMediaManagement'){
          this.getElectronicMediaList();
        }
      if (!res) {
        // If user press cancel
        return;
      }
    })
   }
}