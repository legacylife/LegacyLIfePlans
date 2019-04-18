import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatProgressBar, MatButton } from '@angular/material';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { APIService } from './../../../api.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @ViewChild(MatButton) submitButton: MatButton;
  @ViewChild("usernameField") usernameField: ElementRef;
  @ViewChild("passwordField") passwordField: ElementRef;
  public signinForm: FormGroup;

  errMessage: string = ""
  emailEntered: Boolean = false

  constructor(private api:APIService, private fb: FormBuilder, private router: Router, private titleService: Title) { }

  ngOnInit() {

    this.titleService.setTitle('Login With Your Email | Benchpoint');
    const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId")

    localStorage.clear()
    sessionStorage.clear()
    this.signinForm = this.fb.group ( {
        username: [null , Validators.compose([Validators.required, Validators.pattern(/^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i)])] ,
        password: [null , Validators.compose([Validators.required])],
        rememberMe: [true , Validators.compose ([])]
    });
  }

  signin(userData = null) {
    /*const signinData = this.signinForm.value
    console.log(signinData);

    this.submitButton.disabled = true;*/
    this.progressBar.mode = 'indeterminate';


    let req_vars = {
      username:  this.signinForm.controls['username'].value,
      password: this.signinForm.controls['password'].value,
      stayLoggedIn:  this.signinForm.controls['rememberMe'].value,
      userType: "AdminWeb"
    }

    this.api.apiRequest('post', 'auth/signin', req_vars).subscribe(result => {
      if(result.status == "success"){
        if(result.data.code == "NewUser") {
          localStorage.setItem("username", userData.email)
          localStorage.setItem("fullName", userData.name)
          this.router.navigate(['/', 'authentication', 'signup'])
        } else {
          location.href = '/';
        }
      } else {
        this.errMessage = result.data.message || result.data;
        this.signinForm.controls['username'].enable();
        this.signinForm.controls['password'].setValue('');
        this.signinForm.controls['password'].markAsUntouched();
      }
    }, (err) => {
      console.error(err)
    })


  }

}
