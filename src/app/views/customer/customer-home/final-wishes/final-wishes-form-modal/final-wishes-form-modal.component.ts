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
  subFolderDocumentsList: any;
  finalWishList:any = [];

  constructor(private snack: MatSnackBar,public dialog: MatDialog, private fb: FormBuilder, 
    private confirmService: AppConfirmService,private loader: AppLoaderService, private router: Router,
    private userapi: UserAPIService  ,@Inject(MAT_DIALOG_DATA) public data: any ) 
  { this.folderName = data.FolderName;this.newName = data.newName;}
  public uploader: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
  public uploaderCopy: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });

  ngOnInit() {
     this.userId = localStorage.getItem("endUserId");
     if(this.newName && this.newName != ''){
      this.folderName = this.newName
    }
     this.FinalForm = this.fb.group({
      title: new FormControl('',Validators.required),
      comments: new FormControl(''),
      subFolderDocuments: new FormControl(''),
      //subFolderDocuments_temp: new FormControl(''),
      profileId: new FormControl('')
     });
     this.wishDocumentsList = [];

     const locationArray = location.href.split('/')
     this.selectedProfileId = locationArray[locationArray.length - 1];

     if(this.selectedProfileId && this.selectedProfileId == 'final-wishes'){
        this.selectedProfileId = "";   
     }    

     this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&folderName=${this.folderName}&ProfileId=${this.selectedProfileId}` });
     this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&folderName=${this.folderName}&ProfileId=${this.selectedProfileId}` });
     this.subFolderDocumentsList = [];
     this.getFinalWishesView();
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
            let profileIds = this.finalWishList._id;
            this.FinalForm.controls['profileId'].setValue(profileIds);
            
            this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&folderName=${this.folderName}&ProfileId=${profileIds}` });
            this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&folderName=${this.folderName}&ProfileId=${profileIds}` });
            this.subFolderDocumentsList = result.data.subFolderDocuments;
            
            this.FinalForm.controls['title'].setValue(this.finalWishList.title); 
            this.FinalForm.controls['comments'].setValue(this.finalWishList.comments);
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
      let req_vars = {
        query: Object.assign({customerId: this.userId,subFolderName:this.folderName }),
        proquery: Object.assign(profileInData),
        message: Object.assign({ messageText: this.folderName })
      }
      let profileIds = this.FinalForm.controls['profileId'].value;
      if(profileIds){
        req_vars = {
          query: Object.assign({ _id:profileIds, customerId: this.userId }),
          proquery: Object.assign(profileInData),
          message: Object.assign({ messageText: this.folderName })
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
           this.getWishesDocuments();
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
        this.getWishesDocuments({}, false, false);      
      };
  }

   getWishesDocuments = (query = {}, search = false, uploadRemained = true) => {    
    let profileIds = this.FinalForm.controls['profileId'].value;
    let req_vars = {
      query: Object.assign({customerId: this.userId,subFolderName:this.folderName,status:"Pending" }),
      fields:{_id:1,subFolderDocuments:1}
    }
    if(profileIds){
       req_vars = {
        query: Object.assign({ _id:profileIds, customerId: this.userId }),
        fields:{_id:1,subFolderDocuments:1}
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
        this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
        this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
        this.subFolderDocumentsList = result.data.subFolderDocuments;                       
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
          this.subFolderDocumentsList.splice(doc, 1)
          var query = {};
          const req_vars = {
            query: Object.assign({ _id: ids }, query),
            proquery: Object.assign({ subFolderDocuments: this.subFolderDocumentsList }, query),
            fileName: Object.assign({ docName: tmName }, query)
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


}