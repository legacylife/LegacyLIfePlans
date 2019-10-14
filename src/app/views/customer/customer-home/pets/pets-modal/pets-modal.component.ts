import { Component, OnInit } from '@angular/core';
import { UserAPIService } from './../../../../../userapi.service';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { AppConfirmService } from '../../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { documentTypes } from '../../../../../selectList';
import { FileUploader } from 'ng2-file-upload';
import { serverUrl, s3Details } from '../../../../../config';
import { cloneDeep } from 'lodash'
import { controlNameBinding } from '@angular/forms/src/directives/reactive_directives/form_control_name';
import { FileHandlingService } from 'app/shared/services/file-handling.service';
const URL = serverUrl + '/api/documents/petsdocuments';
@Component({
  selector: 'app-essenioal-id-box',
  templateUrl: './pets-modal.component.html',
  styleUrls: ['./pets-modal.component.scss']
})
export class PetsModalComponent implements OnInit {
  userId = localStorage.getItem("endUserId");
  public uploader: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
  public uploaderCopy: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
  public hasBaseDropZoneOver: boolean = false;
  documentsMissing = false;
  invalidMessage: string;
  PetForm: FormGroup;
  documentTypeList: any[] = documentTypes;
  petDocumentsList: any;
  fileErrors: any;
  petsList:any;
  documents_temps = false;
  profileIdHiddenVal:boolean = false;
  selectedProfileId: string;
  docPath: string;
  urlData:any={};
  customerLegaciesId: string;
  customerLegacyType:string='customer';
  currentProgessinPercent: number = 0;
  toUserId:string = ''
  subFolderName:string = ''

  constructor(private snack: MatSnackBar,public dialog: MatDialog, private fb: FormBuilder, 
    private confirmService: AppConfirmService,private loader: AppLoaderService, private router: Router,
    private userapi: UserAPIService, private fileHandlingService: FileHandlingService) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    const filePath = this.userId+'/'+s3Details.petsFilePath;
    this.docPath = filePath;
    this.PetForm = this.fb.group({
      name: new FormControl('',Validators.required),
      petType: new FormControl(''),
      veterinarian: new FormControl(''),
      dietaryConcerns: new FormControl(''),
      profileId: new FormControl(''),
      documents_temp: new FormControl([], Validators.required)
     });
    //this.petDocumentsList = [];

