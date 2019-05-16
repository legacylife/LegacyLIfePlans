import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { MatDialog,MatSnackBar, MatSidenav } from '@angular/material';
import { FormBuilder, FormGroup, FormControl,Validators,FormArray } from '@angular/forms'
import { egretAnimations } from '../../../shared/animations/egret-animations';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { CustomValidators } from 'ng2-validation';
import { ChangePassComponent } from './change-pass/change-pass.component';
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

 // industryDomain = 'option22';
  date: any;
  ProfileForm: FormGroup;
  AddressForm: FormGroup;
  LicenseForm: FormGroup;
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  userId:string;
  stateList:any;
  state_name:string;
  short_code:string;
  maxDate = new Date(new Date());
  prodata:any;
  profile:any;
  //websites: FormArray;
  constructor(private router: Router, private route: ActivatedRoute,private fb: FormBuilder, private snack: MatSnackBar,public dialog: MatDialog, private api: APIService,private loader: AppLoaderService) { }

  ngOnInit() {
          this.api.apiRequest('post', 'globalsetting/statelist', {}).subscribe(result => {    
            if(result.status == "success"){
                this.stateList = result.data;
            } 
          }, (err) => {
            console.error(err)
          })

           this.ProfileForm = this.fb.group({
            firstName: new FormControl('', Validators.required),
            lastName: new FormControl('', Validators.required),
            username: new FormControl('', Validators.required),
            //phoneNumber: new FormControl('', Validators.required),
            dateOfBirth: new FormControl('',)
          });

          this.AddressForm = this.fb.group({
            businessName: new FormControl('',Validators.required),
            yearsOfService: new FormControl(''),
            businessType: new FormControl(''),
            industryDomain: new FormControl(''),
            addressLine1: new FormControl(''),
            addressLine2: new FormControl(''),
            city: new FormControl('', Validators.required),
            state: new FormControl('', Validators.required),
            zipcode: new FormControl('', Validators.required),
            businessPhoneNumber: new FormControl(''),
            bioText: new FormControl(''),          
            websites: new FormControl(''),          
            socialMediaLinks: new FormGroup({
              facebook: new FormControl(''),
              twitter:  new FormControl(''),
              linkedIn:  new FormControl(''),
            }),
            //websites: new FormControl('')   
           // websites: this.fb.array([ this.createItem() ])         
          });

          
          this.LicenseForm = this.fb.group({
            activeLicenceHeld: new FormControl('', Validators.required),
            agencyOversees: new FormControl('', Validators.required),
            managingPrincipleName: new FormControl('',),
            howManyProducers: new FormControl('',)
          });


          this.profile = [];
          this.getProfile();


          /*this.AddressForm = this.fb.group({            
            websites: this.fb.array([ this.createItem() ])
          });*/
 }

  //function to get all events
  getProfile = (query = {}, search = false) => {   
    this.userId = '5cc9cc301955852c18c5b73a';
    const req_vars = {
      query: Object.assign({ _id: this.userId, userType: "advisor" }, query)
    }
    this.loader.open();
    this.api.apiRequest('post', 'userlist/getprofile', req_vars).subscribe(result => {
     if (result.status == "error") {
        this.profile = [];
        this.loader.close();
      } else {
        this.profile = result.data.userProfile;
        this.ProfileForm.controls['firstName'].setValue(this.profile.firstName);
        this.ProfileForm.controls['lastName'].setValue(this.profile.lastName);
        this.ProfileForm.controls['dateOfBirth'].setValue(this.profile.dateOfBirth);
        this.ProfileForm.controls['username'].setValue(this.profile.username);

        this.AddressForm.controls['businessName'].setValue(this.profile.businessName);
        this.AddressForm.controls['yearsOfService'].setValue(this.profile.yearsOfService);
        this.AddressForm.controls['businessType'].setValue(this.profile.businessType);
        this.AddressForm.controls['industryDomain'].setValue(this.profile.industryDomain);
        this.AddressForm.controls['addressLine1'].setValue(this.profile.addressLine1);
        this.AddressForm.controls['addressLine2'].setValue(this.profile.addressLine2);
        this.AddressForm.controls['city'].setValue(this.profile.city);
        this.AddressForm.controls['state'].setValue(this.profile.state);
        this.AddressForm.controls['zipcode'].setValue(this.profile.zipcode);
        this.AddressForm.controls['businessPhoneNumber'].setValue(this.profile.businessPhoneNumber);
        this.AddressForm.controls['websites'].setValue(this.profile.websites);
        this.AddressForm.controls['bioText'].setValue(this.profile.bioText);
        
        this.LicenseForm.controls['activeLicenceHeld'].setValue(this.profile.activeLicenceHeld);
        this.LicenseForm.controls['agencyOversees'].setValue(this.profile.agencyOversees);
        this.LicenseForm.controls['managingPrincipleName'].setValue(this.profile.managingPrincipleName);
        this.LicenseForm.controls['howManyProducers'].setValue(this.profile.howManyProducers);

//console.log(this.profile.socialMediaLinks.facebook)
        //this.AddressForm.controls['socialMediaLinks.facebook'].setValue(this.profile.socialMediaLinks.facebook);
        //this.AddressForm.controls['socialMediaLinks.twitter'].setValue(this.profile.socialMediaLinks.twitter ? this.profile.socialMediaLinks.twitter : "");
        //this.AddressForm.controls['socialMediaLinks.linkedIn'].setValue(this.profile.socialMediaLinks.linkedIn ? this.profile.socialMediaLinks.linkedIn : "");
      //  this.AddressForm.websites: this.formBuilder.array([ this.createItem() ])
       // this.AddressForm.controls['websites'].setValue(this.profile.websites[0]);
        this.loader.close();
      }
    }, (err) => {
      console.error(err);
      this.loader.close();
    })
  }

  
  ProfileSubmit() {  
    this.userId = '5cc9cc301955852c18c5b73a';
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
      query: Object.assign({ _id: this.userId, userType: "advisor" }),
      proquery: Object.assign(profileInData),
      from: Object.assign({ fromname: "account details" })
    }
    this.loader.open();
    this.api.apiRequest('post', 'auth/cust-profile-update', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      } else {
        //this.prodata = result.data.userProfile;
       // localStorage.setItem("firstName", this.rows.firstName)
       // localStorage.setItem("lastName", this.rows.lastName)       		

        
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }
    }, (err) => {
      console.error(err)
    })
  }

  AddressSubmit() {  
    this.userId = '5cc9cc301955852c18c5b73a';
    const { socialMediaLinks : {linkedIn='' , facebook = '' , twitter =''}} = this.AddressForm.value
    console.log(this.AddressForm.value)
    let AddressInData = {
      addressLine1: this.AddressForm.controls['addressLine1'].value,
      addressLine2: this.AddressForm.controls['addressLine2'].value,
      city: this.AddressForm.controls['city'].value,
      state: this.AddressForm.controls['state'].value,
      zipcode: this.AddressForm.controls['zipcode'].value,
      businessName: this.AddressForm.controls['businessName'].value,
      yearsOfService: this.AddressForm.controls['yearsOfService'].value,
      businessType: this.AddressForm.controls['businessType'].value,
      industryDomain: this.AddressForm.controls['industryDomain'].value,
      businessPhoneNumber: this.AddressForm.controls['businessPhoneNumber'].value,
      bioText: this.AddressForm.controls['bioText'].value,
      websites: this.AddressForm.controls['websites'].value,
      socialMediaLinks:({
        "facebook":facebook,
        "twitter": twitter,
        "linkedIn": linkedIn
      })
    }
    var query = {};
    var proquery = {};
    const req_vars = {
      query: Object.assign({ _id: this.userId, userType: "advisor" }),
      proquery: Object.assign(AddressInData),
      from: Object.assign({ fromname: "Business information" })
    }
    this.loader.open();
    this.api.apiRequest('post', 'auth/cust-profile-update', req_vars).subscribe(result => {
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


  LicenseSubmit(){
    this.userId = '5cc9cc301955852c18c5b73a';
    console.log(this.LicenseForm.value)
    let LicensInData = {
      activeLicenceHeld: this.LicenseForm.controls['activeLicenceHeld'].value,
      agencyOversees: this.LicenseForm.controls['agencyOversees'].value,
      managingPrincipleName: this.LicenseForm.controls['managingPrincipleName'].value,
      howManyProducers: this.LicenseForm.controls['howManyProducers'].value,
    }
    var query = {};
    var proquery = {};
    const req_vars = {
      query: Object.assign({ _id: this.userId, userType: "advisor" }),
      proquery: Object.assign(LicensInData),
      from: Object.assign({ fromname: "License & documents" })
    }
    this.loader.open();
    this.api.apiRequest('post', 'auth/cust-profile-update', req_vars).subscribe(result => {
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


  /*
  addItem(): void {
    this.websites = this.AddressForm.get('websites') as FormArray;
    this.websites.push(this.createItem());
  }

  createItem(): FormGroup {
    return this.fb.group({
      link: ''
    });
  }*/

 changePasspordModal(): void {
      const dialogRef = this.dialog.open(ChangePassComponent, {
        width: '555px',
      });
      dialogRef.afterClosed().subscribe(result => {});
 }
 toggleSideNav() {
      //this.sideNav.opened = !this.sideNav.opened;
    }
 }