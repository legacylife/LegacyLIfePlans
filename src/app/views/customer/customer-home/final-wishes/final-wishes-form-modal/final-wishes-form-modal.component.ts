import { Component, OnInit,Inject } from '@angular/core';
import { UserAPIService } from './../../../../../userapi.service';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { AppConfirmService } from '../../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { MatDialog, MatSnackBar,MAT_DIALOG_DATA  } from '@angular/material';
import { Router } from '@angular/router';
import { FileUploader } from 'ng2-file-upload';
import { serverUrl, s3Details } from '../../../../../config';
import { cloneDeep } from 'lodash'
import { controlNameBinding } from '@angular/forms/src/directives/reactive_directives/form_control_name';
import { NumberValueAccessor } from '@angular/forms/src/directives';
import { FileHandlingService } from 'app/shared/services/file-handling.service';
const URL = serverUrl + '/api/documents/finalWishes';
@Component({
  selector: 'app-essenioal-id-box',
  templateUrl: './final-wishes-form-modal.component.html',
  styleUrls: ['./final-wishes-form-modal.component.scss']
})
export class FinalWishesFormModalComponent implements OnInit {
  userId = localStorage.getItem("endUserId");
  public hasBaseDropZoneOver: boolean = false;
  FinalForm: FormGroup;
  selectedProfileId: string;
  
  wishDocumentsList:any = [];
  profileIdHiddenVal:boolean = false;
  folderName: string;
  newName:string = "";
  fileErrors: any;
  documentsList: any;
  finalWishList:any = [];
  docPath: string;  
  showCalendarField:boolean = false; 
  urlData:any={};
  customerLegaciesId: string;
  customerLegacyType:string='customer';
  currentProgessinPercent:number = 0;
  toUserId:string = ''
  subFolderName:string = ''

  constructor(private snack: MatSnackBar,public dialog: MatDialog, private fb: FormBuilder, 
    private confirmService: AppConfirmService,private loader: AppLoaderService, private router: Router,
    private userapi: UserAPIService  ,@Inject(MAT_DIALOG_DATA) public data: any,
    private fileHandlingService: FileHandlingService ) 
  { this.folderName = data.FolderName;this.newName = data.newName;}
  public uploader: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
  public uploaderCopy: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    const filePath = this.userId+'/'+s3Details.finalWishesFilePath;
    this.docPath = filePath;
    if(this.newName && this.newName != ''){
      this.folderName = this.newName
    }
    this.FinalForm = this.fb.group({
      title: new FormControl('',Validators.required),
      comments: new FormControl(''),
      calendarDate: new FormControl(''),
      profileId: new FormControl('')
    });
    
