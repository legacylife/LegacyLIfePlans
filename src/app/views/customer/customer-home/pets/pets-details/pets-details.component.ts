import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms'
import { egretAnimations } from '../../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../../userapi.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { AppConfirmService } from '../../../../../shared/services/app-confirm/app-confirm.service';
import { PetsModalComponent } from './../pets-modal/pets-modal.component';
@Component({
  selector: 'app-customer-home',
  templateUrl: './final-wishes-details.component.html',
  styleUrls: ['./final-wishes-details.component.scss'],
  animations: [egretAnimations]
})
export class PetsDetailsComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  userId: string;
  selectedProfileId: string = "";
  row: any;
  re =  "/(?:\.([^.]+))?$/" ;
  constructor( // private shopService: ShopService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar, private dialog: MatDialog, private confirmService: AppConfirmService,
    private userapi: UserAPIService, private loader: AppLoaderService, private snack: MatSnackBar, private router: Router
  ) { }

  ngOnInit() {
    // this.categories$ = this.shopService.getCategories();this.categories = ["My essentials", "Pets"]this.products = [] this.cartData = []  this.filterForm = this.fb.group({     search: ['']    })
    this.userId = localStorage.getItem("endUserId");
    const locationArray = location.href.split('/')
    this.selectedProfileId = locationArray[locationArray.length - 1];
    this.getFinalWishView();
  }

  //function to get all events
  getFinalWishView = (query = {}, search = false) => {
    let profileIds = '';
    let req_vars = {}
    if (this.selectedProfileId) {
      profileIds = this.selectedProfileId;
      req_vars = {
        query: Object.assign({ _id: profileIds })
      }
    }
    this.userapi.apiRequest('post', 'finalWish/view-wish-details', req_vars).subscribe(result => {     
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if (result.data) {
          this.row = result.data;
        }
      }  
    }, (err) => {
      console.error(err);
    })
  }

  openFinalWishModal(FolderNames, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(PetsModalComponent, {
      data: {
        FolderName: FolderNames,
        newName: FolderNames,
      },
      width: '720px',
      disableClose: true,
    })
    dialogRef.afterClosed()
      .subscribe(res => {
        this.getFinalWishView();
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }

  deleteFinalWish() {
    var statMsg = "Are you sure you want to delete final wish?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          var query = {};
          const req_vars = {
            query: Object.assign({ _id: this.selectedProfileId }, query)
          }
          this.userapi.apiRequest('post', 'finalWish/delete-finalWish', req_vars).subscribe(result => {
            if (result.status == "error") {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {
              this.loader.close();
              this.router.navigate(['/', 'customer', 'dashboard', 'final-wishes'])
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
