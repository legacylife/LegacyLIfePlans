import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatDialog } from '@angular/material';
import { UserAPIService } from 'app/userapi.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';

@Component({
  selector: 'app-invite-modal',
  templateUrl: './lockscreen-modal.component.html',
  styleUrls: ['./lockscreen-modal.component.scss']
})
export class lockscreenModalComponent implements OnInit {
  lockScreenForm: FormGroup
  userId: string
  userFullName: string
  endUserType: string
  emailHiddenVal:boolean = false;
  constructor(private router: Router, private route: ActivatedRoute, private fb: FormBuilder, private snack: MatSnackBar, public dialog: MatDialog, private userapi: UserAPIService,
    private loader: AppLoaderService, private confirmService: AppConfirmService) {
  }

  ngOnInit() {
    this.userFullName = localStorage.getItem("endUserFirstName") + " " + localStorage.getItem("endUserLastName");
    this.userId = localStorage.getItem("endUserId");
    this.endUserType = localStorage.getItem("endUserType");
    this.lockScreenForm = this.fb.group({
      email: new FormControl(''),
      password: new FormControl('', Validators.required)
    });

    if(this.userId){
      const req_vars = { userId: this.userId }
      this.userapi.apiRequest('post', 'auth/view', req_vars).subscribe(result => {  
        if (result.status=="success") {     
          this.lockScreenForm.controls['email'].setValue(result.data.username);
        }
      }, (err) => {
        console.error(err)
      })
    } else {
      this.router.navigate(['/', 'customer', 'signin']);
    }
  }


lockScreenFormSubmit(userData = null) {
  let signInData = {
    username: this.lockScreenForm.controls['email'].value,
    password: this.lockScreenForm.controls['password'].value,
    userType: {$ne : "sysadmin"}
  }
  this.loader.open();
  this.userapi.apiRequest('post', 'auth/signin', signInData).subscribe(result => {
    this.loader.close();
    if (result.status=="success") {      
      userData = result.data;
        //close the popup here
        localStorage.setItem("setIdleFlag", "false");
        this.dialog.closeAll(); 
    } else {
      if(result.data.message){
        if(result.data.invalidPassword){       
          this.lockScreenForm.controls['password'].setErrors({'invalid' : true});
          this.lockScreenForm.controls['password'].markAsUntouched();
        }
      }      
    }      
  }, (err) => {

  })
}
}