import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { MatProgressBar, MatButton } from '@angular/material';
import { RoutePartsService } from "../../../shared/services/route-parts.service";
import { Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
//import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class signinComponent implements OnInit {
  @ViewChild(MatButton) submitButton: MatButton;

  otpsec = false;
  llpsigninForm: FormGroup; 
  //const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId")

  //localStorage.clear();
  //sessionStorage.clear();

  successMessage: string = ""
  errMessage: string = ""
  constructor( private router: Router,private activeRoute: ActivatedRoute,private api: APIService,private fb: FormBuilder, private loader: AppLoaderService) { }

  ngOnInit() {
	  this.llpsigninForm = new FormGroup({
		  username: new FormControl('', Validators.required),
		  password: new FormControl('', Validators.required)
		})
  }

  loginClick() {
    this.otpsec = true;
  }
  
  llpsignin (userData = null) {
    let signInData = {
      username:  this.llpsigninForm.controls['username'].value,
      password: this.llpsigninForm.controls['password'].value,
      //stayLoggedIn:  this.llpsigninForm.controls['rememberMe'].value,
      userType: "AdminWeb"
    }

    this.api.apiRequest('post', 'auth/signin', signInData).subscribe(result => {
      
      if(result.status == "success"){
        userData = result.data;
		//console.log(userData.userId);
          localStorage.setItem("userId", userData.userId)
          localStorage.setItem("userType", userData.userType)
		  //window.location.href = "http://localhost:4200/admin/userlist";
          this.router.navigate(['/', 'admin', 'userlist'])

      } else {
        this.errMessage = result.data.message || result.data;
        this.llpsigninForm.controls['username'].enable();
        this.llpsigninForm.controls['password'].setValue('');
        this.llpsigninForm.controls['password'].markAsUntouched();
      }
    }, (err) => {
      console.error("------error----"+err)
    })
    // this.submitButton.disabled = true;
  }

}
