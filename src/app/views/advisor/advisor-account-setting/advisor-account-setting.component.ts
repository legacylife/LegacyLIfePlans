
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { MatDialog,MatSnackBar, MatSidenav } from '@angular/material';
import { FormBuilder, FormGroup, FormControl,Validators } from '@angular/forms'
import { egretAnimations } from '../../../shared/animations/egret-animations';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { CustomValidators } from 'ng2-validation';
import { AdvisorChangePassComponent } from './advisor-change-pass/advisor-change-pass.component';
import { map } from 'rxjs/operators';
import { Subscription, Observable, of  } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-advisor-account-setting',
  templateUrl: './advisor-account-setting.component.html',
  styleUrls: ['./advisor-account-setting.component.scss'],
  animations: [egretAnimations]
})
export class AdvisorAccountSettingComponent implements OnInit {

  selected = 'MH';
  date: any;
  ProfileForm: FormGroup;
  AddressForm: FormGroup;
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  userId:string;
  stateList:any;
  state_name:string;
  short_code:string;
  maxDate = new Date(new Date());
  profile:any;
  
  constructor(private router: Router, private route: ActivatedRoute,private fb: FormBuilder, private snack: MatSnackBar,public dialog: MatDialog, private api: APIService,private loader: AppLoaderService) { }

  ngOnInit() {
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
            dateOfBirth: new FormControl('',)
          });

          this.AddressForm = new FormGroup({
            addressLine1: new FormControl('',Validators.required),
            addressLine2: new FormControl(''),
            city: new FormControl('', Validators.required),
            state: new FormControl('', Validators.required),
            zipcode: new FormControl('', Validators.required)
          });

          this.getProfile();
 }

  //function to get all events
  getProfile = (query = {}, search = false) => {
    this.userId = '5cc9cb9f1955852c18c5b738';
    const req_vars = {
      query: Object.assign({ _id: this.userId, userType: "customer" }, query)
    }
    this.loader.open();
    this.api.apiRequest('post', 'userlist/getprofile', req_vars).subscribe(result => {
     if (result.status == "error") {
        this.profile = [];
        this.loader.close();
      } else {
        this.profile = result.data.userProfile;
        this.loader.close();
      }
    }, (err) => {
      console.error(err);
      this.loader.close();
    })
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
        //this.rows = result.data.userProfile;
       // localStorage.setItem("firstName", this.rows.firstName)
       // localStorage.setItem("lastName", this.rows.lastName)       		
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }
    }, (err) => {
      console.error(err)
    })
  }

    changePasspordModal(): void {
      const dialogRef = this.dialog.open(AdvisorChangePassComponent, {
        width: '555px',
      });
      dialogRef.afterClosed().subscribe(result => {});
    }
    toggleSideNav() {
      //this.sideNav.opened = !this.sideNav.opened;
    }
  }

