import { NgModule, Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { MatProgressBar, MatButton, MatSnackBar } from '@angular/material';
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
  public sectionAccessPk: any[];
  otpsec = false;
  llpsigninForm: FormGroup;
  constructor(private router: Router, private activeRoute: ActivatedRoute, private api: APIService, private fb: FormBuilder, private snack: MatSnackBar, private loader: AppLoaderService) { }

  ngOnInit() {
    localStorage.clear();
    sessionStorage.clear();

    this.llpsigninForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.pattern(/^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i)]),
      password: new FormControl('', Validators.required)
    })
  }

  loginClick() {
    this.otpsec = true;
  }

  llpsignin(userData = null) {
    let signInData = {
      username: this.llpsigninForm.controls['username'].value,
      password: this.llpsigninForm.controls['password'].value,
      //stayLoggedIn:  this.llpsigninForm.controls['rememberMe'].value,
      userType: "sysadmin"
    }
    this.loader.open();
    this.api.apiRequest('post', 'auth/signin', signInData).subscribe(result => {
      this.loader.close();
      if (result.status == "success") {
        userData = result.data;
        console.log("user data after signup",userData.sectionAccess.activitylog)
        localStorage.setItem("userId", userData.userId)
        localStorage.setItem("userType", userData.userType)
        localStorage.setItem("firstName", userData.firstName)
        localStorage.setItem("lastName", userData.lastName)
        localStorage.setItem("sectionAccess", JSON.stringify(userData.sectionAccess))
        
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
        this.router.navigate(['/', 'admin', 'userlist'])

      } else {
        this.llpsigninForm.controls['username'].enable();
        var emails = this.llpsigninForm.controls['username'].value

        this.llpsigninForm.controls['password'].markAsUntouched();
        this.llpsigninForm = new FormGroup({
          username: new FormControl('', Validators.required),
          password: new FormControl('', Validators.required)
        })
        this.llpsigninForm.controls['username'].setValue(emails);
      }
    }, (err) => {

    })
  }

  public customValidator(control: FormControl) {
    return { 'invalid': true };
  }

}
