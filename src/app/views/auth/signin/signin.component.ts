import { NgModule, Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { UserAPIService } from './../../../userapi.service';
import { MatProgressBar, MatButton, MatSnackBar } from '@angular/material';
import { RoutePartsService } from "../../../shared/services/route-parts.service";
import { Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
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

  constructor(private router: Router, private activeRoute: ActivatedRoute, private userapi: UserAPIService, private fb: FormBuilder, private snack: MatSnackBar, private loader: AppLoaderService) { }

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
      userType: ""
    }
    this.loader.open();
    this.userapi.apiRequest('post', 'auth/signin', signInData).subscribe(result => {
      this.loader.close();
      if (result.status == "success") {
        userData = result.data;
        localStorage.setItem("endUserId", userData.userId);
        localStorage.setItem("endUserType", userData.userType);
        localStorage.setItem("endUserFirstName", userData.firstName);
        localStorage.setItem("endUserLastName", userData.lastName);        
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
        if(userData.userType=='customer'){
          this.router.navigate(['/', 'customer', 'dashboard']);
        }else{
          this.router.navigate(['/', 'advisor', 'dashboard'])
        }  
      } else {
        this.llpCustsigninForm.controls['username'].enable();
        var emails = this.llpCustsigninForm.controls['username'].value
        if(result.data.invalidEmail){
          this.invalidEmail = true;
          this.invalidMessage = result.data.message
          this.llpCustsigninForm.controls['username'].setErrors({'invalidEmail' : true})
        }else{ 
          this.invalidEmail = false;
          this.llpCustsigninForm.controls['username'].setErrors({'invalidEmail' : false})} 
      }
      if(result.data.invalidPassword){
        this.invalidEmail = false;
        this.llpCustsigninForm.controls['password'].setErrors({'invalid' : true});
        this.llpCustsigninForm.controls['username'].setErrors({'invalidEmail' : false});
      }
    }, (err) => {

    })
  }

}
