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
  constructor(
    private snackBar: MatSnackBar, private dialog: MatDialog, private confirmService: AppConfirmService,
    private userapi: UserAPIService, private loader: AppLoaderService, private snack: MatSnackBar, private router: Router) {
  }

  ngOnInit() {
    const locationArray = location.href.split('/')
    this.selectedProfileId = locationArray[locationArray.length - 1];
    this.userId = localStorage.getItem("endUserId");
    this.getRealEstateAssetDetails();
    this.RealEstateAssetsType = RealEstateAssetsType
  }

  getRealEstateAssetDetails(query = {}, search = false) {
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId }, query)
    }
    this.userapi.apiRequest('post', 'customer/view-real-estate-asset', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.row = result.data
      }
    }, (err) => {
      console.error(err)
    })
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

  deleteAssets() {
    var statMsg = "Are you sure you want to delete this record?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          var query = {};
          const req_vars = {
            query: Object.assign({ _id: this.selectedProfileId }, query)
          }
          this.userapi.apiRequest('post', 'customer/delete-real-estate-asset', req_vars).subscribe(result => {
            if (result.status == "error") {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {
              this.loader.close();
              this.router.navigate(['/', 'customer', 'dashboard', 'real-estate-assets'])
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