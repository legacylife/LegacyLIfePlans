import { Component, OnInit } from '@angular/core';
import { APIService } from './../../../../api.service';
import { UserAPIService } from './../../../../userapi.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AppConfirmService } from '../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { myProfessionals } from '../../../../selectList';
import { DataSharingService } from 'app/shared/services/data-sharing.service';
import { AsYouType } from 'libphonenumber-js'
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
  selectedProfileId:string;
  profesional:any;
  urlData:any={};
  customerLegaciesId: string;
  customerLegacyType:string='customer';
  LegacyPermissionError:string="You don't have access to this section";
  trusteeLegaciesAction:boolean=true;
  constructor(private snack: MatSnackBar,public dialog: MatDialog, private fb: FormBuilder, private confirmService: AppConfirmService,private loader: AppLoaderService, private userapi: UserAPIService,private sharedata: DataSharingService  ) { }

  ngOnInit() {
      this.userId = localStorage.getItem("endUserId");    
      this.professionalForm = this.fb.group({
        namedProfessionals: new FormControl('', Validators.required),
        businessName: new FormControl(''),
        name: new FormControl('', Validators.required),
        address: new FormControl(''),
        mpPhoneNumbers: new FormControl('',[Validators.pattern(/^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]*$/),Validators.minLength(10)]),
        mpEmailAddress: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i)]), 
        profileId: new FormControl('')
      });

      this.urlData = this.userapi.getURLData();
      this.selectedProfileId = this.urlData.lastOne;
      if (this.selectedProfileId && this.selectedProfileId == 'essential-day-one' && this.urlData.lastThird != "legacies") {
        this.selectedProfileId = "";
      }
      
      if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'essential-day-one') {
        this.customerLegaciesId = this.userId;
        this.customerLegacyType =  this.urlData.userType;
        this.userId = this.urlData.lastOne;          
        this.userapi.getUserAccess(this.userId,(userAccess,userDeathFilesCnt,userLockoutPeriod,userDeceased) => { 
          if(userLockoutPeriod || userDeceased){
            this.trusteeLegaciesAction = false;
          }
          this.sharedata.shareLegacyDeathfileCountData(userDeathFilesCnt);
         if(userAccess.MyProfessionalsManagement!='now'){
          this.trusteeLegaciesAction = false;
         }           
    });    
        this.selectedProfileId = "";        
      }

      if(this.selectedProfileId){
        this.professionalForm.controls['profileId'].setValue(this.selectedProfileId); 
        this.getProfessionalDetails();
      }
    }
   
    getProfessionalDetails = (query = {}, search = false) => {
      const req_vars = {
        query: Object.assign({ _id: this.selectedProfileId }, query)
      }
      this.loader.open();
      this.userapi.apiRequest('post', 'customer/view-professional-details', req_vars).subscribe(result => {
        if (result.status == "error") {
          this.loader.close();
        } else { 
          if(result.data){
            this.profesional = result.data;
            this.professionalForm.controls['namedProfessionals'].setValue(this.profesional.namedProfessionals);
            this.professionalForm.controls['name'].setValue(this.profesional.name); 
            this.professionalForm.controls['businessName'].setValue(this.profesional.businessName); 
            this.professionalForm.controls['mpPhoneNumbers'].setValue(this.profesional.mpPhoneNumbers); 
            this.professionalForm.controls['address'].setValue(this.profesional.address); 
            this.professionalForm.controls['mpEmailAddress'].setValue(this.profesional.mpEmailAddress); 
          }
          this.loader.close();
        }
      }, (err) => {
        console.error(err);
        this.loader.close();
      })
    }


    ProfessFormSubmit(profileInData = null) {
      var query = {};
      var proquery = {};
      if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'essential-day-one') {
        profileInData.customerLegacyId = this.customerLegaciesId
        profileInData.customerLegacyType = this.customerLegacyType       
      }
      if(!profileInData.profileId || profileInData.profileId ==''){
        profileInData.customerId = this.userId
      }
      const req_vars = {
        query: Object.assign({ _id: profileInData.profileId}, query),
        proquery: Object.assign(profileInData)
      }
      this.loader.open();      
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

    firstCapitalize(e) {
      let re = /(^|[.!?]\s+)([a-z])/g;
      var textBox: HTMLInputElement = <HTMLInputElement>e.target;
      textBox.value = textBox.value.replace(re, (m, $1, $2) => $1 + $2.toUpperCase());
    }

    checkSpecialChar(event)
    {  
      var key;  
      key = event.charCode;
      return((key > 64 && key < 91) || (key> 96 && key < 123) || key == 8 || key == 32 || (key >= 48 && key <= 57)); 
    } 

    onlyNumbers(event)
    {  
      if ((event.which != 46 ) && (event.which < 48 || event.which > 57)) {
        event.preventDefault();
      }
    }

      
  checkPhoneNumber(event)
  {  
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }else{
      const AsouType = new AsYouType('US');
      let phoneNumber = AsouType.input(this.professionalForm.controls['mpPhoneNumbers'].value);
      this.professionalForm.controls['mpPhoneNumbers'].setValue(phoneNumber);
    }
  }
}