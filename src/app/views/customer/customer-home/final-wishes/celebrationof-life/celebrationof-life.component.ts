import { Component, OnInit } from '@angular/core';
import { UserAPIService } from './../../../../../userapi.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AppConfirmService } from '../../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { FileUploader } from 'ng2-file-upload';
import { serverUrl, s3Details } from '../../../../../config';
import { cloneDeep } from 'lodash';
import { FileHandlingService } from 'app/shared/services/file-handling.service';
const URL = serverUrl + '/api/documents/obituary';

@Component({
  selector: 'app-celebrationof-life',
  templateUrl: './celebrationof-life.component.html',
  styleUrls: ['./celebrationof-life.component.scss']
})
export class CelebrationofLifeComponent implements OnInit {
  
  public hasBaseDropZoneOver: boolean = false;
  userId = localStorage.getItem("endUserId");
  celebrationFormGroup: FormGroup;
  selectedProfileId: string;
  invalidMessage: string;
  documentsMissing = false;
  documents_temps = false;
  celebrationCheck: boolean = false;
  celebrationCheckPhotos: boolean = false;
  profileIdHiddenVal:boolean = false;
  urlData:any={};	  
  celebrationList:any = [];
  customerLegaciesId: string;
  customerLegacyType:string='customer';
  LegacyPermissionError:string="You don't have access to this section";
  trusteeLegaciesAction:boolean=true;
  currentProgessinPercent:number = 0;
  toUserId:string = ''
  fileErrors: any;
  documentsList: any;
  docPath: string;
  isSpeaker:boolean = false;

