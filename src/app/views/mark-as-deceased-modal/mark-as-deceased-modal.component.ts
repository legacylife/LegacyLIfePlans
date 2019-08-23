import { Component, OnInit } from '@angular/core';
import { UserAPIService } from './../../userapi.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AppConfirmService } from '../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../shared/services/app-loader/app-loader.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { FileUploader } from 'ng2-file-upload';
import { serverUrl, s3Details } from '../../config';
import { cloneDeep } from 'lodash'
const URL = serverUrl + '/api/documents/deceasedDocuments';
@Component({
  selector: 'app-mark-as-deceased-modal',
  templateUrl: './mark-as-deceased-modal.component.html',
  styleUrls: ['./mark-as-deceased-modal.component.scss']
})
export class MarkAsDeceasedComponent implements OnInit {
  userId = localStorage.getItem("endUserId");
  public uploader: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
  public uploaderCopy: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
  public hasBaseDropZoneOver: boolean = false;
  currentProgessinPercent: number = 0;
  invalidMessage: string;
  DeceasedForm: FormGroup;
  DocumentsList: any;
  customerData: any;
  fileErrors: any;
  datas: any;
  uploadingDocs:boolean = false;
  profileIdHiddenVal:boolean = false;
  selectedProfileId:string ='';
  trustId: string;
  advisorId: string;
  docPath: string;
  urlData:any={};
  customerLegaciesId: string;
  customerLegacyType:string='customer';
  
  constructor(private snack: MatSnackBar,public dialog: MatDialog, private fb: FormBuilder,private confirmService: AppConfirmService,
    private loader: AppLoaderService, private router: Router,private userapi: UserAPIService) { }

  ngOnInit() {
    const filePath = this.userId+'/'+s3Details.deceasedFilessPath;
    this.docPath = filePath;
    this.DeceasedForm = this.fb.group({
      documents: new FormControl(''),
      profileId: new FormControl('')
    });
    
    this.urlData = this.userapi.getURLData();
    if (this.urlData.lastThird == "legacies") {
        this.customerLegaciesId = this.urlData.lastOne;
        this.customerLegacyType =  this.urlData.userType;          
    }
  
    this.trustId =this.advisorId = '';
    if(localStorage.getItem("endUserType")=='advisor'){
      this.advisorId = this.userId;
    }else{
      this.trustId = this.userId;
    }
    this.uploader = new FileUploader({ url: `${URL}?userType=${localStorage.getItem("endUserType")}&userId=${this.customerLegaciesId}&advisorId=${this.advisorId}&trustId=${this.trustId}&ProfileId=${this.selectedProfileId}`});
    this.uploaderCopy = new FileUploader({ url: `${URL}?userType=${localStorage.getItem("endUserType")}&userId=${this.customerLegaciesId}&advisorId=${this.advisorId}&trustId=${this.trustId}&ProfileId=${this.selectedProfileId}`});

    this.getDeceasedView({}, false, false,true);
  }

  getDeceasedView = (query = {}, search = false, uploadRemained = true,callCustomerInfo= false) => { 
    let req_vars = {};
    if(localStorage.getItem("endUserType")=='customer'){
      req_vars = {
        query: Object.assign({ customerId: this.customerLegaciesId,trustId:this.userId,status:"Pending" })
      }
    }else if(localStorage.getItem("endUserType")=='advisor'){
      req_vars = {
        query: Object.assign({ customerId: this.customerLegaciesId,advisorId:this.userId,status:"Pending" })
      }
    }

    if (this.selectedProfileId) {
      req_vars = {
        query: Object.assign({ _id:this.selectedProfileId})
      }
    }

    this.loader.open(); 
    this.userapi.apiRequest('post', 'deceased/viewDeceaseDetails', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if(result.data){    
          this.datas = result.data;                    
          this.selectedProfileId = this.datas._id;
          this.DeceasedForm.controls['profileId'].setValue(this.selectedProfileId);
          this.DocumentsList = result.data.documents;                   
        }
        if(callCustomerInfo){
          this.getLegacyCustomerDetails();
        }       
        if(uploadRemained) {
          this.uploadRemainingFiles(this.selectedProfileId)
        }  
      }
    }, (err) => {
      console.error(err);
    })
}  

getLegacyCustomerDetails(query = {}){
  const req_vars = {
    query: Object.assign({ _id: this.customerLegaciesId }, query),
    fields:{_id:1,firstName:1,lastName:1}
  }
  this.loader.open(); 
  this.userapi.apiRequest('post', 'userlist/viewall', req_vars).subscribe(result => {
    this.loader.close();
    if (result.status == "error") {
      console.log(result.data)
    } else {
      if(result.data){
        this.customerData = result.data;
      }
    }
  }, (err) => {
    console.error(err)
  })
}


