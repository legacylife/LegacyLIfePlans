import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { UserAPIService } from './../../../../../userapi.service';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { AppConfirmService } from '../../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { FileUploader } from 'ng2-file-upload';
import { serverUrl, s3Details } from '../../../../../config';
import { cloneDeep } from 'lodash'
import { controlNameBinding } from '@angular/forms/src/directives/reactive_directives/form_control_name';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { FileHandlingService } from 'app/shared/services/file-handling.service';
const URL = serverUrl + '/api/documents/timeCapsuledocuments';

@Component({
  selector: 'app-essenioal-id-box',
  templateUrl: './time-capsule-modal.component.html',
  styleUrls: ['./time-capsule-modal.component.scss']
})
export class TimeCapsuleMoalComponent implements OnInit {
  userId = localStorage.getItem("endUserId");
  public uploader: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
  public uploaderCopy: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
  public hasBaseDropZoneOver: boolean = false;
  invalidMessage: string;
  documentsMissing = false;
  documents_temps = false;
  TimeCapsuleForm: FormGroup;  
  timeCapsuleDocsList: any;
  fileErrors: any;
  timeCapsuleList:any;
  profileIdHiddenVal:boolean = false;
  docPath: string;
  urlData:any={};
  dynamicRoute:string;
  customerLegaciesId: string;
  customerLegacyType:string='customer';														
  trusteeLegaciesAction:boolean=true;
  LegacyPermissionError:string="You don't have access to this section";
  selectedProfileId: string;
  currentProgessinPercent: number = 0;
  toUserId:string = ''
  subFolderName:string = ''

