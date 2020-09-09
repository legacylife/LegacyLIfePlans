import { Component, OnInit, OnDestroy, ViewChild,HostListener ,Input, EventEmitter } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Product } from '../../../shared/models/product.model';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../shared/animations/egret-animations';
import { UserAPIService } from 'app/userapi.service';
import { LayoutService } from 'app/shared/services/layout.service';
import { MarkAsDeceasedComponent } from './../../../views/mark-as-deceased-modal/mark-as-deceased-modal.component';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { DataSharingService } from 'app/shared/services/data-sharing.service';
import { legacySettingModalComponent } from './legacy-setting/legacy-setting-modal/legacy-setting-modal.component';
import { SubscriptionService } from 'app/shared/services/subscription.service';
//import { PetsDetailsComponent } from './pets/pets-details/pets-details.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-customer-home',
  templateUrl: './customer-home.component.html',
  styleUrls: ['./customer-home.component.scss'], 
  animations: [egretAnimations]
})
export class CustomerHomeComponent implements OnInit, OnDestroy {
  userId = localStorage.getItem("endUserId");
  public isSideNavOpen: boolean;
  public viewMode: string = 'grid-view'; 
  public currentPage: any;
  layout = null;
  isProUser: boolean = false
  isFreeProuser: boolean = false
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  
  customerLegaicesId:string=''
  activeHeading: string = "";
  documentId: string = "";
  revokeId: string = "";
  shareDeathFileCount: string = "0";
  myLegacy:boolean = true
  sharedLegacies:boolean = false;
  markAsDeceased:boolean = false;
  revokeAsDeceased:boolean = false;
  alreadyRevokeAsDeceased:boolean = false;
  finallyDeceased:boolean = false;
  datas: any;
  
  constructor(private layoutServ: LayoutService,
    private fb: FormBuilder,private snack: MatSnackBar,
    private userapi:UserAPIService,private loader: AppLoaderService,private dialog: MatDialog,private confirmService: AppConfirmService,
    private shareData: DataSharingService, private subscriptionservice:SubscriptionService, private router: Router,   
  ) {
    this.layout = layoutServ.layoutConf
   }

  ngOnInit() {
    // new code on 6th sept 2020
    /*let freeUser = localStorage.getItem('endUserProFreeSubscription')
    let proUser = localStorage.getItem('endUserProSubscription')
    if((freeUser && freeUser == 'yes') || (proUser && proUser == 'yes')){
      this.isProUser = true
    }
    else {
      this.isProUser = false
    }*/

    this.isProUser = localStorage.getItem('endUserProSubscription') == 'yes' ? true : false     // old code
    let urlData = this.userapi.getURLData();
    
    if(urlData.lastThird == 'legacies' && urlData.lastOne){ 
      this.customerLegaicesId = urlData.lastOne;
      this.myLegacy = false
      this.sharedLegacies = true
      this.checkDeceasedStatus();
    }

    this.shareData.userShareCustomerIdSource.subscribe((ids) => {
      if(ids && ids!=='undefined'){
        this.customerLegaicesId = ids;
      }
   })

    const loc = location.href;
    const locArray = loc.split('/')
    this.activeHeading = '';
    if(locArray && locArray[5]){
      this.activeHeading = locArray[5];
    }   

    if(!this.isProUser){
      this.subscriptionservice.checkSubscription( '',( returnArr )=> {
        this.isProUser = localStorage.getItem('endUserProSubscription') && localStorage.getItem('endUserProSubscription') == 'yes' ? true : false
        this.isFreeProuser = localStorage.getItem('endUserProFreeSubscription') && localStorage.getItem('endUserProFreeSubscription') == 'yes' ? true : false
      })
    }
  }

  @HostListener('document:click', ['$event']) clickedOutside(event){
      const loc = location.href;
      const locArray = loc.split('/')
      this.activeHeading = '';
      if(locArray && locArray[5]){
        this.activeHeading = locArray[5];
      }   
      let urlData = this.userapi.getURLData();
      if(urlData.lastThird == 'legacies' && urlData.lastOne){ 
        this.customerLegaicesId = urlData.lastOne;
        this.myLegacy= false
        this.sharedLegacies =true 
      }
  }

