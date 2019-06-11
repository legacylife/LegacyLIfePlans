import { Component, OnInit } from '@angular/core';
import { APIService } from './../../../../api.service';
import { UserAPIService } from './../../../../userapi.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AppConfirmService } from '../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { myProfessionals } from '../../../../selectList';

@Component({
  selector: 'app-essentials-id-box',
  templateUrl: './essentials-my-professionals.component.html',
  styleUrls: ['./essentials-my-professionals.component.scss']
})
export class essentialsMyProfessionalsComponent implements OnInit {
  userId = localStorage.getItem("endUserId");
  professionalForm: FormGroup;
  myProfessionalsList: string[] = myProfessionals;
  profileIdHiddenVal:boolean = false;
  
  constructor(private snack: MatSnackBar,public dialog: MatDialog, private fb: FormBuilder, private confirmService: AppConfirmService,private loader: AppLoaderService, private userapi: UserAPIService  ) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");    
      this.professionalForm = this.fb.group({
        namedProfessionals: new FormControl('', Validators.required),
        businessName: new FormControl('', Validators.required),
        name: new FormControl('', Validators.required),
        address: new FormControl('', Validators.required),
        mpPhoneNumbers: new FormControl(''),//'', Validators.required
        mpEmailAddress: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i)]),
        profileId: new FormControl('')
      });
    }
   
    ProfessFormSubmit(profileInData = null) {
      var query = {};
      var proquery = {};
      const req_vars = {
        query: Object.assign({ _id: profileInData.profileId, customerId: this.userId }, query),
        proquery: Object.assign(profileInData)
      }
      this.loader.open();
      console.log("req_vars", req_vars);
      this.userapi.apiRequest('post', 'customer/my-essentials-profile-submit', req_vars).subscribe(result => {
        this.loader.close();
        if (result.status == "error") {
          this.snack.open(result.data.message, 'OK', { duration: 4000 })
        } else {
          this.snack.open(result.data.message, 'OK', { duration: 4000 })
          this.dialog.closeAll(); 
        }
      }, (err) => {
        console.error(err)
      })
    }



  

 
}