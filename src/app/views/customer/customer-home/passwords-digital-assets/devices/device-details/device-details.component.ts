import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms'
import { egretAnimations } from '../../../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../../../userapi.service';
import { AppLoaderService } from '../../../../../../shared/services/app-loader/app-loader.service';
import { AppConfirmService } from '../../../../../../shared/services/app-confirm/app-confirm.service';
import { DevicesModalComponent } from './../devices-modal/devices-modal.component';
import PatternLock from 'patternlock';
import 'patternlock/dist/patternlock.css';
import { DevicesList,PasswordType } from '../../../../../../selectList';
@Component({
  selector: 'app-customer-home',
  templateUrl: './device-details.component.html',
  styleUrls: ['./device-details.component.scss'],
  animations: [egretAnimations]
})
export class DeviceDetailsComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  userId: string;
  selectedProfileId: string = "";
  row: any;
  re =  "/(?:\.([^.]+))?$/" ;
  docPath: string; 
  lock: any;
  deviceListing: any[];
  passwordType: any[];
  typeOfDocumentList: any[];
  IsVisible: boolean = true;
  trusteeLegaciesAction:boolean=true;
  urlData:any={};
  constructor( 
    private fb: FormBuilder,
    private snackBar: MatSnackBar, private dialog: MatDialog, private confirmService: AppConfirmService,
    private userapi: UserAPIService, private loader: AppLoaderService, private snack: MatSnackBar, private router: Router
  ) { }

  ngOnInit() {  
    this.userId = localStorage.getItem("endUserId");
    this.urlData = this.userapi.getURLData();
    this.selectedProfileId = this.urlData.lastOne;    
    this.trusteeLegaciesAction = this.urlData.trusteeLegaciesAction
    // this.lock = new PatternLock('#patternHolder8', {
    //   allowRepeat: false,
    //   radius: 30, margin: 20,      
    // });
    
    this.getDeviceView();    
  }

  setPattern(pattern: any) {
    this.lock = new PatternLock("#patternHolder8", { enableSetPattern: true, radius: 30, margin: 20 });
    this.lock.setPattern(pattern);
    this.lock.disable();
  }

  //function to get all events
  getDeviceView = (query = {}, search = false) => {
    this.IsVisible= true;
    let profileIds = '';
    let req_vars = {}
    if (this.selectedProfileId) {
      profileIds = this.selectedProfileId;
      req_vars = {
        query: Object.assign({ _id: profileIds })
      }
    }
    this.userapi.apiRequest('post', 'passwordsDigitalAssets/view-device-details', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if (result.data) {
          if(this.urlData.userType == 'advisor' && !result.data.customerLegacyType){
            this.trusteeLegaciesAction = false;
          }
          this.row = result.data;
          this.IsVisible= true;
          if(this.row.passwordPattern && typeof this.row.passwordPattern!=='undefined' && this.row.passwordPattern!=''){
            this.IsVisible= false;
            this.setPattern(this.row.passwordPattern);          
          }
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
    })
    dialogRef.afterClosed()
      .subscribe(res => {
        this.getDeviceView();
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }

  deleteDevices(customerId='') {
    var statMsg = "Are you sure you want to delete device details?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          var query = {};
          const req_vars = {
            query: Object.assign({ _id: this.selectedProfileId }, query)
          }
          this.userapi.apiRequest('post', 'passwordsDigitalAssets/delete-device', req_vars).subscribe(result => {
            if (result.status == "error") {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {
              this.loader.close();
              if(this.urlData.userType == 'advisor'){
                this.router.navigate(['/', 'advisor', 'legacies', 'passwords-digital-assests', customerId])
              }else{
                this.router.navigate(['/', 'customer', 'dashboard', 'passwords-digital-assests'])
              }
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            }
          }, (err) => {
            console.error(err)
            this.loader.close();
          })
        }
      })
  }

  
  getType(key,subFolderName) {
      if(subFolderName=='deviceList'){
        this.typeOfDocumentList = DevicesList;
      }else if(subFolderName=='passwordType'){
        this.typeOfDocumentList = PasswordType;
      }
      
      let filteredTyes = this.typeOfDocumentList.filter(dtype => {
        return dtype.opt_code === key
      }).map(el => el.opt_name)[0];
      
      if(typeof filteredTyes!=='undefined'){
        return filteredTyes
      }
      

  }

}
