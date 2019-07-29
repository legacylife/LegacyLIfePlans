import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { UserAPIService } from 'app/userapi.service';
import { RealEstateModelComponent } from '../real-estate-model/real-estate-model.component';
import { VehicleModelComponent } from '../vehicle-model/vehicle-model.component';
import { AssetsModelComponent } from '../assets-model/assets-model.component';
import { RealEstateType, RealEstateAssetsType } from 'app/selectList';
import { ManageTrusteeModalComponent } from '../../manage-trustee-modal/manage-trustee-modal.component';
@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss']
})
export class ListingComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  userId: string;
  typeOfLst: any = [];
  realEstateList: any = [];
  showRealEstateListing = false;
  realEstateVehiclesList: any = [];
  showRealEstateVehiclesListing = false;
  showAssetsListing = false;
  realEstateAssetsList: any = [];
  dynamicRoute:string;
  trusteeLegaciesAction:boolean=true;
  urlData:any={};
  trusteeRealEstateCnt:any;
  trusteeVehicleCnt:any;
  trusteeAssetsCnt:any;
  RealEstateManagementSection:string='now';
  VehiclesManagementSection:string='now';
  AssetsManagementSection:string='now';
  LegacyPermissionError:string="You don't have permission of this section";
  showTrusteeCnt:boolean=true;
  constructor(
    private route: ActivatedRoute,
    private router: Router, private dialog: MatDialog,
    private userapi: UserAPIService, private loader: AppLoaderService
  ) {

  }
 
  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.urlData = this.userapi.getURLData();
    this.dynamicRoute = this.urlData.dynamicRoute;
    this.trusteeLegaciesAction = this.urlData.trusteeLegaciesAction
    if (this.urlData.lastThird == "legacies") {
      this.userId = this.urlData.lastOne;
      this.userapi.getUserAccess(this.userId, (userAccess) => {
        this.RealEstateManagementSection = userAccess.RealEstateManagement
        this.VehiclesManagementSection= userAccess.VehiclesManagement
        this.AssetsManagementSection= userAccess.AssetsManagement
      });
      this.showTrusteeCnt = false;
    }
    this.getRealEstateList();
    this.getRealEstateVehiclesList();
    this.getRealEstateAssetsList();
  }
  @HostListener('document:click', ['$event']) clickedOutside(event){
    if(event.srcElement.outerText=='Send an Invite'){
      setTimeout(()=>{
        this.getRealEstateList();
        this.getRealEstateVehiclesList();
        this.getRealEstateAssetsList();
      },2000);              
    }
  }
  getRealEstateList(query = {}, search = false) {
    let trusteeQuery = {};
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" }, query),
      trusteeQuery: Object.assign({ customerId: this.userId,"userAccess.RealEstateManagement" : "now", status:"Active" }, trusteeQuery),
      fields: {},
      offset: '',
      limit: '',
      order: { "modifiedOn": -1 },
    }
    this.userapi.apiRequest('post', 'realEstateAssets/real-estate-list', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.realEstateList = result.data.realEstateList;
        this.trusteeRealEstateCnt = result.data.totalTrusteeRecords;
        
        if (result.data.realEstateList.length > 0) {
          this.showRealEstateListing = true;
        }
      }
    }, (err) => {
      console.error(err);
    })
  }

  getRealEstateVehiclesList(query = {}, search = false) {
    let trusteeQuery = {};
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" }, query),
      trusteeQuery: Object.assign({ customerId: this.userId,"userAccess.VehiclesManagement" : "now", status:"Active" }, trusteeQuery),
      fields: {},
      offset: '',
      limit: '',
      order: { "modifiedOn": -1 },
    }
    this.userapi.apiRequest('post', 'realEstateAssets/real-estate-vehicles-list', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.realEstateVehiclesList = result.data.realEstateVehiclesList;
        this.trusteeVehicleCnt = result.data.totalTrusteeRecords;
        if (result.data.realEstateVehiclesList.length > 0) {
          this.showRealEstateVehiclesListing = true;
        }
      }
    }, (err) => {
      console.error(err);
    })
  }


  getRealEstateAssetsList(query = {}, search = false) {
    let trusteeQuery = {};
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" }, query),
      trusteeQuery: Object.assign({ customerId: this.userId,"userAccess.AssetsManagement" : "now", status:"Active" }, trusteeQuery),
      fields: {},
      offset: '',
      limit: '',
      order: { "modifiedOn": -1 },
    }
    this.userapi.apiRequest('post', 'realEstateAssets/real-estate-assets-list', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.realEstateAssetsList = result.data.realEstateAssetsList;
        this.trusteeAssetsCnt = result.data.totalTrusteeRecords;
        if (result.data.realEstateAssetsList.length > 0) {
          this.showAssetsListing = true;
        }
      }
    }, (err) => {
      console.error(err);
    })
  }

  openModal(modelName, isNew?) {
    let model: any
    if (modelName == "RealEstate") {
      model = RealEstateModelComponent
    } else if (modelName == "Vehicles") {
      model = VehicleModelComponent
    } else {
      model = AssetsModelComponent
    }
    let dialogRef: MatDialogRef<any> = this.dialog.open(model, {
      width: '720px',
      disableClose: true,
    })
    dialogRef.afterClosed()
      .subscribe(res => {
        if (modelName == "RealEstate") {
          this.getRealEstateList()
        } else if (modelName == "Vehicles") {
          this.getRealEstateVehiclesList()
        } else {
          this.getRealEstateAssetsList()
        }        
        if (!res) {                    
          return;
        }
      })
  }

  getType(key, folderName) {
    if (folderName) {
      if (folderName == 'RealEstate') {
        this.typeOfLst = RealEstateType;
      } else {
        this.typeOfLst = RealEstateAssetsType;
      }

      let filteredTyes = this.typeOfLst.filter(dtype => {
        return dtype.opt_code === key
      }).map(el => el.opt_name)[0]
      return filteredTyes
    }
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
        if(code=='RealEstateManagement'){
          this.getRealEstateList();
        }else if(code=='VehiclesManagement'){
          this.getRealEstateVehiclesList();
        }else if(code=='AssetsManagement'){
          this.getRealEstateAssetsList();
        }
      if (!res) {
        // If user press cancel
        return;
      }
    })
   }

}