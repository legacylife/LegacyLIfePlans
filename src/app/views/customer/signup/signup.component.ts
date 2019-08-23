import { Component, OnInit, ViewChild, Pipe, PipeTransform } from '@angular/core';
import { MatProgressBar, MatButton, MatSnackBar } from '@angular/material';
import { UserAPIService } from './../../../userapi.service';
import { Router, ActivatedRoute } from '@angular/router';
import { RoutePartsService } from "../../../shared/services/route-parts.service";
import { Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { Observable, of } from 'rxjs';
import { ProfilePicService } from 'app/shared/services/profile-pic.service';
import { serverUrl, s3Details } from '../../../config';
import 'rxjs/add/observable/timer'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/take'

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})

export class CustomerSignupComponent implements OnInit {
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @ViewChild(MatButton) submitButton: MatButton;
  transform(value: number): string {
    const minutes: number = Math.floor(value / 60);
    return ('00' + minutes).slice(-2) + ':' + ('00' + Math.floor(value - minutes * 60)).slice(-2);
  }
  llpCustsignupForm: FormGroup;
  llpCustotpForm: FormGroup;
  custFreeTrailBtn = false;
  custProceedBtn = true;
  custOtpSec = false;
  invalidMessage: string;
  invalidOtpMessage: string;
  EmailExist: boolean;
  invalidOTP: boolean;
  profilePicture: any = "assets/images/arkenea/default.jpg"
  //passwordRegex: any = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!#%*?&])[A-Za-z\d$@$!#%*?&]{6,16}/
  passwordRegex: any = /^.{6,}$/
  countDown;
  counter = 0;
  tick = 0;
  inviteCode:string = ''

  customerFreeAccessDays:Number = 0
  customerFreeTrialStatus:Boolean = false

