import { Component, OnInit, OnDestroy, ViewChild,HostListener } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Product } from '../../../shared/models/product.model';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../shared/animations/egret-animations';
import { UserAPIService } from 'app/userapi.service';
import { LayoutService } from 'app/shared/services/layout.service';
import { MarkAsDeceasedComponent } from './../../../views/mark-as-deceased-modal/mark-as-deceased-modal.component';
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
  layout = null;
  isProUser: boolean = false
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  
  public products: any[];
  public categories: any[];
  public activeCategory: string = 'all';
  public filterForm: FormGroup;
  public cart: any[];
  public cartData: any;
  customerLegaicesId:string=''
  activeHeading: string = "";
  myLegacy:boolean = true
  sharedLegacies:boolean = false
  constructor(private layoutServ: LayoutService,
    private fb: FormBuilder,private snackBar: MatSnackBar,
    private userapi:UserAPIService,
    private dialog: MatDialog
  ) {
    this.layout = layoutServ.layoutConf
   }

  ngOnInit() {
    this.isProUser = localStorage.getItem('endUserProSubscription') == 'yes' ? true : false
    // this.categories$ = this.shopService.getCategories();
    this.categories = ["My essentials", "Pets"]
    this.products = []
    this.cartData = []
    this.filterForm = this.fb.group({
      search: ['']
    })
    
    let urlData = this.userapi.getURLData();
    if(urlData.lastThird == 'legacies' && urlData.lastOne){
      this.customerLegaicesId = urlData.lastOne
      this.myLegacy= false
      this.sharedLegacies =true 
    }

    const loc = location.href;
    const locArray = loc.split('/')
    this.activeHeading = '';
    if(locArray && locArray[5]){
      this.activeHeading = locArray[5];
    }   
  }

  @HostListener('document:click', ['$event']) clickedOutside(event){
      const loc = location.href;
      const locArray = loc.split('/')
      this.activeHeading = '';
      if(locArray && locArray[5]){
        this.activeHeading = locArray[5];
      }   
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
    if(this.layout.isMobile){
      this.sideNav.opened = !this.sideNav.opened;
    }  
  }

  markAsDeceasedModal(data: any = {}, isNew?) {
    let title = isNew ? 'Add new member' : 'Update member';
    let dialogRef: MatDialogRef<any> = this.dialog.open(MarkAsDeceasedComponent, {
      width: '720px',
      disableClose: true,
    })
  }
}
