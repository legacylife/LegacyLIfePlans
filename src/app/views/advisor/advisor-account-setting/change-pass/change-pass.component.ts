import { Component, OnInit } from '@angular/core';
import { APIService } from './../../../../api.service';
import { UserAPIService } from './../../../../userapi.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { AppConfirmService } from '../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

//const passwordRegex: any = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!#%*?&])[A-Za-z\d$@$!#%*?&]{6,16}/
const passwordRegex: any = /^.{6,}$/
const password = new FormControl('', [Validators.required, Validators.pattern(passwordRegex)]);
const NewPassword = new FormControl('', [Validators.required, Validators.pattern(passwordRegex), Validators.minLength(6)]);
const confirmPassword = new FormControl('', [Validators.required, CustomValidators.equalTo(NewPassword)]);

@Component({
  selector: 'app-change-pass',
  templateUrl: './change-pass.component.html',
  styleUrls: ['./change-pass.component.scss']
})
export class ChangePassComponent implements OnInit {
  userId:string;
  resetForm: FormGroup;
  constructor( private fb: FormBuilder, private userapi: UserAPIService,private router: Router,private snack: MatSnackBar,public dialog: MatDialog,private confirmService: AppConfirmService, private loader: AppLoaderService) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.resetForm = this.fb.group({
      password: password,
      NewPassword: NewPassword,
      confirmPassword: confirmPassword
    });

  }

  PassSubmit(){
    let passwordData = {
      userId: this.userId,
      password: this.resetForm.controls['password'].value,
      newPassword: this.resetForm.controls['NewPassword'].value,
      confirmPassword: this.resetForm.controls['confirmPassword'].value,
      userType: "advisor"
    }
    this.loader.open();
    this.userapi.apiRequest('post', 'auth/changePassword', passwordData).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        this.resetForm.controls['password'].setErrors({ 'invalid': true });
        this.resetForm.controls['password'].setValue('');
      } else {
        this.dialog.closeAll();
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }
    }, (err) => {
      console.error(err)
    })
  }

}
