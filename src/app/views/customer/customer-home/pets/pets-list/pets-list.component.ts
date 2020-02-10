import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { egretAnimations } from '../../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../../userapi.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { PetsModalComponent } from './../pets-modal/pets-modal.component';
import { ManageTrusteeModalComponent } from '../../manage-trustee-modal/manage-trustee-modal.component';
import { DataSharingService } from 'app/shared/services/data-sharing.service';
@Component({
  selector: 'app-customer-home',
  templateUrl: './pets-list.component.html',
  styleUrls: ['./pets-list.component.scss'],
  animations: [egretAnimations]
})
export class PetsListComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  showPetsListing = true;
  showPetsListingCnt: any;
  userId: string;
  petsListing:any = [];
  modifiedDate:any;
  PetList:any = [];
  customerData:any = [];
  trusteePetsCnt:any;
  urlData:any={};
	dynamicRoute:string;
  customerLegaciesId: string;
  customerLegacyType:string='customer';														
  trusteeLegaciesAction:boolean=true;
  showTrusteeCnt:boolean=true;
  PetsManagementSection:string='now';
  LegacyPermissionError:string="You don't have access to this section";
  instruction_data:any;
  instruction_data_flag:boolean=false;  
  shareLegacFlag:boolean=false;  
  isProUser = false;
  isFreeProuser = false;
  constructor(private route: ActivatedRoute,private router: Router, private dialog: MatDialog,private userapi: UserAPIService, private loader: AppLoaderService,private sharedata: DataSharingService) { }
  ngOnInit() { 
    this.userId = localStorage.getItem("endUserId");
    this.urlData = this.userapi.getURLData();
    this.customerLegaciesId = this.urlData.lastOne;
    this.dynamicRoute = this.urlData.dynamicRoute;
    this.trusteeLegaciesAction = this.urlData.trusteeLegaciesAction;    
    if (this.urlData.lastThird == "legacies") {
      this.userId = this.urlData.lastOne;
      this.getCustomerDetails();
        this.userapi.getUserAccess(this.userId, (userAccess,userDeathFilesCnt,userLockoutPeriod,userDeceased) => { 
          if(userLockoutPeriod || userDeceased){
            this.trusteeLegaciesAction = false;
          }
          this.sharedata.shareLegacyDeathfileCountData(userDeathFilesCnt);
          this.PetsManagementSection = userAccess.PetsManagement
        });
      this.showTrusteeCnt = false;
      this.shareLegacFlag = true;
    }else{      
      this.isProUser = localStorage.getItem('endUserProSubscription') && localStorage.getItem('endUserProSubscription') == 'yes' ? true : false
      this.isFreeProuser = localStorage.getItem('endUserProFreeSubscription') && localStorage.getItem('endUserProFreeSubscription') == 'yes' ? true : false
      if (!this.isProUser && !this.isFreeProuser) {
        this.router.navigate(['/', 'customer', 'dashboard']);
      }

      this.userapi.getFolderInstructions('pets', (returnData) => {
        this.instruction_data = returnData;
        if(this.instruction_data){this.instruction_data_flag = true;}
      });
    } 
    this.getPetsList();
  }
  @HostListener('document:click', ['$event']) clickedOutside(event){
    if(event.srcElement.textContent=='Send an Invite'){
      setTimeout(()=>{
        this.getPetsList();    
      },2000);     
    } 
  }

  getPetsList = (query = {}) => {
    let trusteeQuery = {};
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" }, query),
      trusteeQuery: Object.assign({ customerId: this.userId,"userAccess.PetsManagement" : "now", status:"Active" }, trusteeQuery),
      fields: {},
      order: {"createdOn": -1},
    }
    this.userapi.apiRequest('post', 'pets/petsListing', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.petsListing = result.data.petList;
        if(this.shareLegacFlag){
          let petsListing = '';
          if(this.PetsManagementSection=='now'){
            petsListing = this.petsListing;
          }
          let sharePetsList = {petsList: petsListing };        
          this.sharedata.shareLegacyData(sharePetsList);
        }
        this.showPetsListingCnt = this.petsListing.length;  
        this.trusteePetsCnt = result.data.totalTrusteeRecords;  
        if (this.showPetsListingCnt>0) {
          this.showPetsListing = true;
        }
        else {
          this.showPetsListing = false;
        }
      }
    }, (err) => {
      console.error(err);
    })
  }

  openPetsModal() {
    let dialogRef: MatDialogRef<any> = this.dialog.open(PetsModalComponent, {     
      width: '720px',
      disableClose: true,
    });
    dialogRef.afterClosed()
    .subscribe(res => {
      this.getPetsList();
      if (!res) {
        // If user press cancel
        return;
      }
    })
  }

  getCustomerDetails(query = {}){
    const req_vars = {
      query: Object.assign({ _id: this.customerLegaciesId }, query)
    }
    this.userapi.apiRequest('post', 'userlist/viewall', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.customerData = result.data;
      }
    }, (err) => {
      console.error(err)
    })
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
      this.getPetsList();
      if (!res) {
        // If user press cancel
        return;
      }
    })
   }
}