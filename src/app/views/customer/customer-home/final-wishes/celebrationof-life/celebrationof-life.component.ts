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
import { DataSharingService } from 'app/shared/services/data-sharing.service';
const URL = serverUrl + '/api/documents/celebrationofLife';

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
  subFolderName:string = ''
  isSpeaker:boolean = false;

  constructor(private _formBuilder: FormBuilder,private snack: MatSnackBar,public dialog: MatDialog,  private confirmService: AppConfirmService, private loader: AppLoaderService, private router: Router, private userapi: UserAPIService,private fileHandlingService: FileHandlingService,private sharedata: DataSharingService) { }
  public uploader: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
  public uploaderCopy: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });

  ngOnInit() {
    const filePath = this.userId+'/'+s3Details.celebrationofLifeFilePath;
    this.docPath = filePath;
    this.documentsList = [];
    this.celebrationFormGroup = this._formBuilder.group({
      eventByName: new FormControl('',Validators.required),
      eventPlace: new FormControl('',Validators.required),
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
        this.sharedata.shareLegacyDeathfileCountData(userDeathFilesCnt);
       if(userAccess.CelebrationLifeManagement!='now'){
        this.trusteeLegaciesAction = false;
       }           
       });   
      this.selectedProfileId = "";        
    }
    this.toUserId = this.userId;
    this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${this.selectedProfileId}` });
    this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${this.selectedProfileId}` });
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


  documentDelete(doc, name, tmName) {
    let ids = this.celebrationFormGroup.controls['profileId'].value;
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
            folderName:s3Details.celebrationofLifeFilePath,
          }
          this.userapi.apiRequest('post', 'documents/deletefinalwishesCelebrationDoc', req_vars).subscribe(result => {
            if (result.status == "error") {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            }
            if (this.documentsList.length < 1) {
              this.celebrationFormGroup.controls['documents_temp'].setValue('');
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

public fileOverBase(e: any): void {
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
          this.uploaderCopy = cloneDeep(this.uploader)
          this.uploader.queue.splice(1, this.uploader.queue.length - 1)
          this.uploaderCopy.queue.splice(0, 1);
       
          this.uploader.queue.forEach((fileoOb, ind) => {
            if(this.documentsList.length < 1){  this.celebrationFormGroup.controls['documents_temp'].setValue(''); }
              this.uploader.uploadItem(fileoOb);  
          });

          this.updateProgressBar();
          this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {              
            this.getCelebrationDocuments();
            setTimeout(()=>{    
              this.uploader.clearQueue();
              },800);
          };

          this.uploader.onCompleteAll = () => {
            setTimeout(()=>{    
              this.getCelebrationDocuments();
              },5000);
          }
        }
      }
    }
  })
 }
}

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
      this.celebrationFormGroup.controls['documents_temp'].setValue('');         
    }
    this.uploaderCopy.queue.forEach((fileoOb, ind) => {
        this.uploaderCopy.uploadItem(fileoOb);
        
    });
    this.updateProgressBar();
    this.uploaderCopy.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      this.uploaderCopy.removeFromQueue(item);
      this.getCelebrationDocuments({}, false, false);   
    };

    this.uploaderCopy.onCompleteAll = () => {
      setTimeout(()=>{    
        this.getCelebrationDocuments();
        },5000);
    }
}

getCelebrationDocuments = (query = {}, search = false, uploadRemained = true) => {     
    let profileIds = this.celebrationFormGroup.controls['profileId'].value;
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
    this.userapi.apiRequest('post', 'finalwishes/view-celebration-details', req_vars).subscribe(result => {
      if (result.status == "error") {
      } else {
        if(result.data){
          profileIds = this.selectedProfileId = result.data._id;
          this.celebrationFormGroup.controls['profileId'].setValue(profileIds);
          if(uploadRemained) {
            this.uploadRemainingFiles(profileIds)
          }
          this.documentsList = result.data.documents;    
          this.celebrationFormGroup.controls['documents_temp'].setValue('');
          if(this.documentsList.length>0){
            this.celebrationFormGroup.controls['documents_temp'].setValue('1');
            this.documentsMissing = false;
          }     
        } 
        if(this.currentProgessinPercent==100){
          this.currentProgessinPercent = 0;
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
    folderName:s3Details.celebrationofLifeFilePath,
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

}
