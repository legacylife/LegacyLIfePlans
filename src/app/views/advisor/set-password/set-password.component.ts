import { Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar, MatButton, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { CustomValidators } from 'ng2-validation';
import { APIService } from './../../../api.service';
import { UserAPIService } from './../../../userapi.service';

const passwordRegex: any = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!#%*?&])[A-Za-z\d$@$!#%*?&]{6,16}/
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
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @ViewChild(MatButton) submitButton: MatButton;
  constructor(private userapi: UserAPIService, private fb: FormBuilder, private router: Router, private activatedRoute: ActivatedRoute, private snack: MatSnackBar, private confirmService: AppConfirmService, private loader: AppLoaderService) { }

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

    this.userapi.apiRequest('post', 'auth/resetPassword', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "success") {
        this.snack.open(result.data, 'OK', { duration: 4000 })

        setTimeout(() => {
          this.router.navigate(['/customer/signin']);
        }, 2000);
      } else {
        this.snack.open(result.data, 'OK', { duration: 4000 })
      }
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
