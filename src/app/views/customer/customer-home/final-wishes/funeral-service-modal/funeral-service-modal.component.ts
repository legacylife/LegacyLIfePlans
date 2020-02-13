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
import { cloneDeep,debounce } from 'lodash';
import { FileHandlingService } from 'app/shared/services/file-handling.service';
import { funeralOptions } from '../../../../../selectList';
import { DataSharingService } from 'app/shared/services/data-sharing.service';
const URL = serverUrl + '/api/documents/funeralServices';
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
  subFolderName:string = ''
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
    this.userId = localStorage.getItem("endUserId");
    const filePath = this.userId+'/'+s3Details.funeralServicesFilePath;
    this.docPath = filePath;
    this.documentsList = [];
    this.selectAnyOneFormGroup = this._formBuilder.group({
      funaralServiceType: new FormControl('1'),
    });

    this.firstFormGroup = this._formBuilder.group({
      serviceFor: new FormControl('Friends and family'),
      otherChecked:new FormControl(''),
      serviceForOther:new FormControl(''),
      isBodyPresent: new FormControl(''),
      isCasket:new FormControl(''),
      deceasedWear:new FormControl(''),      
    });

    this.secondFormGroup = this._formBuilder.group({
      serviceParticipants:new FormControl(''),
      leaderChecked: new FormControl(false),
      leaderDescrption:new FormControl(''),

      eulogistChecked: new FormControl(false),
      eulogistdescription:new FormControl(''),     
      
      reflectionsChecked: new FormControl(false),
      reflectionsDescription: new FormControl(''),

      readingsChecked:new FormControl(false),
      readingsDescription: new FormControl(''),

      musiciansChecked:new FormControl(false),
      musiciansDescription:new FormControl(''),    
      
      pallbearersChecked: new FormControl(false),
      pallbearersDescription:new FormControl(''),

      additionalParticipants:new FormControl(''),
      servicesUsed:new FormControl(''),
      flowersUsed:new FormControl(''),

    });
    this.thirdFormGroup = this._formBuilder.group({
      isFloralArrangements:new FormControl('No'),
      needVisualTribute:new FormControl('No'),
      peopleInVisualTribute:new FormControl(''),
      havePreparedVisualTribute:new FormControl('No'),
      
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
       if(userAccess.FuneralPlansManagement!='now'){
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
          let profileIds    = this.selectedProfileId = this.funeralData._id;
        
          this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
          this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
          this.documentsList = this.funeralData.documents;
          if(this.documentsList.length>0){
            this.thirdFormGroup.controls['documents_temp'].setValue('1');
            this.documentsMissing = false; 
          }

          if (this.funeralData.serviceFor == "Other") {
            this.serviceOther = true;
          } else {
            this.serviceOther = false;
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
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId }),
      proquery: Object.assign(profileInData),
      fromId:localStorage.getItem('endUserId'),
      toId:this.toUserId,
      folderName:s3Details.funeralServicesFilePath
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

  FuneralServiceDelete(doc, name, tmName) {
    let ids = this.thirdFormGroup.controls['profileId'].value;
    var statMsg = "Are you sure you want to delete '" + name + "' file?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          this.documentsList.splice(doc, 1)
          var query = {};
          const req_vars = {
            query: Object.assign({ _id: ids }, query),
            proquery: Object.assign({ documents: this.documentsList }, query),
            fileName: Object.assign({ docName: tmName }, query),
            fromId:localStorage.getItem('endUserId'),
            toId:this.toUserId,
            folderName:s3Details.funeralServicesFilePath,
            subFolderName:this.subFolderName
          }
          this.userapi.apiRequest('post', 'documents/deletefinalwishesfuneralServicesDoc', req_vars).subscribe(result => {
            if (result.status == "error") {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            }
            if (this.documentsList.length < 1) {
              this.thirdFormGroup.controls['documents_temp'].setValue('');
              this.documentsMissing = true;
              this.invalidMessage = "Please drag your document.";
            }
          }, (err) => {
            console.error(err)
            this.loader.close();
          })
        }
      })
}

public fileOverBase = debounce((e: any) => {
  this.currentProgessinPercent = 0;
  this.hasBaseDropZoneOver = e;
  this.fileErrors = [];
  let totalItemsToBeUpload = this.uploader.queue.length,
      totalUploderFileSize = 0,
      remainingSpace = 0,
      message = ''

  if(this.uploader.isUploading || this.uploaderCopy.isUploading){
    this.snack.open('Please wait! Uploading is in process...', 'OK', { duration: 4000 })
  }else{
  this.uploader.queue.forEach((fileoOb) => {
    let filename = fileoOb.file.name;
    var extension = filename.substring(filename.lastIndexOf('.') + 1);
    var fileExts = ["jpg", "jpeg", "png", "txt", "pdf", "docx", "doc"];
    let resp = this.isExtension(extension,fileExts);
    totalUploderFileSize += fileoOb.file.size
   if(!resp){
      var FileMsg = "This file '" + filename + "' is not supported";
      this.uploader.removeFromQueue(fileoOb);
      let pushArry = {"error":FileMsg} 
      this.fileErrors.push(pushArry); 
      setTimeout(()=>{    
        this.fileErrors = []
      }, 3500);
    }
  });

  let legacyUserData = {userId: this.toUserId, userType:'customer'};
  this.fileHandlingService.checkAvailableSpace( legacyUserData, async (spaceDetails) => {
    remainingSpace = Number(spaceDetails.remainingSpace);
    message = spaceDetails.message;
    if( totalUploderFileSize > remainingSpace) {
      this.confirmService.reactivateReferEarnPopup({ message: message, status: 'notactivate' }).subscribe(res => {
        if (res) {  
        }        
      })
    } else {
      let proceedToUpload = true;
      if( message != '' ) {
        let confirmResponse = await this.confirmService.confirm({ message: message }).toPromise()
        proceedToUpload = true
      }
      if( proceedToUpload ) {         
        if(this.selectedProfileId){
          this.uploader.onBeforeUploadItem = (item) => {
            item.url = `${URL}?userId=${this.userId}&ProfileId=${this.selectedProfileId}`;
          }
        }
        if(this.uploader.getNotUploadedItems().length) {
          this.currentProgessinPercent = 1;
          this.uploaderCopy = cloneDeep(this.uploader)
          this.uploader.queue.splice(1, this.uploader.queue.length - 1)
          this.uploaderCopy.queue.splice(0, 1);
        
          this.uploader.queue.forEach((fileoOb, ind) => {
            if(this.documentsList.length < 1){  this.thirdFormGroup.controls['documents_temp'].setValue(''); }
              this.uploader.uploadItem(fileoOb);  
          });
          this.updateProgressBar();         
          this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {              
            this.getFuneralServiceDocuments();
            setTimeout(()=>{    
              this.uploader.clearQueue();
              },800);
          };
          this.uploader.onCompleteAll = () => {
            if(!this.uploaderCopy.queue.length){
              this.currentProgessinPercent = 0;
            }
          }
        }
      }
    }
  })
}
},300)

