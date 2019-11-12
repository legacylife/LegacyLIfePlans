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

  selectAnyOneFormGroup: FormGroup;

  constructor(private _formBuilder: FormBuilder, private snack: MatSnackBar, public dialog: MatDialog, private confirmService: AppConfirmService, private loader: AppLoaderService, private router: Router, private userapi: UserAPIService, private fileHandlingService: FileHandlingService) { }
  public uploader: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
  public uploaderCopy: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });

  ngOnInit() {
    this.selectAnyOneFormGroup = this._formBuilder.group({
      funaralServiceType: [''],
      profileId:['']
    });

    this.firstFormGroup = this._formBuilder.group({
      serviceFor: [''],
      otherChecked:[],
      serviceForOther:[''],
      isBodyPresent: [''],
      isCasket:[''],
      deceasedWear:['']      
    });

    this.secondFormGroup = this._formBuilder.group({
      serviceParticipants:[''],
      leaderChecked: [''],
      leaderDescrption:[''],

      eulogistChecked: [''],
      eulogistdescription:[''],      
      
      reflectionsChecked: [''],
      reflectionsDescription: [''],

      readingsChecked:[''],
      readingsDescription: [''],

      musiciansChecked:[''],
      musiciansDescription:[''],      
      
      pallbearersChecked: [''],
      pallbearersDescription:[''],

      additionalParticipants:[''],
      servicesUsed:[''],
      flowersUsed:['']

    });
    this.thirdFormGroup = this._formBuilder.group({
      isFloralArrangements:[''],
      needVisualTribute:[''],
      peopleInVisualTribute:[''],
      havePreparedVisualTribute:[''],
      documents:[''],
      locationOfDocuments:[''],
      additionalPlans:['']
    });

    this.urlData = this.userapi.getURLData();
    this.selectedProfileId = this.urlData.lastOne;
    if (this.selectedProfileId && this.selectedProfileId == 'essential-day-one' && this.urlData.lastThird != "legacies") {
      this.selectedProfileId = "";
    }

    if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'essential-day-one') {
      this.customerLegaciesId = this.userId;
      this.customerLegacyType = this.urlData.userType;
      this.userId = this.urlData.lastOne;
      this.userapi.getUserAccess(this.userId, (userAccess, userDeathFilesCnt, userLockoutPeriod, userDeceased) => {
        if (userLockoutPeriod || userDeceased) {
          this.trusteeLegaciesAction = false;
        }
        if (userAccess.MyProfessionalsManagement != 'now') {
          this.trusteeLegaciesAction = false;
        }
      });
      this.selectedProfileId = "";
    }

    if (this.selectedProfileId) {
      this.selectAnyOneFormGroup.controls['profileId'].setValue(this.selectedProfileId);
      //this.getProfessionalDetails();
    }

  }

  PlanFormSubmit(selectAnyOneData,stepOneData,stepTwoData,stepThreeData){


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

    var query = {};
    var proquery = {};     
  
    let profileIds = this.selectAnyOneFormGroup.controls['profileId'].value;
    if(profileIds){
      this.selectedProfileId = profileIds;
    }
    /*if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'final-wishes') {
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
    this.userapi.apiRequest('post', 'finalwishes/funeral-plans-form-submit', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      } else {
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
        this.dialog.closeAll(); 
      }
    }, (err) => {
      console.error(err)
    })*/

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
