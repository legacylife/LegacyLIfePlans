import { Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar, MatButton, MatSnackBar } from '@angular/material';
import { Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { APIService } from './../../../api.service';
import { UserAPIService } from './../../../userapi.service';
import { Router, ActivatedRoute } from '@angular/router';
import { RoutePartsService } from "../../../shared/services/route-parts.service";
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { states } from '../../../state';

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
  profilePicture: any = "assets/images/arkenea/uri.jpg"

  constructor(private router: Router, private activeRoute: ActivatedRoute, private userapi: UserAPIService, private fb: FormBuilder, private snack: MatSnackBar, private loader: AppLoaderService) { }
  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.username = localStorage.getItem("endUsername");
    this.userType = localStorage.getItem("endUserType");

    if(this.userId){
      this.stateList = states;

      this.llpCustsignupProfileForm = new FormGroup({
        firstName: new FormControl('', Validators.required),
        lastName: new FormControl('', Validators.required),
        businessPhoneNumber: new FormControl('', Validators.required),
        dateOfBirth: new FormControl('', Validators.required),
        city: new FormControl('', Validators.required),
        state: new FormControl('', Validators.required),
        zipcode: new FormControl('', Validators.required)
      });

    } else {
      this.router.navigate(['/', 'customer', 'signup']);
    }
  }

  skipSignup() {
    this.router.navigate(['/', 'customer', 'dashboard']);
  }

  llpCustSignup() {
    this.loader.open();
    let img = document.getElementById('profilePicture') as HTMLInputElement
    console.log(this.llpCustsignupProfileForm.value)
    let profileInData = this.llpCustsignupProfileForm.value

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
        this.snack.open('Your profile information has been updated successfully.', 'OK', { duration: 4000 })
        this.router.navigate(['/', 'customer', 'dashboard']);
      } else {
        this.loader.close();
        console.log(result.data);
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

}

