import { Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar, MatButton } from '@angular/material';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { APIService } from './../../../api.service';

const passwordRegex: any = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!#%*?&])[A-Za-z\d$@$!#%*?&]{6,16}/
const password = new FormControl('', [Validators.required, Validators.pattern(passwordRegex)]);
const confirmPassword = new FormControl('', CustomValidators.equalTo(password));

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  public resetForm: FormGroup;
  errorMessage: string = ""
  successMessage: string = ""
  userId: string = ""

  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @ViewChild(MatButton) submitButton: MatButton;
  constructor(private api:APIService, private fb: FormBuilder, private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.resetForm = this.fb.group( {
      password: password,
      confirmPassword: confirmPassword
    });
    this.activatedRoute.params.subscribe((params: Params) => {
      this.userId = params.id
    })
  }
  onSubmit() {
    const req_vars = { password:  this.resetForm.controls['password'].value, userId: this.userId, userType: "AdminWeb" }

    this.api.apiRequest('post', 'auth/resetPassword', req_vars).subscribe(result => {
      if(result.status == "success"){
        this.successMessage = result.data;
        this.hideAlerts()
        setTimeout(() => {
          this.router.navigate ( [ 'llp-admin', 'password-reset-success' ] );
        }, 2000);
      } else {
        this.errorMessage = result.data.message || result.data;
        this.hideAlerts()
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