  constructor(private _formBuilder: FormBuilder,private snack: MatSnackBar,public dialog: MatDialog,  private confirmService: AppConfirmService, private loader: AppLoaderService, private router: Router, private userapi: UserAPIService,private fileHandlingService: FileHandlingService) { }
  public uploader: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
  public uploaderCopy: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });

  ngOnInit() {
    this.celebrationFormGroup = this._formBuilder.group({
      eventByName: new FormControl('',Validators.required),
      eventPlace: new FormControl(''),
      speakerAvailable: new FormControl('no'),
      speakerName: new FormControl(''),
      foodNMenuItems: new FormControl(''),
      musicNames: new FormControl(''),
      groupActivities: new FormControl(''),
      documentLocation: new FormControl(''),
      mementos: new FormControl(''),
      paymentOptions: new FormControl(''),
      documents_temp: new FormControl(''),
      profileId: new FormControl(''),
    });

    this.urlData = this.userapi.getURLData();
    this.selectedProfileId = this.urlData.lastOne;
    if (this.selectedProfileId && this.selectedProfileId == 'final-wishes' && this.urlData.lastThird != "legacies") {
      this.selectedProfileId = "";
    }

    if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'final-wishes') {
      this.customerLegaciesId = this.userId;
      this.customerLegacyType =  this.urlData.userType;
      this.userId = this.urlData.lastOne;          
      this.userapi.getUserAccess(this.userId,(userAccess,userDeathFilesCnt,userLockoutPeriod,userDeceased) => { 
        if(userLockoutPeriod || userDeceased){
          this.trusteeLegaciesAction = false;
        }
       if(userAccess.DevicesManagement!='now'){
        this.trusteeLegaciesAction = false;
       }           
       });   
      this.selectedProfileId = "";        
    }
    this.toUserId = this.userId;
    this.getcelebrationView();

  }

  getcelebrationView = (query = {}, search = false) => {  
    let req_vars = {
      query: Object.assign({ customerId: this.userId,status:"Pending" }, query)
    }

    let profileIds = '';
    if (this.selectedProfileId) {
      profileIds = this.selectedProfileId;
      req_vars = {
        query: Object.assign({ _id: profileIds })
      }
    }

    this.loader.open(); 
    this.userapi.apiRequest('post', 'finalwishes/view-celebration-details', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if(result.data){    
          this.celebrationList = result.data;   
          this.toUserId     = this.celebrationList.customerId;
          let profileIds    = this.celebrationList._id;
        
          this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
          this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
          this.documentsList = this.celebrationList.documents;
          if(this.documentsList.length>0){
            this.celebrationFormGroup.controls['documents_temp'].setValue('1');
            this.documentsMissing = false; 
          }

          if(this.celebrationList.speakerAvailable && this.celebrationList.speakerAvailable == 'yes'){
            this.isSpeaker = true;
          }
          
          this.celebrationFormGroup.controls['profileId'].setValue(profileIds);
          this.celebrationFormGroup.controls['eventByName'].setValue(this.celebrationList.eventByName); 
          this.celebrationFormGroup.controls['eventPlace'].setValue(this.celebrationList.eventPlace);
          this.celebrationFormGroup.controls['speakerAvailable'].setValue(this.celebrationList.speakerAvailable);
          this.celebrationFormGroup.controls['speakerName'].setValue(this.celebrationList.speakerName); 
          this.celebrationFormGroup.controls['foodNMenuItems'].setValue(this.celebrationList.foodNMenuItems);
          this.celebrationFormGroup.controls['musicNames'].setValue(this.celebrationList.musicNames); 
          this.celebrationFormGroup.controls['groupActivities'].setValue(this.celebrationList.groupActivities); 
          this.celebrationFormGroup.controls['documentLocation'].setValue(this.celebrationList.documentLocation);
          this.celebrationFormGroup.controls['mementos'].setValue(this.celebrationList.mementos); 
          this.celebrationFormGroup.controls['paymentOptions'].setValue(this.celebrationList.paymentOptions);  
        }       
      }
    }, (err) => {
      console.error(err);
    })
  }

  onChangeSpeaker(key) {      
    if(key=='yes') {      
      this.isSpeaker = true;
      this.celebrationFormGroup = this._formBuilder.group({
        eventByName: new FormControl(this.celebrationFormGroup.controls['eventByName'].value,Validators.required),
        eventPlace: new FormControl(this.celebrationFormGroup.controls['eventPlace'].value),
        speakerAvailable: new FormControl(this.celebrationFormGroup.controls['speakerAvailable'].value),
        speakerName: new FormControl(this.celebrationFormGroup.controls['speakerName'].value,Validators.required),
        foodNMenuItems: new FormControl(this.celebrationFormGroup.controls['foodNMenuItems'].value),
        musicNames: new FormControl(this.celebrationFormGroup.controls['musicNames'].value),
        groupActivities: new FormControl(this.celebrationFormGroup.controls['groupActivities'].value),
        documentLocation: new FormControl(this.celebrationFormGroup.controls['documentLocation'].value),
        mementos: new FormControl(this.celebrationFormGroup.controls['mementos'].value),
        paymentOptions: new FormControl(this.celebrationFormGroup.controls['paymentOptions'].value),
        documents_temp: new FormControl(this.celebrationFormGroup.controls['documents_temp'].value),
        profileId: new FormControl(this.celebrationFormGroup.controls['profileId'].value),
      });

    }else{
      this.isSpeaker = false;
      this.celebrationFormGroup = this._formBuilder.group({
        eventByName: new FormControl(this.celebrationFormGroup.controls['eventByName'].value,Validators.required),
        eventPlace: new FormControl(this.celebrationFormGroup.controls['eventPlace'].value),
        speakerAvailable: new FormControl(this.celebrationFormGroup.controls['speakerAvailable'].value),
        speakerName: new FormControl(this.celebrationFormGroup.controls['speakerName'].value),
        foodNMenuItems: new FormControl(this.celebrationFormGroup.controls['foodNMenuItems'].value),
        musicNames: new FormControl(this.celebrationFormGroup.controls['musicNames'].value),
        groupActivities: new FormControl(this.celebrationFormGroup.controls['groupActivities'].value),
        documentLocation: new FormControl(this.celebrationFormGroup.controls['documentLocation'].value),
        mementos: new FormControl(this.celebrationFormGroup.controls['mementos'].value),
        paymentOptions: new FormControl(this.celebrationFormGroup.controls['paymentOptions'].value),
        documents_temp: new FormControl(this.celebrationFormGroup.controls['documents_temp'].value),
        profileId: new FormControl(this.celebrationFormGroup.controls['profileId'].value),
      });
    }
  }

  CelebrationFormSubmit(profileInData = null) {
    var query = {};
    var proquery = {};     
  
    let profileIds = this.celebrationFormGroup.controls['profileId'].value;
    if(profileIds){
      this.selectedProfileId = profileIds;
    }
    if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'final-wishes') {
      profileInData.customerLegacyId = this.customerLegaciesId
      profileInData.customerLegacyType = this.customerLegacyType
    }        
    if(!profileInData.profileId || profileInData.profileId ==''){
      profileInData.customerId = this.userId
    }
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId }),
      proquery: Object.assign(profileInData),
      fromId:localStorage.getItem('endUserId'),
      toId:this.toUserId,
      folderName:s3Details.obituaryFilePath
    }

    //this.loader.open();     
    this.userapi.apiRequest('post', 'finalwishes/celebration-form-submit', req_vars).subscribe(result => {
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


 

}
