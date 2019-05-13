import { Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar, MatButton,MatSnackBar } from '@angular/material';
import { Validators, FormGroup, FormControl,FormBuilder } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { APIService } from './../../../api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { RoutePartsService } from "../../../shared/services/route-parts.service";
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.scss']
})
export class UpdateProfileComponent implements OnInit {

  date: any
  chosenYearHandler: any
  llpCustsignupProfileForm: FormGroup;
  
  constructor(private router: Router, private activeRoute: ActivatedRoute, private api: APIService, private fb: FormBuilder, private snack: MatSnackBar, private loader: AppLoaderService) {}
  ngOnInit() {
    this.llpCustsignupProfileForm = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      businessPhoneNumber: new FormControl('', Validators.required),
      dateOfBirth: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      zipcode: new FormControl('', Validators.required)
    });    
  }

  skipSignup() {  
    this.router.navigate(['/', 'customer', 'dashboard']);
  }

  llpCustSignup() {  
    this.loader.open();
    let UserEmail = localStorage.getItem("UserEmail")
    let req_vars = { username:UserEmail,
                     firstName: this.llpCustsignupProfileForm.controls['firstName'].value,
                     lastName: this.llpCustsignupProfileForm.controls['lastName'].value,
                     businessPhoneNumber: this.llpCustsignupProfileForm.controls['businessPhoneNumber'].value,
                     dateOfBirth: this.llpCustsignupProfileForm.controls['dateOfBirth'].value,
                     state: this.llpCustsignupProfileForm.controls['state'].value,
                     city: this.llpCustsignupProfileForm.controls['city'].value,
                     zipcode: this.llpCustsignupProfileForm.controls['zipcode'].value,                     
                     userType: "customer" }
    console.log(req_vars.firstName,req_vars.lastName,req_vars.businessPhoneNumber,req_vars.dateOfBirth,req_vars.state,req_vars.city,req_vars.zipcode);

    this.api.apiRequest('post', 'auth/signup', req_vars).subscribe(result => {
		this.loader.close();
      if(result.status == "success"){
          this.snack.open('We have sent you reset instructions. Please check your email.', 'OK', { duration: 4000 })
          this.router.navigate(['/', 'customer', 'dashboard']);
      } else {
      
      }
    }, (err) => {
      console.error(err)
    })
  }

}

