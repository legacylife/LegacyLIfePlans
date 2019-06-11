import { Component, OnInit } from '@angular/core';
import { APIService } from './../../../../api.service';
import { UserAPIService } from './../../../../userapi.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AppConfirmService } from '../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { documentTypes } from '../../../../selectList';
import { states } from '../../../../state';

@Component({
  selector: 'app-essentials-id-box',
  templateUrl: './essentials-my-professionals.component.html',
  styleUrls: ['./essentials-my-professionals.component.scss']
})
export class essentialsMyProfessionalsComponent implements OnInit {
  userId = localStorage.getItem("endUserId");
  IDForm: FormGroup;
 
  constructor(private snack: MatSnackBar,public dialog: MatDialog, private fb: FormBuilder, private confirmService: AppConfirmService,private loader: AppLoaderService, private userapi: UserAPIService  ) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
  
    }
   
    IdFormSubmit(profileInData = null) {
      console.log("data :- ",profileInData);
      var query = {};
      var proquery = {};
      const req_vars = {
        query: Object.assign({ customerId: this.userId }),
        proquery: Object.assign(profileInData)
      }
      //8this.loader.open();
      console.log("req_vars", req_vars);
      this.userapi.apiRequest('post', 'customer/my_essentials_id_form_submit', req_vars).subscribe(result => {
     //8   this.loader.close();
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