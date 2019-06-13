import { Component, OnInit,Inject } from '@angular/core';
import { APIService } from './../../../../api.service';
import { UserAPIService } from './../../../../userapi.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AppConfirmService } from '../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { CustomValidators } from 'ng2-validation';
import { MatDialog, MatSnackBar,MAT_DIALOG_DATA  } from '@angular/material';
import { Router } from '@angular/router';
import { EstateTypeOfDocument,HealthcareTypeOfDocument,PersonalAffairsTypeOfDocument } from '../../../../selectList';
import { FileUploader } from 'ng2-file-upload';
import { serverUrl, s3Details } from '../../../../config';
const URL = serverUrl + '/api/documents/legalStuff';

@Component({
  selector: 'app-legal-stuff-modal',
  templateUrl: './legal-stuff-modal.component.html',
  styleUrls: ['./legal-stuff-modal.component.scss']
})
export class legalStuffModalComponent implements OnInit {

  userId = localStorage.getItem("endUserId"); 
  public hasBaseDropZoneOver: boolean = false;
  invalidMessage: string;
  LegalForm: FormGroup;
  subFolderDocumentsMissing = false;
  subFolderDocuments_temps = false;
  fileErrors: any;
  profileIdHiddenVal:boolean = false;
  subFolderDocumentsList: any;
  LegalStuffList:any = [];
  folderName: string;
  typeOfDocumentList: any[]
  selectedProfileId: string;
  newName:string = "";
  constructor(private snack: MatSnackBar,public dialog: MatDialog, private fb: FormBuilder, private confirmService: AppConfirmService,private loader: AppLoaderService, private userapi: UserAPIService ,@Inject(MAT_DIALOG_DATA) public data: any ) { this.folderName = data.FolderName;this.newName = data.newName;}
  public uploader: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });

  ngOnInit() {
    if(this.newName && this.newName != ''){
      this.folderName = this.newName
    }
    const locationArray = location.href.split('/')
    this.selectedProfileId = locationArray[locationArray.length - 1];

    if (this.selectedProfileId && this.selectedProfileId == 'legal-stuff') {
      this.selectedProfileId = "";
    }
    this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&folderName=${this.folderName}&ProfileId=${this.selectedProfileId}` });
   
    if(this.folderName=='Estate'){
      this.typeOfDocumentList = EstateTypeOfDocument;
    }else if(this.folderName=='Healthcare'){
      this.typeOfDocumentList = HealthcareTypeOfDocument;
    }else if(this.folderName=='Personal Affairs'){
      this.typeOfDocumentList = PersonalAffairsTypeOfDocument;      
    }
    this.LegalForm = this.fb.group({
      typeOfDocument: new FormControl('', Validators.required),
      subFolderDocuments_temp: new FormControl([], Validators.required),
      comments: new FormControl('', Validators.required), 
      profileId: new FormControl('')
     });
     this.subFolderDocumentsList = [];
     this.getEssentialLegalView();

   }

   LegalFormSubmit(profileInData = null) {
    var query = {};
    var proquery = {};     
    profileInData.subFolderName = this.folderName;
    const req_vars = {
      query: Object.assign({customerId: this.userId,subFolderName:this.folderName }),
      proquery: Object.assign(profileInData),
      message: Object.assign({ messageText: "Estate" })
    }
    let profileIds = this.LegalForm.controls['profileId'].value;
    if(profileIds){
      const req_vars = {
        query: Object.assign({ _id:profileIds, customerId: this.userId }),
        proquery: Object.assign(profileInData),
        message: Object.assign({ messageText: "Estate" })
      }
    }
    //console.log("profileInData",profileInData)
    this.loader.open();     
    this.userapi.apiRequest('post', 'customer/essentials-legal-form-submit', req_vars).subscribe(result => {
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


  getEssentialLegalView = (query = {}, search = false) => { 
   
    let req_vars = {
      query: Object.assign({ customerId: this.userId,subFolderName:this.folderName,status:"Pending" }, query)//, status:"Pending"
    }

    let profileIds = '';
    if (this.selectedProfileId) {
      profileIds = this.selectedProfileId;
      req_vars = {
        query: Object.assign({ _id: profileIds })
      }
    }

    this.loader.open(); 
    this.userapi.apiRequest('post', 'customer/view-legalStuff-details', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if(result.data){    
          this.LegalStuffList = result.data;   
          this.LegalForm.controls['profileId'].setValue(this.LegalStuffList._id);
          this.subFolderDocumentsList = result.data.subFolderDocuments;

          if(this.LegalStuffList.subFolderDocuments.length>0){
            this.LegalForm.controls['subFolderDocuments_temp'].setValue('1');
          }
          this.LegalForm.controls['typeOfDocument'].setValue(this.LegalStuffList.typeOfDocument); 
          this.LegalForm.controls['comments'].setValue(this.LegalStuffList.comments);
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
      this.uploader.uploadAll();
      this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
        this.getLegalDocuments();
      };
    }
  }


  getLegalDocuments = (query = {}, search = false) => {    

    let profileIds = this.LegalForm.controls['profileId'].value;
    let req_vars = {
      query: Object.assign({customerId: this.userId,subFolderName:this.folderName,status:"Pending" }),
      fields:{subFolderDocuments:1}
    }
    if(profileIds){
       req_vars = {
        query: Object.assign({ _id:profileIds, customerId: this.userId }),
        fields:{subFolderDocuments:1}
      }
    }    
    this.userapi.apiRequest('post', 'customer/view-legalStuff-details', req_vars).subscribe(result => {
      if (result.status == "error") {
      } else {
        //this.profile = result.data.userProfile;
        this.subFolderDocumentsList = result.data.subFolderDocuments;        
        if(result.data.subFolderDocuments.length>0){
          this.LegalForm.controls['subFolderDocuments_temp'].setValue('1');
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

}