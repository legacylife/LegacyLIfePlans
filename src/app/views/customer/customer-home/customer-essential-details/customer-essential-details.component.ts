import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Product } from '../../../../shared/models/product.model';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../userapi.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { PersonalProfileModalComponent } from '../personal-profile-modal/personal-profile-modal.component';
import { AppConfirmService } from '../../../../shared/services/app-confirm/app-confirm.service';

@Component({
  selector: 'app-customer-home',
  templateUrl: './customer-essential-details.component.html',
  styleUrls: ['./customer-essential-details.component.scss'],
  animations: [egretAnimations]
})
export class CustomerEssentialDetailsComponent implements OnInit {
  public isSideNavOpen: boolean;
  public viewMode: string = 'grid-view';
  public currentPage: any;
  dayFirst = true;
  daySeco = false;
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  userId: string;
  selectedProfileId: string = "";
  row: any;
  pplandLineNumberList: string = "";
  ppEmailsList: string = "";
  wpLandlineNumbersList: string = "";
  ccWorkLandlineNumbersList: string = "";
  ccChurchLandlineNumbersList: string = "";
  ccContactLandlineNumbersList: string = "";
  createdOn: any;
  ppaddressData: string = "";
  wpaddressData: string = "";
  trusteeLegaciesAction:boolean=true;
  urlData:any={};
  LegacyPermissionError:string="You don't have access to this section";
  constructor(
    // private shopService: ShopService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar, private dialog: MatDialog, private confirmService: AppConfirmService,
    private userapi: UserAPIService, private loader: AppLoaderService, private snack: MatSnackBar, private router: Router
  ) { }

  ngOnInit() {
    this.urlData = this.userapi.getURLData();
    this.selectedProfileId = this.urlData.lastOne;
    this.trusteeLegaciesAction = this.urlData.trusteeLegaciesAction;
    this.userId = localStorage.getItem("endUserId");
    this.getEssentialProfileDetails();
  }

  //function to get all events
  getEssentialProfileDetails = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId }, query)
    }
    this.userapi.apiRequest('post', 'customer/view-essential-profile', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if(this.urlData.userType == 'advisor' && !result.data.customerLegacyType){
          this.trusteeLegaciesAction = false;
        }
        this.row = result.data
        this.ppaddressData = (this.row.ppAddressLine1 ? this.row.ppAddressLine1 : '') + " " + (this.row.ppAddressLine2 ? this.row.ppAddressLine2 : '') + " " + (this.row.ppCity ? this.row.ppCity : '') + " " + (this.row.ppState ?this.row.ppState : '') +"  "+ (this.row.ppZipCode ? this.row.ppZipCode :'')  +" "+ (this.row.ppCountry ? this.row.ppCountry : '')
        this.ppaddressData = this.ppaddressData.trim();
        this.createdOn = this.row.createdOn ? this.row.createdOn : "";
        this.pplandLineNumberList = this.row.ppLandlineNumbers.map(function (item) { return item.phone; }).join(", ");
        this.ppEmailsList = this.row.ppEmails.map(function (item) { return item.email; }).join(", ");
        this.wpLandlineNumbersList = this.row.wpLandlineNumbers.map(function (item) { return item.phone; }).join(", ");
        this.ccWorkLandlineNumbersList = this.row.ccWorkLandlineNumbers.map(function (item) { return item.phone; }).join(", ");
        this.ccContactLandlineNumbersList = this.row.cclandlineNumbers.map(function (item) { return item.phone; }).join(", ");
        this.ccChurchLandlineNumbersList = this.row.ccChurchLandlineNumbers.map(function (item) { return item.phone; }).join(", ");

        this.wpaddressData = (this.row.wpAddressLine1 ? this.row.wpAddressLine1 : '') + " " + (this.row.wpAddressLine2 ? this.row.wpAddressLine2 : '') + " " + (this.row.wpCity ? this.row.wpCity : '') + " " + (this.row.wpState ?this.row.wpState : '') +"  "+ (this.row.wpZipCode ? this.row.wpZipCode :'')  +" "+ (this.row.wpCountry ? this.row.wpCountry : '')
        this.wpaddressData = this.ppaddressData.trim();
     
        this.customerisValid(this.row);
      }
    }, (err) => {
      console.error(err)
      //this.showLoading = false
    })
  }

  customerisValid(data){
    if (this.urlData.lastThird == "legacies") {
      this.userapi.getUserAccess(data.customerId,(userAccess,userDeathFilesCnt,userLockoutPeriod,userDeceased) => { 
        if(userLockoutPeriod || userDeceased){
          this.trusteeLegaciesAction = false;
        }
       if(userAccess.PersonalProfileManagement!='now'){
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

  deleteProfile(customerId='') {
    var statMsg = "Are you sure you want to delete profile?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          var query = {};
          const req_vars = {
            query: Object.assign({ _id: this.selectedProfileId }, query)
          }
          this.userapi.apiRequest('post', 'customer/deleteprofile', req_vars).subscribe(result => {
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

  openProfileModal(data: any = {}, isNew?) {
    localStorage.setItem("personalProfileAction", "updated");
    let dialogRef: MatDialogRef<any> = this.dialog.open(PersonalProfileModalComponent, {
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

  checkSpecialChar(event)
  {  
    var key;  
    key = event.charCode;
    return((key > 64 && key < 91) || (key> 96 && key < 123) || key == 8 || key == 32 || (key >= 48 && key <= 57)); 
  }

}