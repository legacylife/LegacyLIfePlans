import { Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar, MatButton, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { APIService } from './../../../api.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  userEmail;

  public forgotForm: FormGroup;
  
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @ViewChild(MatButton) submitButton: MatButton;
  constructor(private api:APIService, private fb: FormBuilder, private router: Router,private snack: MatSnackBar, private confirmService: AppConfirmService, private loader: AppLoaderService) { }

  ngOnInit() {
    this.forgotForm = this.fb.group ( {
      email: [null , Validators.compose ( [ Validators.required, Validators.pattern(/^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i) ] )]
    } );
  }
  submitEmail() {
   this.loader.open();
    let req_vars = { username:  this.forgotForm.controls['email'].value, userType: "AdminWeb" }
    this.api.apiRequest('post', 'auth/forgotPassword', req_vars).subscribe(result => {
		this.loader.close();
      if(result.status == "success"){
          this.snack.open('We have sent you reset instructions. Please check your email.', 'OK', { duration: 4000 })
		  setTimeout(() => {
			  this.router.navigate ( [ 'llp-admin', 'forgot-password-success' ] );
		  }, 2000);
      } else {
       // this.errorMessage = result.data.message || result.data;
	    this.forgotForm.controls['email'].enable();
		var emails = this.forgotForm.controls['email'].value
        this.forgotForm.controls['email'].markAsUntouched();
		this.forgotForm = new FormGroup({
		   email: new FormControl('', [this.customValidator])
		})
		this.forgotForm.controls['email'].setValue(emails);
      }
    }, (err) => {
      console.error(err)
    })
  }
  
  public customValidator(control: FormControl) {
  	 return { 'invalid': true };
  }
}