  constructor(private snack: MatSnackBar,public dialog: MatDialog, private fb: FormBuilder,
    private confirmService: AppConfirmService,private loader: AppLoaderService,
    private router: Router, private userapi: UserAPIService,
    private fileHandlingService: FileHandlingService,private detector: ChangeDetectorRef) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    const filePath = this.userId+'/'+s3Details.timeCapsuleFilePath;
    this.docPath = filePath;
    this.TimeCapsuleForm = this.fb.group({
      name: new FormControl('',Validators.required),     
      profileId: new FormControl(''),
      documents_temp: new FormControl([], Validators.required),
     });
    this.timeCapsuleDocsList = [];
    this.urlData = this.userapi.getURLData();
    this.selectedProfileId = this.urlData.lastOne;
    if (this.selectedProfileId && this.selectedProfileId == 'time-capsule' && this.urlData.lastThird != "legacies") {
      this.selectedProfileId = "";
    }
    if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'time-capsule') {
        this.customerLegaciesId = this.userId;
        this.customerLegacyType =  this.urlData.userType;
        this.userId = this.urlData.lastOne;          
        this.userapi.getUserAccess(this.userId,(userAccess,userDeathFilesCnt,userLockoutPeriod,userDeceased) => { 
          if(userLockoutPeriod || userDeceased){
            this.trusteeLegaciesAction = false;
          }
         if(userAccess.TimeCapsuleManagement!='now'){
          this.trusteeLegaciesAction = false;
         }           
        }); 
        this.selectedProfileId = "";        
    }
    
    this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${this.selectedProfileId}` });
    this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${this.selectedProfileId}` });
    this.toUserId = this.userId
    this.getTimeCapsuleView();
  }

  TimeCapsuleFormSubmit(profileInData = null) {
    var query = {};
    var proquery = {};     
    
    let profileIds = this.TimeCapsuleForm.controls['profileId'].value;
    if(profileIds){
      this.selectedProfileId = profileIds;
    }

    if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'time-capsule') {
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
      folderName:s3Details.timeCapsuleFilePath,
      subFolderName:this.subFolderName
    }
    this.loader.open();     
    this.userapi.apiRequest('post', 'timeCapsule/timeCapsule-form-submit', req_vars).subscribe(result => {
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

  getTimeCapsuleView = (query = {}, search = false) => { 
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
    this.userapi.apiRequest('post', 'timeCapsule/view-timeCapsule-details', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if(result.data){
          this.timeCapsuleList = result.data;
          let profileIds = this.selectedProfileId = this.timeCapsuleList._id;          
          this.TimeCapsuleForm.controls['profileId'].setValue(profileIds);
          this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
          this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
          this.timeCapsuleDocsList = result.data.documents;            
          if(this.timeCapsuleDocsList.length>0){
            this.TimeCapsuleForm.controls['documents_temp'].setValue('1');
            this.documentsMissing = false;
          }
          this.TimeCapsuleForm.controls['name'].setValue(this.timeCapsuleList.name);
        }       
      }
    }, (err) => {
      console.error(err);
    })
  }  

  timeCapsuleDelete(doc, name, tmName) {
      let ids = this.TimeCapsuleForm.controls['profileId'].value;
      var statMsg = "Are you sure you want to delete '" + name + "' file?"
      this.confirmService.confirm({ message: statMsg })
        .subscribe(res => {
          if (res) {
            this.loader.open();
            this.timeCapsuleDocsList.splice(doc, 1)
            var query = {};
            const req_vars = {
              query: Object.assign({ _id: ids }, query),
              proquery: Object.assign({ documents: this.timeCapsuleDocsList }, query),
              fileName: Object.assign({ docName: tmName }, query),
              fromId:localStorage.getItem('endUserId'),
              toId:this.toUserId,
              folderName:s3Details.timeCapsuleFilePath,
              subFolderName:this.subFolderName
            }
            this.userapi.apiRequest('post', 'documents/deleteTimeCapsuleDoc', req_vars).subscribe(result => {
              if (result.status == "error") {
                this.loader.close();
                this.snack.open(result.data.message, 'OK', { duration: 4000 })
              } else {
                this.loader.close();
                this.snack.open(result.data.message, 'OK', { duration: 4000 })
              }
              if (this.timeCapsuleDocsList.length < 1) {
                this.TimeCapsuleForm.controls['documents_temp'].setValue('');
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
   
    this.uploader.queue.forEach((fileoOb) => {
      let filename = fileoOb.file.name;
      var extension = filename.substring(filename.lastIndexOf('.') + 1);
      var fileExts = ["jpg", "jpeg", "png", "txt", "pdf", "docx", "doc","mov","mp3","mp4","mkv", "mpeg", "wav", "ogg", "opus", "bmp", "tiff", "svg", "webm", "mpeg4", "3gpp", "avi", "mpegps", "wmv", "flv"];
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
              if(this.timeCapsuleDocsList.length < 1){  this.TimeCapsuleForm.controls['documents_temp'].setValue(''); }
                this.uploader.uploadItem(fileoOb);  
            });

            this.uploader.onProgressItem = (item: any, response: any) => {       
              this.updateProgressBar();    
            };
           
            this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {              
              this.getTimeCapsuleDocuments();
              setTimeout(()=>{    
                this.uploader.clearQueue();
                },800);
            };

            this.uploader.onCompleteAll = () => {
              setTimeout(()=>{    
                this.getTimeCapsuleDocuments();
                },5000);
            }
          }
        }
      }
    })
  }

  updateProgressBar(){
    let uploaderLength = 0;  let uploaderCopyLength = 0;
    this.uploader.onProgressItem = (progress:any) => {
      this.currentProgessinPercent = progress;
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
    //console.log('len 1# ',this.uploader.queue.length,'len 2# ',this.uploaderCopy.queue.length,' Processs',this.currentProgessinPercent)
  }

  uploadRemainingFiles(profileId) {    
      this.uploaderCopy.onBeforeUploadItem = (item) => {
        item.url = `${URL}?userId=${this.userId}&ProfileId=${profileId}`;
        this.TimeCapsuleForm.controls['documents_temp'].setValue('');         
      }
      this.uploaderCopy.queue.forEach((fileoOb, ind) => {
          this.uploaderCopy.uploadItem(fileoOb);
          
      });
      this.updateProgressBar();
      this.uploaderCopy.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
        this.uploaderCopy.removeFromQueue(item);
        this.getTimeCapsuleDocuments({}, false, false);   
      };

      this.uploaderCopy.onCompleteAll = () => {
        setTimeout(()=>{    
          this.getTimeCapsuleDocuments();
          },5000);
      }
  }

  getTimeCapsuleDocuments = (query = {}, search = false, uploadRemained = true) => {     
      let profileIds = this.TimeCapsuleForm.controls['profileId'].value;
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
      this.userapi.apiRequest('post', 'timeCapsule/view-timeCapsule-details', req_vars).subscribe(result => {
        if (result.status == "error") {
        } else {
          if(result.data){
            profileIds = this.selectedProfileId = result.data._id;
            this.TimeCapsuleForm.controls['profileId'].setValue(profileIds);
            if(uploadRemained) {
              this.uploadRemainingFiles(profileIds)
            }

            this.timeCapsuleDocsList = result.data.documents;    
            this.TimeCapsuleForm.controls['documents_temp'].setValue('');
            if(this.timeCapsuleDocsList.length>0){
              this.TimeCapsuleForm.controls['documents_temp'].setValue('1');
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
      folderName:s3Details.timeCapsuleFilePath,
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