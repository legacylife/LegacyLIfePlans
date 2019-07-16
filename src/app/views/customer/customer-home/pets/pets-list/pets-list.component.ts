import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { egretAnimations } from '../../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../../userapi.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { PetsModalComponent } from './../pets-modal/pets-modal.component';

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

  urlData:any={};
	dynamicRoute:string;
  customerLegaciesId: string;
  customerLegacyType:string='customer';														
  trusteeLegaciesAction:boolean=true;

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
    }
    this.getPetsList();
  }

  getPetsList = (query = {}) => {
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" }, query),
      fields: {},
      order: {"createdOn": -1},
    }
    this.userapi.apiRequest('post', 'pets/petsListing', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.petsListing = result.data.petList;
        this.showPetsListingCnt = this.petsListing.length;  
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
}