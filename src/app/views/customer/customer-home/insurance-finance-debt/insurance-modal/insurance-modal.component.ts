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
import { InsurancePolicyType } from '../../../../../selectList';

const URL = serverUrl + '/api/documents/insuranceDocuments';
const filePath = s3Details.url+'/'+s3Details.insuranceFilePath;
@Component({
  selector: 'app-essenioal-id-box',
  templateUrl: './insurance-modal.component.html',
  styleUrls: ['./insurance-modal.component.scss']
})
export class InsuranceModalComponent implements OnInit {
  userId = localStorage.getItem("endUserId");
  public uploader: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
  public uploaderCopy: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
  public hasBaseDropZoneOver: boolean = false;
  invalidMessage: string;
  InsuranceForm: FormGroup;  
  InsuranceDocsList: any;
  fileErrors: any;
  insuranceList:any;
  policyTypeList:any[];
  profileIdHiddenVal:boolean = false;
  docPath: string;
  selectedProfileId: string;
  constructor(private snack: MatSnackBar,public dialog: MatDialog, private fb: FormBuilder,private confirmService: AppConfirmService,private loader: AppLoaderService,private router: Router, private userapi: UserAPIService) { }

  ngOnInit() {
        this.userId = localStorage.getItem("endUserId");
        this.policyTypeList = InsurancePolicyType;
        this.docPath = filePath;
        this.InsuranceForm = this.fb.group({
          policyType: new FormControl('',Validators.required),     
          company: new FormControl(''),
          policyNumber: new FormControl(''),
          contactPerson: new FormControl(''),
          contactEmail: new FormControl('',Validators.pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i)),
          contactPhone: new FormControl(''),
          comments: new FormControl(''),
          profileId: new FormControl('')
        });

        this.InsuranceDocsList = [];
        const locationArray = location.href.split('/')
        this.selectedProfileId = locationArray[locationArray.length - 1];

        if(this.selectedProfileId && this.selectedProfileId == 'insurance-finance-debt'){
          this.selectedProfileId = "";   
        }    
        this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${this.selectedProfileId}` });
        this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${this.selectedProfileId}` });
        this.getInsuranceView();
    }

    InsuranceFormSubmit(profileInData = null) {
      var query = {};
      var proquery = {};     
      
      let profileIds = this.InsuranceForm.controls['profileId'].value;
      if(profileIds){
        this.selectedProfileId = profileIds;
      }
      const req_vars = {
        query: Object.assign({ _id: this.selectedProfileId,customerId: this.userId  }),
        proquery: Object.assign(profileInData)
      }
      this.loader.open();     
      this.userapi.apiRequest('post', 'insuranceFinanceDebt/insurance-form-submit', req_vars).subscribe(result => {
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

    getInsuranceView = (query = {}, search = false) => { 
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
      this.userapi.apiRequest('post', 'insuranceFinanceDebt/view-insurance-details', req_vars).subscribe(result => {
        this.loader.close();
        if (result.status == "error") {
          console.log(result.data)
        } else {
          if(result.data){    
            this.insuranceList = result.data;                    
            let profileIds = this.insuranceList._id;
            this.InsuranceForm.controls['profileId'].setValue(profileIds);
            this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
            this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
            this.InsuranceDocsList = result.data.documents;            
            this.InsuranceForm.controls['policyType'].setValue(this.insuranceList.policyType);
            this.InsuranceForm.controls['company'].setValue(this.insuranceList.company);
            this.InsuranceForm.controls['policyNumber'].setValue(this.insuranceList.policyNumber);
            this.InsuranceForm.controls['contactPerson'].setValue(this.insuranceList.contactPerson);
            this.InsuranceForm.controls['contactEmail'].setValue(this.insuranceList.contactEmail);
            this.InsuranceForm.controls['contactPhone'].setValue(this.insuranceList.contactPhone);
            this.InsuranceForm.controls['comments'].setValue(this.insuranceList.comments);
          }       
        }
      }, (err) => {
        console.error(err);
      })
    }  

    InsuranceDelete(doc, name, tmName) {
      let ids = this.InsuranceForm.controls['profileId'].value;
      var statMsg = "Are you sure you want to delete '" + name + "' file?"
      this.confirmService.confirm({ message: statMsg })
        .subscribe(res => {
          if (res) {
            this.loader.open();
            this.InsuranceDocsList.splice(doc, 1)
            var query = {};
            const req_vars = {
              query: Object.assign({ _id: ids }, query),
              proquery: Object.assign({ documents: this.InsuranceDocsList }, query),
              fileName: Object.assign({ docName: tmName }, query)
            }
            this.userapi.apiRequest('post', 'documents/deleteInsuranceDoc', req_vars).subscribe(result => {
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
           this.getInsuranceDocuments();
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
        this.getInsuranceDocuments({}, false, false);
      
      };
    }

    getInsuranceDocuments = (query = {}, search = false, uploadRemained = true) => {     
      let profileIds = this.InsuranceForm.controls['profileId'].value;
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
      this.userapi.apiRequest('post', 'insuranceFinanceDebt/view-insurance-details', req_vars).subscribe(result => {
        if (result.status == "error") {
        } else {
          profileIds = result.data._id;
          this.InsuranceForm.controls['profileId'].setValue(profileIds);
          if(uploadRemained) {
            this.uploadRemainingFiles(profileIds)
          }
          this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
          this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
          this.InsuranceDocsList = result.data.documents;              
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
}