    this.urlData = this.userapi.getURLData();
    this.selectedProfileId = this.urlData.lastOne;
    if (this.selectedProfileId && this.selectedProfileId == 'pets' && this.urlData.lastThird != "legacies") {
      this.selectedProfileId = "";
    }
    if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'pets') {
        this.customerLegaciesId = this.userId;
        this.customerLegacyType =  this.urlData.userType;
        this.userId = this.urlData.lastOne;          
        this.selectedProfileId = "";        
    }
    
    this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${this.selectedProfileId}` });
    this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${this.selectedProfileId}` });
    this.toUserId = this.userId
    this.getPetsView();
  }

  PetFormSubmit(profileInData = null) {
      var query = {};
      var proquery = {};     
      
      let profileIds = this.PetForm.controls['profileId'].value;
      if(profileIds){
        this.selectedProfileId = profileIds;
      }
      if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'pets') {
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
        folderName:s3Details.petsFilePath,
        subFolderName:this.subFolderName
      }
      this.loader.open();     
      this.userapi.apiRequest('post', 'pets/pets-form-submit', req_vars).subscribe(result => {
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
  
  getPetsView = (query = {}, search = false) => { 
      let req_vars = {
        query: Object.assign({ customerId: this.userId,status:"Pending" })
      }
     
      let profileIds = '';
      if (this.selectedProfileId) {
        profileIds = this.selectedProfileId;
        req_vars = {
          query: Object.assign({ _id:profileIds})
        }
      }

      this.loader.open(); 
      this.userapi.apiRequest('post', 'pets/view-pets-details', req_vars).subscribe(result => {
        this.loader.close();
        if (result.status == "error") {
          console.log(result.data)
        } else {
          if(result.data){    
            this.petsList = result.data;       
            this.toUserId      = this.petsList.customerId
            let profileIds = this.petsList._id;
            this.PetForm.controls['profileId'].setValue(profileIds);
            this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
            this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
            this.petDocumentsList = result.data.documents;            
            this.PetForm.controls['name'].setValue(this.petsList.name);
            this.PetForm.controls['petType'].setValue(this.petsList.petType);
            this.PetForm.controls['veterinarian'].setValue(this.petsList.veterinarian);
            this.PetForm.controls['dietaryConcerns'].setValue(this.petsList.dietaryConcerns);
            this.PetForm.controls['documents_temp'].setValue('');
            if(this.petDocumentsList.length>0){
              this.PetForm.controls['documents_temp'].setValue('1');
              this.documentsMissing = false;
            }
          }       
        }
      }, (err) => {
        console.error(err);
      })
  }  

  PetDelete(doc, name, tmName) {
      let ids = this.PetForm.controls['profileId'].value;
      var statMsg = "Are you sure you want to delete '" + name + "' file?"
      this.confirmService.confirm({ message: statMsg })
        .subscribe(res => {
          if (res) {
            this.loader.open();
            this.petDocumentsList.splice(doc, 1)
            var query = {};
            const req_vars = {
              query: Object.assign({ _id: ids }, query),
              proquery: Object.assign({ documents: this.petDocumentsList }, query),
              fileName: Object.assign({ docName: tmName }, query),
              fromId:localStorage.getItem('endUserId'),
              toId:this.toUserId,
              folderName:s3Details.finalWishesFilePath,
              subFolderName:this.subFolderName
            }
            this.userapi.apiRequest('post', 'documents/deletePets', req_vars).subscribe(result => {
              if (result.status == "error") {
                this.loader.close();
                this.snack.open(result.data.message, 'OK', { duration: 4000 })
              } else {
                this.loader.close();
                this.snack.open(result.data.message, 'OK', { duration: 4000 })
              }

              if (this.petDocumentsList.length < 1) {
                this.PetForm.controls['documents_temp'].setValue('');
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

    let legacyUserData = {userId: this.toUserId,userType: 'customer'}
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
            //this.PetForm.controls['documents_temp'].setValue('');
            this.uploaderCopy = cloneDeep(this.uploader);
            this.uploader.queue.splice(1, this.uploader.queue.length - 1)
            this.uploaderCopy.queue.splice(0, 1)
            this.uploader.queue.forEach((fileoOb, ind) => {
              this.PetForm.controls['documents_temp'].setValue('');
                  this.uploader.uploadItem(fileoOb);
            });
            
            this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
              this.updateProgressBar();
              this.getPetsDocuments();
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
    //console.log(" 4 ==> ",this.uploaderCopy.queue.length,"===",this.uploader.queue.length,'===',this.uploader.getNotUploadedItems().length);
    let remainingLength = this.uploader.getNotUploadedItems().length + this.uploaderCopy.getNotUploadedItems().length;
    if(this.uploader.queue.length>0){
      this.uploader.clearQueue();
    }
    this.currentProgessinPercent = 100 - (remainingLength * 100 / totalLength);
    this.currentProgessinPercent = Number(this.currentProgessinPercent.toFixed());
  }

  uploadRemainingFiles(profileId) {
      this.uploaderCopy.onBeforeUploadItem = (item) => {
        item.url = `${URL}?userId=${this.userId}&ProfileId=${profileId}`;
      }
      this.uploaderCopy.queue.forEach((fileoOb, ind) => {
        this.PetForm.controls['documents_temp'].setValue('');
        this.uploaderCopy.uploadItem(fileoOb);
      });
  
      this.uploaderCopy.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
        this.updateProgressBar()
        this.getPetsDocuments({}, false, false);      
      };
      this.uploaderCopy.onCompleteAll=()=>{
        this.uploaderCopy.clearQueue();
        this.currentProgessinPercent = 0;
      }
  }

  getPetsDocuments = (query = {}, search = false, uploadRemained = true) => {     
      let profileIds = this.PetForm.controls['profileId'].value;
      let req_vars = {
        query: Object.assign({customerId: this.userId,status:"Pending" }),
        fields:{_id:1,documents:1}
      }
      if(profileIds){
         req_vars = {
          query: Object.assign({ _id:profileIds}),
          fields:{_id:1,documents:1}
        }
      }    
      this.userapi.apiRequest('post', 'pets/view-pets-details', req_vars).subscribe(result => {
        if (result.status == "error") {
        } else {
          profileIds = result.data._id;
          this.PetForm.controls['profileId'].setValue(profileIds);
          this.PetForm.controls['documents_temp'].setValue('1');
          this.documentsMissing = false;
          if(uploadRemained) {
            this.uploadRemainingFiles(profileIds)
          }
          // this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
          // this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
          this.petDocumentsList = result.data.documents;              
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
  
  downloadFile = filename => {
    let query = {};
    let req_vars = {
      query: Object.assign({ docPath: this.docPath, filename: filename }, query),
      fromId:localStorage.getItem('endUserId'),
      toId:this.toUserId,
      folderName:s3Details.finalWishesFilePath,
      subFolderName:this.subFolderName
    };
    this.userapi.download("documents/downloadDocument", req_vars).subscribe(res => {
        var downloadURL = window.URL.createObjectURL(res);
        let filePath = downloadURL;
        var link=document.createElement('a');
        link.href = filePath;
        link.download = filename;
        link.click();
      });
  }
}