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
const URL = serverUrl + '/api/documents/obituary';
@Component({
  selector: 'app-obituary-modal',
  templateUrl: './obituary-modal.component.html',
  styleUrls: ['./obituary-modal.component.scss']
})
export class ObituaryModalComponent implements OnInit {
  public hasBaseDropZoneOver: boolean = false;
  userId = localStorage.getItem("endUserId");
  ObituaryFormGroup: FormGroup;
  selectedProfileId: string;
  invalidMessage: string;
  documentsMissing = false;
  documents_temps = false;
  obituaryCheck: boolean = false;
  obituaryCheckPhotos: boolean = false;
  profileIdHiddenVal:boolean = false;
  urlData:any={};	  
  obituaryList:any = [];
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
  constructor(private _formBuilder: FormBuilder,private snack: MatSnackBar,public dialog: MatDialog,  private confirmService: AppConfirmService, private loader: AppLoaderService, private router: Router, private userapi: UserAPIService,private fileHandlingService: FileHandlingService,private sharedata: DataSharingService) { }
  public uploader: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
  public uploaderCopy: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });

  ngOnInit() {
    const filePath = this.userId+'/'+s3Details.obituaryFilePath;
    this.docPath = filePath;
    this.documentsList = [];
    this.ObituaryFormGroup = this._formBuilder.group({
      check: new FormControl('yes',Validators.required),
      prepareTo: new FormControl(''),
      photos: new FormControl('no'),
      documents_temp: new FormControl(''),
      media: new FormControl(''),
      sentTo: new FormControl(''),
      information: new FormControl(''),
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
       if(userAccess.ObituaryManagement!='now'){
        this.trusteeLegaciesAction = false;
       }           
       });   
      this.selectedProfileId = "";        
    }
    this.toUserId = this.userId;
    this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${this.selectedProfileId}` });
    this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${this.selectedProfileId}` });
    this.getobituaryView();
  }

  getobituaryView = (query = {}, search = false) => {  
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
    this.userapi.apiRequest('post', 'finalwishes/view-obituary-details', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if(result.data){    
          this.obituaryList = result.data;   
          this.toUserId     = this.obituaryList.customerId;
          let profileIds    = this.obituaryList._id;
        
          this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
          this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
          this.documentsList = this.obituaryList.documents;
          if(this.documentsList.length>0){
            this.ObituaryFormGroup.controls['documents_temp'].setValue('1');
            this.documentsMissing = false;
          }
          if(this.obituaryList.check && this.obituaryList.check == 'yes'){
            this.obituaryCheck = true;
          } 

          if(this.obituaryList.check == 'yes' && this.obituaryList.photos == 'yes'){
            this.obituaryCheckPhotos = true;
          }

          this.ObituaryFormGroup.controls['profileId'].setValue(profileIds);
          this.ObituaryFormGroup.controls['check'].setValue(this.obituaryList.check); 
          this.ObituaryFormGroup.controls['prepareTo'].setValue(this.obituaryList.prepareTo);
          this.ObituaryFormGroup.controls['photos'].setValue(this.obituaryList.photos);
          this.ObituaryFormGroup.controls['media'].setValue(this.obituaryList.media); 
          this.ObituaryFormGroup.controls['sentTo'].setValue(this.obituaryList.sentTo);
          this.ObituaryFormGroup.controls['information'].setValue(this.obituaryList.information);          
        }       
      }
    }, (err) => {
      console.error(err);
    })
  }

  onCheckType(key) {  
    if(key=='yes'){      
      this.obituaryCheck = true;
    }else{
      this.obituaryCheck = false;
    }   
    this.ObituaryFormGroup = this._formBuilder.group({
      check: new FormControl(this.ObituaryFormGroup.controls['check'].value,Validators.required),
      prepareTo: new FormControl(this.ObituaryFormGroup.controls['prepareTo'].value),
      photos: new FormControl(this.ObituaryFormGroup.controls['photos'].value),
      documents_temp: new FormControl(this.ObituaryFormGroup.controls['documents_temp'].value),
      media: new FormControl(this.ObituaryFormGroup.controls['media'].value),
      sentTo: new FormControl(this.ObituaryFormGroup.controls['sentTo'].value),
      information: new FormControl(this.ObituaryFormGroup.controls['information'].value),
      profileId: new FormControl(this.ObituaryFormGroup.controls['profileId'].value),
    });
  }

  onCheckPhotos(key) {      
    if(key=='yes') {      
      this.obituaryCheckPhotos = true;
      this.ObituaryFormGroup = this._formBuilder.group({
        check: new FormControl(this.ObituaryFormGroup.controls['check'].value,Validators.required),
        prepareTo: new FormControl(this.ObituaryFormGroup.controls['prepareTo'].value),
        photos: new FormControl(this.ObituaryFormGroup.controls['photos'].value),
        documents_temp: new FormControl(this.ObituaryFormGroup.controls['documents_temp'].value), // , Validators.required
        media: new FormControl(this.ObituaryFormGroup.controls['media'].value),
        sentTo: new FormControl(this.ObituaryFormGroup.controls['sentTo'].value),
        information: new FormControl(this.ObituaryFormGroup.controls['information'].value),
        profileId: new FormControl(this.ObituaryFormGroup.controls['profileId'].value),
      });
    }else{
      this.obituaryCheckPhotos = false;
      this.ObituaryFormGroup = this._formBuilder.group({
        check: new FormControl(this.ObituaryFormGroup.controls['check'].value,Validators.required),
        prepareTo: new FormControl(this.ObituaryFormGroup.controls['prepareTo'].value),
        photos: new FormControl(this.ObituaryFormGroup.controls['photos'].value),
        documents_temp: new FormControl(this.ObituaryFormGroup.controls['documents_temp'].value),
        media: new FormControl(this.ObituaryFormGroup.controls['media'].value),
        sentTo: new FormControl(this.ObituaryFormGroup.controls['sentTo'].value),
        information: new FormControl(this.ObituaryFormGroup.controls['information'].value),
        profileId: new FormControl(this.ObituaryFormGroup.controls['profileId'].value),
      });
    }
  }

  ObituaryFormSubmit(profileInData = null) {
    var query = {};
    var proquery = {};  

    let profileIds = this.ObituaryFormGroup.controls['profileId'].value;
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
    this.userapi.apiRequest('post', 'finalwishes/obituary-form-submit', req_vars).subscribe(result => {
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

  public fileOverBase(e: any): void {
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
              this.ObituaryFormGroup.controls['documents_temp'].setValue('');
              this.uploader.uploadItem(fileoOb);             
            });

            this.updateProgressBar();
            this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
              this.getObituaryDocuments();
              setTimeout(()=>{    
                this.uploader.clearQueue();
                },800);
            };
            this.uploader.onCompleteAll = () => {
              setTimeout(()=>{    
                this.getObituaryDocuments();
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
      this.ObituaryFormGroup.controls['documents_temp'].setValue('');         
    }
    this.uploaderCopy.queue.forEach((fileoOb, ind) => {
        this.uploaderCopy.uploadItem(fileoOb);
        
    });
    this.updateProgressBar();
    this.uploaderCopy.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      this.uploaderCopy.removeFromQueue(item);
      this.getObituaryDocuments({}, false, false);   
    };

    this.uploaderCopy.onCompleteAll = () => {
      setTimeout(()=>{    
        this.getObituaryDocuments();
        },5000);
    }
}

  getObituaryDocuments = (query = {}, search = false, uploadRemained = true) => {    
    let profileIds = this.ObituaryFormGroup.controls['profileId'].value;
    let req_vars = {
      query: Object.assign({customerId: this.userId,status:"Pending" }),
      fields:{_id:1,documents:1}
    }
    if(profileIds){
       req_vars = {
        query: Object.assign({_id:profileIds }),
        fields:{_id:1,documents:1}
      }
    }
    this.userapi.apiRequest('post', 'finalwishes/view-obituary-details', req_vars).subscribe(result => {
      if (result.status == "error") {
      } else {
        if(result.data){
          profileIds = this.selectedProfileId = result.data._id;
          this.ObituaryFormGroup.controls['profileId'].setValue(profileIds);
          if(uploadRemained) {
            this.uploadRemainingFiles(result.data._id)
          }

          this.documentsList = result.data.documents;      
          this.ObituaryFormGroup.controls['documents_temp'].setValue('');
          if(this.documentsList.length>0){
            this.ObituaryFormGroup.controls['documents_temp'].setValue('1');
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

  documentDelete(doc, name, tmName) {
    let ids = this.ObituaryFormGroup.controls['profileId'].value;
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
            folderName:s3Details.obituaryFilePath,
          }
          this.userapi.apiRequest('post', 'documents/deletefinalwishesObituaryDoc', req_vars).subscribe(result => {
            if (result.status == "error") {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {           
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            }
       
            if (this.documentsList.length < 1) {
              this.ObituaryFormGroup.controls['documents_temp'].setValue('');
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

  downloadFile = (filename) => {    
    let query = {};
    let req_vars = {
      query: Object.assign({ docPath: this.docPath, filename: filename }, query),
      fromId:localStorage.getItem('endUserId'),
      toId:this.toUserId,
      folderName:s3Details.obituaryFilePath,
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
