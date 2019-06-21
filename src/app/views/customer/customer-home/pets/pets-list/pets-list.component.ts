import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
//import { Subscription, Observable } from 'rxjs';
//import { map } from 'rxjs/operators';
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
  showFuneralPlansListing = false;
  showFuneralPlansCnt: any;
  showObituaryListing = false;
  showObituaryListingCnt: any;
  showCelebrationLifesListing = false;
  showCelebrationLifesListingCnt: any;

  userId: string;
  FuneralPlansList:any = [];
  ObituaryList:any = [];
  CelebrationLifesList:any = [];
  modifiedDate:any;

  WishesList:any = [];

  constructor(private route: ActivatedRoute,private router: Router, private dialog: MatDialog,private userapi: UserAPIService, private loader: AppLoaderService) { }
  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    
    this.getWishList();
  }

  getWishList = (query = {}) => {
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" }, query),
      fields: {},
      order: {"createdOn": -1},
    }
    this.userapi.apiRequest('post', 'finalwish/finalListing', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.WishesList = result.data.wishList;
        this.FuneralPlansList = this.WishesList.filter(dtype => {
          return dtype.subFolderName == 'Funeral Plans'
        }).map(el => el)
        this.showFuneralPlansCnt = this.FuneralPlansList.length        
        if (this.showFuneralPlansCnt>0) {
          this.showFuneralPlansListing = true;
        }

        this.ObituaryList = this.WishesList.filter(dtype => {
          return dtype.subFolderName == 'Obituary'
        }).map(el => el)
        this.showObituaryListingCnt = this.ObituaryList.length
        if (this.showObituaryListingCnt > 0) {
          this.showObituaryListing = true;
        }

        this.CelebrationLifesList = this.WishesList.filter(dtype => {
          return dtype.subFolderName == 'Celebration of Life'
        }).map(el => el)
        this.showCelebrationLifesListingCnt = this.CelebrationLifesList.length
        if (this.showCelebrationLifesListingCnt > 0) {
          this.showCelebrationLifesListing = true;
        }

      }
    }, (err) => {
      console.error(err);
    })
  }

  openFinalWishModal(FolderName, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(PetsModalComponent, {
      data: {
        FolderName: FolderName,
      },
      width: '720px',
      disableClose: true,
    });
    dialogRef.afterClosed()
    .subscribe(res => {
      this.getWishList();
      if (!res) {
        // If user press cancel
        return;
      }
    })
  }
}