    this.wishDocumentsList = [];
    this.urlData = this.userapi.getURLData();
    this.selectedProfileId = this.urlData.lastOne;
    if (this.selectedProfileId && this.selectedProfileId == 'final-wishes' && this.urlData.lastThird != "legacies") {
      this.selectedProfileId = "";
    }
    if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'final-wishes') {
      this.customerLegaciesId = this.userId;
      this.customerLegacyType =  this.urlData.userType;
      this.userId = this.urlData.lastOne;          
      this.selectedProfileId = "";
    }

    this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&folderName=${this.folderName}&ProfileId=${this.selectedProfileId}` });
    this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&folderName=${this.folderName}&ProfileId=${this.selectedProfileId}` });
    this.documentsList = [];
    this.toUserId = this.userId
    this.getFinalWishesView();

    if(this.folderName == 'Celebration of Life'){
      this.showCalendarField = true;
    }
  }

  getFinalWishesView = (query = {}, search = false) => {    
    let req_vars = {
      query: Object.assign({ customerId: this.userId,subFolderName:this.folderName,status:"Pending" }, query)
    }

    let profileIds = '';
    if (this.selectedProfileId) {
      profileIds = this.selectedProfileId;
      req_vars = {
        query: Object.assign({ _id: profileIds })
      }
    }

    this.loader.open(); 
    this.userapi.apiRequest('post', 'finalwish/view-wish-details', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if(result.data){    
          this.finalWishList = result.data;   
          this.subFolderName = this.finalWishList.subFolderName
          this.toUserId      = this.finalWishList.customerId
          let profileIds = this.finalWishList._id;
          this.FinalForm.controls['profileId'].setValue(profileIds);
          
          this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&folderName=${this.folderName}&ProfileId=${profileIds}` });
          this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&folderName=${this.folderName}&ProfileId=${profileIds}` });
          this.documentsList = result.data.documents;
          
          this.FinalForm.controls['title'].setValue(this.finalWishList.title); 
          this.FinalForm.controls['comments'].setValue(this.finalWishList.comments);
          this.FinalForm.controls['calendarDate'].setValue(this.finalWishList.calendarDate);
        }       
      }
    }, (err) => {
      console.error(err);
    })
  }

  WishesFormSubmit(profileInData = null) {
    var query = {};
    var proquery = {};     
    profileInData.subFolderName = this.folderName;
    if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'final-wishes') {
      profileInData.customerLegacyId = this.customerLegaciesId
      profileInData.customerLegacyType = this.customerLegacyType
    }

    if(!profileInData.profileId || profileInData.profileId ==''){
      profileInData.customerId = this.userId
    }

    let req_vars = {
      query: Object.assign({subFolderName:this.folderName }),
      proquery: Object.assign(profileInData),
      message: Object.assign({ messageText: this.folderName }),
      fromId:localStorage.getItem('endUserId'),
      toId:this.toUserId,
      folderName:s3Details.finalWishesFilePath,
      subFolderName:this.subFolderName
    }
    let profileIds = this.FinalForm.controls['profileId'].value;
    if(profileIds){
      req_vars = {
        query: Object.assign({ _id:profileIds}),
        proquery: Object.assign(profileInData),
        message: Object.assign({ messageText: this.folderName }),
        fromId:localStorage.getItem('endUserId'),
        toId:this.toUserId,
        folderName:s3Details.finalWishesFilePath,
        subFolderName:this.subFolderName
      }
    }

    this.loader.open();     
    this.userapi.apiRequest('post', 'finalwish/wishes-form-submit', req_vars).subscribe(result => {
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

    let legacyUserData = {userId: this.toUserId, userType: this.urlData.userType}
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
              this.uploader.uploadItem(fileoOb);
            });
        
            this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
              this.updateProgressBar();
              this.getWishesDocuments();
            };
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
  }

  uploadRemainingFiles(profileId) {
      this.uploaderCopy.onBeforeUploadItem = (item) => {
        item.url = `${URL}?userId=${this.userId}&ProfileId=${profileId}`;
      }
      this.uploaderCopy.queue.forEach((fileoOb, ind) => {
          this.uploaderCopy.uploadItem(fileoOb);
      });
  
      this.uploaderCopy.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
        this.updateProgressBar();
        this.getWishesDocuments({}, false, false);      
      };
  }

  getWishesDocuments = (query = {}, search = false, uploadRemained = true) => {    
    let profileIds = this.FinalForm.controls['profileId'].value;
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
    this.userapi.apiRequest('post', 'finalwish/view-wish-details', req_vars).subscribe(result => {
      if (result.status == "error") {
      } else {
        profileIds = result.data._id;
        this.FinalForm.controls['profileId'].setValue(profileIds);
        if(uploadRemained) {
          this.uploadRemainingFiles(result.data._id)
        }
        // this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
        // this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
        this.documentsList = result.data.documents;                       
      }
    }, (err) => {
      console.error(err);
    })
  }

  subFolderDelete(doc, name, tmName) {
    let ids = this.FinalForm.controls['profileId'].value;
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
            folderName:s3Details.finalWishesFilePath,
            subFolderName:this.subFolderName
          }
          this.userapi.apiRequest('post', 'documents/deletesubFolderWishesDoc', req_vars).subscribe(result => {
            if (result.status == "error") {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {           
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
  { var key;  
    key = event.charCode;
    return((key > 64 && key < 91) || (key> 96 && key < 123) || key == 8 || key == 32 || (key >= 48 && key <= 57)); 
  }

  downloadFile = (filename) => {    
    let query = {};
    let req_vars = {
      query: Object.assign({ docPath: this.docPath, filename: filename }, query),
      fromId:localStorage.getItem('endUserId'),
      toId:this.toUserId,
      folderName:s3Details.finalWishesFilePath,
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