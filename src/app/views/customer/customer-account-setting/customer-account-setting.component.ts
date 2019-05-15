
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSnackBar, MatSidenav } from '@angular/material';
import { Product } from '../../../shared/models/product.model';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../shared/animations/egret-animations';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
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
  userId:string;
  stateList:any;
  state_name:string;
  short_code:string;
  maxDate = new Date(new Date());
  rows:any;
  constructor(
    // private shopService: ShopService,
    private fb: FormBuilder,
    private snack: MatSnackBar,public dialog: MatDialog, private api: APIService,private loader: AppLoaderService
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
    this.userId = '5cc9cb9f1955852c18c5b738';
    let profileInData = {
      firstName: this.ProfileForm.controls['firstName'].value,
      lastName: this.ProfileForm.controls['lastName'].value,
     // businessPhoneNumber: this.ProfileForm.controls['businessPhoneNumber'].value,
     // phoneNumber: this.ProfileForm.controls['phoneNumber'].value,
      dateOfBirth: this.ProfileForm.controls['dateOfBirth'].value      
    }
    var query = {};
    var proquery = {};
    const req_vars = {
      query: Object.assign({ _id: this.userId, userType: "customer" }),
      proquery: Object.assign(profileInData),
      from: Object.assign({ from: "account details" })
    }
    this.loader.open();
    this.api.apiRequest('post', 'auth/cust-profile-update', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      } else {
        this.rows = result.data.userProfile;
        localStorage.setItem("firstName", this.rows.firstName)
        localStorage.setItem("lastName", this.rows.lastName)       		
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }
    }, (err) => {
      console.error(err)
    })
  }
  
  AddressSubmit() {  
    this.userId = '5cc9cb9f1955852c18c5b738';
    let AddressInData = {
      addressLine1: this.AddressForm.controls['addressLine1'].value,
      addressLine2: this.AddressForm.controls['addressLine2'].value,
      city: this.AddressForm.controls['city'].value,
      state: this.AddressForm.controls['state'].value,
      zipcode: this.AddressForm.controls['zipcode'].value      
    }
    var query = {};
    var proquery = {};
    const req_vars = {
      query: Object.assign({ _id: this.userId, userType: "customer" }),
      proquery: Object.assign(AddressInData),
      from: Object.assign({ fromname: "address details" })
    }
    this.loader.open();
    this.api.apiRequest('post', 'auth/cust-profile-update', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      } else {
        this.rows = result.data.userProfile;
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }
    }, (err) => {
      console.error(err)
    })
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
