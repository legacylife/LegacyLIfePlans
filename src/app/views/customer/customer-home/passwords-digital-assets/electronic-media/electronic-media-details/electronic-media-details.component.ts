import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms'
import { egretAnimations } from '../../../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../../../userapi.service';
import { AppLoaderService } from '../../../../../../shared/services/app-loader/app-loader.service';
import { AppConfirmService } from '../../../../../../shared/services/app-confirm/app-confirm.service';
import { ElectronicMediaModalComponent } from './../electronic-media-modal/electronic-media-modal.component';
import { ElectronicMediaLists } from '../../../../../../selectList';
@Component({
  selector: 'app-customer-home',
  templateUrl: './electronic-media-details.component.html',
  styleUrls: ['./electronic-media-details.component.scss'],
  animations: [egretAnimations]
})
export class ElectronicMediaDetailsComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  userId: string;
  selectedProfileId: string = "";
  row: any;
  re =  "/(?:\.([^.]+))?$/" ;
  docPath: string; 
  typeOfList:any[];
  trusteeLegaciesAction:boolean=true;
  urlData:any={};
  toUserId:string = '';
  LegacyPermissionError:string="You don't have access to this section";
  constructor( // private shopService: ShopService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar, private dialog: MatDialog, private confirmService: AppConfirmService,
    private userapi: UserAPIService, private loader: AppLoaderService, private snack: MatSnackBar, private router: Router
  ) { }

  ngOnInit() {  
    this.userId = localStorage.getItem("endUserId");
    this.urlData = this.userapi.getURLData();
    this.selectedProfileId = this.urlData.lastOne;
    this.trusteeLegaciesAction = this.urlData.trusteeLegaciesAction
    this.getElectronicMediaView();
  }

  //function to get all events
  getElectronicMediaView = (query = {}, search = false) => {
    let profileIds = '';
    let req_vars = {}
    if (this.selectedProfileId) {
      profileIds = this.selectedProfileId;
      req_vars = {
        query: Object.assign({ _id: profileIds })
      }
    }
    this.userapi.apiRequest('post', 'passwordsDigitalAssets/view-electronicMedia-details', req_vars).subscribe(result => {     
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if (result.data) {
          if(this.urlData.userType == 'advisor' && !result.data.customerLegacyType){
            this.trusteeLegaciesAction = false;
          }
          this.row = result.data;        
          this.toUserId =  this.row.customerId;
          this.customerisValid(this.row);      
        }
      }  
    }, (err) => {
      console.error(err);
    })
  }

  customerisValid(data){
    if (this.urlData.lastThird == "legacies") {
      this.userapi.getUserAccess(data.customerId,(userAccess,userDeathFilesCnt,userLockoutPeriod,userDeceased) => { 
        if(userLockoutPeriod || userDeceased){
          this.trusteeLegaciesAction = false;
        }
        
        if(userAccess.ElectronicMediaManagement!='now'){
          this.snack.open(this.LegacyPermissionError, 'OK', { duration: 4000 })
          this.router.navigateByUrl('/'+localStorage.getItem("endUserType")+'/dashboard');
        }          
      });    
    } else {      
      if(data.customerId!=this.userId){
        this.snack.open(this.LegacyPermissionError, 'OK', { duration: 4000 })
        this.router.navigateByUrl('/'+localStorage.getItem("endUserType")+'/dashboard');
      }
    } 
  }

  openElectronicMediaModal() {
    let dialogRef: MatDialogRef<any> = this.dialog.open(ElectronicMediaModalComponent, {     
      width: '720px',
      disableClose: true,
    })
    dialogRef.afterClosed()
      .subscribe(res => {
        this.getElectronicMediaView();
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }

  deleteElectronicMedia(customerId='') {
    var statMsg = "Are you sure you want to delete electronic media details?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          var query = {};
          const req_vars = {
            query: Object.assign({ _id: this.selectedProfileId }, query),
            toId:this.toUserId,
            folderName:'Passwords & Digital Assets',
            subFolderName:'Electronic media'
          }
          this.userapi.apiRequest('post', 'passwordsDigitalAssets/delete-electronicMedia', req_vars).subscribe(result => {
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


  getType(key) {
    this.typeOfList = ElectronicMediaLists;
    let filteredTyes = this.typeOfList.filter(dtype => {
      return dtype.opt_code === key
    }).map(el => el.opt_name)[0]
    return filteredTyes
  }

}
