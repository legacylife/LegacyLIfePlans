import { Component, OnInit } from '@angular/core';
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
import { FinancePolicyType } from '../../../../../selectList';
import { FileHandlingService } from 'app/shared/services/file-handling.service';
const URL = serverUrl + '/api/documents/financeDocuments';

@Component({
  selector: 'app-essenioal-id-box',
  templateUrl: './finance-modal.component.html',
  styleUrls: ['./finance-modal.component.scss']
})
export class FinanceModalComponent implements OnInit {
  userId = localStorage.getItem("endUserId");
  public uploader: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
  public uploaderCopy: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
  public hasBaseDropZoneOver: boolean = false;
  invalidMessage: string;
  documentsMissing = false;
  documents_temps = false;
  FinanceForm: FormGroup;  
  FinanceDocsList: any;
  fileErrors: any;
  financeList:any;
  financeTypeList:any[];
  profileIdHiddenVal:boolean = false;
  newVal:boolean = false;
  docPath: string;
  selectedProfileId: string;
  urlData:any={};
  customerLegaciesId: string;
  customerLegacyType:string='customer';
  currentProgessinPercent:number = 0;
  toUserId:string = ''
  subFolderName:string = 'Finance'

  constructor(private snack: MatSnackBar,public dialog: MatDialog, private fb: FormBuilder,
    private confirmService: AppConfirmService,private loader: AppLoaderService,
    private router: Router, private userapi: UserAPIService,
    private fileHandlingService: FileHandlingService) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    const filePath = this.userId+'/'+s3Details.financeFilePath;
    this.financeTypeList = FinancePolicyType;
    this.docPath = filePath;
    this.FinanceForm = this.fb.group({
      financesType: new FormControl('',Validators.required),  
      financesTypeNew: new FormControl(''),   
      nameOnAccount: new FormControl('',Validators.required),
      administatorName: new FormControl('',Validators.required),
      branchLocation: new FormControl(''),
      accountNumber: new FormControl(''),
      contactEmail: new FormControl('',Validators.pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i)),
      contactPhone: new FormControl('',Validators.pattern(/^[0-9]{7,15}$/)),
      comments: new FormControl(''),
      profileId: new FormControl(''),
      documents_temp: new FormControl([], Validators.required),
    });

    this.FinanceDocsList = [];
    this.urlData = this.userapi.getURLData();
    this.selectedProfileId = this.urlData.lastOne;
    if (this.selectedProfileId && this.selectedProfileId == 'insurance-finance-debt' && this.urlData.lastThird != "legacies") {
      this.selectedProfileId = "";
    }        
    if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'insurance-finance-debt') {
        this.customerLegaciesId = this.userId;
        this.customerLegacyType =  this.urlData.userType;
        this.userId = this.urlData.lastOne;          
        this.selectedProfileId = "";        
    }
    this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${this.selectedProfileId}` });
    this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${this.selectedProfileId}` });
    this.toUserId = this.userId
    this.getFinanceView();
  }

  onChangeType(key) {
    this.newVal = false;
    if(key=='16'){
      this.newVal = true;
      this.FinanceForm = this.fb.group({
        financesType: new FormControl(this.FinanceForm.controls['financesType'].value,Validators.required),
        financesTypeNew: new FormControl(this.FinanceForm.controls['financesTypeNew'].value,Validators.required), 
        nameOnAccount: new FormControl(this.FinanceForm.controls['nameOnAccount'].value,Validators.required),
        administatorName: new FormControl(this.FinanceForm.controls['administatorName'].value,Validators.required),
        branchLocation: new FormControl(this.FinanceForm.controls['branchLocation'].value,),
        accountNumber: new FormControl(this.FinanceForm.controls['accountNumber'].value,),
        contactEmail: new FormControl(this.FinanceForm.controls['contactEmail'].value, Validators.pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i)),
        contactPhone: new FormControl(this.FinanceForm.controls['contactPhone'].value,Validators.pattern(/^[0-9]{7,15}$/)),
        comments: new FormControl(this.FinanceForm.controls['comments'].value,),
        profileId: new FormControl(this.FinanceForm.controls['profileId'].value,)
      });
    }  
    else {
      this.FinanceForm = this.fb.group({
        financesType: new FormControl(this.FinanceForm.controls['financesType'].value,Validators.required),
        financesTypeNew: new FormControl(this.FinanceForm.controls['financesTypeNew'].value), 
        administatorName: new FormControl(this.FinanceForm.controls['administatorName'].value,Validators.required),
        nameOnAccount: new FormControl(this.FinanceForm.controls['nameOnAccount'].value,Validators.required),
        branchLocation: new FormControl(this.FinanceForm.controls['branchLocation'].value,),
        accountNumber: new FormControl(this.FinanceForm.controls['accountNumber'].value,),
        contactEmail: new FormControl(this.FinanceForm.controls['contactEmail'].value,Validators.pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i)),
        contactPhone: new FormControl(this.FinanceForm.controls['contactPhone'].value,Validators.pattern(/^[0-9]{7,15}$/)),
        comments: new FormControl(this.FinanceForm.controls['comments'].value,),
        profileId: new FormControl(this.FinanceForm.controls['profileId'].value,)
      });
    }    
  }

  FinanceFormSubmit(profileInData = null) {
    var query = {};
    var proquery = {};     
    
    let profileIds = this.FinanceForm.controls['profileId'].value;
    if(profileIds){
      this.selectedProfileId = profileIds;
    }
    if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'insurance-finance-debt') {
      profileInData.customerLegacyId = this.customerLegaciesId
      profileInData.customerLegacyType = this.customerLegacyType
    }

    if(!profileInData.profileId || profileInData.profileId ==''){
      profileInData.customerId = this.userId
    }
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId}),
      proquery: Object.assign(profileInData),
      fromId:localStorage.getItem("endUserId"),
      toId:this.toUserId,
      folderName:s3Details.financeFilePath,
      subFolderName:this.subFolderName
    }
    this.loader.open();     
    this.userapi.apiRequest('post', 'insuranceFinanceDebt/finance-form-submit', req_vars).subscribe(result => {
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

  getFinanceView = (query = {}, search = false) => { 
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
    this.userapi.apiRequest('post', 'insuranceFinanceDebt/view-finance-details', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if(result.data){    
          this.newVal = false;
          this.financeList = result.data;     
          this.toUserId = this.financeList.customerId                   
          let profileIds = this.financeList._id;
          this.FinanceForm.controls['profileId'].setValue(profileIds);
          this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
          this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
          this.FinanceDocsList = result.data.documents;     
          if(this.FinanceDocsList.length>0){
            this.FinanceForm.controls['documents_temp'].setValue('1');
            this.documentsMissing = false;
          }       
          this.FinanceForm.controls['financesType'].setValue(this.financeList.financesType);
          this.FinanceForm.controls['financesTypeNew'].setValue(this.financeList.financesTypeNew);
          if(this.financeList.financesType == 16){
            this.newVal = true;
          }  
          this.FinanceForm.controls['nameOnAccount'].setValue(this.financeList.nameOnAccount);          
          this.FinanceForm.controls['administatorName'].setValue(this.financeList.administatorName);
          this.FinanceForm.controls['accountNumber'].setValue(this.financeList.accountNumber);
          this.FinanceForm.controls['branchLocation'].setValue(this.financeList.branchLocation);           
          this.FinanceForm.controls['contactEmail'].setValue(this.financeList.contactEmail);
          this.FinanceForm.controls['contactPhone'].setValue(this.financeList.contactPhone);
          this.FinanceForm.controls['comments'].setValue(this.financeList.comments);
        }       
      }
    }, (err) => {
      console.error(err);
    })
  }  

  FinanceDelete(doc, name, tmName) {
    let ids = this.FinanceForm.controls['profileId'].value;
    var statMsg = "Are you sure you want to delete '" + name + "' file?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          this.FinanceDocsList.splice(doc, 1)
          var query = {};
          const req_vars = {
            query: Object.assign({ _id: ids }, query),
            proquery: Object.assign({ documents: this.FinanceDocsList }, query),
            fileName: Object.assign({ docName: tmName }, query),
            fromId:localStorage.getItem("endUserId"),
            toId:this.toUserId,
            folderName:s3Details.financeFilePath,
            subFolderName:this.subFolderName
          }
          this.userapi.apiRequest('post', 'documents/deleteFinanceDoc', req_vars).subscribe(result => {
            if (result.status == "error") {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            }
            if (this.FinanceDocsList.length < 1) {
              this.FinanceForm.controls['documents_temp'].setValue('');
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

    let legacyUserData = {userId: this.toUserId, userType:'customer'}
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
                  this.FinanceForm.controls['documents_temp'].setValue('');    
                  this.uploader.uploadItem(fileoOb);
              });
              this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
                this.updateProgressBar();
                this.getFinanceDocuments();
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
    if(this.uploader.queue.length>0){
      this.uploader.clearQueue();
    }
  }

  uploadRemainingFiles(profileId) {
    this.uploaderCopy.onBeforeUploadItem = (item) => {
      item.url = `${URL}?userId=${this.userId}&ProfileId=${profileId}`;
      this.FinanceForm.controls['documents_temp'].setValue('');        
    }
    this.uploaderCopy.queue.forEach((fileoOb, ind) => {
        this.uploaderCopy.uploadItem(fileoOb);
    });

    this.uploaderCopy.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      this.updateProgressBar();
      this.getFinanceDocuments({}, false, false);      
    };
  }

  getFinanceDocuments = (query = {}, search = false, uploadRemained = true) => {     
    let profileIds = this.FinanceForm.controls['profileId'].value;
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
    this.userapi.apiRequest('post', 'insuranceFinanceDebt/view-finance-details', req_vars).subscribe(result => {
      if (result.status == "error") {
      } else {
        profileIds = result.data._id;
        this.FinanceForm.controls['profileId'].setValue(profileIds);
        if(uploadRemained) {
          this.uploadRemainingFiles(profileIds)
        }
        this.FinanceDocsList = result.data.documents;    
        this.FinanceForm.controls['documents_temp'].setValue('');
        if(this.FinanceDocsList.length>0){
          this.FinanceForm.controls['documents_temp'].setValue('1');
          this.documentsMissing = false;
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

  onlyNumbers(event)
  {  
    if ((event.which != 46 ) && (event.which < 48 || event.which > 57)) {
      event.preventDefault();
    }
  }

  downloadFile = (filename) => {    
    let query = {};
    let req_vars = {
      query: Object.assign({ docPath: this.docPath, filename: filename }, query),
      fromId:localStorage.getItem("endUserId"),
      toId:this.toUserId,
      folderName:s3Details.financeFilePath,
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