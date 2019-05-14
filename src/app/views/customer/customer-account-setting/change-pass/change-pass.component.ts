import { Component, OnInit } from '@angular/core';
import { APIService } from './../../../../api.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { AppConfirmService } from '../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

const passwordRegex: any = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!#%*?&])[A-Za-z\d$@$!#%*?&]{6,16}/
const password = new FormControl('', [Validators.required, Validators.pattern(passwordRegex)]);
const NewPassword = new FormControl('', [Validators.required, Validators.pattern(passwordRegex), Validators.minLength(6)]);
const confirmPassword = new FormControl('', CustomValidators.equalTo(NewPassword));

@Component({
  selector: 'app-change-pass',
  templateUrl: './change-pass.component.html',
  styleUrls: ['./change-pass.component.scss']
})
export class ChangePassComponent implements OnInit {
  userId:string;
  resetForm: FormGroup;
  constructor( private fb: FormBuilder, private api: APIService,private router: Router,private snack: MatSnackBar,private confirmService: AppConfirmService, private loader: AppLoaderService) { }

  ngOnInit() {
    this.resetForm = this.fb.group({
      password: password,
      confirmPassword: confirmPassword
    });

  }


  PassSubmit(){
    const req_vars = { password: this.resetForm.controls['password'].value, token: this.userId, userType: "sysadmin" }

    this.api.apiRequest('post', 'auth/resetPassword', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "success") {
        this.snack.open(result.data, 'OK', { duration: 4000 })

        setTimeout(() => {
          //this.router.navigate(['password-reset-success']);
        }, 2000);
      } else {
        this.snack.open(result.data, 'OK', { duration: 4000 })
      }
    }, (err) => {
      // console.error(err)
      this.snack.open(err, 'OK', { duration: 4000 })
    })

  }

}