updateProgressBar(){
  let uploaderLength = 0;  let uploaderCopyLength = 0;
  if(this.currentProgessinPercent==0){
    this.uploader.onProgressItem = (progress:any) => {
      this.currentProgessinPercent = progress;
    }
  }
  this.uploader.onProgressAll = (progress:any) => {
    uploaderLength = progress;
    if(this.uploaderCopy.queue.length==0){
      this.currentProgessinPercent = uploaderLength;
    }
    this.uploaderCopy.onProgressAll = ( progress: any) => {
      uploaderCopyLength = progress;
      this.currentProgessinPercent = (uploaderLength + uploaderCopyLength)/100;
      let totalLength = uploaderLength + uploaderCopyLength;
      this.currentProgessinPercent = totalLength - 100;
    }
  }
}

uploadRemainingFiles(profileId) {    
    this.uploaderCopy.onBeforeUploadItem = (item) => {
      item.url = `${URL}?userId=${this.userId}&ProfileId=${profileId}`;
      this.thirdFormGroup.controls['documents_temp'].setValue('');         
    }
    this.uploaderCopy.queue.forEach((fileoOb, ind) => {
        this.uploaderCopy.uploadItem(fileoOb);
        
    });
    this.updateProgressBar();
    this.uploaderCopy.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      this.uploaderCopy.removeFromQueue(item);
      this.getFuneralServiceDocuments({}, false, false);   
    };

    this.uploaderCopy.onCompleteAll = () => {
      setTimeout(()=>{    
        this.getFuneralServiceDocuments();
        },5000);
    }
}

getFuneralServiceDocuments = (query = {}, search = false, uploadRemained = true) => {     
    let profileIds = this.thirdFormGroup.controls['profileId'].value;
    let req_vars = {
      query: Object.assign({customerId: this.userId,status:"Pending" }),
      fields:{_id:1,documents:1}
    }
    if(profileIds){
       req_vars = {
        query: Object.assign({ _id:profileIds }),
        fields:{_id:1,documents:1}
      }
    }    
    this.userapi.apiRequest('post', 'finalwishes/view-funeral-plan-details', req_vars).subscribe(result => {
      if (result.status == "error") {
      } else {
        if(result.data){
          profileIds = this.selectedProfileId = result.data._id;
          this.thirdFormGroup.controls['profileId'].setValue(profileIds);
          if(uploadRemained) {
            this.uploadRemainingFiles(profileIds)
          }

          this.documentsList = result.data.documents;    
          this.thirdFormGroup.controls['documents_temp'].setValue('');
          if(this.documentsList.length>0){
            this.thirdFormGroup.controls['documents_temp'].setValue('1');
            this.documentsMissing = false;
          }     
          if(this.currentProgessinPercent==100){
            this.currentProgessinPercent = 0;
          }            
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

downloadFile = (filename) => {    
  let query = {};
  let req_vars = {
    query: Object.assign({ docPath: this.docPath, filename: filename }, query),
    fromId:localStorage.getItem('endUserId'),
    toId:this.toUserId,
    folderName:s3Details.funeralServicesFilePath,
    subFolderName:this.subFolderName
  }
  this.snack.open("Downloading file is in process, Please wait some time!", 'OK');
  this.userapi.download('documents/downloadDocument', req_vars).subscribe(res => {
    var newBlob = new Blob([res])
    var downloadURL = window.URL.createObjectURL(newBlob);
    let filePath = downloadURL;
    var link=document.createElement('a');
    link.href = filePath;
    link.download = filename;
    document.body.appendChild(link);
    link.click();this.snack.dismiss();
  });
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
      this.PlanFormSubmit(this.selectAnyOneFormGroup.value,this.firstFormGroup.value,this.secondFormGroup.value,this.thirdFormGroup.value)
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

    if (field == "otherChecked") {
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
    if (getVtVal == 'Yes') {
      this.visualTribute = true;
    } else {
      this.visualTribute = false;
    }

  }

  prepareVtChange(selectedval) {
    let getVtVal = selectedval.value;
    if (getVtVal == 'Yes') {
      this.uploadDocAndLoc = true;
    } else {
      this.uploadDocAndLoc = false;
    }

  }

  firstCapitalize(e) {
    let re = /(^|[.!?]\s+)([a-z])/g;
    var textBox: HTMLInputElement = <HTMLInputElement>e.target;
    textBox.value = textBox.value.replace(re, (m, $1, $2) => $1 + $2.toUpperCase());
  }
  
}
