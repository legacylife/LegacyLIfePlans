import { Component, OnInit,Inject } from '@angular/core';
import { APIService } from './../../../../api.service';
import { UserAPIService } from './../../../../userapi.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AppConfirmService } from '../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { CustomValidators } from 'ng2-validation';
import { MatDialog, MatSnackBar,MAT_DIALOG_DATA  } from '@angular/material';
import { Router } from '@angular/router';
import { EstateTypeOfDocument,HealthcareTypeOfDocument,PersonalAffairsTypeOfDocument } from '../../../../selectList';
import { FileUploader } from 'ng2-file-upload';
import { cloneDeep } from 'lodash'
import { serverUrl, s3Details } from '../../../../config';
import { NumberValueAccessor } from '@angular/forms/src/directives';
import { FileHandlingService } from 'app/shared/services/file-handling.service';
const URL = serverUrl + '/api/documents/legalStuff';
@Component({
  selector: 'app-legal-stuff-modal',
  templateUrl: './legal-stuff-modal.component.html',
  styleUrls: ['./legal-stuff-modal.component.scss']
})
export class legalStuffModalComponent implements OnInit {

  userId = localStorage.getItem("endUserId"); 
  public hasBaseDropZoneOver: boolean = false;
  invalidMessage: string;
  LegalForm: FormGroup;
  documentsMissing = false;
  documents_temps = false;
  fileErrors: any;
  profileIdHiddenVal:boolean = false;
  documentsList: any;
  LegalStuffList:any = [];
  folderName: string;
  typeOfDocumentList: any[]
  selectedProfileId: string;
  newName:string = "";
  docPath: string;
  urlData:any={};
  customerLegaciesId: string;
  customerLegacyType:string='customer';
  currentProgessinPercent:Number = 0;
  toUserId:string = ''
  subFolderName:string = ''
  LegacyPermissionError:string="You don't have access to this section";
  trusteeLegaciesAction:boolean=true;
  constructor(private snack: MatSnackBar,public dialog: MatDialog, private fb: FormBuilder,
    private confirmService: AppConfirmService,private loader: AppLoaderService,
    private userapi: UserAPIService ,@Inject(MAT_DIALOG_DATA) public data: any,
    private fileHandlingService: FileHandlingService )
  { 
      this.folderName = data.FolderName;this.newName = data.newName;
  }
  public uploader: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
  public uploaderCopy: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });

  ngOnInit() {
    const filePath = this.userId+'/'+s3Details.legalStuffDocumentsPath;
    this.docPath = filePath; 
    if(this.newName && this.newName != ''){
      this.folderName = this.newName
    }
    
    this.urlData = this.userapi.getURLData();
    this.selectedProfileId = this.urlData.lastOne;
    if (this.selectedProfileId && this.selectedProfileId == 'legal-stuff' && this.urlData.lastThird != "legacies") {
      this.selectedProfileId = "";
    }
    
    if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'legal-stuff') {
        this.customerLegaciesId = this.userId;
        this.customerLegacyType =  this.urlData.userType;
        this.userId = this.urlData.lastOne;          
        this.userapi.getUserAccess(this.userId,(userAccess,userDeathFilesCnt,userLockoutPeriod,userDeceased) => { 
          if(userLockoutPeriod || userDeceased){
            this.trusteeLegaciesAction = false;
          }
         if((this.folderName=='Estate' && userAccess.EstateManagement!='now') || (this.folderName=='Healthcare' && userAccess.HealthcareManagement!='now') || (this.folderName=='Personal Affairs' && userAccess.PersonalAffairsManagement!='now')){         
          this.trusteeLegaciesAction = false;
         }           
         }); 
        this.selectedProfileId = "";        
    }
 
    if(this.folderName=='Estate'){
      this.typeOfDocumentList = EstateTypeOfDocument;
    }else if(this.folderName=='Healthcare'){
      this.typeOfDocumentList = HealthcareTypeOfDocument;
    }else if(this.folderName=='Personal Affairs'){
      this.typeOfDocumentList = PersonalAffairsTypeOfDocument;      
    }
    this.LegalForm = this.fb.group({
      typeOfDocument: new FormControl('', Validators.required),
      documents_temp: new FormControl([], Validators.required),
      comments: new FormControl(''), 
      profileId: new FormControl('')
    });

    this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&folderName=${this.folderName}&ProfileId=${this.selectedProfileId}` });
    this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&folderName=${this.folderName}&ProfileId=${this.selectedProfileId}` });
    this.documentsList = [];
    this.toUserId = this.userId
    this.getEssentialLegalView();
  }

  LegalFormSubmit(profileInData = null) {
    var query = {};
    var proquery = {};     
    profileInData.subFolderName = this.folderName;

    if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'legal-stuff') {
      profileInData.customerLegacyId = this.customerLegaciesId
      profileInData.customerLegacyType = this.customerLegacyType
    }

    if(!profileInData.profileId || profileInData.profileId ==''){
      profileInData.customerId = this.userId
    }

    let req_vars = {
      query: Object.assign({customerId: this.userId,subFolderName:this.folderName }),
      proquery: Object.assign(profileInData),
      message: Object.assign({ messageText: this.folderName }),
      fromId:localStorage.getItem('endUserId'),
      toId:this.toUserId,
      folderName:s3Details.legalStuffDocumentsPath,
      subFolderName:this.subFolderName
    }
    let profileIds = this.LegalForm.controls['profileId'].value;
    if(profileIds){
      req_vars = {
        query: Object.assign({ _id:profileIds }),
        proquery: Object.assign(profileInData),
        message: Object.assign({ messageText: this.folderName }),
        fromId:localStorage.getItem('endUserId'),
        toId:this.toUserId,
        folderName:s3Details.legalStuffDocumentsPath,
        subFolderName:this.subFolderName
      }
    }
    this.loader.open();     
    this.userapi.apiRequest('post', 'customer/essentials-legal-form-submit', req_vars).subscribe(result => {
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

  getEssentialLegalView = (query = {}, search = false) => {    
    let req_vars = {
      query: Object.assign({ customerId: this.userId,subFolderName:this.folderName,status:"Pending" }, query)//, status:"Pending"
    }

    let profileIds = '';
    if (this.selectedProfileId) {
      profileIds = this.selectedProfileId;
      req_vars = {
        query: Object.assign({ _id: profileIds })
      }
    }

    this.loader.open(); 
    this.userapi.apiRequest('post', 'customer/view-legalStuff-details', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if(result.data){    
          this.LegalStuffList = result.data;
          this.subFolderName  = this.LegalStuffList.subFolderName
          this.toUserId       = this.LegalStuffList.customerId

          let profileIds = this.LegalStuffList._id;
          this.LegalForm.controls['profileId'].setValue(profileIds);
          
          this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&folderName=${this.folderName}&ProfileId=${profileIds}` });
          this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&folderName=${this.folderName}&ProfileId=${profileIds}` });
          this.documentsList = result.data.documents;
          if(this.documentsList.length>0){
            this.LegalForm.controls['documents_temp'].setValue('1');
            this.documentsMissing = false;
          }
          this.LegalForm.controls['typeOfDocument'].setValue(this.LegalStuffList.typeOfDocument); 
          this.LegalForm.controls['comments'].setValue(this.LegalStuffList.comments);
        }       
      }
    }, (err) => {
      console.error(err);
    })
  }

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
    this.fileErrors = [];
    let totalItemsToBeUpload = this.uploader.queue.length,
        totalUploderFileSize = 0,
        remainingSpace = 0,
        message = ''
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
        }, 5000);
    
      }
    });

    let legacyUserData = {userId: this.toUserId, userType:'customer'}
    this.fileHandlingService.checkAvailableSpace( legacyUserData, async (spaceDetails) => {
      remainingSpace = Number(spaceDetails.remainingSpace)
      message = spaceDetails.message
    
      if( totalUploderFileSize > remainingSpace) {
        this.confirmService.reactivateReferEarnPopup({ message: message, status: 'notactivate' }).subscribe(res => {
          if (res) {
            console.log("**************",res)
          }
          this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${this.selectedProfileId}` });
        })
      }
      else{
        let proceedToUpload = true
        if( message != '' ) {
          let confirmResponse = await this.confirmService.confirm({ message: message }).toPromise()
          proceedToUpload = true
        }
        if( proceedToUpload ) {
          if(this.uploader.getNotUploadedItems().length){
            this.uploaderCopy = cloneDeep(this.uploader)
            this.uploader.queue.splice(1, this.uploader.queue.length - 1)
            this.uploaderCopy.queue.splice(0, 1)
          
            this.uploader.queue.forEach((fileoOb, ind) => {
              this.LegalForm.controls['documents_temp'].setValue('');
                this.uploader.uploadItem(fileoOb);
            });

            this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
              this.updateProgressBar();
              this.getLegalDocuments();
            };
            this.uploader.onCompleteAll=()=>{
              this.uploader.clearQueue();
              if(!this.uploaderCopy.queue.length){
                this.currentProgessinPercent = 0;
              }
            }
          }
        }
      }
    })
  }

  updateProgressBar(){
    let totalLength = this.uploaderCopy.queue.length + this.uploader.queue.length;
    let remainingLength =  this.uploader.getNotUploadedItems().length + this.uploaderCopy.getNotUploadedItems().length;
    this.currentProgessinPercent = 100 - (remainingLength * 100 / totalLength);
    if(this.uploader.queue.length>0){
      this.uploader.clearQueue();
    }
    this.currentProgessinPercent = Number(this.currentProgessinPercent.toFixed());
  }

  uploadRemainingFiles(profileId) {
    this.uploaderCopy.onBeforeUploadItem = (item) => {
      item.url = `${URL}?userId=${this.userId}&folderName=${this.folderName}&ProfileId=${profileId}`;
      this.LegalForm.controls['documents_temp'].setValue('');
    }
    this.uploaderCopy.queue.forEach((fileoOb, ind) => {
        this.uploaderCopy.uploadItem(fileoOb);
    });

    this.uploaderCopy.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      this.updateProgressBar();
      this.getLegalDocuments({}, false, false);    
    };
    this.uploaderCopy.onCompleteAll=()=>{
      this.uploaderCopy.clearQueue();
      this.currentProgessinPercent = 0;
    }
  }

  getLegalDocuments = (query = {}, search = false, uploadRemained = true) => {    
    let profileIds = this.LegalForm.controls['profileId'].value;
    let req_vars = {
      query: Object.assign({customerId: this.userId,subFolderName:this.folderName,status:"Pending" }),
      fields:{_id:1,documents:1}
    }
    if(profileIds){
       req_vars = {
        query: Object.assign({ _id:profileIds }),
        fields:{_id:1,documents:1}
      }
    }    
    this.userapi.apiRequest('post', 'customer/view-legalStuff-details', req_vars).subscribe(result => {
      if (result.status == "error") {
      } else {
        profileIds = result.data._id;
        this.LegalForm.controls['profileId'].setValue(profileIds);
        if(uploadRemained) {
          this.uploadRemainingFiles(result.data._id)
        }
        this.documentsList = result.data.documents;        
        this.LegalForm.controls['documents_temp'].setValue('');
        if(this.documentsList.length>0){
          this.LegalForm.controls['documents_temp'].setValue('1');
          this.documentsMissing = false;
        }         
      }
    }, (err) => {
      console.error(err);
    })
  }

  subFolderDelete(doc, name, tmName) {
    let ids = this.LegalForm.controls['profileId'].value;
    var statMsg = "Are you sure you want to delete '" + name +"' file?"
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
            folderName:s3Details.legalStuffDocumentsPath,
            subFolderName:this.subFolderName
          }
          this.userapi.apiRequest('post', 'documents/deletesubFolderDoc', req_vars).subscribe(result => {
            if (result.status == "error") {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            }

            if (this.documentsList.length < 1) {
              this.LegalForm.controls['documents_temp'].setValue('');
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
      query: Object.assign({ docPath: this.docPath, filename: filename }, query),
      fromId:localStorage.getItem('endUserId'),
      toId:this.toUserId,
      folderName:s3Details.legalStuffDocumentsPath,
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
      link.click();
      this.snack.dismiss();
    });
  }
}