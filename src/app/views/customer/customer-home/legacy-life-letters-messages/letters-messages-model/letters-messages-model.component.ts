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
const URL = serverUrl + '/api/documents/letterMessage';
const filePath = s3Details.url+'/'+s3Details.letterMessageDocumentsPath;
@Component({
  selector: 'app-letters-messages-model',
  templateUrl: './letters-messages-model.component.html',
  styleUrls: ['./letters-messages-model.component.scss']
})
export class LettersMessagesModelComponent implements OnInit {
  userId = localStorage.getItem("endUserId"); 
  public hasBaseDropZoneOver: boolean = false;
  invalidMessage: string;
  LettersMessagesForm: FormGroup;
  documentsMissing = false;
  fileErrors: any;
  profileIdHiddenVal:boolean = false;
  documentsList: any;
  LetterMessageList:any = [];
  selectedProfileId: string;
  newName:string = "";
  docPath: string;
  constructor(private snack: MatSnackBar,public dialog: MatDialog, private fb: FormBuilder, private confirmService: AppConfirmService,private loader: AppLoaderService,private userapi: UserAPIService ) {}
  public uploader: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
  public uploaderCopy: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });

  ngOnInit() {
    this.docPath = filePath; 
 
    const locationArray = location.href.split('/')
    this.selectedProfileId = locationArray[locationArray.length - 1];
    if (this.selectedProfileId && this.selectedProfileId == 'letters-messages') {
      this.selectedProfileId = "";
    }

    this.LettersMessagesForm = this.fb.group({
      title: new FormControl('', Validators.required),
      letterBox: new FormControl('', Validators.required), 
      subject: new FormControl(''),
      profileId: new FormControl('')
     });

     this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${this.selectedProfileId}` });
     this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${this.selectedProfileId}` });
     this.documentsList = [];
     this.getLettersMessagesView();
   }

   LettersMessagesFormSubmit(profileInData = null) {
    var query = {};
    var proquery = {};     

    let req_vars = {
      query: Object.assign({customerId: this.userId }),
      proquery: Object.assign(profileInData),
      message: Object.assign({})
    }
    let profileIds = this.LettersMessagesForm.controls['profileId'].value;
    if(profileIds){
      req_vars = {
        query: Object.assign({ _id:profileIds, customerId: this.userId }),
        proquery: Object.assign(profileInData),
        message: Object.assign({})
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
          let profileIds = this.LetterMessageList._id;
          this.LettersMessagesForm.controls['profileId'].setValue(profileIds);
          this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
          this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
          this.LettersMessagesForm.controls['title'].setValue(this.LetterMessageList.title);
          this.LettersMessagesForm.controls['letterBox'].setValue(this.LetterMessageList.letterBox);
          this.LettersMessagesForm.controls['subject'].setValue(this.LetterMessageList.subject);
          this.documentsList = result.data.documents;       
        }       
      }
    }, (err) => {
      console.error(err);
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
        this.getlettersMessagesDocuments();
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
      this.getlettersMessagesDocuments({}, false, false);
    };
  }

  getlettersMessagesDocuments = (query = {}, search = false, uploadRemained = true) => {    
    let profileIds = this.LettersMessagesForm.controls['profileId'].value;
    let req_vars = {
      query: Object.assign({customerId: this.userId,status:"Pending" }),
      fields:{_id:1,documents:1}
    }
    if(profileIds){
       req_vars = {
        query: Object.assign({ _id:profileIds, customerId: this.userId }),
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
        this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
        this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
        this.documentsList = result.data.documents;                    
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
            fileName: Object.assign({ docName: tmName }, query)
          }
          this.userapi.apiRequest('post', 'documents/deleteletterMessageDoc', req_vars).subscribe(result => {
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
  {  
    var key;  
    key = event.charCode;
    return((key > 64 && key < 91) || (key> 96 && key < 123) || key == 8 || key == 32 || (key >= 48 && key <= 57)); 
  }

}