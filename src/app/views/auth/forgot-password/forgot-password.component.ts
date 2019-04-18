import { Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar, MatButton } from '@angular/material';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { APIService } from './../../../api.service';
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  userEmail;

  public forgotForm: FormGroup;
  errorMessage: string = ""
  successMessage: string = ""

  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @ViewChild(MatButton) submitButton: MatButton;
  constructor(private api:APIService, private fb: FormBuilder, private router: Router) { }

  ngOnInit() {
    this.forgotForm = this.fb.group ( {
      email: [null , Validators.compose ( [ Validators.required, Validators.pattern(/^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i) ] )]
    } );
  }
  submitEmail() {
    //this.submitButton.disabled = true;
    //this.progressBar.mode = 'indeterminate';
    console.log(this.forgotForm.controls['email'].value)
    let req_vars = { username:  this.forgotForm.controls['email'].value, userType: "AdminWeb" }

    
    
    this.api.apiRequest('post', 'auth/forgotPassword', req_vars).subscribe(result => {
      if(result.status == "success"){
        this.successMessage = result.data;
        this.hideAlerts();
        setTimeout(() => {
          this.router.navigate ( [ 'authentication', 'signin' ] );
        }, 5000);
      } else {
        this.errorMessage = result.data.message || result.data;
        this.hideAlerts();
      }
    }, (err) => {
      console.error(err)
    })
  }

  //function to hide alerts
  hideAlerts = () => {
    setTimeout(()=> {
      this.successMessage = ""
      this.errorMessage = ""
    }, 3000)
  }
}
