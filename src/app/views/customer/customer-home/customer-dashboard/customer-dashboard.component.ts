import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSnackBar, MatSidenav, MatDialogRef, MatDialog, } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Product } from '../../../../shared/models/product.model';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { addTrusteeModalComponent } from '../add-trustee-modal/add-trustee-modal.component';


@Component({
  selector: 'app-customer-home',
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.scss'],
  animations: [egretAnimations]
})
export class CustomerDashboardComponent implements OnInit, OnDestroy {
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
    private route: ActivatedRoute, 
    private router: Router, private dialog: MatDialog,
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

  openAddTrusteeModal(data: any = {}, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(addTrusteeModalComponent, {
      width: '720px',
      disableClose: true,
    })
  }
}
