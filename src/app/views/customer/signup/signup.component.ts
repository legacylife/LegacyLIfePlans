import { Component, OnInit, ViewChild, Pipe, PipeTransform } from '@angular/core';
import { MatProgressBar, MatButton, MatSnackBar } from '@angular/material';
import { APIService } from './../../../api.service';
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
  passwordRegex: any = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!#%*?&])[A-Za-z\d$@$!#%*?&]{6,16}/
  countDown;
  counter = 0;
  tick = 0;

  constructor(private router: Router, private activeRoute: ActivatedRoute, private api: APIService, private fb: FormBuilder, private snack: MatSnackBar, private loader: AppLoaderService) { }
  ngOnInit() {
    this.llpCustsignupForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.pattern(/^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i)]),
      password: new FormControl('', [Validators.required, Validators.pattern(this.passwordRegex)])
    });

    this.llpCustotpForm = new FormGroup({
      otp: new FormControl('', Validators.required)// CustomValidators.number({min: 6, max: 6})
    });


  }

  custProceed() {
    let req_vars = {
      username: this.llpCustsignupForm.controls['username'].value,
      password: this.llpCustsignupForm.controls['password'].value,
      userType: 'customer'
    }
    this.loader.open();
    this.api.apiRequest('post', 'auth/checkEmail', req_vars).subscribe(result => {
      if (result.status == "success") {
        this.loader.close();
        if (result.data.code == "Exist") {
          this.llpCustsignupForm.controls['username'].enable();
          this.invalidMessage = result.data.message;
          this.EmailExist = true;
          this.llpCustsignupForm.controls['username'].setErrors({ 'EmailExist': true })
        } else {
          this.llpCustsignupForm.controls['username'].disable();
          this.llpCustsignupForm.controls['password'].disable();
          this.custFreeTrailBtn = true;
          this.custProceedBtn = false;
          this.custOtpSec = true;
          this.llpCustsignupForm.controls['username'].setErrors({ 'EmailExist': false })
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
    let req_vars = {
      username: this.llpCustsignupForm.controls['username'].value,
      otpCode: this.llpCustotpForm.controls['otp'].value
    }
    this.loader.open();
    this.api.apiRequest('post', 'auth/checkOtp', { query: req_vars }).subscribe(result => {
      if (result.status == "success") {
        this.loader.close();
        if (result.data.code == "success") {
          localStorage.setItem("username", result.data.username);
          localStorage.setItem("userId", result.data.userId);
          localStorage.setItem("userType", result.data.userType);

          this.snack.open(result.data.message, 'OK', { duration: 4000 })
          this.router.navigate(['/', 'customer', 'update-profile']);
        } else {
          this.invalidOTP = true;
          this.llpCustotpForm.controls['otp'].setErrors({ 'invalidOTP': true })
          this.invalidOtpMessage = result.data.message;
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
    this.counter = 30;
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