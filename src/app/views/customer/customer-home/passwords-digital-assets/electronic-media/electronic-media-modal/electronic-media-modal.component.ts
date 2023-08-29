import { Component, OnInit } from '@angular/core';
import { UserAPIService } from './../../../../../../userapi.service';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { AppConfirmService } from '../../../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../../../shared/services/app-loader/app-loader.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { ElectronicMediaLists } from '../../../../../../selectList';
import { DataSharingService } from 'app/shared/services/data-sharing.service';
@Component({
  selector: 'app-essenioal-id-box',
  templateUrl: './electronic-media-modal.component.html',
  styleUrls: ['./electronic-media-modal.component.scss']
})
export class ElectronicMediaModalComponent implements OnInit {
  userId = localStorage.getItem("endUserId");
  invalidMessage: string;
  ElectronicMediaForm: FormGroup;
  electronicMediaList:any;
  profileIdHiddenVal:boolean = false;
  selectedProfileId: string;
  electronicMediaListing: any[];
  urlData:any={};	  
  customerLegaciesId: string;
  customerLegacyType:string='customer';
  trusteeLegaciesAction:boolean=true;
  LegacyPermissionError:string="You don't have access to this section";
  constructor(private snack: MatSnackBar,public dialog: MatDialog, private fb: FormBuilder,private confirmService: AppConfirmService,private loader: AppLoaderService, private router: Router,
    private userapi: UserAPIService,private sharedata: DataSharingService){ }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.electronicMediaListing = ElectronicMediaLists;
    this.ElectronicMediaForm = this.fb.group({
      mediaType: new FormControl('',Validators.required),
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
       this.userapi.getUserAccess(this.userId,(userAccess,userDeathFilesCnt,userLockoutPeriod,userDeceased) => { 
        if(userLockoutPeriod || userDeceased){
          this.trusteeLegaciesAction = false;
        }
        this.sharedata.shareLegacyDeathfileCountData(userDeathFilesCnt);
       if(userAccess.ElectronicMediaManagement!='now'){
        this.trusteeLegaciesAction = false;
       }           
      }); 
       this.selectedProfileId = "";        
     }
     this.getelectronicMediaView();
    }

    ElectronicMediaFormSubmit(profileInData = null) {
      var query = {};
      var proquery = {};     
      
      let profileIds = this.ElectronicMediaForm.controls['profileId'].value;
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
      this.userapi.apiRequest('post', 'passwordsDigitalAssets/electronic-media-form-submit', req_vars).subscribe(result => {
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
  
    getelectronicMediaView = (query = {}, search = false) => { 
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
      this.userapi.apiRequest('post', 'passwordsDigitalAssets/view-electronic-media-details', req_vars).subscribe(result => {
        this.loader.close();
        if (result.status == "error") {
          console.log(result.data)
        } else {
          if(result.data){    
            this.electronicMediaList = result.data;                    
            if(this.electronicMediaList._id!=''){
              let profileIds = this.electronicMediaList._id;
            }
            this.ElectronicMediaForm.controls['profileId'].setValue(profileIds);
            this.ElectronicMediaForm.controls['mediaType'].setValue(this.electronicMediaList.mediaType);
            this.ElectronicMediaForm.controls['username'].setValue(this.electronicMediaList.username);
            this.ElectronicMediaForm.controls['password'].setValue('');
            this.ElectronicMediaForm.controls['comments'].setValue(this.electronicMediaList.comments);
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
 
  //function to trim the input value
  trimInput(event, colName){
    this.ElectronicMediaForm.controls[colName].setValue(event.target.value.trim())
  }
}