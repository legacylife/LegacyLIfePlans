import { Component, OnInit, ViewChild, Pipe, PipeTransform } from '@angular/core';
import { MatProgressBar, MatButton, MatSnackBar } from '@angular/material';
import { APIService } from './../../../api.service';
import { UserAPIService } from './../../../userapi.service';
import { Router, ActivatedRoute } from '@angular/router';
import { RoutePartsService } from "../../../shared/services/route-parts.service";
import { Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { Observable, of } from 'rxjs';
import 'rxjs/add/observable/timer'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/take'

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class AdvisorSignupComponent implements OnInit {
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @ViewChild(MatButton) submitButton: MatButton;
  transform(value: number): string {
    const minutes: number = Math.floor(value / 60);
    return ('00' + minutes).slice(-2) + ':' + ('00' + Math.floor(value - minutes * 60)).slice(-2);
  }
  llpAdvsignupForm: FormGroup;
  llpAdvotpForm: FormGroup;
  freeTrailBtn = false;
  proceedBtn = true;
  advisorOtp = false;
  invalidMessage: string;
  invalidOtpMessage: string;
  EmailExist: boolean;
  invalidOTP: boolean;
  countDown;
  counter = 0;
  tick = 0;
  inviteCode:string = ''

  advisorFreeAccessDays:Number = 0
  advisorFreeTrialStatus:Boolean = false

  constructor(private router: Router, private activeRoute: ActivatedRoute, private userapi: UserAPIService, private fb: FormBuilder, private snack: MatSnackBar, private loader: AppLoaderService) { 
    this.activeRoute.params.subscribe(params => {
      this.inviteCode = params['inviteCode'] ? params['inviteCode'] : '';
    });
    //console.log("inviteCode",this.inviteCode)
  }

  ngOnInit() {
    this.llpAdvsignupForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i)])
    });

    this.llpAdvotpForm = new FormGroup({
      otp: new FormControl('', Validators.required)
    });

    this.getFreeTrialSettings()
  }

  async getFreeTrialSettings(){
    let returnArr = await this.userapi.apiRequest('get', 'freetrialsettings/getdetails', {}).toPromise(),
        freeTrialPeriodSettings = returnArr.data
    this.advisorFreeAccessDays  = Number(freeTrialPeriodSettings.advisorFreeDays)
    this.advisorFreeTrialStatus  = freeTrialPeriodSettings.advisorStatus == 'On'? true : false
  }

  advProceed() {
    let req_vars = {
      username: this.llpAdvsignupForm.controls['username'].value,
      userType: 'advisor',
      inviteCode: this.inviteCode
    }
    this.loader.open();
    this.userapi.apiRequest('post', 'auth/checkEmail', req_vars).subscribe(result => {
      if (result.status == "success") {
        this.loader.close();
        if (result.data.code == "Exist") {
          this.llpAdvsignupForm.controls['username'].enable();
          this.invalidMessage = result.data.message;
          this.EmailExist = true;
          this.llpAdvsignupForm.controls['username'].setErrors({ 'EmailExist': true })
        } /*else if (result.data.code == "ExistAdvisor") {
          localStorage.setItem("endUsername", result.data.username)
          localStorage.setItem("endUserId", result.data.userId)
          localStorage.setItem("endUserType", result.data.userType)
          this.router.navigate(['/', 'advisor', 'business-info']);          
        }*/ else if (result.data.code == "ExistReject") {
          this.llpAdvsignupForm.controls['username'].enable();
          this.invalidMessage = result.data.message;
          this.EmailExist = true;
          this.llpAdvsignupForm.controls['username'].setErrors({ 'EmailExist': true })          
        }else if (result.data.code == "InviteReject") {
          this.llpAdvsignupForm.controls['username'].enable();
          //this.invalidMessage = result.data.message;
          this.snack.open(result.data.message, 'OK', { duration: 10000 })
          this.EmailExist = true;
          this.llpAdvsignupForm.controls['username'].setErrors({ 'EmailExist': true })          
        }else {
          this.llpAdvsignupForm.controls['username'].disable();
          this.freeTrailBtn = true;
          this.proceedBtn = false;
          this.advisorOtp = true;
          this.llpAdvsignupForm.controls['username'].setErrors({ 'EmailExist': false })
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
      invitedBy = 'advisor'
    }
    let req_vars = {
      username: this.llpAdvsignupForm.controls['username'].value,
      otpCode: this.llpAdvotpForm.controls['otp'].value,
      invitedBy: invitedBy
    }
    this.loader.open();
    this.userapi.apiRequest('post', 'auth/checkOtp', { query: req_vars }).subscribe(result => {
      if (result.status == "success") {
        this.loader.close();
        if (result.data.code == "success") {
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
          this.snack.open(result.data.message, 'OK', { duration: 4000 })
          this.router.navigate(['/', 'advisor', 'business-info']);
        } else {
          this.invalidOTP = true;
          this.llpAdvotpForm.controls['otp'].setErrors({ 'invalidOTP': true })
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

  ResendOtpProceed() {
    this.advProceed();
  }

  toproceed() {
    this.advisorOtp = true;
    this.freeTrailBtn = true;
    this.proceedBtn = false;
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