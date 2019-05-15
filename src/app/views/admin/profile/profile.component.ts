import { Component, OnInit } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { MatSnackBar } from '@angular/material';
import { Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { RoutePartsService } from "../../../shared/services/route-parts.service";
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { CustomValidators } from 'ng2-validation';

const passwordRegex: any = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!#%*?&])[A-Za-z\d$@$!#%*?&]{6,16}/
const password = new FormControl('', [Validators.required, Validators.pattern(passwordRegex)]);
const NewPassword = new FormControl('', [Validators.required, Validators.pattern(passwordRegex), Validators.minLength(6)]);
const confirmPassword = new FormControl('', CustomValidators.equalTo(NewPassword));

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  public uploader: FileUploader = new FileUploader({ url: 'upload_url' });
  public hasBaseDropZoneOver: boolean = false;

  userId: string
  userType: string = ""
  rows: any;
  llpProfileForm: FormGroup;
  llpPasswordForm: FormGroup;


  constructor(private router: Router, private activeRoute: ActivatedRoute, private api: APIService, private fb: FormBuilder, private snack: MatSnackBar, private loader: AppLoaderService) { }

  ngOnInit() {
    this.userId = localStorage.getItem("userId") || sessionStorage.getItem("userId")
    this.userType = localStorage.getItem("userType") || sessionStorage.getItem("userType")

    if (!this.api.isLoggedIn()) {
      this.router.navigate(['/', 'llp-admin', 'signin'])
    } else {
      this.llpProfileForm = new FormGroup({
        firstName: new FormControl('', Validators.required),
        lastName: new FormControl('', Validators.required),
        //phoneNumber: new FormControl('', Validators.required)		  
      })

      this.llpPasswordForm = this.fb.group({
        password: password,
        NewPassword: NewPassword,
        confirmPassword: confirmPassword
      });

      this.getProfile()
    }
  }

  //function to get all events
  getProfile = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ _id: this.userId, userType: "sysadmin" }, query)
    }
    //this.loader.open();
    this.api.apiRequest('post', 'userlist/getprofile', req_vars).subscribe(result => {
      //this.loader.close();
      if (result.status == "error") {
        this.rows = [];
        console.log(result.data)
      } else {
        this.rows = result.data.userProfile;
        this.llpProfileForm.controls['firstName'].setValue(this.rows.firstName);
        this.llpProfileForm.controls['lastName'].setValue(this.rows.lastName);
        //this.llpProfileForm.controls['phoneNumber'].setValue(this.rows.phoneNumber[0].prefix+' '+this.rows.phoneNumber[0].phonenumber);		
      }
    }, (err) => {
      console.error(err)
    })
  }

  llpprofile(userData = null) {
    let profileInData = {
      firstName: this.llpProfileForm.controls['firstName'].value,
      lastName: this.llpProfileForm.controls['lastName'].value
    }
    var query = {};
    var proquery = {};
    const req_vars = {
      query: Object.assign({ _id: this.userId, userType: "sysadmin" }),
      proquery: Object.assign(profileInData)
    }
    this.loader.open();
    this.api.apiRequest('post', 'userlist/updateprofile', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      } else {
        this.rows = result.data.userProfile;
        localStorage.setItem("firstName", this.rows.firstName)
        localStorage.setItem("lastName", this.rows.lastName)

        this.llpProfileForm.controls['firstName'].setValue(this.rows.firstName);
        this.llpProfileForm.controls['lastName'].setValue(this.rows.lastName);
        //this.llpProfileForm.controls['phoneNumber'].setValue(this.rows.phoneNumber[0].prefix+' '+this.rows.phoneNumber[0].phonenumber);				
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }
    }, (err) => {
      console.error(err)
    })

  }

  llppassword(userData = null) {
    let passwordData = {
      userId: this.userId,
      password: this.llpPasswordForm.controls['password'].value,
      newPassword: this.llpPasswordForm.controls['NewPassword'].value,
      confirmPassword: this.llpPasswordForm.controls['confirmPassword'].value,
      userType: "sysadmin"
    }
    this.loader.open();
    this.api.apiRequest('post', 'auth/changePassword', passwordData).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        this.llpPasswordForm.controls['password'].setErrors({ 'invalid': true });
      } else {
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }
    }, (err) => {
      console.error(err)
    })


  }
  public passwordsValidator(control: FormControl) {
    return { 'invalid': true };
  }
  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

}