  constructor(private router: Router,private picService : ProfilePicService, private activeRoute: ActivatedRoute, private userapi: UserAPIService, private fb: FormBuilder, private snack: MatSnackBar, private loader: AppLoaderService) {
    this.activeRoute.params.subscribe(params => {
      this.inviteCode = params['inviteCode'] ? params['inviteCode'] : '';
    });
   }
  ngOnInit() {
    this.llpCustsignupForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i)]),
      password: new FormControl('', [Validators.required, Validators.pattern(this.passwordRegex)])
    });

    this.llpCustotpForm = new FormGroup({
      otp: new FormControl('', Validators.required)// CustomValidators.number({min: 6, max: 6})
    });
    
    this.getFreeTrialSettings()
  }

  async getFreeTrialSettings(){
    let returnArr = await this.userapi.apiRequest('get', 'freetrialsettings/getdetails', {}).toPromise(),
        freeTrialPeriodSettings = returnArr.data
    this.customerFreeAccessDays  = Number(freeTrialPeriodSettings.customerFreeAccessDays)
    this.customerFreeTrialStatus  = freeTrialPeriodSettings.customerStatus == 'On'? true : false
  }

  custProceed() {
    let req_vars = {
      username: this.llpCustsignupForm.controls['username'].value,
      password: this.llpCustsignupForm.controls['password'].value,
      userType: 'customer',
      inviteCode: this.inviteCode
    }
    this.loader.open();
    this.userapi.apiRequest('post', 'auth/checkEmail', req_vars).subscribe(result => {
      if (result.status == "success") {
        this.loader.close();
        if (result.data.code == "Exist") {
          this.llpCustsignupForm.controls['username'].enable();
          this.invalidMessage = result.data.message;
          this.EmailExist = true;
          this.llpCustsignupForm.controls['username'].setErrors({ 'EmailExist': true })
          this.snack.open(result.data.message, 'OK', { duration: 4000 })
        }else if (result.data.code == "InviteReject") {
          this.llpCustsignupForm.controls['username'].enable();
          //this.invalidMessage = result.data.message;
          this.snack.open(result.data.message, 'OK', { duration: 10000 })
          this.EmailExist = true;
          this.llpCustsignupForm.controls['username'].setErrors({ 'EmailExist': true })          
        } else {
          this.llpCustsignupForm.controls['username'].disable();
          this.llpCustsignupForm.controls['password'].disable();
          this.custFreeTrailBtn = true;
          this.custProceedBtn = false;
          this.custOtpSec = true;
          this.llpCustsignupForm.controls['username'].setErrors({ 'EmailExist': false })
          this.EmailExist = false;
          this.snack.open(result.data.message, 'OK', { duration: 4000 })
          this.clockCall();
        }
      } else {
        this.loader.close();
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }
    }, (err) => {
      this.loader.close();
      console.error(err)
    })
  }

  OtpProceed() {
    let invitedBy = ''
    if( this.inviteCode != '') {
      invitedBy = 'customer'
    }
    let req_vars = {
      username: this.llpCustsignupForm.controls['username'].value,
      otpCode: this.llpCustotpForm.controls['otp'].value,
      invitedBy: invitedBy
    }
    this.loader.open();
    this.userapi.apiRequest('post', 'auth/checkOtp', { query: req_vars }).subscribe(result => {
      if (result.status == "success") {
        this.loader.close();
        if (result.data.code == "success") {
          this.llpCustsignupForm.controls['username'].setErrors({ 'EmailExist': false })
          localStorage.setItem("endUsername", result.data.username)
          localStorage.setItem("endUserId", result.data.userId)
          localStorage.setItem("endUserType", result.data.userType)
          localStorage.setItem("endUserCreatedOn", result.data.createdOn);
          localStorage.setItem("endUserSubscriptionStartDate", result.data.subscriptionStartDate);
          localStorage.setItem("endUserSubscriptionEndDate", result.data.subscriptionEndDate);
          localStorage.setItem("endUserSubscriptionStatus", result.data.subscriptionStatus);
          localStorage.setItem("endUserAutoRenewalStatus", result.data.autoRenewalStatus);
          localStorage.setItem("endUserProSubscription", 'yes');
          localStorage.setItem("endUserSubscriptionAddon", result.data.addOnGiven);
          if (result.data.profilePicture) {
            this.profilePicture = s3Details.url + "/" + s3Details.profilePicturesPath + result.data.profilePicture;
            localStorage.setItem('endUserProfilePicture', this.profilePicture)
            this.picService.setProfilePic = this.profilePicture;
          }

          this.snack.open(result.data.message, 'OK', { duration: 8000 })
          this.router.navigate(['/', 'customer', 'update-profile']);
        } else {
          this.invalidOTP = true;
          this.llpCustotpForm.controls['otp'].setErrors({ 'invalidOTP': true })
          this.invalidOtpMessage = result.data.message;
          this.snack.open(result.data.message, 'OK', { duration: 10000 })
        }
      } else {
        this.loader.close();
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }
    }, (err) => {
      console.error(err);
      this.loader.close();
      this.snack.open(err.message, 'OK', { duration: 4000 })
    })

  }

  llpSignupFirst() {
    let req_vars = {
      username: this.llpCustsignupForm.controls['username'].value,
      password: this.llpCustsignupForm.controls['password'].value,
      userType: "customer"
    }
    console.log(req_vars);
    //this.successMessage = "Congratulations! You are signed up successfully."

  }

  ResendOtpProceed() {
    this.custProceed();
  }

  clockCall() {
    this.counter = 60;
    this.tick = 1000;
    this.countDown = Observable.timer(0, this.tick)
      .take(this.counter)
      .map(() => --this.counter);
  }
}
@Pipe({
  name: 'formatTime'
})
export class FormatTimePipe implements PipeTransform {
  transform(value: number): string {
    const minutes: number = Math.floor(value / 60);
    return ('00' + minutes).slice(-2) + ':' + ('00' + Math.floor(value - minutes * 60)).slice(-2);
  }

}