import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms'
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../userapi.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { AppConfirmService } from '../../../../shared/services/app-confirm/app-confirm.service';
import { essentialsMyProfessionalsComponent } from './../essentials-my-professionals/essentials-my-professionals.component';
import { DataSharingService } from 'app/shared/services/data-sharing.service';
@Component({
  selector: 'app-customer-home',
  templateUrl: './essentials-my-professionals-details.component.html',
  styleUrls: ['./essentials-my-professionals-details.component.scss'],
  animations: [egretAnimations]
})
export class EssentialsMyProfessionalsDetailsComponent implements OnInit {
  //public isSideNavOpen: boolean; public viewMode: string = 'grid-view';  public currentPage: any;  dayFirst = true;  daySeco = false;
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  //public products: any[];  public categories: any[];  public activeCategory: string = 'all';  public filterForm: FormGroup;  public cart: any[];  public cartData: any;
  userId: string;
  selectedProfileId: string = "";
  row: any;
  urlData:any={};
  trusteeLegaciesAction:boolean=true;
  LegacyPermissionError:string="You don't have access to this section";
  subFolderName:string = ''
  constructor( // private shopService: ShopService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar, private dialog: MatDialog, private confirmService: AppConfirmService,
    private userapi: UserAPIService, private loader: AppLoaderService, private snack: MatSnackBar, private router: Router,private sharedata: DataSharingService
  ) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.urlData = this.userapi.getURLData();
    this.selectedProfileId = this.urlData.lastOne;
    this.trusteeLegaciesAction = this.urlData.trusteeLegaciesAction
    this.getEssentialProfileDetails(); 
  }

  //function to get all events
  getEssentialProfileDetails = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId }, query)
    }
    this.userapi.apiRequest('post', 'customer/view-professional-details', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if(this.urlData.userType == 'advisor' && !result.data.customerLegacyType){
          this.trusteeLegaciesAction = false;
        }
        this.row = result.data;
        if(this.row){
          this.customerisValid(this.row);
        }        
      }
    }, (err) => {
      console.error(err)
    })
  }

  customerisValid(data){
    this.sharedata.shareLegacyCustomerIdData(data.customerId);
    if (this.urlData.lastThird == "legacies") {
      this.userapi.getUserAccess(data.customerId,(userAccess,userDeathFilesCnt,userLockoutPeriod,userDeceased) => { 
        if(userLockoutPeriod || userDeceased){
          this.trusteeLegaciesAction = false;
        }
        this.sharedata.shareLegacyDeathfileCountData(userDeathFilesCnt);
       if(userAccess.MyProfessionalsManagement!='now'){
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

  openProfessionalsModal(data: any = {}, isNew?) {
    console.log('asd')
    let dialogRef: MatDialogRef<any> = this.dialog.open(essentialsMyProfessionalsComponent, {
      width: '720px',
      disableClose: true,
    })

    dialogRef.afterClosed()
      .subscribe(res => {
        this.getEssentialProfileDetails();
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }

  deleteProfessionals(customerId='') {
    var statMsg = "Are you sure you want to delete professionals?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          var query = {};
          const req_vars = {
            query: Object.assign({ _id: this.selectedProfileId }, query),
            fromId:this.userId,
          }
          this.userapi.apiRequest('post', 'customer/delete-professionals', req_vars).subscribe(result => {
            if (result.status == "error") {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {
              this.loader.close();
              if(this.urlData.userType == 'advisor'){
                this.router.navigate(['/', 'advisor', 'legacies', 'essential-day-one', customerId])
              }else{
                this.router.navigate(['/', 'customer', 'dashboard', 'essential-day-one'])
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
}
