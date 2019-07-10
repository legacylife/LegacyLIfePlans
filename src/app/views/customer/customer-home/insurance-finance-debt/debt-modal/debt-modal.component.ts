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
import { DebtType } from '../../../../../selectList';

const URL = serverUrl + '/api/documents/debtDocuments';
const filePath = s3Details.url+'/'+s3Details.debtFilePath;
@Component({
  selector: 'app-essenioal-id-box',
  templateUrl: './debt-modal.component.html',
  styleUrls: ['./debt-modal.component.scss']
})
export class DebtModalComponent implements OnInit {
  userId = localStorage.getItem("endUserId");
  public uploader: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
  public uploaderCopy: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
  public hasBaseDropZoneOver: boolean = false;
  invalidMessage: string;
  DebtForm: FormGroup;  
  DebtDocsList: any;
  fileErrors: any;
  debtList:any;
  debtsTypeList:any[];
  profileIdHiddenVal:boolean = false;
  newVal:boolean = false;
  docPath: string;
  selectedProfileId: string;
  constructor(private snack: MatSnackBar,public dialog: MatDialog, private fb: FormBuilder,private confirmService: AppConfirmService,private loader: AppLoaderService,private router: Router, private userapi: UserAPIService) { }

  ngOnInit() {
        this.userId = localStorage.getItem("endUserId");
        this.debtsTypeList = DebtType;
        this.docPath = filePath;
        this.DebtForm = this.fb.group({
          debtsType: new FormControl('',Validators.required),  
          debtsTypeNew: new FormControl(''),   
          bankLendarName: new FormControl('',Validators.required),
          accountNumber: new FormControl(''),
          contactEmail: new FormControl('',Validators.pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i)),
          contactPhone: new FormControl('',Validators.pattern(/^[0-9]{7,15}$/)),
          comments: new FormControl(''),
          profileId: new FormControl('')
        });

        this.DebtDocsList = [];
        const locationArray = location.href.split('/')
        this.selectedProfileId = locationArray[locationArray.length - 1];

        if(this.selectedProfileId && this.selectedProfileId == 'insurance-finance-debt'){
          this.selectedProfileId = "";   
        }    
        this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${this.selectedProfileId}` });
        this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${this.selectedProfileId}` });
        this.getFinanceView();
    }

    onChangeType(key) {
      this.newVal = false;
      if(key=='7'){
        this.newVal = true;
        this.DebtForm = this.fb.group({
          debtsType: new FormControl(this.DebtForm.controls['debtsType'].value,Validators.required),
          debtsTypeNew: new FormControl(this.DebtForm.controls['debtsTypeNew'].value,Validators.required), 
          bankLendarName: new FormControl(this.DebtForm.controls['bankLendarName'].value,Validators.required),
          accountNumber: new FormControl(this.DebtForm.controls['accountNumber'].value,),
          contactEmail: new FormControl(this.DebtForm.controls['contactEmail'].value,Validators.pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i)),
          contactPhone: new FormControl(this.DebtForm.controls['contactPhone'].value,Validators.pattern(/^[0-9]{7,15}$/)),
          comments: new FormControl(this.DebtForm.controls['comments'].value,),
          profileId: new FormControl(this.DebtForm.controls['profileId'].value,)
        });
      }
      else {
        this.DebtForm = this.fb.group({
          debtsType: new FormControl(this.DebtForm.controls['debtsType'].value,Validators.required),
          debtsTypeNew: new FormControl(this.DebtForm.controls['debtsTypeNew'].value), 
          bankLendarName: new FormControl(this.DebtForm.controls['bankLendarName'].value,Validators.required),
          accountNumber: new FormControl(this.DebtForm.controls['accountNumber'].value,),
          contactEmail: new FormControl(this.DebtForm.controls['contactEmail'].value,Validators.pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i)),
          contactPhone: new FormControl(this.DebtForm.controls['contactPhone'].value,Validators.pattern(/^[0-9]{7,15}$/)),
          comments: new FormControl(this.DebtForm.controls['comments'].value,),
          profileId: new FormControl(this.DebtForm.controls['profileId'].value,)
        });
      }
    }

    DebtFormSubmit(profileInData = null) {
      var query = {};
      var proquery = {};     
      
      let profileIds = this.DebtForm.controls['profileId'].value;
      if(profileIds){
        this.selectedProfileId = profileIds;
      }
      const req_vars = {
        query: Object.assign({ _id: this.selectedProfileId,customerId: this.userId  }),
        proquery: Object.assign(profileInData)
      }
      this.loader.open();     
      this.userapi.apiRequest('post', 'insuranceFinanceDebt/debt-form-submit', req_vars).subscribe(result => {
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
          query: Object.assign({ _id:profileIds, customerId: this.userId })
        }
      }
      this.loader.open(); 
      this.userapi.apiRequest('post', 'insuranceFinanceDebt/view-debt-details', req_vars).subscribe(result => {
        this.loader.close();
        if (result.status == "error") {
          console.log(result.data)
        } else {
          if(result.data){    
            this.newVal = false;
            this.debtList = result.data;                    
            let profileIds = this.debtList._id;
            this.DebtForm.controls['profileId'].setValue(profileIds);
            this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
            this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
                
            this.DebtForm.controls['debtsType'].setValue(this.debtList.debtsType);
            this.DebtForm.controls['debtsTypeNew'].setValue(this.debtList.debtsTypeNew);
            if(this.debtList.debtsType == '7'){
              this.newVal = true;
            }            
            this.DebtForm.controls['bankLendarName'].setValue(this.debtList.bankLendarName);
            this.DebtForm.controls['accountNumber'].setValue(this.debtList.accountNumber);
            this.DebtForm.controls['contactEmail'].setValue(this.debtList.contactEmail);
            this.DebtForm.controls['contactPhone'].setValue(this.debtList.contactPhone);
            this.DebtForm.controls['comments'].setValue(this.debtList.comments);
          }       
        }
      }, (err) => {
        console.error(err);
      })
    }  

  FinanceDelete(doc, name, tmName) {
      let ids = this.DebtForm.controls['profileId'].value;
      var statMsg = "Are you sure you want to delete '" + name + "' file?"
      this.confirmService.confirm({ message: statMsg })
        .subscribe(res => {
          if (res) {
            this.loader.open();
            this.DebtDocsList.splice(doc, 1)
            var query = {};
            const req_vars = {
              query: Object.assign({ _id: ids }, query),
              proquery: Object.assign({ documents: this.DebtDocsList }, query),
              fileName: Object.assign({ docName: tmName }, query)
            }
            this.userapi.apiRequest('post', 'documents/deleteDebtDoc', req_vars).subscribe(result => {
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