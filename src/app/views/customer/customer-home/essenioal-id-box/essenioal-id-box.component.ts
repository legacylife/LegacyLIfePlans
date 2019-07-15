import { Component, OnInit } from '@angular/core';
import { APIService } from './../../../../api.service';
import { UserAPIService } from './../../../../userapi.service';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';

import { AppConfirmService } from '../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { documentTypes } from '../../../../selectList';
import { FileUploader } from 'ng2-file-upload';
import { serverUrl, s3Details } from '../../../../config';
import { states } from '../../../../state';
import { cloneDeep } from 'lodash'
import { controlNameBinding } from '@angular/forms/src/directives/reactive_directives/form_control_name';
const URL = serverUrl + '/api/documents/myEssentialsID';

@Component({
  selector: 'app-essenioal-id-box',
  templateUrl: './essenioal-id-box.component.html',
  styleUrls: ['./essenioal-id-box.component.scss']
})
export class EssenioalIdBoxComponent implements OnInit {
  //selected = 'option1';
  userId = localStorage.getItem("endUserId");
  public uploader: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
  public uploaderCopy: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
  public hasBaseDropZoneOver: boolean = false;
  public hasAnotherDropZoneOver: boolean = false;
  advisorDocumentsHide = false;
  invalidMessage: string;
  advisorDocumentsMissing: boolean = false;
  IDForm: FormGroup;
  documentTypeList: any[] = documentTypes;
  idProofDocumentsList: any;
  idProofDocumentsMissing = false;
  idProofDocuments_temps = false;
  fileErrors: any;
  stateList: any;
  docPath: string;
  typeOne: boolean = false;
  typeOneTwo: boolean = false;
  typeOneTwoSixSeven: boolean = false;
  typeThree: boolean = false;
  typeTwo: boolean = false;
  typeFour: boolean = false;
  typeFive: boolean = false;
  typeSix: boolean = false;
  typeSeven: boolean = false;
  typeSixSeven: boolean = false;
  essentialIDList:any = [];
  showIDListingCnt:any;
  profileIdHiddenVal:boolean = false;
  selectedProfileId: string;
  constructor(private snack: MatSnackBar,public dialog: MatDialog, private fb: FormBuilder, 
    private confirmService: AppConfirmService,private loader: AppLoaderService, private router: Router,
    private userapi: UserAPIService  ) 
  { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
   
    const filePath = this.userId+'/'+s3Details.myEssentialsDocumentsPath;
    this.docPath = filePath; 
    this.stateList = states.sort();
    this.IDForm = this.fb.group({
      documentType: new FormControl('',Validators.required),
      socialSecurityNumber: new FormControl(''),
      locationSocialSecurityCard: new FormControl(''),
      licenseNumber: new FormControl(''),
      nonDriverIDNumber: new FormControl(''),
      DoDIDNumber: new FormControl(''),
      placeOfBirth: new FormControl(''),
      countryOfIssue: new FormControl(''),
      DBN: new FormControl(''),
      fileNumber: new FormControl(''),
      state: new FormControl(''),
      passportNumber: new FormControl(''),
      locationDriverLicense: new FormControl(''),
      locationDoDID: new FormControl(''),
      expirationDate: new FormControl(''),
      locationPassport: new FormControl(''),
      LocationWorkPermitVisa: new FormControl(''),  
      idProofDocuments_temp: new FormControl('',Validators.required),
      comments: new FormControl(''), 
      profileId: new FormControl('')
     });
     this.idProofDocumentsList = [];

     const locationArray = location.href.split('/')
     this.selectedProfileId = locationArray[locationArray.length - 1];

    if(this.selectedProfileId && this.selectedProfileId == 'essential-day-one'){
      this.selectedProfileId = "";   
    }
    
     this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${this.selectedProfileId}` });
     this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${this.selectedProfileId}` });

     this.getEssentialIdView();
    }

    onChangeDocumentType(key) {
      this.typeOne = false;//licenseNumber  state expirationDate  locationDriverLicense
      this.typeOneTwo = false; // state expirationDate locationDriverLicense
      this.typeOneTwoSixSeven = false;//expirationDate
      this.typeThree = false;//locationDoDID DoDIDNumber  DBN
      this.typeTwo = false; //nonDriverIDNumber state expirationDate
      this.typeFour = false;//placeOfBirth  fileNumber
      this.typeFive = false;//socialSecurityNumber  locationSocialSecurityCard
      this.typeSix = false;//countryOfIssue expirationDate  locationPassport
      this.typeSeven = false;//countryOfIssue expirationDate  LocationWorkPermitVisa
      this.typeSixSeven = false;
    let idProofDocuments_tempss = '';
    if(this.IDForm.controls['idProofDocuments_temp'].value=='1'){
      idProofDocuments_tempss = '1'; 
    }
    if(idProofDocuments_tempss=='1'){
      this.IDForm.controls['idProofDocuments_temp'].setValue('1');
      }

    this.IDForm = this.fb.group({
      documentType: new FormControl(this.IDForm.controls['documentType'].value,Validators.required),
      socialSecurityNumber: new FormControl(this.IDForm.controls['socialSecurityNumber'].value,),
      locationSocialSecurityCard: new FormControl(this.IDForm.controls['locationSocialSecurityCard'].value,),
      licenseNumber: new FormControl(this.IDForm.controls['licenseNumber'].value,),
      nonDriverIDNumber: new FormControl(this.IDForm.controls['nonDriverIDNumber'].value,),
      DoDIDNumber: new FormControl(this.IDForm.controls['DoDIDNumber'].value,),
      placeOfBirth: new FormControl(this.IDForm.controls['placeOfBirth'].value,),
      countryOfIssue: new FormControl(this.IDForm.controls['countryOfIssue'].value,),
      DBN: new FormControl(this.IDForm.controls['DBN'].value,),
      fileNumber: new FormControl(this.IDForm.controls['fileNumber'].value,),
      state: new FormControl(this.IDForm.controls['state'].value,),
      passportNumber: new FormControl(this.IDForm.controls['passportNumber'].value,),
      locationDriverLicense: new FormControl(this.IDForm.controls['locationDriverLicense'].value,),
      locationDoDID: new FormControl(this.IDForm.controls['locationDoDID'].value,),
      expirationDate: new FormControl(this.IDForm.controls['expirationDate'].value,),
      locationPassport: new FormControl(this.IDForm.controls['locationPassport'].value,),
      LocationWorkPermitVisa: new FormControl(this.IDForm.controls['LocationWorkPermitVisa'].value,),  
      comments: new FormControl(this.IDForm.controls['comments'].value), 
      profileId: new FormControl(this.IDForm.controls['profileId'].value,),
      idProofDocuments_temp: new FormControl(idProofDocuments_tempss,Validators.required)      
     });

     this.IDForm.controls['comments'].clearValidators()
     this.IDForm.controls['comments'].updateValueAndValidity()

     if(idProofDocuments_tempss=='1'){
      this.IDForm.controls['idProofDocuments_temp'].setValue('1');
      }

      if(key==1){  
        this.typeOne = true;      
        this.typeOneTwo = true;      
        this.typeOneTwoSixSeven = true;      
        // this.IDForm.controls['licenseNumber'] = new FormControl(this.IDForm.controls['licenseNumber'].value,Validators.required);
        // this.IDForm.controls['state'] = new FormControl(this.IDForm.controls['state'].value,Validators.required);
        // this.IDForm.controls['expirationDate'] = new FormControl(this.IDForm.controls['expirationDate'].value,Validators.required);
        // this.IDForm.controls['locationDriverLicense'] = new FormControl(this.IDForm.controls['locationDriverLicense'].value,Validators.required);
        this.IDForm = this.fb.group({
          documentType: new FormControl(this.IDForm.controls['documentType'].value,Validators.required),
          socialSecurityNumber: new FormControl(this.IDForm.controls['socialSecurityNumber'].value,),
          locationSocialSecurityCard: new FormControl(this.IDForm.controls['locationSocialSecurityCard'].value,),
          licenseNumber: new FormControl(this.IDForm.controls['licenseNumber'].value,Validators.required),
          nonDriverIDNumber: new FormControl(this.IDForm.controls['nonDriverIDNumber'].value,),
          DoDIDNumber: new FormControl(this.IDForm.controls['DoDIDNumber'].value,),
          placeOfBirth: new FormControl(this.IDForm.controls['placeOfBirth'].value,),
          countryOfIssue: new FormControl(this.IDForm.controls['countryOfIssue'].value,),
          DBN: new FormControl(this.IDForm.controls['DBN'].value,),
          fileNumber: new FormControl(this.IDForm.controls['fileNumber'].value,),
          state: new FormControl(this.IDForm.controls['state'].value,Validators.required),
          passportNumber: new FormControl(this.IDForm.controls['passportNumber'].value,),
          locationDriverLicense: new FormControl(this.IDForm.controls['locationDriverLicense'].value,Validators.required),
          locationDoDID: new FormControl(this.IDForm.controls['locationDoDID'].value,),
          expirationDate: new FormControl(this.IDForm.controls['expirationDate'].value,Validators.required),
          locationPassport: new FormControl(this.IDForm.controls['locationPassport'].value,),
          LocationWorkPermitVisa: new FormControl(this.IDForm.controls['LocationWorkPermitVisa'].value,),  
          comments: new FormControl(this.IDForm.controls['comments'].value), 
          profileId: new FormControl(this.IDForm.controls['profileId'].value,),
          idProofDocuments_temp: new FormControl(idProofDocuments_tempss,Validators.required)      
         });
         
      }else if(key==2){  
        this.typeTwo = true;      
        this.typeOneTwo = true;      
        this.typeOneTwoSixSeven = true;
        // this.IDForm.controls['state'] = new FormControl(this.IDForm.controls['state'].value,Validators.required);
        // this.IDForm.controls['nonDriverIDNumber'] = new FormControl(this.IDForm.controls['nonDriverIDNumber'].value,Validators.required);
        // this.IDForm.controls['expirationDate'] = new FormControl(this.IDForm.controls['expirationDate'].value,Validators.required);
        // this.IDForm.controls['locationDriverLicense'] = new FormControl(this.IDForm.controls['locationDriverLicense'].value,Validators.required);
        this.IDForm = this.fb.group({
          documentType: new FormControl(this.IDForm.controls['documentType'].value,Validators.required),
          socialSecurityNumber: new FormControl(this.IDForm.controls['socialSecurityNumber'].value,),
          locationSocialSecurityCard: new FormControl(this.IDForm.controls['locationSocialSecurityCard'].value,),
          licenseNumber: new FormControl(this.IDForm.controls['licenseNumber'].value,),
          nonDriverIDNumber: new FormControl(this.IDForm.controls['nonDriverIDNumber'].value,Validators.required),
          DoDIDNumber: new FormControl(this.IDForm.controls['DoDIDNumber'].value,),
          placeOfBirth: new FormControl(this.IDForm.controls['placeOfBirth'].value,),
          countryOfIssue: new FormControl(this.IDForm.controls['countryOfIssue'].value,),
          DBN: new FormControl(this.IDForm.controls['DBN'].value,),
          fileNumber: new FormControl(this.IDForm.controls['fileNumber'].value,),
          state: new FormControl(this.IDForm.controls['state'].value,Validators.required),
          passportNumber: new FormControl(this.IDForm.controls['passportNumber'].value,),
          locationDriverLicense: new FormControl(this.IDForm.controls['locationDriverLicense'].value,Validators.required),
          locationDoDID: new FormControl(this.IDForm.controls['locationDoDID'].value,),
          expirationDate: new FormControl(this.IDForm.controls['expirationDate'].value,Validators.required),
          locationPassport: new FormControl(this.IDForm.controls['locationPassport'].value,),
          LocationWorkPermitVisa: new FormControl(this.IDForm.controls['LocationWorkPermitVisa'].value,),  
          comments: new FormControl(this.IDForm.controls['comments'].value), 
          profileId: new FormControl(this.IDForm.controls['profileId'].value,),
          idProofDocuments_temp: new FormControl(idProofDocuments_tempss,Validators.required)      
         });
      }else if(key==3){  
        this.typeThree = true;              
        // this.IDForm.controls['locationDoDID'] = new FormControl(this.IDForm.controls['locationDoDID'].value,Validators.required);
        // this.IDForm.controls['DoDIDNumber'] = new FormControl(this.IDForm.controls['DoDIDNumber'].value,Validators.required);
        // this.IDForm.controls['DBN'] = new FormControl(this.IDForm.controls['DBN'].value,Validators.required);
        this.IDForm = this.fb.group({
          documentType: new FormControl(this.IDForm.controls['documentType'].value,Validators.required),
          socialSecurityNumber: new FormControl(this.IDForm.controls['socialSecurityNumber'].value,),
          locationSocialSecurityCard: new FormControl(this.IDForm.controls['locationSocialSecurityCard'].value,),
          licenseNumber: new FormControl(this.IDForm.controls['licenseNumber'].value,),
          nonDriverIDNumber: new FormControl(this.IDForm.controls['nonDriverIDNumber'].value,),
          DoDIDNumber: new FormControl(this.IDForm.controls['DoDIDNumber'].value,Validators.required),
          placeOfBirth: new FormControl(this.IDForm.controls['placeOfBirth'].value,),
          countryOfIssue: new FormControl(this.IDForm.controls['countryOfIssue'].value,),
          DBN: new FormControl(this.IDForm.controls['DBN'].value,Validators.required),
          fileNumber: new FormControl(this.IDForm.controls['fileNumber'].value,),
          state: new FormControl(this.IDForm.controls['state'].value,),
          passportNumber: new FormControl(this.IDForm.controls['passportNumber'].value,),
          locationDriverLicense: new FormControl(this.IDForm.controls['locationDriverLicense'].value,),
          locationDoDID: new FormControl(this.IDForm.controls['locationDoDID'].value,Validators.required),
          expirationDate: new FormControl(this.IDForm.controls['expirationDate'].value,),
          locationPassport: new FormControl(this.IDForm.controls['locationPassport'].value,),
          LocationWorkPermitVisa: new FormControl(this.IDForm.controls['LocationWorkPermitVisa'].value,),  
          comments: new FormControl(this.IDForm.controls['comments'].value), 
          profileId: new FormControl(this.IDForm.controls['profileId'].value,),
          idProofDocuments_temp: new FormControl(idProofDocuments_tempss,Validators.required)      
         });
      }else if(key==4){            
        this.typeFour = true;                    
        this.IDForm = this.fb.group({
          documentType: new FormControl(this.IDForm.controls['documentType'].value,Validators.required),
          socialSecurityNumber: new FormControl(this.IDForm.controls['socialSecurityNumber'].value,),
          locationSocialSecurityCard: new FormControl(this.IDForm.controls['locationSocialSecurityCard'].value,),
          licenseNumber: new FormControl(this.IDForm.controls['licenseNumber'].value,),
          nonDriverIDNumber: new FormControl(this.IDForm.controls['nonDriverIDNumber'].value,),
          DoDIDNumber: new FormControl(this.IDForm.controls['DoDIDNumber'].value,),
          placeOfBirth: new FormControl(this.IDForm.controls['placeOfBirth'].value,Validators.required),
          countryOfIssue: new FormControl(this.IDForm.controls['countryOfIssue'].value,),
          DBN: new FormControl(this.IDForm.controls['DBN'].value,),
          fileNumber: new FormControl(this.IDForm.controls['fileNumber'].value,Validators.required),
          state: new FormControl(this.IDForm.controls['state'].value,),
          passportNumber: new FormControl(this.IDForm.controls['passportNumber'].value,),
          locationDriverLicense: new FormControl(this.IDForm.controls['locationDriverLicense'].value,),
          locationDoDID: new FormControl(this.IDForm.controls['locationDoDID'].value,),
          expirationDate: new FormControl(this.IDForm.controls['expirationDate'].value,),
          locationPassport: new FormControl(this.IDForm.controls['locationPassport'].value,),
          LocationWorkPermitVisa: new FormControl(this.IDForm.controls['LocationWorkPermitVisa'].value,),  
          comments: new FormControl(this.IDForm.controls['comments'].value), 
          profileId: new FormControl(this.IDForm.controls['profileId'].value,),
          idProofDocuments_temp: new FormControl(idProofDocuments_tempss,Validators.required)      
         });
        }else if(key==5){     
        this.typeFive = true;             
        this.IDForm = this.fb.group({
          documentType: new FormControl(this.IDForm.controls['documentType'].value,Validators.required),
          socialSecurityNumber: new FormControl(this.IDForm.controls['socialSecurityNumber'].value,Validators.required),
          locationSocialSecurityCard: new FormControl(this.IDForm.controls['locationSocialSecurityCard'].value,Validators.required),
          licenseNumber: new FormControl(this.IDForm.controls['licenseNumber'].value,),
          nonDriverIDNumber: new FormControl(this.IDForm.controls['nonDriverIDNumber'].value,),
          DoDIDNumber: new FormControl(this.IDForm.controls['DoDIDNumber'].value,),
          placeOfBirth: new FormControl(this.IDForm.controls['placeOfBirth'].value,),
          countryOfIssue: new FormControl(this.IDForm.controls['countryOfIssue'].value,),
          DBN: new FormControl(this.IDForm.controls['DBN'].value,),
          fileNumber: new FormControl(this.IDForm.controls['fileNumber'].value,),
          state: new FormControl(this.IDForm.controls['state'].value,),
          passportNumber: new FormControl(this.IDForm.controls['passportNumber'].value,),
          locationDriverLicense: new FormControl(this.IDForm.controls['locationDriverLicense'].value,),
          locationDoDID: new FormControl(this.IDForm.controls['locationDoDID'].value,),
          expirationDate: new FormControl(this.IDForm.controls['expirationDate'].value,),
          locationPassport: new FormControl(this.IDForm.controls['locationPassport'].value,),
          LocationWorkPermitVisa: new FormControl(this.IDForm.controls['LocationWorkPermitVisa'].value,),  
          comments: new FormControl(this.IDForm.controls['comments'].value), 
          profileId: new FormControl(this.IDForm.controls['profileId'].value,),
          idProofDocuments_temp: new FormControl(idProofDocuments_tempss,Validators.required)      
         });
      }else if(key==6){  
        this.typeSix = true;  
        this.typeOneTwoSixSeven = true;         
        this.typeSixSeven = true;        
        this.IDForm = this.fb.group({
          documentType: new FormControl(this.IDForm.controls['documentType'].value,Validators.required),
          socialSecurityNumber: new FormControl(this.IDForm.controls['socialSecurityNumber'].value,),
          locationSocialSecurityCard: new FormControl(this.IDForm.controls['locationSocialSecurityCard'].value,),
          licenseNumber: new FormControl(this.IDForm.controls['licenseNumber'].value,),
          nonDriverIDNumber: new FormControl(this.IDForm.controls['nonDriverIDNumber'].value,),
          DoDIDNumber: new FormControl(this.IDForm.controls['DoDIDNumber'].value,),
          placeOfBirth: new FormControl(this.IDForm.controls['placeOfBirth'].value,),
          countryOfIssue: new FormControl(this.IDForm.controls['countryOfIssue'].value,Validators.required),
          DBN: new FormControl(this.IDForm.controls['DBN'].value,),
          fileNumber: new FormControl(this.IDForm.controls['fileNumber'].value,),
          state: new FormControl(this.IDForm.controls['state'].value,),
          passportNumber: new FormControl(this.IDForm.controls['passportNumber'].value,),
          locationDriverLicense: new FormControl(this.IDForm.controls['locationDriverLicense'].value,),
          locationDoDID: new FormControl(this.IDForm.controls['locationDoDID'].value,),
          expirationDate: new FormControl(this.IDForm.controls['expirationDate'].value,Validators.required),
          locationPassport: new FormControl(this.IDForm.controls['locationPassport'].value,Validators.required),
          LocationWorkPermitVisa: new FormControl(this.IDForm.controls['LocationWorkPermitVisa'].value,),  
          comments: new FormControl(this.IDForm.controls['comments'].value), 
          profileId: new FormControl(this.IDForm.controls['profileId'].value,),
          idProofDocuments_temp: new FormControl(idProofDocuments_tempss,Validators.required)      
         });
      }else if(key==7){  
        this.typeSeven = true;     
        this.typeOneTwoSixSeven = true;     
        this.typeSixSeven = true;         
        this.IDForm = this.fb.group({
          documentType: new FormControl(this.IDForm.controls['documentType'].value,Validators.required),
          socialSecurityNumber: new FormControl(this.IDForm.controls['socialSecurityNumber'].value,),
          locationSocialSecurityCard: new FormControl(this.IDForm.controls['locationSocialSecurityCard'].value,),
          licenseNumber: new FormControl(this.IDForm.controls['licenseNumber'].value,),
          nonDriverIDNumber: new FormControl(this.IDForm.controls['nonDriverIDNumber'].value,),
          DoDIDNumber: new FormControl(this.IDForm.controls['DoDIDNumber'].value,),
          placeOfBirth: new FormControl(this.IDForm.controls['placeOfBirth'].value,),
          countryOfIssue: new FormControl(this.IDForm.controls['countryOfIssue'].value,Validators.required),
          DBN: new FormControl(this.IDForm.controls['DBN'].value,),
          fileNumber: new FormControl(this.IDForm.controls['fileNumber'].value,),
          state: new FormControl(this.IDForm.controls['state'].value,),
          passportNumber: new FormControl(this.IDForm.controls['passportNumber'].value,),
          locationDriverLicense: new FormControl(this.IDForm.controls['locationDriverLicense'].value,),
          locationDoDID: new FormControl(this.IDForm.controls['locationDoDID'].value,),
          expirationDate: new FormControl(this.IDForm.controls['expirationDate'].value,Validators.required),
          locationPassport: new FormControl(this.IDForm.controls['locationPassport'].value,),
          LocationWorkPermitVisa: new FormControl(this.IDForm.controls['LocationWorkPermitVisa'].value,Validators.required),  
          comments: new FormControl(this.IDForm.controls['comments'].value), 
          profileId: new FormControl(this.IDForm.controls['profileId'].value,),
          idProofDocuments_temp: new FormControl(idProofDocuments_tempss,Validators.required)      
         });
      }
      if(idProofDocuments_tempss=='1'){
        this.IDForm.controls['idProofDocuments_temp'].setValue('1');
      }
//      this.IDForm.updateValueAndValidity();
  }

  IdFormSubmit(profileInData = null) {
      var query = {};
      var proquery = {};     
      
      let profileIds = this.IDForm.controls['profileId'].value;
      if(profileIds){
        this.selectedProfileId = profileIds;
      }
      const req_vars = {
        query: Object.assign({ _id: this.selectedProfileId  }),
        proquery: Object.assign(profileInData),   
        from: Object.assign({ customerId: this.userId }) 
      }

      this.loader.open();     
      this.userapi.apiRequest('post', 'customer/essentials-id-form-submit', req_vars).subscribe(result => {
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
  
    getEssentialIdView = (query = {}, search = false) => { 
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
      this.userapi.apiRequest('post', 'customer/view-id-details', req_vars).subscribe(result => {
        this.loader.close();
        if (result.status == "error") {
          console.log(result.data)
        } else {
          if(result.data){    
            this.essentialIDList = result.data;                    
            let profileIds = this.essentialIDList._id;
            this.IDForm.controls['profileId'].setValue(profileIds);
            this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
            this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });

            this.idProofDocumentsList = result.data.idProofDocuments;
            if(this.essentialIDList.idProofDocuments.length>0){
              this.IDForm.controls['idProofDocuments_temp'].setValue('1');
            }
            this.IDForm.controls['documentType'].setValue(this.essentialIDList.documentType);
            if(this.essentialIDList.documentType){
              this.onChangeDocumentType(this.essentialIDList.documentType);
            }
            
            this.IDForm.controls['socialSecurityNumber'].setValue(this.essentialIDList.socialSecurityNumber);
            this.IDForm.controls['locationSocialSecurityCard'].setValue(this.essentialIDList.locationSocialSecurityCard);
            this.IDForm.controls['state'].setValue(this.essentialIDList.state);
            this.IDForm.controls['licenseNumber'].setValue(this.essentialIDList.licenseNumber);
            this.IDForm.controls['nonDriverIDNumber'].setValue(this.essentialIDList.nonDriverIDNumber);
            this.IDForm.controls['DoDIDNumber'].setValue(this.essentialIDList.DoDIDNumber);
            this.IDForm.controls['placeOfBirth'].setValue(this.essentialIDList.placeOfBirth);
            this.IDForm.controls['countryOfIssue'].setValue(this.essentialIDList.countryOfIssue);
            this.IDForm.controls['DBN'].setValue(this.essentialIDList.DBN);
            this.IDForm.controls['fileNumber'].setValue(this.essentialIDList.fileNumber);
            this.IDForm.controls['passportNumber'].setValue(this.essentialIDList.passportNumber);
            this.IDForm.controls['locationDriverLicense'].setValue(this.essentialIDList.locationDriverLicense);
            this.IDForm.controls['locationDoDID'].setValue(this.essentialIDList.locationDoDID); 
            this.IDForm.controls['expirationDate'].setValue(this.essentialIDList.expirationDate);
            this.IDForm.controls['locationPassport'].setValue(this.essentialIDList.locationPassport);
            this.IDForm.controls['LocationWorkPermitVisa'].setValue(this.essentialIDList.LocationWorkPermitVisa); 
            this.IDForm.controls['comments'].setValue(this.essentialIDList.comments);
          }       
        }
      }, (err) => {
        console.error(err);
      })
  }  

  IDDelete(doc, name, tmName) {
      let ids = this.IDForm.controls['profileId'].value;
      var statMsg = "Are you sure you want to delete '" + name + "' file?"
      this.confirmService.confirm({ message: statMsg })
        .subscribe(res => {
          if (res) {
            this.loader.open();
            this.idProofDocumentsList.splice(doc, 1)
            var query = {};
            const req_vars = {
              query: Object.assign({ _id: ids }, query),
              proquery: Object.assign({ idProofDocuments: this.idProofDocumentsList }, query),
              fileName: Object.assign({ docName: tmName }, query)
            }
            this.userapi.apiRequest('post', 'documents/deleteIdDoc', req_vars).subscribe(result => {
              if (result.status == "error") {
                this.loader.close();
                this.snack.open(result.data.message, 'OK', { duration: 4000 })
              } else {
                if(this.idProofDocumentsList.length<1){
                  this.IDForm.controls['idProofDocuments_temp'].setValue('');
                }  
                this.loader.close();
                this.snack.open(result.data.message, 'OK', { duration: 4000 })
              }
            }, (err) => {
              console.error(err)
              this.loader.close();
            })
          }
        })
  }

  public fileOverBase(e: any): void {
      this.hasBaseDropZoneOver = e;
      this.fileErrors = [];
      this.uploader.queue.forEach((fileoOb) => {
        let filename = fileoOb.file.name;
        var extension = filename.substring(filename.lastIndexOf('.') + 1);
        var fileExts = ["jpg", "jpeg", "png", "txt", "pdf", "docx", "doc"];
        let resp = this.isExtension(extension,fileExts);
        if(!resp){
          var FileMsg = "This file '" + filename + "' is not supported";
          this.uploader.removeFromQueue(fileoOb);
          let pushArry = {"error":FileMsg} 
          this.fileErrors.push(pushArry); 
          setTimeout(()=>{    
            this.fileErrors = []
          }, 5000);
      
        }
      });
  
      // if(this.uploader.getNotUploadedItems().length){
      //   this.uploader.uploadAll();
      //   this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      //     this.getIdDocuments();
      //   };
      // }

      if(this.uploader.getNotUploadedItems().length){
        this.uploaderCopy = cloneDeep(this.uploader)
        this.uploader.queue.splice(1, this.uploader.queue.length - 1)
        this.uploaderCopy.queue.splice(0, 1)
        
        this.uploader.queue.forEach((fileoOb, ind) => {
              this.uploader.uploadItem(fileoOb);
         });
   
         this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
           this.getIdDocuments();
         };
       }
    }

    uploadRemainingFiles(profileId) {
      this.uploaderCopy.onBeforeUploadItem = (item) => {
        item.url = `${URL}?userId=${this.userId}&ProfileId=${profileId}`;
      }
      this.uploaderCopy.queue.forEach((fileoOb, ind) => {
          this.uploaderCopy.uploadItem(fileoOb);
      });
  
      this.uploaderCopy.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
        this.getIdDocuments({}, false, false);
      
      };
    }

    getIdDocuments = (query = {}, search = false, uploadRemained = true) => {     
      let profileIds = this.IDForm.controls['profileId'].value;
      let req_vars = {
        query: Object.assign({customerId: this.userId,status:"Pending" }),
        fields:{_id:1,idProofDocuments:1}
      }
      if(profileIds){
         req_vars = {
          query: Object.assign({ _id:profileIds, customerId: this.userId  }),
          fields:{_id:1,idProofDocuments:1}
        }
      }    
      this.userapi.apiRequest('post', 'customer/view-id-details', req_vars).subscribe(result => {
        if (result.status == "error") {
        } else {
          profileIds = result.data._id;
          this.IDForm.controls['profileId'].setValue(profileIds);
          if(uploadRemained) {
            this.uploadRemainingFiles(profileIds)
          }

          this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
          this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });

          this.idProofDocumentsList = result.data.idProofDocuments;
          if(result.data.idProofDocuments.length>0){
            this.IDForm.controls['idProofDocuments_temp'].setValue('1');
          }         
        }
      }, (err) => {
        console.error(err);
      })
    }
  
   isExtension(ext, extnArray) {
    var result = false;
    var i;
    if (ext) {
        ext = ext.toLowerCase();
        for (i = 0; i < extnArray.length; i++) {
            if (extnArray[i].toLowerCase() === ext) {
                result = true;
                break;
            }
        }
    }
    return result;
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
  

  downloadFile = (filename) => {    
    let query = {};
    let req_vars = {
      query: Object.assign({ docPath: this.docPath, filename: filename }, query)
    }
    this.userapi.download('documents/downloadDocument', req_vars).subscribe(res => {
      window.open(window.URL.createObjectURL(res));
      let filePath = s3Details.url+'/'+this.docPath+filename;
      var link=document.createElement('a');
      link.href = filePath;
      link.download = filePath.substr(filePath.lastIndexOf('/') + 1);
      link.click();
    });
  }

}