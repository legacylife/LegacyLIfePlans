import { NgModule, Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { UserAPIService } from './../../../userapi.service';
import { MatProgressBar, MatButton, MatSnackBar } from '@angular/material';
import { RoutePartsService } from "../../../shared/services/route-parts.service";
import { Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { serverUrl, s3Details } from '../../../config';
import { ProfilePicService } from 'app/shared/services/profile-pic.service';
import { SubscriptionService } from 'app/shared/services/subscription.service';
//import { delay } from 'rxjs/operators';
console.log('signin');
@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  @ViewChild(MatButton) submitButton: MatButton;
  
  otpsec = false;
  llpCustsigninForm: FormGroup; 
  invalidEmail: boolean;
  invalidMessage: string;
  username: FormControl 
  password: FormControl;
  profilePicture: any = "assets/images/arkenea/default.jpg"

  constructor(private router: Router,private picService : ProfilePicService, private activeRoute: ActivatedRoute, private userapi: UserAPIService, private fb: FormBuilder, private snack: MatSnackBar, private loader: AppLoaderService, private subscriptionservice:SubscriptionService) { }

  ngOnInit() {
    this.llpCustsigninForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i)]),
      password: new FormControl('', Validators.required)
    })
  }

  loginClick() {
    this.otpsec = true;
  }

  llpCustSignin(userData = null) {
    let signInData = {
      username: this.llpCustsigninForm.controls['username'].value,
      password: this.llpCustsigninForm.controls['password'].value,
      //stayLoggedIn:  this.llpCustsigninForm.controls['rememberMe'].value,
      userType: {$ne : "sysadmin"}
      //userType: "advisor"
    }
    // const params = {
    //   query: Object.assign({ username: this.llpCustsigninForm.controls['username'].value,password:this.llpCustsigninForm.controls['password'].value,userType: { $ne: 'sysadmin'} })
    // };
    this.loader.open();
    this.userapi.apiRequest('post', 'auth/signin', signInData).subscribe(result => {
    
      if (result.status=="success") {      
        userData = result.data;
        localStorage.setItem("endUserId", userData.userId);
        localStorage.setItem("endUserType", userData.userType);
        localStorage.setItem("endUserFirstName", userData.firstName);
        localStorage.setItem("endUserLastName", userData.lastName); 
        localStorage.setItem("endUserProfilePicture", userData.profilePicture); 
        localStorage.setItem("endUserCreatedOn", userData.createdOn);
        localStorage.setItem("endUserSubscriptionStartDate", userData.subscriptionStartDate);
        localStorage.setItem("endUserSubscriptionEndDate", userData.subscriptionEndDate);
        localStorage.setItem("endUserSubscriptionStatus", userData.subscriptionStatus);
        localStorage.setItem("endUserAutoRenewalStatus", userData.autoRenewalStatus);
        localStorage.setItem("endUserProSubscription", 'no');
        localStorage.setItem("endUserSubscriptionAddon", userData.addOnGiven);
        localStorage.setItem("endisReferAndEarn", userData.isReferAndEarn);
        localStorage.setItem("setIdleFlag",'false');
        localStorage.setItem("endUserDeceased",'false');
        localStorage.setItem("endUserlockoutLegacyDate",'');
        if(userData.deceased && userData.deceased.status && userData.lockoutLegacyDate!=null){
          localStorage.setItem("endUserDeceased",'true');
          localStorage.setItem("endUserlockoutLegacyDate",userData.lockoutLegacyDate);
        }       

        if (userData.profilePicture) {
          this.profilePicture = s3Details.url + "/" + s3Details.profilePicturesPath + userData.profilePicture;
          localStorage.setItem('endUserProfilePicture', this.profilePicture)
          this.picService.setProfilePic = this.profilePicture;
        }
        let legacySetting = '';
        if(userData.legacySetting){
          legacySetting = userData.legacySetting;
        }

        this.subscriptionservice.checkSubscription( '',( returnArr )=> {}) // IMP for subscription
        //this.snack.open(result.data.message, 'OK', { duration: 4000 })
        if(userData.userType=='customer'){
          localStorage.setItem("endUserlegacySetting",legacySetting);
          this.router.navigate(['/', 'customer', 'dashboard']);
          setTimeout(() => {
            this.loader.close();
          }, 2000);  //5s
          
        }else{
          this.router.navigate(['/', 'advisor', 'dashboard'])
          setTimeout(() => {
            this.loader.close();
          }, 2000);  //5s          
        }  
      } else {
        this.loader.close();
       // this.llpCustsigninForm.controls['username'].enable();
        var emails = this.llpCustsigninForm.controls['username'].value
        if(result.data.invalidEmail){
          this.invalidEmail = true;
          this.invalidMessage = result.data.message
          this.llpCustsigninForm.controls['username'].setErrors({'invalidEmail' : true})
        //  this.llpCustsigninForm.controls['password'].setErrors({'invalid' : false});
          //this.llpCustsigninForm.controls['username'].markAsUntouched();
        //  this.llpCustsigninForm.controls['username'].markAsTouched();
        }else if(result.data.invalidPassword){
          //this.llpCustsigninForm.controls['username'].markAsTouched();
          this.llpCustsigninForm.controls['password'].setErrors({'invalid' : true});
          //this.llpCustsigninForm.controls['username'].setErrors({'invalidEmail' : false});
          this.llpCustsigninForm.controls['password'].setValue('');
          this.llpCustsigninForm.controls['password'].markAsUntouched();
          this.invalidEmail = false;
        }else{
          this.llpCustsigninForm.controls['username'].markAsUntouched();
          this.invalidEmail = false;
          this.llpCustsigninForm.controls['username'].setErrors({'invalidEmail' : false})
        }
      }      
    }, (err) => {
      this.loader.close();
    })
  }

}
