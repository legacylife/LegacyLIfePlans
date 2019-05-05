// import { Component, OnInit } from '@angular/core';

// @Component({
//   selector: 'app-customer-home',
//   templateUrl: './customer-home.component.html',
//   styleUrls: ['./customer-home.component.scss']
// })
// export class CustomerHomeComponent implements OnInit {

//   constructor() { }

//   ngOnInit() {
//   }

// }

import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSnackBar, MatSidenav } from '@angular/material';
import { Product } from '../../../shared/models/product.model';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../shared/animations/egret-animations';

@Component({
  selector: 'app-customer-home',
  templateUrl: './customer-home.component.html',
  styleUrls: ['./customer-home.component.scss'],
  animations: [egretAnimations]
})
export class CustomerHomeComponent implements OnInit, OnDestroy {
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

  constructor(
    // private shopService: ShopService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    // this.categories$ = this.shopService.getCategories();
    this.categories = ["My essentials", "Pets"]

   
    this.products = []
    this.cartData = []
    this.filterForm = this.fb.group({
      search: ['']
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
