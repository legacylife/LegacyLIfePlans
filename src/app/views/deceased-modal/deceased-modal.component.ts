import { Component, OnInit } from '@angular/core';
import { UserAPIService } from './../../userapi.service';
import { AppConfirmService } from '../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../shared/services/app-loader/app-loader.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

@Component({
  selector: 'app-deceased-modal',
  templateUrl: './deceased-modal.component.html',
  styleUrls: ['./deceased-modal.component.scss']
})
export class DeceasedComponent implements OnInit {
  userId = localStorage.getItem("endUserId");
  customerData: any;
  trustId: string;
  advisorId: string;
  urlData:any={};
  deceasedData:any;
  customerLegaciesId: string;
  customerLegacyType:string='customer';
  lockoutLegacyDate: string;
  lockoutLegacyDateFlag:boolean = false;
  DeceasedFlag: string;
  deceasedDataFlag:boolean = false;
  constructor(private snack: MatSnackBar,public dialog: MatDialog,private confirmService: AppConfirmService,private loader: AppLoaderService, private router: Router,
    private userapi: UserAPIService) { }

  ngOnInit() {
    this.urlData = this.userapi.getURLData();
    if (this.urlData.lastThird == "legacies") {
        this.customerLegaciesId = this.urlData.lastOne;
        this.customerLegacyType =  this.urlData.userType;          
    }
  
    this.trustId =this.advisorId = '';
    if(localStorage.getItem("endUserType")=='advisor'){
      this.advisorId = this.userId;
    }else{
      this.trustId = this.userId;
    }
    
    this.DeceasedFlag = localStorage.getItem("endUserDeceased");
    if(localStorage.getItem("endUserlockoutLegacyDate")){
      this.lockoutLegacyDate = localStorage.getItem("endUserlockoutLegacyDate");
      this.lockoutLegacyDateFlag = true;
    }    
    if(this.DeceasedFlag=='true'){
      this.getDeceasedView();
      this.getLegacyCustomerDetails();
    }
  }

getLegacyCustomerDetails(query = {}){
  const req_vars = {
    query: Object.assign({ _id: this.userId }, query),
    fields:{_id:1,firstName:1,lastName:1}
  }
  this.loader.open(); 
  this.userapi.apiRequest('post', 'userlist/viewall', req_vars).subscribe(result => {
    this.loader.close();
    if (result.status == "error") {
      console.log(result.data)
    } else {
      if(result.data){
        this.customerData = result.data;
      }
    }
  }, (err) => {
    console.error(err)
  })
}

getDeceasedView = (query = {}, search = false) => { 
  let req_vars = {
    query: Object.assign({customerId:this.userId,status:"Active" })
  }

  this.userapi.apiRequest('post', 'deceased/deceaseView', req_vars).subscribe(result => {
   if (result.status == "error") {
      console.log(result.data)
    } else {
      if(result.data.deceasedData){    
        this.deceasedData = result.data.deceasedData;    
        this.deceasedDataFlag = true; 
      }
    }
  }, (err) => {
    console.error(err);
  })
} 

revokeAsLegacyHolder() {
      var query = {};
      const req_vars = {
        query: Object.assign({customerId:this.userId}, query),
        revokeId:this.userId,
        userType:localStorage.getItem("endUserType"),
      }
      this.loader.open();   
      this.userapi.apiRequest('post', 'deceased/revokeOwnDeceased', req_vars).subscribe(result => {
        localStorage.setItem("endUserDeceased",'');
        localStorage.setItem("endUserlockoutLegacyDate",'');
        this.loader.close();
        this.dialog.closeAll(); 
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }, (err) => {
        console.error(err)
        this.loader.close();
      })                 
}

}

