import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { UserAPIService } from 'app/userapi.service';
import { RealEstateModelComponent } from '../real-estate-model/real-estate-model.component';
import { VehicleModelComponent } from '../vehicle-model/vehicle-model.component';
import { AssetsModelComponent } from '../assets-model/assets-model.component';
import { RealEstateType, RealEstateAssetsType } from 'app/selectList';

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
  constructor(
    private route: ActivatedRoute,
    private router: Router, private dialog: MatDialog,
    private userapi: UserAPIService, private loader: AppLoaderService
  ) {

  }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.getRealEstateList();
    this.getRealEstateVehiclesList();
    this.getRealEstateAssetsList();
    let urlData = this.userapi.getURLData();
    this.dynamicRoute = urlData.dynamicRoute;
    this.trusteeLegaciesAction = urlData.trusteeLegaciesAction
  }

  getRealEstateList(query = {}, search = false) {
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" }, query),
      fields: {},
      offset: '',
      limit: '',
      order: { "modifiedOn": -1 },
    }
    this.userapi.apiRequest('post', 'realEstateAssets/real-estate-list', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.realEstateList = result.data;
        if (result.data.length > 0) {
          this.showRealEstateListing = true;
        }
      }
    }, (err) => {
      console.error(err);
    })
  }

  getRealEstateVehiclesList(query = {}, search = false) {
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" }, query),
      fields: {},
      offset: '',
      limit: '',
      order: { "modifiedOn": -1 },
    }
    this.userapi.apiRequest('post', 'realEstateAssets/real-estate-vehicles-list', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.realEstateVehiclesList = result.data;
        if (result.data.length > 0) {
          this.showRealEstateVehiclesListing = true;
        }
      }
    }, (err) => {
      console.error(err);
    })
  }


  getRealEstateAssetsList(query = {}, search = false) {
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" }, query),
      fields: {},
      offset: '',
      limit: '',
      order: { "modifiedOn": -1 },
    }
    this.userapi.apiRequest('post', 'realEstateAssets/real-estate-assets-list', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.realEstateAssetsList = result.data;
        if (result.data.length > 0) {
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

}