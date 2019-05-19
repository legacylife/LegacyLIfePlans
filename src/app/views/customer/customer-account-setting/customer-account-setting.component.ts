import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { UserAPIService } from './../../../userapi.service';
import { MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms'
import { egretAnimations } from '../../../shared/animations/egret-animations';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { CustomValidators } from 'ng2-validation';
import { ChangePassComponent } from './change-pass/change-pass.component';
import { map } from 'rxjs/operators';
import { Subscription, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { states } from '../../../state';
@Component({
  selector: 'app-customer-account-setting',
  templateUrl: './customer-account-setting.component.html',
  styleUrls: ['./customer-account-setting.component.scss'],
  animations: egretAnimations
})
export class CustomerAccountSettingComponent implements OnInit, OnDestroy {
  date: any;
  ProfileForm: FormGroup;
  AddressForm: FormGroup;
  @ViewChild(MatSidenav) private sideNav: MatSidenav;

  userId: string;
  stateList: any;
  state_name: string;
  short_code: string;
  maxDate = new Date(new Date());
  profile: any;

  constructor(private router: Router, private route: ActivatedRoute, private fb: FormBuilder, private snack: MatSnackBar, public dialog: MatDialog, private userapi: UserAPIService, private loader: AppLoaderService) { }

  ngOnInit() {
    this.stateList = states;
    this.userId = localStorage.getItem("endUserId");
    this.ProfileForm = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      phoneNumber: new FormControl('', Validators.required),
      landlineNumber: new FormControl('', Validators.required),
      dateOfBirth: new FormControl('', ),
      username: new FormControl('', )
    });

    this.AddressForm = new FormGroup({
      addressLine1: new FormControl('', Validators.required),
      addressLine2: new FormControl(''),
      city: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      zipcode: new FormControl('', Validators.required)
    });

    this.profile = [];
    this.getProfile();

  }
  showSecoDay() {
    //this.dayFirst = false; this.daySeco = true;
  }

  ngOnDestroy() {

  }

  //function to get all events
  getProfile = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ _id: this.userId, userType: "customer" }, query)
    }
    this.loader.open();
    this.userapi.apiRequest('post', 'userlist/getprofile', req_vars).subscribe(result => {
      if (result.status == "error") {
        this.profile = [];
        this.loader.close();
      } else {

        this.profile = result.data.userProfile;
        console.log(this.profile.username)
        this.ProfileForm.controls['firstName'].setValue(this.profile.firstName);
        this.ProfileForm.controls['lastName'].setValue(this.profile.lastName);
        this.ProfileForm.controls['dateOfBirth'].setValue(this.profile.dateOfBirth);
        this.ProfileForm.controls['username'].setValue(this.profile.username);
        this.ProfileForm.controls['phoneNumber'].setValue(this.profile.phoneNumber);
        this.ProfileForm.controls['landlineNumber'].setValue(this.profile.landlineNumber);

        this.AddressForm.controls['addressLine2'].setValue(this.profile.addressLine2);
        this.AddressForm.controls['addressLine2'].setValue(this.profile.addressLine2);
        this.AddressForm.controls['city'].setValue(this.profile.city);
        this.AddressForm.controls['state'].setValue(this.profile.state);
        this.AddressForm.controls['zipcode'].setValue(this.profile.zipcode);

        this.loader.close();
      }
    }, (err) => {
      console.error(err);
      this.loader.close();
    })
  }


  ProfileSubmit() {
    let profileInData = {
      firstName: this.ProfileForm.controls['firstName'].value,
      lastName: this.ProfileForm.controls['lastName'].value,
      phoneNumber: this.ProfileForm.controls['phoneNumber'].value,
      landlineNumber: this.ProfileForm.controls['landlineNumber'].value,
      dateOfBirth: this.ProfileForm.controls['dateOfBirth'].value
    }
    var query = {};
    var proquery = {};
    const req_vars = {
      query: Object.assign({ _id: this.userId, userType: "customer" }),
      proquery: Object.assign(profileInData),
      from: Object.assign({ fromname: "account details" })
    }
    this.loader.open();
    this.userapi.apiRequest('post', 'auth/cust-profile-update', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      } else {
        //this.rows = result.data.userProfile;
        // localStorage.setItem("firstName", this.rows.firstName)
        // localStorage.setItem("lastName", this.rows.lastName)       		
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }
    }, (err) => {
      console.error(err)
    })
  }

  AddressSubmit() {
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
    this.userapi.apiRequest('post', 'auth/cust-profile-update', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      } else {
        // this.rows = result.data.userProfile;
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }
    }, (err) => {
      console.error(err)
    })
  }

  setActiveCategory(category) {
    //this.activeCategory = category;
    //this.filterForm.controls['category'].setValue(category)
  }

  toggleSideNav() {
    this.sideNav.opened = !this.sideNav.opened;
  }

  changePasspordModal(): void {
    const dialogRef = this.dialog.open(ChangePassComponent, {
      width: '555px',
    });
    dialogRef.afterClosed().subscribe(result => { });
  }
}