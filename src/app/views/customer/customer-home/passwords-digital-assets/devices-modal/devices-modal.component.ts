import { Component, OnInit, AfterViewInit } from '@angular/core';
import { UserAPIService } from './../../../../../userapi.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AppConfirmService } from '../../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import * as PatternLock from 'pattern-lock-js/patternlock';
import * as html2canvas from 'html2canvas/dist/html2canvas';

import { DevicesList } from '../../../../../selectList';
import { FileUploader } from 'ng2-file-upload';
import { serverUrl, s3Details } from '../../../../../config';
import { cloneDeep } from 'lodash'
import { controlNameBinding } from '@angular/forms/src/directives/reactive_directives/form_control_name';
const URL = serverUrl + '/api/documents/petsdocuments';
const filePath = s3Details.url+'/'+s3Details.petsFilePath;
@Component({
  selector: 'app-essenioal-id-box',
  templateUrl: './devices-modal.component.html',
  styleUrls: ['./devices-modal.component.scss']
})
export class DevicesModalComponent implements OnInit, AfterViewInit{
  //selected = 'option1';
  userId = localStorage.getItem("endUserId");
  public uploader: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
  public uploaderCopy: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
  public hasBaseDropZoneOver: boolean = false;

  invalidMessage: string;
  DevicesForm: FormGroup;
  deviceListing: any[];
  petDocumentsList: any;
  fileErrors: any;
  petsList:any;
  profileIdHiddenVal:boolean = false;
  selectedProfileId: string;
  docPath: string;
  lock: any;
  constructor(private snack: MatSnackBar,public dialog: MatDialog, private fb: FormBuilder, 
    private confirmService: AppConfirmService,private loader: AppLoaderService, private router: Router,
    private userapi: UserAPIService  ) 
  { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.docPath = filePath;
    this.deviceListing = DevicesList;
    this.DevicesForm = this.fb.group({
      deviceList: new FormControl('',Validators.required),
      deviceName: new FormControl(''),
      username: new FormControl(''),
     // password: new FormControl(''),
      profileId: new FormControl('')
     });

     this.petDocumentsList = [];

     const locationArray = location.href.split('/')
     this.selectedProfileId = locationArray[locationArray.length - 1];

      if(this.selectedProfileId && this.selectedProfileId == 'passwords-digital-assests'){
        this.selectedProfileId = "";   
      }
     this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${this.selectedProfileId}` });
     this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${this.selectedProfileId}` });
    // this.getPetsView();
    }

   ngAfterViewInit(){
      this.lock = new PatternLock("#patternHolder", {
        onPattern:this.getPattern        
      });
    }
 
    getPattern(pattern : any){
      //pattern
      console.log("pattern No ",pattern)
     // var c = document.getElementById('patternHolder');
     // var t = c.getContext('2d');
     html2canvas(document.getElementById('patternHolder')).then(function(canvas) {
      document.getElementById('patternHolder').appendChild(canvas);
      var base64URL = canvas.toDataURL('image/jpeg').replace('image/jpeg', 'image/octet-stream');
      console.log("HERE we Are ",base64URL)
    });
    }

  

    DevicesFormSubmit(profileInData = null) {
      var query = {};
      var proquery = {};     
      
      let profileIds = this.DevicesForm.controls['profileId'].value;
      if(profileIds){
        this.selectedProfileId = profileIds;
      }
      const req_vars = {
        query: Object.assign({ _id: this.selectedProfileId,customerId: this.userId  }),
        proquery: Object.assign(profileInData)
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
          query: Object.assign({ _id:profileIds, customerId: this.userId })
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
            let profileIds = this.petsList._id;
            this.DevicesForm.controls['profileId'].setValue(profileIds);
            this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
            this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
            this.petDocumentsList = result.data.documents;            
            this.DevicesForm.controls['name'].setValue(this.petsList.name);
            this.DevicesForm.controls['petType'].setValue(this.petsList.petType);
            this.DevicesForm.controls['veterinarian'].setValue(this.petsList.veterinarian);
            this.DevicesForm.controls['dietaryConcerns'].setValue(this.petsList.dietaryConcerns);
          }       
        }
      }, (err) => {
        console.error(err);
      })
  }  

  PetDelete(doc, name, tmName) {
      let ids = this.DevicesForm.controls['profileId'].value;
      var statMsg = "Are you sure you want to delete '" + name + "' file?"
      this.confirmService.confirm({ message: statMsg })
        .subscribe(res => {
          if (res) {
            this.loader.open();
            this.petDocumentsList.splice(doc, 1)
            var query = {};
            const req_vars = {
              query: Object.assign({ _id: ids }, query),
              proquery: Object.assign({ idProofDocuments: this.petDocumentsList }, query),
              fileName: Object.assign({ docName: tmName }, query)
            }
            this.userapi.apiRequest('post', 'documents/deleteIdDoc', req_vars).subscribe(result => {
              if (result.status == "error") {
                this.loader.close();
                this.snack.open(result.data.message, 'OK', { duration: 4000 })
              } else {
                if(this.petDocumentsList.length<1){
                  this.DevicesForm.controls['idProofDocuments_temp'].setValue('');
                }  
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

  public fileOverBase(e: any): void {
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
        this.uploaderCopy = cloneDeep(this.uploader)
        this.uploader.queue.splice(1, this.uploader.queue.length - 1)
        this.uploaderCopy.queue.splice(0, 1)
        
        this.uploader.queue.forEach((fileoOb, ind) => {
              this.uploader.uploadItem(fileoOb);
         });
   
         this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
           this.getPetsDocuments();
         };
       }
    }

    uploadRemainingFiles(profileId) {
      this.uploaderCopy.onBeforeUploadItem = (item) => {
        item.url = `${URL}?userId=${this.userId}&ProfileId=${profileId}`;
      }
      this.uploaderCopy.queue.forEach((fileoOb, ind) => {
          this.uploaderCopy.uploadItem(fileoOb);
      });
  
      this.uploaderCopy.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
        this.getPetsDocuments({}, false, false);
      
      };
    }

    getPetsDocuments = (query = {}, search = false, uploadRemained = true) => {     
      let profileIds = this.DevicesForm.controls['profileId'].value;
      let req_vars = {
        query: Object.assign({customerId: this.userId,status:"Pending" }),
        fields:{_id:1,documents:1}
      }
      if(profileIds){
         req_vars = {
          query: Object.assign({ _id:profileIds, customerId: this.userId  }),
          fields:{_id:1,documents:1}
        }
      }    
      this.userapi.apiRequest('post', 'pets/view-pets-details', req_vars).subscribe(result => {
        if (result.status == "error") {
        } else {
          profileIds = result.data._id;
          this.DevicesForm.controls['profileId'].setValue(profileIds);
          if(uploadRemained) {
            this.uploadRemainingFiles(profileIds)
          }
          this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
          this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
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
  

 

}