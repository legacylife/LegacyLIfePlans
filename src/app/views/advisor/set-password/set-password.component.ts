import { Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar, MatButton, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { CustomValidators } from 'ng2-validation';
import { APIService } from './../../../api.service';
import { UserAPIService } from './../../../userapi.service';
import { SubscriptionService } from 'app/shared/services/subscription.service';
import { s3Details } from 'app/config';
import { ProfilePicService } from 'app/shared/services/profile-pic.service';

const passwordRegex: any = /^.{6,}$/
const password = new FormControl('', [Validators.required, Validators.pattern(passwordRegex)]);
const confirmPassword = new FormControl('', CustomValidators.equalTo(password));

@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.scss']
})
export class SetPasswordComponent implements OnInit {
  public resetForm: FormGroup;
  userId: string = ""
  username: string = ""
  profilePicture: any = "assets/images/arkenea/default.jpg"
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @ViewChild(MatButton) submitButton: MatButton;
  constructor(private userapi: UserAPIService, private fb: FormBuilder, private router: Router, private activatedRoute: ActivatedRoute, 
    private snack: MatSnackBar, private confirmService: AppConfirmService, private loader: AppLoaderService, 
    private subscriptionservice:SubscriptionService,private picService : ProfilePicService) { }

  ngOnInit() {
    this.resetForm = this.fb.group({
      password: password,
      confirmPassword: confirmPassword
    });
    this.activatedRoute.params.subscribe((params: Params) => {
      this.userId = params.id
    })

    this.checkToken();
  }

  onSubmit() {
    this.loader.open();
    const req_vars = { password: this.resetForm.controls['password'].value, token: this.userId, userType: "advisor" }
    this.userapi.apiRequest('post', 'auth/resetPassword', req_vars).subscribe(passResult => {
      this.loader.close();
      let signInData = {
        username: passResult.data.username,
        password: this.resetForm.controls['password'].value,
        userType: {$ne : "sysadmin"}
      }
      this.userapi.apiRequest('post', 'auth/signin', signInData).subscribe(result => {
        if (result.status=="success") {
          let userData = result.data;
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
  
          this.subscriptionservice.checkSubscription( ( returnArr )=> {})  
          if (userData.profilePicture) {
            this.profilePicture = s3Details.url + "/" + s3Details.profilePicturesPath + userData.profilePicture;
            localStorage.setItem('endUserProfilePicture', this.profilePicture)
            this.picService.setProfilePic = this.profilePicture;
          }
          this.snack.open(passResult.data.msg, 'OK', { duration: 4000 })
          this.router.navigate(['/subscription']);
        }
      })

    }, (err) => {
      this.snack.open(err, 'OK', { duration: 4000 })
    })
  }

  //function to get events
  checkToken() {
    let req_vars = {
      userId: this.userId,
      userType: "advisor"
    }
    this.userapi.apiRequest('post', 'auth/reset-password-token', req_vars).subscribe(result => {
      if (result.status == "error") {
        this.router.navigate(['llp-admin', 'error']);
        this.snack.open(result.data, 'OK', { duration: 6000 })
      } else {
        this.username = result.data.username
      }
    })
  }
}