markAsDeceased() {
  let profileIds = this.DeceasedForm.controls['profileId'].value;console.log("profileIds -->",profileIds)
      if(profileIds){
        this.selectedProfileId = profileIds;
      }
      let legacyHolderUserName = '';
      if(this.customerData.firstName && this.customerData.lastName){
        legacyHolderUserName = this.customerData.firstName+' '+this.customerData.lastName;
      }
      let deceasedFromName = localStorage.getItem("firstName")+' '+localStorage.getItem("lastName");
      let req_vars = {_id:this.selectedProfileId,customerId:this.customerLegaciesId,advisorId:this.advisorId,trustId:this.trustId,userType:localStorage.getItem("endUserType"),legacyHolderName:legacyHolderUserName,deceasedFromName:deceasedFromName}
      this.loader.open();   
        this.userapi.apiRequest('post', 'deceased/markAsDeceased', req_vars).subscribe(result => {
          this.loader.close();
          this.dialog.closeAll(); 
          this.snack.open(result.data.message, 'OK', { duration: 4000 })
        }, (err) => {
          console.error(err)
          this.loader.close();
        })                 
}


public fileOverBase(e: any): void {
      this.uploadingDocs = true;
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

      if(this.uploader.getNotUploadedItems().length){
        this.uploaderCopy = cloneDeep(this.uploader);
        this.uploader.queue.splice(1, this.uploader.queue.length - 1)
        this.uploaderCopy.queue.splice(0, 1)
       
        this.uploader.onBeforeUploadItem = (item) => {
            item.url = `${URL}?userType=${localStorage.getItem("endUserType")}&userId=${this.customerLegaciesId}&advisorId=${this.advisorId}&trustId=${this.trustId}&ProfileId=${this.selectedProfileId}`;
        }
        this.uploader.queue.forEach((fileoOb, ind) => {
              this.uploader.uploadItem(fileoOb);
         });
         this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
           this.updateProgressBar();
           this.getDeceasedView();
         };

         this.uploader.onCompleteAll=()=>{
          if(this.uploaderCopy.queue.length==0){  
            this.uploadingDocs = false;
          }
         };
       }
    }
    
  updateProgressBar(){
    let totalLength = this.uploaderCopy.queue.length + this.uploader.queue.length;
    let remainingLength =  this.uploader.getNotUploadedItems().length + this.uploaderCopy.getNotUploadedItems().length;    
    this.currentProgessinPercent = 100 - (remainingLength * 100 / totalLength);
    this.currentProgessinPercent = Number(this.currentProgessinPercent.toFixed());
  }

  uploadRemainingFiles(profileId) {
    if(profileId!=='undefined'){
      this.uploaderCopy.onBeforeUploadItem = (item) => {
        item.url = `${URL}?userType=${localStorage.getItem("endUserType")}&userId=${this.customerLegaciesId}&advisorId=${this.advisorId}&trustId=${this.trustId}&ProfileId=${profileId}`;
      }
      this.uploaderCopy.queue.forEach((fileoOb, ind) => {
          this.uploaderCopy.uploadItem(fileoOb);
      });
      this.uploaderCopy.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
        this.updateProgressBar();
        this.getDeceasedView({}, false, false,false);
      };

      this.uploaderCopy.onCompleteAll=()=>{
        this.uploadingDocs = false;
      };
    }
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

  docDelete(doc, name, tmName) {
    let ids = this.DeceasedForm.controls['profileId'].value;
    var statMsg = "Are you sure you want to delete '" + name + "' file?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          this.DocumentsList.splice(doc, 1)
          var query = {};
          const req_vars = {
            query: Object.assign({ _id: ids }, query),
            proquery: Object.assign({ documents: this.DocumentsList }, query),
            fileName: Object.assign({ docName: tmName }, query)
          }
          this.userapi.apiRequest('post', 'documents/deleteDeceased', req_vars).subscribe(result => {
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

  downloadFile = filename => {
    let query = {};
    let req_vars = {
      query: Object.assign({ docPath: this.docPath, filename: filename }, query)
    };
    this.userapi.download("documents/downloadDocument", req_vars).subscribe(res => {
        var downloadURL = window.URL.createObjectURL(res);
        let filePath = downloadURL;
        var link=document.createElement('a');
        link.href = filePath;
        link.download = filename;
        link.click();
      });
  };

}

