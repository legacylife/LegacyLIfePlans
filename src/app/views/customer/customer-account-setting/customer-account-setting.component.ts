import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { UserAPIService } from './../../../userapi.service';
import { MatDialog, MatSnackBar, MatSidenav, MatDialogRef } from '@angular/material';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms'
import { egretAnimations } from '../../../shared/animations/egret-animations';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { CustomValidators } from 'ng2-validation';
import { ChangePassComponent } from './change-pass/change-pass.component';
import { ChangePicComponent } from './../../change-pic/change-pic.component';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { map } from 'rxjs/operators';
import { Subscription, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { states } from '../../../state';
import { serverUrl, s3Details } from '../../../config'
import { ProfilePicService } from 'app/shared/services/profile-pic.service';
import { CanComponentDeactivate } from '../../../shared/services/auth/can-deactivate.guard';
import { SubscriptionService } from '../../../shared/services/subscription.service';
import  * as moment  from 'moment'
import { CardDetailsComponent } from 'app/shared/components/card-details-modal/card-details-modal.component';

@Component({
  selector: 'app-customer-account-setting',
  templateUrl: './customer-account-setting.component.html',
  styleUrls: ['./customer-account-setting.component.scss'],
  animations: egretAnimations,
  providers: [SubscriptionService]
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
  isUpdating = false;
  uploadedFile: File
  profilePicture: any = "assets/images/arkenea/default.jpg"
  pdisplay: boolean = false
  pcropperDisplay: boolean = false
  profileImage = null

  /**
   * Subscription variable declaration
   */
  planName: string = 'free'
  autoRenewalStatus: string = 'off'
  subscriptionExpireDate: string = ''
  defaultSpace:number = 0
  spaceDimension:string = 'GB'
  usedSpaceDimension:string = 'MB'
  addOnSpace:number = 0
  addOnSpaceDisplay:number = 0
  addOnAmountFor:string = ''
  addOnAmount:number = 0
  totalSpaceAlloted: number = 1
  spaceProgressBar:any = 100
  totalUsedSpace:any = 0

  isAccountFree: boolean = true
  isSubscribePlan: boolean = false
  isSubscribedBefore: boolean = false
  autoRenewalFlag: boolean = false
  autoRenewalVal:boolean = false
  isPremiumExpired: boolean = false
  isSubscriptionCanceled:boolean = false
  userCreateOn: any
  userSubscriptionDate: any
  today: Date = moment().toDate()
  isProUser:boolean = false
  getAddOn:boolean = false
  modified = false // display confirmation popup if user click on other link
  isGetAddOn:boolean = false

  constructor(private router: Router, private route: ActivatedRoute, private fb: FormBuilder,
    private snack: MatSnackBar, public dialog: MatDialog, private userapi: UserAPIService,
    private loader: AppLoaderService, private picService: ProfilePicService, private confirmService: AppConfirmService,
    private subscriptionservice:SubscriptionService ) {
  }

  ngOnInit() {
  //   if(typeof this.userId !== "undefined") {
  //     this.router.navigate(['/', 'auth','signin']);
  // }
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

    this.ProfileForm.valueChanges.subscribe(val => {
      this.modified = true
    })

    this.AddressForm = new FormGroup({
      addressLine1: new FormControl('', Validators.required),
      addressLine2: new FormControl(''),
      city: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      zipcode: new FormControl('', [Validators.required, , Validators.pattern(/^\d{5}(?:[-\s]\d{4})?$/)])
    });

    this.AddressForm.valueChanges.subscribe(val => {
      this.modified = true
    })

    this.profile = [];
    this.getProfile();

    /**
     * Check the user subscription details
     */
    this.checkSubscription()
  }

  checkSubscription() {
    this.subscriptionservice.checkSubscription( ( returnArr )=> {
      this.userCreateOn = returnArr.userCreateOn
      this.isSubscribedBefore = returnArr.isSubscribedBefore
      this.isSubscriptionCanceled = returnArr.isSubscriptionCanceled
      this.autoRenewalFlag = returnArr.autoRenewalFlag
      this.autoRenewalVal = returnArr.autoRenewalVal
      this.autoRenewalStatus = returnArr.autoRenewalStatus
      this.isAccountFree = returnArr.isAccountFree
      this.isPremiumExpired = returnArr.isPremiumExpired
      this.isSubscribePlan = returnArr.isSubscribePlan
      this.planName = returnArr.planName
      this.subscriptionExpireDate = returnArr.subscriptionExpireDate
      this.defaultSpace = returnArr.defaultSpace
      this.addOnSpace = returnArr.addOnSpace
      console.log("isAccountFree",this.isAccountFree,"isSubscribePlan",this.isSubscribePlan,"isPremiumExpired",this.isPremiumExpired)
      
      let devideAmount = 1048576
      if( ( Number(returnArr.totalUsedSpace) >= 1073741824 ) ) { //If used space is greater or equal to 1 GB
        this.usedSpaceDimension = 'GB'
        devideAmount = 1073741824
      }
      else {//If used space is less than 1 GB
        this.usedSpaceDimension = 'MB'
        devideAmount = 1048576
      }
      this.totalUsedSpace = ( Number(returnArr.totalUsedSpace) / devideAmount ).toFixed(2)
      this.totalSpaceAlloted = ( this.defaultSpace + this.addOnSpace )

      if( this.isAccountFree && !this.isPremiumExpired ) {
        this.spaceProgressBar = (this.totalUsedSpace * 100 / this.totalSpaceAlloted).toFixed(2)
        if( this.usedSpaceDimension == 'MB' ) {
          this.spaceProgressBar = (this.totalUsedSpace * 100 / (this.totalSpaceAlloted*1024) ).toFixed(2)
        }
      }

      this.subscriptionservice.getPlanDetails( ( planData )=> {
        if( planData && (Object.keys(planData).length !== 0) ) {
          //this.defaultSpace = planData.metadata.defaultSpace
          this.addOnSpaceDisplay = planData.metadata.addOnSpace
          this.spaceDimension = planData.metadata.spaceDimension        
          let subscriptionDate = moment( localStorage.getItem("endUserSubscriptionEndDate") )
          let diff = Math.round(this.subscriptionservice.getDateDiff( this.today, subscriptionDate.toDate() ))
          let addOnCharges = Number (planData.metadata.addOnCharges)
          let addOnAmount = diff > 364 ? addOnCharges : ( (addOnCharges/365)*diff ).toFixed(2)
          let finalAddOnAmount = Number(addOnAmount)
          this.addOnAmount = finalAddOnAmount < 0.5 ? 0.5 : finalAddOnAmount
          this.addOnAmountFor = diff > 364 ? 'per year' : 'for '+(diff)+' days'

          this.isGetAddOn = localStorage.getItem('endUserSubscriptionAddon') && localStorage.getItem('endUserSubscriptionAddon') == 'yes' ? true : false
          
          let allotedSpace:any = 1
          if( this.isAccountFree && !this.isPremiumExpired ) {
            allotedSpace = returnArr.defaultSpace
          }
          else if( this.isSubscribePlan && !this.isPremiumExpired ) {
            allotedSpace = returnArr.defaultSpace
            if( this.isGetAddOn ) {
              allotedSpace = this.defaultSpace + this.addOnSpace
            }
          }
          this.totalSpaceAlloted = allotedSpace
          this.spaceProgressBar = (this.totalUsedSpace * 100 / this.totalSpaceAlloted).toFixed(2)
          if( this.usedSpaceDimension == 'MB' ) {
            this.spaceProgressBar = (this.totalUsedSpace * 100 / (this.totalSpaceAlloted*1024) ).toFixed(2)
          }
        }
        else{
          if( this.isAccountFree && !this.isPremiumExpired ) {
            this.totalSpaceAlloted = this.defaultSpace
            this.spaceProgressBar = (this.totalUsedSpace * 100 / this.totalSpaceAlloted).toFixed(2)
            if( this.usedSpaceDimension == 'MB' ) {
              this.spaceProgressBar = (this.totalUsedSpace * 100 / (this.totalSpaceAlloted*1024) ).toFixed(2)
            }
          }
        }
        console.log("totalUsedSpace",this.totalUsedSpace,"totalSpaceAlloted",this.totalSpaceAlloted,"spaceProgressBar",this.spaceProgressBar)
      })
    })
    this.spaceProgressBar = (this.totalUsedSpace * 100 / this.totalSpaceAlloted).toFixed(2)
    this.isProUser = localStorage.getItem('endUserProSubscription') && localStorage.getItem('endUserProSubscription') == 'yes' ? true : false
  }

  canDeactivate(): any {
    //return !this.ProfileForm.dirty;
    return !this.modified;
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
        this.modified = false;
        this.loader.close();
      }
    }, (err) => {
      console.error(err);
      this.loader.close();
    })
  }


  ProfileSubmit() {
    this.modified = false;
    this.isUpdating = true;  
    if(this.ProfileForm.dirty){        }
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
    this.modified = false;
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

  firstCapitalize(e) {
    let re = /(^|[.!?]\s+)([a-z])/g;
    var textBox: HTMLInputElement = <HTMLInputElement>e.target;
    textBox.value = textBox.value.replace(re, (m, $1, $2) => $1 + $2.toUpperCase());
  }
    
  checkSpecialChar(event)
  {  
    var key;  
    key = event.charCode;
    return((key > 64 && key < 91) || (key> 96 && key < 123) || key == 8 || key == 32 || (key >= 48 && key <= 57)); 
  }

  autoRenewal() {
    if( this.autoRenewalVal ) {
      this.autoRenewalStatus = 'off'
      this.autoRenewalVal = false
    }
    else{
      this.autoRenewalStatus = 'on'
      this.autoRenewalVal = true
    }
    
    this.subscriptionservice.updateAutoRenewalStatus( this.userId, this.autoRenewalVal )
  }

  cancelSubscription= (query = {}) => {
    this.subscriptionservice.cancelSubscription( this.userId, this.isSubscriptionCanceled, (value)=> {
      this.isSubscriptionCanceled= value;
      this.checkSubscription()
    })
    // this.checkSubscription()
  }

  getAddOnPack() {
    if( this.getAddOn ) {
      this.getAddOn = false
    }
    else{
      this.getAddOn = true
    }
  }

  openCardDetailsModal() {
    let dialogRef: MatDialogRef<any> = this.dialog.open(CardDetailsComponent, {
      width: '500px',
      disableClose: true,
      data: {
        for: 'addon',
      }
    })
    dialogRef.afterClosed()
      .subscribe(res => {
        this.isGetAddOn = localStorage.getItem('endUserSubscriptionAddon') && localStorage.getItem('endUserSubscriptionAddon') == 'yes' ? true : false
        let allotedSpace = Number(this.addOnSpace) + Number(this.defaultSpace)
        this.totalSpaceAlloted = allotedSpace
        this.spaceProgressBar = (this.totalUsedSpace * 100 / this.totalSpaceAlloted).toFixed(2)
      })
  }
  
}