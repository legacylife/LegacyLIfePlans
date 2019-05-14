
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSnackBar, MatSidenav } from '@angular/material';
import { Product } from '../../../shared/models/product.model';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../shared/animations/egret-animations';

import { MatProgressBar, MatButton } from '@angular/material';
import { Validators} from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { ChangePassComponent } from './change-pass/change-pass.component';
import { APIService } from './../../../api.service';

@Component({
  selector: 'app-customer-account-setting',
  templateUrl: './customer-account-setting.component.html',
  styleUrls: ['./customer-account-setting.component.scss'],
  animations: [egretAnimations]
})
export class CustomerAccountSettingComponent implements OnInit, OnDestroy {
  public isSideNavOpen: boolean;
  public viewMode: string = 'grid-view';
  public currentPage: any;
  dayFirst = true;
  daySeco = false;
  date: any;
  ProfileForm: FormGroup;
  AddressForm: FormGroup;
  chosenYearHandler: any;

  @ViewChild(MatSidenav) private sideNav: MatSidenav;

  public products: any[];
  public categories: any[];
  public activeCategory: string = 'all';
  public cart: any[];
  public cartData: any;
  stateList:any;
  state_name:string;
  short_code:string;
  maxDate = new Date(new Date());
  
  constructor(
    // private shopService: ShopService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,public dialog: MatDialog, private api: APIService
  ) { }

  ngOnInit() {
    // this.categories$ = this.shopService.getCategories();
     this.api.apiRequest('post', 'globalsetting/statelist', {}).subscribe(result => {    
          if(result.status == "success"){
              this.stateList = result.data;
          } 
        }, (err) => {
          console.error(err)
        })

    this.ProfileForm = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      businessPhoneNumber: new FormControl('', Validators.required),
      phoneNumber: new FormControl('', Validators.required),
      dateOfBirth: new FormControl('', )
    });

    this.AddressForm = new FormGroup({
      addressLine1: new FormControl('', Validators.required),
      addressLine2: new FormControl('', ),
      city: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      zipcode: new FormControl('', Validators.required)
    });

    this.categories = ["My essentials", "Pets"]
   
    this.products = []
    this.cartData = []
   // this.filterForm = this.fb.group({      search: ['']    })
  }
  showSecoDay() {
    this.dayFirst = false;
    this.daySeco = true;
  }
  ngOnDestroy() {

  }
  

  ProfileSubmit() {  

  }
  
  AddressSubmit() {  

  }



  setActiveCategory(category) {
    this.activeCategory = category;
    //this.filterForm.controls['category'].setValue(category)
  }

  toggleSideNav() {
    this.sideNav.opened = !this.sideNav.opened;
  }
  changePasspordModal(): void {
    const dialogRef = this.dialog.open(ChangePassComponent, {
      width: '555px',
    });
    dialogRef.afterClosed().subscribe(result => {});
  }
}
