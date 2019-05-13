import { Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar, MatButton, MatSnackBar } from '@angular/material';
import { APIService } from './../../../api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { RoutePartsService } from "../../../shared/services/route-parts.service";
import { Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class CustomerSignupComponent implements OnInit {
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @ViewChild(MatButton) submitButton: MatButton;

  llpCustsignupForm: FormGroup;
  llpCustotpForm: FormGroup;
  custFreeTrailBtn = false;
  custProceedBtn = true;
  custOtpSec = false;
  ResendBtn = false;
  invalidMessage: string;
  invalidOtpMessage:string;
  EmailExist: boolean;
  invalidOTP: boolean;
  passwordRegex: any = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!#%*?&])[A-Za-z\d$@$!#%*?&]{6,16}/

  constructor(private router: Router, private activeRoute: ActivatedRoute, private api: APIService, private fb: FormBuilder, private snack: MatSnackBar, private loader: AppLoaderService) {}
  ngOnInit() {
      this.llpCustsignupForm = new FormGroup({
        username: new FormControl('', [Validators.required, Validators.pattern(/^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i)]),
        password: new FormControl('', [Validators.required, Validators.pattern(this.passwordRegex) ])    
      });

      this.llpCustotpForm = new FormGroup({
        otp: new FormControl('', Validators.required)// CustomValidators.number({min: 6, max: 6})
      });      
  }

  custProceed() {
    let req_vars = {
      username:  this.llpCustsignupForm.controls['username'].value,
      password: this.llpCustsignupForm.controls['password'].value     
    }
   this.loader.open();   
    this.api.apiRequest('post', 'auth/checkEmail', req_vars).subscribe(result => {          
      if(result.status == "success"){        
        this.loader.close();
       /* this.llpCustotpForm = new FormGroup({
          otp: new FormControl('', Validators.required)// CustomValidators.number({min: 6, max: 6})
        });*/
        if(result.data.code == "Exist"){        
          this.llpCustsignupForm.controls['username'].enable();
          this.invalidMessage = result.data.message;
          this.EmailExist = true;
          this.llpCustsignupForm.controls['username'].setErrors({'EmailExist' : true})                 
        }else{          
          this.custFreeTrailBtn = true;
          this.custProceedBtn = false;
          this.custOtpSec = true;        
          this.llpCustsignupForm.controls['username'].setErrors({'EmailExist' : false})
          
          setTimeout(function () {
            this.ResendBtn = true; 
         }, 4000);
          this.snack.open(result.data.message, 'OK', { duration: 4000 })
        }
      } else {
        this.loader.close();
         this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }      
    }, (err) => {
      this.loader.close();
      console.error(err)
      //this.errorMessage = err.message      
    }) 
 }

  OtpProceed() {
    let req_vars = {username:  this.llpCustsignupForm.controls['username'].value,otpCode:  this.llpCustotpForm.controls['otp'].value,status:'Active'}
    this.loader.open();   
    this.api.apiRequest('post', 'auth/checkOtp', {query : req_vars}).subscribe(result => {      
      if(result.status == "success"){   
        this.loader.close();     
        if(result.data.code == "success"){        
          this.snack.open(result.data.message, 'OK', { duration: 4000 })          
          this.router.navigate(['/', 'customer', 'update-profile']);
        }else{          
          this.invalidOTP = true;
          this.llpCustotpForm.controls['otp'].setErrors({'invalidOTP' : true})                                     
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
        username:  this.llpCustsignupForm.controls['username'].value,
        password: this.llpCustsignupForm.controls['password'].value,
        userType: "customer" 
      }
      console.log(req_vars);
  /*
      this.api.apiRequest('post', 'auth/signup', req_vars).subscribe(result => {
        if(result.status == "success"){
          //this.successMessage = "Congratulations! You are signed up successfully."
          setTimeout(() => {
            this.router.navigate ( [ '/' ] )
          }, 3000)
        } else {
          //this.errorMessage = result.data.message || result.data;
          
        }

      }, (err) => {
        console.error(err)
        //this.errorMessage = err.message      
      })

    */
  }

  ResendOtpProceed() {  

  }




}
