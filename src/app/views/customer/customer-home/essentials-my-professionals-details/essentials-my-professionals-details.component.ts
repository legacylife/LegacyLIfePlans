import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef,MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms'
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../userapi.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { AppConfirmService } from '../../../../shared/services/app-confirm/app-confirm.service';
import { essentialsMyProfessionalsComponent } from './../essentials-my-professionals/essentials-my-professionals.component';
@Component({
  selector: 'app-customer-home',
  templateUrl: './essentials-my-professionals-details.component.html',
  styleUrls: ['./essentials-my-professionals-details.component.scss'],
  animations: [egretAnimations]
})
export class EssentialsMyProfessionalsDetailsComponent implements OnInit {
  //public isSideNavOpen: boolean; public viewMode: string = 'grid-view';  public currentPage: any;  dayFirst = true;  daySeco = false;
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  //public products: any[];  public categories: any[];  public activeCategory: string = 'all';  public filterForm: FormGroup;  public cart: any[];  public cartData: any;
  userId: string;
  selectedProfileId: string = "";
  row: any;
  constructor( // private shopService: ShopService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar, private dialog: MatDialog, private confirmService: AppConfirmService,
    private userapi: UserAPIService, private loader: AppLoaderService, private snack: MatSnackBar,  private router: Router
  ) { }

  ngOnInit() {
    // this.categories$ = this.shopService.getCategories();this.categories = ["My essentials", "Pets"]this.products = [] this.cartData = []  this.filterForm = this.fb.group({     search: ['']    })
    this.userId = localStorage.getItem("endUserId");
    const locationArray = location.href.split('/')
    this.selectedProfileId = locationArray[locationArray.length - 1];
    this.getEssentialProfileDetails();
  }

  //function to get all events
  getEssentialProfileDetails = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId }, query)
    }
    this.userapi.apiRequest('post', 'customer/view-professional-details', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.row = result.data;console.log(result.data)
        // this.pplandLineNumberList = Array.prototype.map.call(this.row.ppLandlineNumbers, function (item) { return item.phone; }).join(",");
        // this.ppEmailsList = Array.prototype.map.call(this.row.ppEmails, function (item) { return item.email; }).join(",");
        // this.wpLandlineNumbersList = Array.prototype.map.call(this.row.wpLandlineNumbers, function (item) { return item.phone; }).join(",");
        // this.ccWorkLandlineNumbersList = Array.prototype.map.call(this.row.ccWorkLandlineNumbers, function (item) { return item.phone; }).join(",");
        // this.ccChurchLandlineNumbersList = Array.prototype.map.call(this.row.ccChurchLandlineNumbers, function (item) { return item.phone; }).join(",");
      }
    }, (err) => {
      console.error(err)
    })  
  }

  openProfessionalsModal(data: any = {}, isNew?) {console.log('asd')
    let dialogRef: MatDialogRef<any> = this.dialog.open(essentialsMyProfessionalsComponent, {
      width: '720px',
      disableClose: true,
    })
  }
  
  deleteProfessionals() {
    console.log('asdasd')
    var statMsg = "Are you sure you want to delete professionals?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          var query = {};
          const req_vars = {
            query: Object.assign({ _id: this.selectedProfileId }, query)
          }
          this.userapi.apiRequest('post', 'customer/delete-professionals', req_vars).subscribe(result => {
            if (result.status == "error") {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {
              this.loader.close();
              this.router.navigate(['/', 'customer', 'dashboard', 'essential-day-one'])
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            }
          }, (err) => {
            console.error(err)
            this.loader.close();
          })
        }
      })
  }
  // ngOnDestroy() {

  // }

  // showSecoDay() {
  //   this.dayFirst = false;this.daySeco = true;
  // }
  // setActiveCategory(category) {
  //   this.activeCategory = category;
  //   this.filterForm.controls['category'].setValue(category)
  // }

  // toggleSideNav() {
  //   this.sideNav.opened = !this.sideNav.opened;
  // }
}
