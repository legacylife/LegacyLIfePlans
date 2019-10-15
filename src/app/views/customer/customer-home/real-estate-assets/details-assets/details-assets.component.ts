import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { UserAPIService } from 'app/userapi.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { AssetsModelComponent } from '../assets-model/assets-model.component';
import { RealEstateAssetsType } from 'app/selectList';

@Component({
  selector: 'app-details-assets',
  templateUrl: './details-assets.component.html',
  styleUrls: ['./details-assets.component.scss']
})

export class DetailsAssetsComponent implements OnInit {
  public isSideNavOpen: boolean;
  public viewMode: string = 'grid-view';
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  userId: string;
  selectedProfileId: string = "";
  row: any;
  RealEstateAssetsType: any=[];
  trusteeLegaciesAction:boolean=true;
  urlData:any={};
  toUserId:string = ''
  subFolderName:string = 'Assets'
  LegacyPermissionError:string="You don't have access to this section";
  constructor(
    private snackBar: MatSnackBar, private dialog: MatDialog, private confirmService: AppConfirmService,
    private userapi: UserAPIService, private loader: AppLoaderService, private snack: MatSnackBar, private router: Router) {
  }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.urlData = this.userapi.getURLData();
    this.selectedProfileId = this.urlData.lastOne;
    this.trusteeLegaciesAction = this.urlData.trusteeLegaciesAction

    this.getRealEstateAssetDetails();
    this.RealEstateAssetsType = RealEstateAssetsType
  }

  getRealEstateAssetDetails(query = {}, search = false) {
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId }, query)
    }
    this.toUserId = this.userId
    this.userapi.apiRequest('post', 'realEstateAssets/view-real-estate-asset', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if(this.urlData.userType == 'advisor' && !result.data.customerLegacyType){
          this.trusteeLegaciesAction = false;
        }
        this.row = result.data
        this.toUserId = this.row.customerLegacyId ? this.row.customerLegacyId : this.row.customerId;
        if(this.row){
          this.customerisValid(this.row);
        }
      }
    }, (err) => {
      console.error(err)
    })
  }

  customerisValid(data){
    if (this.urlData.lastThird == "legacies") {
      this.userapi.getUserAccess(data.customerId,(userAccess,userDeathFilesCnt,userLockoutPeriod,userDeceased) => { 
        if(userLockoutPeriod || userDeceased){
          this.trusteeLegaciesAction = false;
        }
  
        if(userAccess.AssetsManagement!='now'){
          this.snack.open(this.LegacyPermissionError, 'OK', { duration: 4000 })
          this.router.navigateByUrl('/'+localStorage.getItem("endUserType")+'/dashboard');
        }          
      });    
    }else{      
      if(data.customerId!=this.userId){
        this.snack.open(this.LegacyPermissionError, 'OK', { duration: 4000 })
        this.router.navigateByUrl('/'+localStorage.getItem("endUserType")+'/dashboard');
      }
    } 
  }

  openModal(data: any = {}, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(AssetsModelComponent, {
      width: '720px',
      disableClose: true,
    })

    dialogRef.afterClosed()
      .subscribe(res => {
        this.getRealEstateAssetDetails();
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }

  deleteAssets(customerId='') {
    var statMsg = "Are you sure you want to delete this record?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          var query = {};
          const req_vars = {
            query: Object.assign({ _id: this.selectedProfileId }, query),
            fromId:localStorage.getItem('endUserId'),
            toId:this.toUserId,
            folderName:'Real Estate & Assets',
            subFolderName: this.subFolderName
          }
          this.userapi.apiRequest('post', 'realEstateAssets/delete-real-estate-asset', req_vars).subscribe(result => {
            if (result.status == "error") {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {
              this.loader.close();
              if(this.urlData.userType == 'advisor'){
                this.router.navigate(['/', 'advisor', 'legacies', 'real-estate-assets', customerId])
              }else{
                this.router.navigate(['/', 'customer', 'dashboard', 'real-estate-assets'])
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

  getType(key, folderName) {
      let filteredTyes = this.RealEstateAssetsType.filter(dtype => {
        return dtype.opt_code === key
      }).map(el => el.opt_name)[0]
      return filteredTyes
  }
}