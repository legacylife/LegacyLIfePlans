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
  fileErrors: any;
  datas: any;
  profileIdHiddenVal:boolean = false;
  selectedProfileId: string;
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
    this.selectedProfileId = "";
   // this.selectedProfileId = this.urlData.lastOne;
    // if (this.selectedProfileId && this.urlData.lastThird != "legacies") {
    //   this.selectedProfileId = "";
    // }
    if (this.urlData.lastThird == "legacies") {
        this.customerLegaciesId = this.userId;
        this.customerLegacyType =  this.urlData.userType;          
       // this.selectedProfileId = "";        
    }
    this.trustId =this.advisorId = '';
    if(localStorage.getItem("endUserType")=='advisor')
    this.advisorId = this.userId;
    else
    this.trustId = this.userId;
    
    this.uploader = new FileUploader({ url: `${URL}?userId=${this.customerLegaciesId}&advisorId=${this.advisorId}&trustId=${this.trustId}&ProfileId=${this.selectedProfileId}` });
    this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.customerLegaciesId}&advisorId=${this.advisorId}&trustId=${this.trustId}&ProfileId=${this.selectedProfileId}` });
    this.getDeceasedView({}, false, false);
  }

  getDeceasedView = (query = {}, search = false, uploadRemained = true) => { 
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

    let profileIds = '';
    if (this.selectedProfileId) {
      profileIds = this.selectedProfileId;
      req_vars = {
        query: Object.assign({ _id:profileIds})
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
          let profileIds = this.datas._id;
          this.DeceasedForm.controls['profileId'].setValue(profileIds);
          this.uploader = new FileUploader({ url: `${URL}?userId=${this.customerLegaciesId}&advisorId=${this.advisorId}&trustId=${this.trustId}&ProfileId=${profileIds}` });
          this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.customerLegaciesId}&advisorId=${this.advisorId}&trustId=${this.trustId}&ProfileId=${profileIds}` });
          this.DocumentsList = result.data.documents;  
          if(uploadRemained) {
            this.uploadRemainingFiles(profileIds)
          }          
        }       
      }
    }, (err) => {
      console.error(err);
    })
}  

public fileOverBase(e: any): void {
      this.hasBaseDropZoneOver = e;
      this.fileErrors = [];//console.log(" 1 ==> ",this.uploader.queue.length);
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
        this.uploaderCopy = cloneDeep(this.uploader);//console.log(" 2 ==> ",this.uploader.queue.length)
        this.uploader.queue.splice(1, this.uploader.queue.length - 1)
        this.uploaderCopy.queue.splice(0, 1)
        //console.log(" 3 ==> ",this.uploader.queue.length,'==',this.uploaderCopy.queue.length)
        this.uploader.queue.forEach((fileoOb, ind) => {
              this.uploader.uploadItem(fileoOb);
         });
   
         this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
           this.updateProgressBar();
           this.getDeceasedView();
         };
       }
    }
    
  updateProgressBar(){
    let totalLength = this.uploaderCopy.queue.length + this.uploader.queue.length;
    //console.log(" 4 ==> ",this.uploaderCopy.queue.length,"===",this.uploader.queue.length)
    let remainingLength =  this.uploader.getNotUploadedItems().length + this.uploaderCopy.getNotUploadedItems().length;    
    this.currentProgessinPercent = 100 - (remainingLength * 100 / totalLength);
    this.currentProgessinPercent = Number(this.currentProgessinPercent.toFixed());
  }

  uploadRemainingFiles(profileId) {console.log("profileId==>",profileId)
      this.uploaderCopy.onBeforeUploadItem = (item) => {
        item.url = `${URL}?userId=${this.userId}&advisorId=${this.advisorId}&trustId=${this.trustId}&ProfileId=${profileId}`;
      }
      this.uploaderCopy.queue.forEach((fileoOb, ind) => {
          this.uploaderCopy.uploadItem(fileoOb);
      });
      console.log("profileId==>",profileId)
      this.uploaderCopy.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
        this.updateProgressBar();
        this.getDeceasedView();
      };
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

  }

