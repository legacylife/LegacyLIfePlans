import { Component, OnInit,Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { MatDialog, MatSnackBar  } from '@angular/material';
import { Router } from '@angular/router';
import { FileUploader } from 'ng2-file-upload';
import { cloneDeep } from 'lodash'
import { UserAPIService } from 'app/userapi.service';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { serverUrl,s3Details } from 'app/config';
import { FileHandlingService } from 'app/shared/services/file-handling.service';
const URL = serverUrl + '/api/documents/letterMessage';

@Component({
  selector: 'app-letters-messages-model',
  templateUrl: './letters-messages-model.component.html',
  styleUrls: ['./letters-messages-model.component.scss']
})
export class LettersMessagesModelComponent implements OnInit {
  userId = localStorage.getItem("endUserId"); 
  public hasBaseDropZoneOver: boolean = false;
  invalidMessage: string;
  documentsMissing = false;
  documents_temps = false;
  LettersMessagesForm: FormGroup;
  fileErrors: any;
  profileIdHiddenVal:boolean = false;
  documentsList: any;
  LetterMessageList:any = [];
  selectedProfileId: string;
  newName:string = "";
  docPath: string;
  urlData:any={};
  customerLegaciesId: string;
  customerLegacyType:string='customer';
  currentProgessinPercent:number = 0;

  toUserId:string = ''
  subFolderName:string = ''

  constructor(private snack: MatSnackBar,public dialog: MatDialog, private fb: FormBuilder,
    private confirmService: AppConfirmService,private loader: AppLoaderService,
    private userapi: UserAPIService, private fileHandlingService: FileHandlingService ) {}
  public uploader: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
  public uploaderCopy: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });

  ngOnInit() {
    const filePath = this.userId+'/'+s3Details.letterMessageDocumentsPath;
    this.docPath = filePath;
    this.urlData = this.userapi.getURLData();
    this.selectedProfileId = this.urlData.lastOne;
    if (this.selectedProfileId && this.selectedProfileId == 'letters-messages' && this.urlData.lastThird != "legacies") {
      this.selectedProfileId = "";
    }
    if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'letters-messages') {
        this.customerLegaciesId = this.userId;
        this.customerLegacyType =  this.urlData.userType;
        this.userId = this.urlData.lastOne;          
        this.selectedProfileId = "";        
    }

    this.LettersMessagesForm = this.fb.group({
      title: new FormControl('', Validators.required),
      letterBox: new FormControl('', Validators.required), 
      subject: new FormControl(''),
      profileId: new FormControl(''),
      documents_temp: new FormControl([], Validators.required),
    });

    this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${this.selectedProfileId}` });
    this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${this.selectedProfileId}` });
    this.documentsList = [];
    this.toUserId = this.userId
    this.getLettersMessagesView();
  }

  LettersMessagesFormSubmit(profileInData = null) {
    var query = {};
    var proquery = {};     
    if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'letters-messages') {
      profileInData.customerLegacyId = this.customerLegaciesId
      profileInData.customerLegacyType = this.customerLegacyType
    }
    if(!profileInData.profileId || profileInData.profileId ==''){
      profileInData.customerId = this.userId
    }

    let req_vars = {
      query: Object.assign({customerId: this.userId }),
      proquery: Object.assign(profileInData),
      message: Object.assign({}),
      fromId:localStorage.getItem('endUserId'),
      toId:this.toUserId,
      folderName:s3Details.letterMessageDocumentsPath,
      subFolderName:this.subFolderName
    }
    let profileIds = this.LettersMessagesForm.controls['profileId'].value;
    if(profileIds){
      req_vars = {
        query: Object.assign({ _id:profileIds }),
        proquery: Object.assign(profileInData),
        message: Object.assign({}),
        fromId:localStorage.getItem('endUserId'),
        toId:this.toUserId,
        folderName:s3Details.letterMessageDocumentsPath,
        subFolderName:this.subFolderName
      }
    }

    this.loader.open();     
    this.userapi.apiRequest('post', 'lettersMessages/letters-form-submit', req_vars).subscribe(result => {
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

  getLettersMessagesView = (query = {}, search = false) => {    
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
    this.userapi.apiRequest('post', 'lettersMessages/view-lettersMessages-details', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if(result.data){    
          this.LetterMessageList = result.data;   
          this.toUserId          = this.LetterMessageList.customerId
          let profileIds = this.LetterMessageList._id;
          this.LettersMessagesForm.controls['profileId'].setValue(profileIds);
          this.LettersMessagesForm.controls['title'].setValue(this.LetterMessageList.title);
          this.LettersMessagesForm.controls['letterBox'].setValue(this.LetterMessageList.letterBox);
          this.LettersMessagesForm.controls['subject'].setValue(this.LetterMessageList.subject);
          this.documentsList = result.data.documents;       
          if(this.documentsList.length>0){
            this.LettersMessagesForm.controls['documents_temp'].setValue('1');
            this.documentsMissing = false;
          } 
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
            this.LettersMessagesForm.controls['documents_temp'].setValue('');
                this.uploader.uploadItem(fileoOb);
            });

            this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
              this.updateProgressBar();
              this.getlettersMessagesDocuments();
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
    this.currentProgessinPercent = Number(this.currentProgessinPercent.toFixed());
    if(this.uploader.queue.length>0){
      this.uploader.clearQueue();
    }
  }

  uploadRemainingFiles(profileId) {
    this.uploaderCopy.onBeforeUploadItem = (item) => {
      this.LettersMessagesForm.controls['documents_temp'].setValue('');        
      item.url = `${URL}?userId=${this.userId}&ProfileId=${profileId}`;
    }
    this.uploaderCopy.queue.forEach((fileoOb, ind) => {
        this.uploaderCopy.uploadItem(fileoOb);
    });

    this.uploaderCopy.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      this.updateProgressBar();
      this.getlettersMessagesDocuments({}, false, false);
    };
    this.uploaderCopy.onCompleteAll=()=>{
      this.uploaderCopy.clearQueue();
      this.currentProgessinPercent = 0;
    }
  }

  getlettersMessagesDocuments = (query = {}, search = false, uploadRemained = true) => {    
    let profileIds = this.LettersMessagesForm.controls['profileId'].value;
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
    this.userapi.apiRequest('post', 'lettersMessages/view-lettersMessages-details', req_vars).subscribe(result => {
      if (result.status == "error") {
      } else {
        profileIds = result.data._id;
        this.LettersMessagesForm.controls['profileId'].setValue(profileIds);
        if(uploadRemained) {
          this.uploadRemainingFiles(result.data._id)
        }
        this.documentsList = result.data.documents;  
        this.LettersMessagesForm.controls['documents_temp'].setValue('');        
        if(this.documentsList.length>0){
          this.LettersMessagesForm.controls['documents_temp'].setValue('1');
          this.documentsMissing = false;
        }                      
      }
    }, (err) => {
      console.error(err);
    })
  }

  docDelete(doc, name, tmName) {
    let ids = this.LettersMessagesForm.controls['profileId'].value;
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
            folderName:s3Details.letterMessageDocumentsPath,
            subFolderName:this.subFolderName
          }
          this.userapi.apiRequest('post', 'documents/deleteletterMessageDoc', req_vars).subscribe(result => {
            if (result.status == "error") {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {              
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            }
            if (this.documentsList.length < 1) {
              this.LettersMessagesForm.controls['documents_temp'].setValue('');
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
      folderName:s3Details.letterMessageDocumentsPath,
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