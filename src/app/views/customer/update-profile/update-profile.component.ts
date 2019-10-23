import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatProgressBar, MatButton, MatSnackBar } from '@angular/material';
import { Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { APIService } from './../../../api.service';
import { UserAPIService } from './../../../userapi.service';
import { Router, ActivatedRoute } from '@angular/router';
import { RoutePartsService } from "../../../shared/services/route-parts.service";
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { states } from '../../../state';
import { ChangePicComponent } from './../../change-pic/change-pic.component';
import { serverUrl, s3Details } from '../../../config'
import { ProfilePicService } from 'app/shared/services/profile-pic.service';

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.scss']
})
export class UpdateProfileComponent implements OnInit {

  userId: string;
  userType: string;
  username:string;
  date: any;
  chosenYearHandler: any;
  llpCustsignupProfileForm: FormGroup;
  stateList: any;
  state_name: string;
  short_code: string;
  uploadedFile: File
  maxDate = new Date(new Date())
  profilePicture: any = "assets/images/arkenea/default.jpg"

  customerFreeAccessDays:Number = 0
  customerFreeTrialStatus:Boolean = false

  constructor(private router: Router, private activeRoute: ActivatedRoute, private userapi: UserAPIService, private fb: FormBuilder, private snack: MatSnackBar, private loader: AppLoaderService, public dialog: MatDialog,private picService: ProfilePicService) { }
  ngOnInit() {
    this.picService.itemValue.subscribe((nextValue) => {
      this.profilePicture =  nextValue
    })
    this.userId = localStorage.getItem("endUserId");
    this.username = localStorage.getItem("endUsername");
    this.userType = localStorage.getItem("endUserType");
    this.stateList = states;
    this.llpCustsignupProfileForm = new FormGroup({
      firstName: new FormControl('', Validators.compose([ Validators.required, this.noWhitespaceValidator, Validators.minLength(1), Validators.maxLength(50)])),
      lastName: new FormControl('', Validators.compose([ Validators.required, this.noWhitespaceValidator, Validators.minLength(1), Validators.maxLength(50)])),
      phoneNumber: new FormControl('', [Validators.required, Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]),
      dateOfBirth: new FormControl('', Validators.required),
      city: new FormControl('', Validators.compose([ Validators.required, this.noWhitespaceValidator, Validators.minLength(1), Validators.maxLength(50)])),
      state: new FormControl('', Validators.required),
      zipcode: new FormControl('', [Validators.required, , Validators.pattern(/^\d{5}(?:[-\s]\d{4})?$/)]),
    });

    if(this.userId){
      const req_vars = { userId: this.userId }
      this.userapi.apiRequest('post', 'auth/view', req_vars).subscribe(result => {  
        if (result.data && result.data.profilePicture) {
          this.profilePicture = s3Details.url + "/" + s3Details.profilePicturesPath + result.data.profilePicture;
          localStorage.setItem('endUserProfilePicture', this.profilePicture)
          this.picService.setProfilePic = this.profilePicture;
        }
        if(result.data.profileSetup &&  result.data.profileSetup == "yes"){          
          this.router.navigate(['/', 'customer', 'account-setting']);
        } 
      }, (err) => {
        console.error(err)
      })
    } else {
      this.router.navigate(['/', 'customer', 'signup']);
    }
    this.getFreeTrialSettings()
  }

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  async getFreeTrialSettings(){
    let returnArr = await this.userapi.apiRequest('get', 'freetrialsettings/getdetails', {}).toPromise(),
        freeTrialPeriodSettings = returnArr.data
    this.customerFreeAccessDays  = Number(freeTrialPeriodSettings.customerFreeAccessDays)
    this.customerFreeTrialStatus  = freeTrialPeriodSettings.customerStatus == 'On'? true : false
  }

  skipSignup() {
    this.router.navigate(['/', 'customer', 'dashboard']);
  }

  llpCustSignup() {
    this.loader.open();
    let img = document.getElementById('profilePicture') as HTMLInputElement
    console.log(this.llpCustsignupProfileForm.value)
    let profileInData = this.llpCustsignupProfileForm.value
    profileInData.profileSetup = 'yes';

    var query = {};
    var proquery = {};
    let req_vars = {
      query: Object.assign({ _id: this.userId, userType: this.userType }),
      proquery: Object.assign(profileInData)
    }
    
    this.userapi.apiRequest('post', 'userlist/updateprofile', req_vars).subscribe(result => {
      if (img.files && img.files.length > 0) {
        this.saveProfilePicture()
      }
      if (result.status == "success") {
        this.loader.close();

        let profileData = result.data.userProfile;  
        localStorage.setItem("endUserFirstName", profileData.firstName)
        localStorage.setItem("endUserLastName", profileData.lastName)
        
        if (profileData.profilePicture) {
          this.profilePicture = s3Details.url + "/" + s3Details.profilePicturesPath + profileData.profilePicture;
          localStorage.setItem('endUserProfilePicture', this.profilePicture)
          this.picService.setProfilePic = this.profilePicture;
        }
        else {
          this.picService.setProfilePic = this.profilePicture;
        }

        this.snack.open('Your profile information has been updated successfully.', 'OK', { duration: 4000 })
        setTimeout(() => {
          this.router.navigate(['/', 'customer', 'dashboard']);
        }, 2000);  
      } else {
        this.loader.close();
        this.snack.open(result.data, 'OK', { duration: 4000 })
      }
    }, (err) => {
      console.error(err)
    })
  }

  saveProfilePicture() {
    const fd = new FormData()    
    fd.append('userId', this.userId)
    fd.append('profilePicture', this.uploadedFile, this.uploadedFile.name);
    this.userapi.apiRequest('post', 'auth/updateProfilePic', fd).subscribe((result: any) => {
      if (result.status == "success") {
        this.loader.close();
        let userHeaderDetails = sessionStorage.getItem("enduserHeaderDetails")
        let userDetails = JSON.parse(userHeaderDetails)
        userDetails.profilePicture = result.data.profilePicture
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
    //console.log(this.uploadedFile)
    if (this.uploadedFile.size > 5242880) {
      this.snack.open("Profile picture must be less than 5 MB.", 'OK', { duration: 4000 })      
    } else if (validExt.indexOf(ext) > -1) {
      let reader = new FileReader()
      reader.onloadend = () => {
        if (reader.result) {
          this.profilePicture = reader.result;
        }

      }
      reader.readAsDataURL(this.uploadedFile)
    } else {
      this.snack.open("Please select valid image. Valid extentions are jpg, jpeg, png, gif.", 'OK', { duration: 4000 })      
    }
  }

  changePicModal(): void {
    const dialogRef = this.dialog.open(ChangePicComponent, {
      width: '555px',
    });
    dialogRef.afterClosed().subscribe(result => { });
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

}

