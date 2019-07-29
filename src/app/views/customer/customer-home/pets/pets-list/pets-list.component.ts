import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { egretAnimations } from '../../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../../userapi.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { PetsModalComponent } from './../pets-modal/pets-modal.component';
import { ManageTrusteeModalComponent } from '../../manage-trustee-modal/manage-trustee-modal.component';

@Component({
  selector: 'app-customer-home',
  templateUrl: './pets-list.component.html',
  styleUrls: ['./pets-list.component.scss'],
  animations: [egretAnimations]
})
export class PetsListComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  showPetsListing = false;
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
  LegacyPermissionError:string="You don't have permission of this section";
  constructor(private route: ActivatedRoute,private router: Router, private dialog: MatDialog,private userapi: UserAPIService, private loader: AppLoaderService) { }
  ngOnInit() { 
    this.userId = localStorage.getItem("endUserId");
    this.urlData = this.userapi.getURLData();
    this.customerLegaciesId = this.urlData.lastOne;
    this.dynamicRoute = this.urlData.dynamicRoute;
    this.trusteeLegaciesAction = this.urlData.trusteeLegaciesAction    
    if (this.urlData.lastThird == "legacies") {
      this.userId = this.urlData.lastOne;
      this.getCustomerDetails();
      this.userapi.getUserAccess(this.userId, (userAccess) => {
        this.PetsManagementSection = userAccess.PetsManagement
      });
      this.showTrusteeCnt = false;
    }
    this.getPetsList();
  }
  @HostListener('document:click', ['$event']) clickedOutside(event){
    if(event.srcElement.outerText=='Send an Invite'){
      setTimeout(()=>{
        console.log("Pets here !!! ")
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
        this.showPetsListingCnt = this.petsListing.length;  
        this.trusteePetsCnt = result.data.totalTrusteeRecords;  
        if (this.showPetsListingCnt>0) {
          this.showPetsListing = true;
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