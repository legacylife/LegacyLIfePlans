import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Product } from '../../../../shared/models/product.model';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../userapi.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { PersonalProfileModalComponent } from '../personal-profile-modal/personal-profile-modal.component';
import { AppConfirmService } from '../../../../shared/services/app-confirm/app-confirm.service';

@Component({
  selector: 'app-customer-home',
  templateUrl: './customer-essential-details.component.html',
  styleUrls: ['./customer-essential-details.component.scss'],
  animations: [egretAnimations]
})
export class CustomerEssentialDetailsComponent implements OnInit, OnDestroy {
  public isSideNavOpen: boolean;
  public viewMode: string = 'grid-view';
  public currentPage: any;
  dayFirst = true;
  daySeco = false;
  @ViewChild(MatSidenav) private sideNav: MatSidenav;

  public products: any[];
  public categories: any[];
  public activeCategory: string = 'all';
  public filterForm: FormGroup;
  public cart: any[];
  public cartData: any;
  userId: string;
  selectedProfileId: string = "";
  row: any;
  pplandLineNumberList: string = "";
  ppEmailsList: string = "";
  wpLandlineNumbersList: string = "";
  ccWorkLandlineNumbersList: string = "";
  ccChurchLandlineNumbersList: string = "";
  ccContactLandlineNumbersList: string = "";
  createdOn: any;
  ppaddressData: string = ""

  constructor(
    // private shopService: ShopService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar, private dialog: MatDialog, private confirmService: AppConfirmService,
    private userapi: UserAPIService, private loader: AppLoaderService, private snack: MatSnackBar, private router: Router
  ) { }

  ngOnInit() {
    const locationArray = location.href.split('/')
    this.selectedProfileId = locationArray[locationArray.length - 1];

    this.userId = localStorage.getItem("endUserId");
    this.getEssentialProfileDetails();
    this.categories = ["My essentials", "Pets"]


    this.products = []
    this.cartData = []
    this.filterForm = this.fb.group({
      search: ['']
    })
  }

  //function to get all events
  getEssentialProfileDetails = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId }, query)
    }

    this.userapi.apiRequest('post', 'customer/view-essential-profile', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.row = result.data
        //this.ppaddressData = (this.row.ppAddressLine1 ? this.row.ppAddressLine1 : '') +" "+ (this.row.ppAddressLine2 ? this.row.ppAddressLine2 : '')+" "+this.row.ppCity ? this.row.ppCity : '' +" "+ this.row.ppState ?this.row.ppState : '' +" "+this.row.ppCountry ? this.row.ppCountry : '' +" "+this.row.ppZipCode ? this.row.ppZipCode :''
        this.createdOn = this.row.createdOn ? this.row.createdOn : "";
        this.pplandLineNumberList = this.row.ppLandlineNumbers && this.row.ppLandlineNumbers.map(function (item) { return item.phone; }).join(",");
        this.ppEmailsList = this.row.ppEmails.map(function (item) { return item.email; }).join(",");
        this.wpLandlineNumbersList = this.row.wpLandlineNumbers && this.row.wpLandlineNumbers.map(function (item) { return item.phone; }).join(",");
        this.ccWorkLandlineNumbersList = this.row.ccWorkLandlineNumbers && this.row.ccWorkLandlineNumbers.map(function (item) { return item.phone; }).join(",");
        this.ccContactLandlineNumbersList = this.row.cclandlineNumbers && this.row.cclandlineNumbers.map(function (item) { return item.phone; }).join(",");
        this.ccChurchLandlineNumbersList = this.row.ccChurchLandlineNumbers && this.row.ccChurchLandlineNumbers.map(function (item) { return item.phone; }).join(",");
      }
    }, (err) => {
      console.error(err)
      //this.showLoading = false
    })

  }

  deleteProfile() {
    var statMsg = "Are you sure you want to delete profile?"


    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          var query = {};
          const req_vars = {
            query: Object.assign({ _id: this.selectedProfileId }, query)
          }
          this.userapi.apiRequest('post', 'customer/deleteprofile', req_vars).subscribe(result => {
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

  openProfileModal(data: any = {}, isNew?) {

    let dialogRef: MatDialogRef<any> = this.dialog.open(PersonalProfileModalComponent, {
      width: '720px',
      disableClose: true,
    })

    dialogRef.afterClosed()
      .subscribe(res => {
        this.getEssentialProfileDetails();
        if (!res) {
          // If user press cancel
          return;
        }
    })

  }

  showSecoDay() {
    this.dayFirst = false;
    this.daySeco = true;
  }
  ngOnDestroy() {

  }

  setActiveCategory(category) {
    this.activeCategory = category;
    this.filterForm.controls['category'].setValue(category)
  }

  toggleSideNav() {
    this.sideNav.opened = !this.sideNav.opened;
  }
}