  checkDeceasedStatus(query = {}){
    this.shareData.userShareCustomerIdSource.subscribe((ids) => {
      if(ids){
        this.customerLegaicesId = ids;
      }
   })
    let req_vars = {};
    if(localStorage.getItem("endUserType")=='customer'){
      req_vars = {
        query: Object.assign({ customerId: this.customerLegaicesId,trustId:this.userId,status:"Active" })
      }
    }else if(localStorage.getItem("endUserType")=='advisor'){
      req_vars = {
        query: Object.assign({ customerId: this.customerLegaicesId,advisorId:this.userId,status:"Active" })
      }
    }
    //this.loader.open(); 
    this.userapi.apiRequest('post', 'deceased/viewDeceaseDetails', req_vars).subscribe(result => {
    //this.loader.close();
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.documentId = '';
        this.markAsDeceased = true;
        this.revokeAsDeceased = false;
        this.revokeId = this.userId;
        if(result.data.deceasedData){    
            this.datas = result.data.deceasedData;       
            this.documentId = this.datas._id;
            this.markAsDeceased = false;
            this.revokeAsDeceased = true;
            if(this.datas.customerId.deceased && this.datas.customerId.deceased.status=='Active'){
              this.revokeAsDeceased = false;
              this.finallyDeceased = true;
            }
        }

        if(result.data.alreadyDeceased){    
          //this.documentId = result.data.alreadyDeceased._id;
          //this.alreadyRevokeAsDeceased = true;
          //result.data.alreadyDeceased.customerId.lockoutLegacyDate
          this.revokeAsDeceased = true;
          if(result.data.alreadyDeceased.customerId.deceased && result.data.alreadyDeceased.customerId.deceased.status=='Active'){
            this.markAsDeceased = false;
            this.revokeAsDeceased = false;
            this.finallyDeceased = true;
          }
        }
        
        this.shareData.userShareDataDeathFileSource.subscribe((shareDeathFileCount) => {
          this.shareDeathFileCount = shareDeathFileCount;
        
        })
      }
    }, (err) => {
      console.error(err);
    })
  }


  ngOnDestroy() {
  }

  toggleSideNav() {
    if(this.layout.isMobile){
      this.sideNav.opened = !this.sideNav.opened;
    }  
  }

  checkLegacySetting(path) {
    if (!this.isProUser && !this.isFreeProuser) {
      let dialogRef: MatDialogRef<any> = this.dialog.open(legacySettingModalComponent, {     
        width: '720px',
        disableClose: true,
      });
      dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
      })
    }else{
      this.router.navigate([path])
    }
  }

  markAsDeceasedModal(data: any = {}) {
     this.shareData.userShareCustomerIdSource.subscribe((ids) => {
        if(ids){
          this.customerLegaicesId = ids;
        }
     })
     this.markAsDeceasedModalOpen(this.customerLegaicesId);
  }

  markAsDeceasedModalOpen(customerLegaicesId) {
    if(customerLegaicesId){
        let dialogRef: MatDialogRef<any> = this.dialog.open(MarkAsDeceasedComponent, {
          width: '720px',
          disableClose: true,
          data: {
            customerLegaicesId: customerLegaicesId,
          }
        });
        dialogRef.afterClosed()
        .subscribe(res => {
          this.checkDeceasedStatus();
          if (!res) {
            return;
          }
        })
    }
  }


  revokeAsDeceasedModal() {
    this.shareData.userShareCustomerIdSource.subscribe((ids) => {
      this.customerLegaicesId = ids;
      this.revokeAsDeceasedModalOpen(this.customerLegaicesId);
   })
  }

  revokeAsDeceasedModalOpen(customerLegaicesId) {
    // if(!this.documentId){
    //   this.snack.open("Something wrong, Please try again", 'OK', { duration: 4000 })
    // }else{
    var statMsg = "Are you sure you want to revoke the deceased request?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          var query = {};
          let criteria = {};
          if(this.documentId){
            criteria = {_id:this.documentId};
          }else{
            criteria = {customerId:customerLegaicesId,status:'Active'};
          }

          const req_vars = {
            query: Object.assign(criteria, query),
            revokeId:this.revokeId,
            userType:localStorage.getItem("endUserType"),
            deceasedFromName:localStorage.getItem("endUserFirstName") + " " + localStorage.getItem("endUserLastName"),
            fromId:this.userId,
            toId:customerLegaicesId,
            folderName:'',
            subFolderName:''
          }

          this.userapi.apiRequest('post', 'deceased/revokeAsDeceased', req_vars).subscribe(result => {
            if (result.status == "error") {              
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {
              this.checkDeceasedStatus();              
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            }
            this.loader.close();
          }, (err) => {
            console.error(err)
            this.loader.close();
          })
        }
      })
   // }
  }
}
