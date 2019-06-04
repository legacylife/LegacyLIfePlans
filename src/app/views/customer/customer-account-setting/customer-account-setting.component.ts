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
import { ChangePicComponent } from './../../change-pic/change-pic.component';

import { map } from 'rxjs/operators';
import { Subscription, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { states } from '../../../state';
import { serverUrl, s3Details } from '../../../config'
import { ProfilePicService } from 'app/shared/services/profile-pic.service';

@Component({
  selector: 'app-customer-account-setting',
  templateUrl: './customer-account-setting.component.html',
  styleUrls: ['./customer-account-setting.component.scss'],
  animations: egretAnimations,
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

  uploadedFile: File
  profilePicture: any = "assets/images/arkenea/default.jpg"
pdisplay: boolean = false
  pcropperDisplay: boolean = false
  profileImage = null
  
  constructor(private router: Router, private route: ActivatedRoute, private fb: FormBuilder,
    private snack: MatSnackBar, public dialog: MatDialog, private userapi: UserAPIService,
    private loader: AppLoaderService, private picService: ProfilePicService) {
  }

  ngOnInit() {
    this.picService.itemValue.subscribe((nextValue) => {
      this.profilePicture =  nextValue
    })
    this.stateList = states;
    this.userId = localStorage.getItem("endUserId");
    this.ProfileForm = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      phoneNumber: new FormControl('', [Validators.required, Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]),
      landlineNumber: new FormControl('', [Validators.required, Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]),
      dateOfBirth: new FormControl('', ),
      username: new FormControl('', )
    });

    this.AddressForm = new FormGroup({
      addressLine1: new FormControl('', Validators.required),
      addressLine2: new FormControl(''),
      city: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      zipcode: new FormControl('', [Validators.required, , Validators.pattern(/^\d{5}(?:[-\s]\d{4})?$/)])
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

        this.AddressForm.controls['addressLine1'].setValue(this.profile.addressLine1);
        this.AddressForm.controls['addressLine2'].setValue(this.profile.addressLine2);
        this.AddressForm.controls['city'].setValue(this.profile.city);
        this.AddressForm.controls['state'].setValue(this.profile.state);
        this.AddressForm.controls['zipcode'].setValue(this.profile.zipcode);

        if (this.profile.profilePicture) {
          this.profilePicture = s3Details.url + "/" + s3Details.profilePicturesPath + this.profile.profilePicture;
          localStorage.setItem('endUserProfilePicture', this.profilePicture)
          this.picService.setProfilePic = this.profilePicture;
        }

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
        this.getProfile();     		
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
        this.getProfile();
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
  
  changePicModal(): void {
    const dialogRef = this.dialog.open(ChangePicComponent, {
      width: '555px',
    });
    dialogRef.afterClosed().subscribe(result => { });
  }

  /**
   * Profile upload
   */
  saveProfilePictureNOTINUSE() {
    const fd = new FormData()
    fd.append('userId', this.userId)
    fd.append('profilePicture', this.uploadedFile, this.uploadedFile.name);
    this.userapi.apiRequest('post', 'auth/updateProfilePic', fd).subscribe((result: any) => {
      if (result.status == "success") {
        this.loader.close();
        let userHeaderDetails = sessionStorage.getItem("enduserHeaderDetails")
        let userDetails = JSON.parse(userHeaderDetails)
        userHeaderDetails = JSON.stringify(userDetails)
        if (localStorage.getItem("enduserHeaderDetails")) {
          localStorage.setItem("enduserHeaderDetails", userHeaderDetails)
        } else {
          sessionStorage.setItem("enduserHeaderDetails", userHeaderDetails)
        }
      } else {
        this.snack.open(result.data, 'OK', { duration: 4000 })
      }
    }, (err) => {
      this.snack.open(err.error.data, 'OK', { duration: 4000 })
    })
  }

  //function to show profile
  showSelectedProfilePicture() {
    let img = document.getElementById('profilePicture') as HTMLInputElement
    this.uploadedFile = img.files[0]
    const filenameArray = this.uploadedFile.name.split('.')
    const ext = filenameArray[filenameArray.length - 1].toLowerCase()
    const validExt = ['jpg', 'jpeg', 'png', 'gif']
    if (this.uploadedFile.size > 5242880) {
      this.snack.open("Profile picture must be less than 5 MB.", 'OK', { duration: 4000 })
    } else if (validExt.indexOf(ext) > -1) {
      let reader = new FileReader()
      reader.onloadend = () => {
        if (reader.result) {
          this.profilePicture = reader.result;
          localStorage.setItem('endUserProfilePicture', this.profilePicture)
          this.picService.setProfilePic = this.profilePicture;
         // this.saveProfilePicture()
        }
      }
      reader.readAsDataURL(this.uploadedFile)
    } else {
      this.snack.open("Please select valid image. Valid extentions are jpg, jpeg, png, gif.", 'OK', { duration: 4000 })
    }
  }

}