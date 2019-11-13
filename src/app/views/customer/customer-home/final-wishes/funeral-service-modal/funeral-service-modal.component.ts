import { Component, OnInit } from '@angular/core';
import { egretAnimations } from 'app/shared/animations/egret-animations';
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
import { funeralOptions } from '../../../../../selectList';
const URL = serverUrl + '/api/documents/obituary';
import { DataSharingService } from 'app/shared/services/data-sharing.service';
@Component({
  selector: 'app-funeral-service-modal',
  templateUrl: './funeral-service-modal.component.html',
  styleUrls: ['./funeral-service-modal.component.scss'],
  animations: egretAnimations
})
export class FuneralServiceModalComponent implements OnInit {

  public hasBaseDropZoneOver: boolean = false;
  funeralOptions = funeralOptions;
  userId = localStorage.getItem("endUserId");
  celebrationFormGroup: FormGroup;
  selectedProfileId: string;
  invalidMessage: string;
  documentsMissing = false;
  documents_temps = false;
  profileIdHiddenVal: boolean = false;
  urlData: any = {};
  customerLegaciesId: string;
  customerLegacyType: string = 'customer';
  LegacyPermissionError: string = "You don't have access to this section";
  trusteeLegaciesAction: boolean = true;
  currentProgessinPercent: number = 0;
  toUserId: string = ''
  fileErrors: any;
  documentsList: any;
  docPath: string;

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;

  firstServicesSec = true;
  allServicesSec = false;
  serviceOther = false;
  ceremonySec = false;
  reflectionsSec = false;
  eulogistSec = false;
  readingsSec = false;
  musiciansSec = false;
  pallbearersSec = false;
  visualTribute = false;
  uploadDocAndLoc = false;
  funeralData : any;

  selectAnyOneFormGroup: FormGroup;

