import { Component, OnInit } from '@angular/core';
import { UserAPIService } from './../../../../../../userapi.service';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { AppConfirmService } from '../../../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../../../shared/services/app-loader/app-loader.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { ElectronicMediaLists } from '../../../../../../selectList';
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
  constructor(private snack: MatSnackBar,public dialog: MatDialog, private fb: FormBuilder,private confirmService: AppConfirmService,private loader: AppLoaderService, private router: Router,
    private userapi: UserAPIService){ }

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

     const locationArray = location.href.split('/')
     this.selectedProfileId = locationArray[locationArray.length - 1];

     if(this.selectedProfileId && (this.selectedProfileId == 'electronic-media' || this.selectedProfileId == 'passwords-digital-assests')){
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
      const req_vars = {
        query: Object.assign({ _id: this.selectedProfileId,customerId: this.userId  }),
        proquery: Object.assign(profileInData)
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
          query: Object.assign({ _id:profileIds, customerId: this.userId })
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
 

}