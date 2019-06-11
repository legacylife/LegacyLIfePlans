import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSnackBar, MatSidenav } from '@angular/material';
import { Product } from '../../../../shared/models/product.model';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../userapi.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';

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
  row:any;
  pplandLineNumberList:string = "";
  ppEmailsList:string = "";
  wpLandlineNumbersList: string = "";
  ccWorkLandlineNumbersList:string = "";
  ccChurchLandlineNumbersList:string = ""; 

  constructor(
    // private shopService: ShopService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private userapi: UserAPIService, private loader: AppLoaderService
  ) { }

  ngOnInit() {
    const locationArray = location.href.split('/')
    this.selectedProfileId = locationArray[locationArray.length - 1];

    this.userId = localStorage.getItem("endUserId");
    this.getEssentialProfileDetails();
    // this.categories$ = this.shopService.getCategories();
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
        this.pplandLineNumberList  = Array.prototype.map.call(this.row.ppLandlineNumbers, function(item) { return item.phone; }).join(","); 
        this.ppEmailsList  = Array.prototype.map.call(this.row.ppEmails, function(item) { return item.email; }).join(",");
        this.wpLandlineNumbersList  = Array.prototype.map.call(this.row.wpLandlineNumbers, function(item) { return item.phone; }).join(",");
        this.ccWorkLandlineNumbersList  = Array.prototype.map.call(this.row.ccWorkLandlineNumbers, function(item) { return item.phone; }).join(",");
        this.ccChurchLandlineNumbersList  = Array.prototype.map.call(this.row.ccChurchLandlineNumbers, function(item) { return item.phone; }).join(",");
      }
    }, (err) => {
      console.error(err)
      //this.showLoading = false
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