  constructor(private _formBuilder: FormBuilder, private snack: MatSnackBar, public dialog: MatDialog, private confirmService: AppConfirmService, private loader: AppLoaderService, private router: Router, private userapi: UserAPIService, private fileHandlingService: FileHandlingService,private sharedata: DataSharingService) { }
  public uploader: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
  public uploaderCopy: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });

  ngOnInit() {
    this.selectAnyOneFormGroup = this._formBuilder.group({
      funaralServiceType: new FormControl(''),
    });

    this.firstFormGroup = this._formBuilder.group({
      serviceFor: new FormControl(''),
      otherChecked:new FormControl(''),
      serviceForOther:new FormControl(''),
      isBodyPresent: new FormControl(''),
      isCasket:new FormControl(''),
      deceasedWear:new FormControl(''),      
    });

    this.secondFormGroup = this._formBuilder.group({
      serviceParticipants:new FormControl(''),
      leaderChecked: new FormControl(''),
      leaderDescrption:new FormControl(''),

      eulogistChecked: new FormControl(''),
      eulogistdescription:new FormControl(''),     
      
      reflectionsChecked: new FormControl(''),
      reflectionsDescription: new FormControl(''),

      readingsChecked:new FormControl(''),
      readingsDescription: new FormControl(''),

      musiciansChecked:new FormControl(''),
      musiciansDescription:new FormControl(''),    
      
      pallbearersChecked: new FormControl(''),
      pallbearersDescription:new FormControl(''),

      additionalParticipants:new FormControl(''),
      servicesUsed:new FormControl(''),
      flowersUsed:new FormControl(''),

    });
    this.thirdFormGroup = this._formBuilder.group({
      isFloralArrangements:new FormControl(''),
      needVisualTribute:new FormControl(''),
      peopleInVisualTribute:new FormControl(''),
      havePreparedVisualTribute:new FormControl(''),
      documents:new FormControl(''),
      locationOfDocuments:new FormControl(''),
      additionalPlans:new FormControl(''),
      profileId:new FormControl(''),
      documents_temp: new FormControl('')
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
        this.sharedata.shareLegacyDeathfileCountData(userDeathFilesCnt);
       if(userAccess.DevicesManagement!='now'){
        this.trusteeLegaciesAction = false;
       }           
       });   
      this.selectedProfileId = "";        
    }
    this.toUserId = this.userId;
    this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${this.selectedProfileId}` });
    this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${this.selectedProfileId}` });
    this.getFuneralPlanView();
  }

  getFuneralPlanView = (query = {}, search = false) => {  
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
    this.userapi.apiRequest('post', 'finalwishes/view-funeral-plan-details', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if(result.data){    
          this.funeralData = result.data;   
          this.toUserId     = this.funeralData.customerId;
          let profileIds    = this.funeralData._id;
        
          this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
          this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
          this.documentsList = this.funeralData.documents;
          if(this.documentsList.length>0){
            this.thirdFormGroup.controls['documents_temp'].setValue('1');
            this.documentsMissing = false; 
          }

          if(this.funeralData.leaderChecked){
            this.ceremonySec = true
          }
          if(this.funeralData.eulogistChecked){
            this.eulogistSec = true
          }

          if(this.funeralData.reflectionsChecked){
            this.reflectionsSec = true
          }

          if(this.funeralData.readingsChecked){
            this.readingsSec = true
          }

          if(this.funeralData.musiciansChecked){
            this.musiciansSec = true
          }

          if(this.funeralData.pallbearersChecked){
            this.pallbearersSec = true
          }

          if(this.funeralData.needVisualTribute == 'Yes'){
            this.visualTribute = true
          }

          if(this.funeralData.havePreparedVisualTribute == 'Yes'){
            this.uploadDocAndLoc = true
          }


          this.thirdFormGroup.controls['profileId'].setValue(profileIds);
          this.selectAnyOneFormGroup.controls['funaralServiceType'].setValue(this.funeralData.funaralServiceType);
          this.firstFormGroup.controls['serviceFor'].setValue(this.funeralData.serviceFor);
          this.firstFormGroup.controls['otherChecked'].setValue(this.funeralData.otherChecked);
          this.firstFormGroup.controls['serviceForOther'].setValue(this.funeralData.serviceForOther);
          this.firstFormGroup.controls['isBodyPresent'].setValue(this.funeralData.isBodyPresent);
          this.firstFormGroup.controls['isCasket'].setValue(this.funeralData.isCasket);
          this.firstFormGroup.controls['deceasedWear'].setValue(this.funeralData.deceasedWear);   
          
          this.secondFormGroup.controls['serviceParticipants'].setValue(this.funeralData.serviceParticipants);
          this.secondFormGroup.controls['leaderChecked'].setValue(this.funeralData.leaderChecked);
          this.secondFormGroup.controls['leaderDescrption'].setValue(this.funeralData.leaderDescrption);
          this.secondFormGroup.controls['eulogistChecked'].setValue(this.funeralData.eulogistChecked);
          this.secondFormGroup.controls['eulogistdescription'].setValue(this.funeralData.eulogistdescription);
          this.secondFormGroup.controls['reflectionsChecked'].setValue(this.funeralData.reflectionsChecked);
          this.secondFormGroup.controls['reflectionsDescription'].setValue(this.funeralData.reflectionsDescription);

          this.secondFormGroup.controls['readingsChecked'].setValue(this.funeralData.readingsChecked);
          this.secondFormGroup.controls['readingsDescription'].setValue(this.funeralData.readingsDescription);
          this.secondFormGroup.controls['musiciansChecked'].setValue(this.funeralData.musiciansChecked);
          this.secondFormGroup.controls['musiciansDescription'].setValue(this.funeralData.musiciansDescription);
          this.secondFormGroup.controls['pallbearersChecked'].setValue(this.funeralData.pallbearersChecked);
          this.secondFormGroup.controls['pallbearersDescription'].setValue(this.funeralData.pallbearersDescription);
          this.secondFormGroup.controls['additionalParticipants'].setValue(this.funeralData.additionalParticipants);

          this.secondFormGroup.controls['servicesUsed'].setValue(this.funeralData.servicesUsed);
          this.secondFormGroup.controls['flowersUsed'].setValue(this.funeralData.flowersUsed);

          this.thirdFormGroup.controls['isFloralArrangements'].setValue(this.funeralData.isFloralArrangements);
          this.thirdFormGroup.controls['needVisualTribute'].setValue(this.funeralData.needVisualTribute);
          this.thirdFormGroup.controls['peopleInVisualTribute'].setValue(this.funeralData.peopleInVisualTribute);
          this.thirdFormGroup.controls['havePreparedVisualTribute'].setValue(this.funeralData.havePreparedVisualTribute);
          this.thirdFormGroup.controls['documents'].setValue(this.funeralData.documents);
          this.thirdFormGroup.controls['locationOfDocuments'].setValue(this.funeralData.locationOfDocuments);
          this.thirdFormGroup.controls['additionalPlans'].setValue(this.funeralData.additionalPlans);

        }       
      }
    }, (err) => {
      console.error(err);
    })
  }

  PlanFormSubmit(selectAnyOneData,stepOneData,stepTwoData,stepThreeData){


    var query = {};
    var proquery = {};  

    let profileIds = this.thirdFormGroup.controls['profileId'].value;
    if(profileIds){
      this.selectedProfileId = profileIds;
    }
    if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'final-wishes') {
      stepThreeData.customerLegacyId = this.customerLegaciesId
      stepThreeData.customerLegacyType = this.customerLegacyType
    }        
    if(!stepThreeData.profileId || stepThreeData.profileId ==''){
      stepThreeData.customerId = this.userId
    }

    const profileInData = {};
    Object.keys(selectAnyOneData)
    .forEach(key => profileInData[key] = selectAnyOneData[key]);

    Object.keys(stepOneData)
      .forEach(key => profileInData[key] = stepOneData[key]);
    
    Object.keys(stepTwoData)
      .forEach(key => profileInData[key] = stepTwoData[key]);

    Object.keys(stepThreeData)
      .forEach(key => profileInData[key] = stepThreeData[key]);

    console.log("result >>>>>",profileInData)

    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId }),
      proquery: Object.assign(profileInData),
      fromId:localStorage.getItem('endUserId'),
      toId:this.toUserId,
      folderName:s3Details.obituaryFilePath
    }

    //this.loader.open();     
    this.userapi.apiRequest('post', 'finalwishes/funeral-plan-form-submit', req_vars).subscribe(result => {
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

  onChange(value) {
    if (value == "4") {
      this.firstServicesSec = true;
      this.allServicesSec = false;
    } else {
      this.firstServicesSec = false;
      this.allServicesSec = true;
    }
  }

  changeSelection() {
    let value = this.selectAnyOneFormGroup.controls['funaralServiceType'].value
    if (value == "4") {
      this.firstServicesSec = true;
      this.allServicesSec = false;
    } else {
      this.firstServicesSec = false;
      this.allServicesSec = true;
    }
  }

  backToFirst() {
    this.firstServicesSec = true;
    this.allServicesSec = false;
  }

  otherChange(field) {   

    let getOtheVal = this.firstFormGroup.controls['serviceFor'].value;    
    if (getOtheVal == true) {
      this.serviceOther = true;
    } else {
      this.serviceOther = false;
    }
  }
  
  leaderChange(field) {
    let leaderCheckedVal = this.secondFormGroup.controls['leaderChecked'].value;    
    if (leaderCheckedVal == true) {
      this.ceremonySec = true;
    } else {
      this.ceremonySec = false;
    }
  }

  eulogistChange(field) {
    let eulogistCheckedVal = this.secondFormGroup.controls['eulogistChecked'].value;    
    if (eulogistCheckedVal == true) {
      this.eulogistSec = true;
    } else {
      this.eulogistSec = false;
    }
  }

  reflectionsChange(field) {
    let reflectionsCheckedVal = this.secondFormGroup.controls['reflectionsChecked'].value;    
    if (reflectionsCheckedVal == true) {
      this.reflectionsSec = true;
    } else {
      this.reflectionsSec = false;
    }
  }

  readingsChange(field) {  

    let reflectionsCheckedVal = this.secondFormGroup.controls['readingsChecked'].value;    
    if (reflectionsCheckedVal == true) {
      this.readingsSec = true;
    } else {
      this.readingsSec = false;
    }
  }
  musiciansChange(field) {  
    let reflectionsCheckedVal = this.secondFormGroup.controls['musiciansChecked'].value;    
    if (reflectionsCheckedVal == true) {
      this.musiciansSec = true;
    } else {
      this.musiciansSec = false;
    }
  }
  pallbearersChange(field) {   

    let reflectionsCheckedVal = this.secondFormGroup.controls['pallbearersChecked'].value;    
    if (reflectionsCheckedVal == true) {
      this.pallbearersSec = true;
    } else {
      this.pallbearersSec = false;
    }
  }


  vtChange(eve) {
    let getVtVal = eve.value;
    if (getVtVal == 'yes') {
      this.visualTribute = true;
    } else {
      this.visualTribute = false;
    }

  }

  prepareVtChange(selectedval) {
    let getVtVal = selectedval.value;
    if (getVtVal == 'yes') {
      this.uploadDocAndLoc = true;
    } else {
      this.uploadDocAndLoc = false;
    }

  }










}
