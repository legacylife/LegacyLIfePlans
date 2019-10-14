import { Component, OnInit } from '@angular/core';
import { UserAPIService } from './../../../../../../userapi.service';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { AppConfirmService } from '../../../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../../../shared/services/app-loader/app-loader.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
@Component({
  selector: 'app-essenioal-id-box',
  templateUrl: './digital-publications-modal.component.html',
  styleUrls: ['./digital-publications-modal.component.scss']
})
export class DigitalPublicationsModalComponent implements OnInit {
  userId = localStorage.getItem("endUserId");
  invalidMessage: string;
  digitalPublicationForm: FormGroup;
  digitalPublicationList:any;
  profileIdHiddenVal:boolean = false;
  selectedProfileId: string;
  
  urlData:any={};	  
  customerLegaciesId: string;
  customerLegacyType:string='customer';
  constructor(private snack: MatSnackBar,public dialog: MatDialog, private fb: FormBuilder,private confirmService: AppConfirmService,private loader: AppLoaderService, private router: Router,
    private userapi: UserAPIService){ }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");   
    this.digitalPublicationForm = this.fb.group({
      title: new FormControl('',Validators.required),
      username: new FormControl('',Validators.required),
      password: new FormControl('',Validators.required),
      comments: new FormControl(''),
      profileId: new FormControl('')
     });

     this.urlData = this.userapi.getURLData();
     this.selectedProfileId = this.urlData.lastOne;
     if (this.selectedProfileId && this.selectedProfileId == 'passwords-digital-assests' && this.urlData.lastThird != "legacies") {
       this.selectedProfileId = "";
     }
 
     if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'passwords-digital-assests') {
       this.customerLegaciesId = this.userId;
       this.customerLegacyType =  this.urlData.userType;
       this.userId = this.urlData.lastOne;          
       this.selectedProfileId = "";        
     }
     this.getdigitalPublicationView();
    }

    digitalPublicationFormSubmit(profileInData = null) {
      var query = {};
      var proquery = {};     
      
      let profileIds = this.digitalPublicationForm.controls['profileId'].value;
      if(profileIds){
        this.selectedProfileId = profileIds;
      }

      if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'passwords-digital-assests') {
        profileInData.customerLegacyId = this.customerLegaciesId
        profileInData.customerLegacyType = this.customerLegacyType
      }

      if(!profileInData.profileId || profileInData.profileId ==''){
        profileInData.customerId = this.userId
      }
      const req_vars = {
        query: Object.assign({ _id: this.selectedProfileId  }),
        proquery: Object.assign(profileInData),
        fromId:localStorage.getItem('endUserId'),
        toId: this.userId,
        folderName:'Password & Digital Assets',
        subFolderName: 'Electronic Media'
      }
      this.loader.open();     
      this.userapi.apiRequest('post', 'passwordsDigitalAssets/digital-publication-form-submit', req_vars).subscribe(result => {
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
  
    getdigitalPublicationView = (query = {}, search = false) => { 
      let req_vars = {
        query: Object.assign({ customerId: this.userId,status:"Pending" })
      }
     
      let profileIds = '';
      if (this.selectedProfileId) {
        profileIds = this.selectedProfileId;
        req_vars = {
          query: Object.assign({ _id:profileIds })
        }
      }

      this.loader.open(); 
      this.userapi.apiRequest('post', 'passwordsDigitalAssets/view-digital-publication-details', req_vars).subscribe(result => {
        this.loader.close();
        if (result.status == "error") {
          console.log(result.data)
        } else {
          if(result.data){    
            this.digitalPublicationList = result.data;                    
            if(this.digitalPublicationList._id!=''){
              let profileIds = this.digitalPublicationList._id;
            }
            this.digitalPublicationForm.controls['profileId'].setValue(profileIds);
            this.digitalPublicationForm.controls['title'].setValue(this.digitalPublicationList.title);
            this.digitalPublicationForm.controls['username'].setValue(this.digitalPublicationList.username);
            this.digitalPublicationForm.controls['password'].setValue(this.digitalPublicationList.password);
            this.digitalPublicationForm.controls['comments'].setValue(this.digitalPublicationList.comments);
          }       
        }
      }, (err) => {
        console.error(err);
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
 

}