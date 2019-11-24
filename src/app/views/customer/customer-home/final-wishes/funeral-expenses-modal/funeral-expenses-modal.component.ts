import { Component, OnInit } from '@angular/core';
import { UserAPIService } from './../../../../../userapi.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AppConfirmService } from '../../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { FileUploader } from 'ng2-file-upload';
import { serverUrl, s3Details } from '../../../../../config';
import { cloneDeep } from 'lodash';
import { FileHandlingService } from 'app/shared/services/file-handling.service';
import { DataSharingService } from 'app/shared/services/data-sharing.service';
import { toppingList } from '../../../../../selectList';
const URL = serverUrl + '/api/documents/funeralExpenses';

@Component({
  selector: 'app-funeral-expenses-modal',
  templateUrl: './funeral-expenses-modal.component.html',
  styleUrls: ['./funeral-expenses-modal.component.scss']
})
export class FuneralExpensesModalComponent implements OnInit {

  public hasBaseDropZoneOver: boolean = false;
  toppingList = toppingList.sort();
  userId = localStorage.getItem("endUserId");
  selectedProfileId: string;
  invalidMessage: string;
  documentsMissing = false;
  documents_temps = false;
  obituaryCheck: boolean = false;
  obituaryCheckPhotos: boolean = false;
  profileIdHiddenVal:boolean = false;
  urlData:any={};	  
  customerLegaciesId: string;
  customerLegacyType:string='customer';
  LegacyPermissionError:string="You don't have access to this section";
  trusteeLegaciesAction:boolean=true;
  currentProgessinPercent:number = 0;
  toUserId:string = ''
  fileErrors: any;
  documentsList: any;
  docPath: string;  
  subFolderName:string = '';
  expenseData:any;

  expensesFormGroup: FormGroup;
  preneedContract = false;
  madePrearrangment = true;
  
  constructor(private _formBuilder: FormBuilder,private snack: MatSnackBar,public dialog: MatDialog,  private confirmService: AppConfirmService, private loader: AppLoaderService, private router: Router, private userapi: UserAPIService,private fileHandlingService: FileHandlingService,private sharedata: DataSharingService) { }
  public uploader: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
  public uploaderCopy: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });

  ngOnInit() {
    const filePath = this.userId+'/'+s3Details.funeralExpensesFilePath;
    this.docPath = filePath;
    this.documentsList = [];

    this.expensesFormGroup = this._formBuilder.group({
      profileId:new FormControl(''),
      toppings : new FormControl(''),
      haveFuneralArrangement : new FormControl('1'),
      funeralHome : new FormControl('', Validators.required),
      funeralDirector : new FormControl(''),
      address : new FormControl(''),
      phoneNumber : new FormControl(''),

      preneedContractLocation: [''],
      haveGuarantee : new FormControl(''),
      prepaidFuneralServices : new FormControl([]),
      havePriceList : new FormControl(false),
      totalAmountPay : new FormControl(''),
      haveToPayOnDeath : new FormControl(false),
      account : new FormControl(''),

      amountInAccount: new FormControl(''),
      financialInstitution : new FormControl(''),
      havePooled : new FormControl(false),
      pooledAccount : new FormControl(''),
      pooledAmount : new FormControl(''),
      pooledInsuranceCompany : new FormControl(''),
      ContactInfo : new FormControl(''),
      documents_temp: new FormControl(''),
      comments : new FormControl(''),
      additionalInstructions : new FormControl(''),
      
      

    });

    this.urlData = this.userapi.getURLData();
    this.selectedProfileId = this.urlData.lastOne;
    if (this.selectedProfileId && this.selectedProfileId == 'final-wishes' && this.urlData.lastThird != "legacies") {
      this.selectedProfileId = "";
    }

    if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'final-wishes') {
      this.customerLegaciesId = this.userId;
      this.customerLegacyType =  this.urlData.userType;
      this.userId = this.urlData.lastOne;          
      this.userapi.getUserAccess(this.userId,(userAccess,userDeathFilesCnt,userLockoutPeriod,userDeceased) => { 
        if(userLockoutPeriod || userDeceased){
          this.trusteeLegaciesAction = false;
        }
        this.sharedata.shareLegacyDeathfileCountData(userDeathFilesCnt);
       if(userAccess.FuneralExpenseManagement!='now'){
        this.trusteeLegaciesAction = false;
       }           
       });   
      this.selectedProfileId = "";        
    }
    this.toUserId = this.userId;
    this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${this.selectedProfileId}` });
    this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${this.selectedProfileId}` });
    this.getExpenseView();
  }

  getExpenseView = (query = {}, search = false) => {  
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
    this.userapi.apiRequest('post', 'finalwishes/view-funeral-expense-details', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if(result.data){   
          this.expenseData = result.data;   
          this.toUserId     = this.expenseData.customerId;
          let profileIds    = this.expenseData._id;
        
          this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
          this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
          this.documentsList = this.expenseData.documents;
          if(this.documentsList.length>0){
            this.expensesFormGroup.controls['documents_temp'].setValue('1');
            this.documentsMissing = false; 
          }

          if (this.expenseData.haveFuneralArrangement == "1") {
            this.madePrearrangment = true;
            this.preneedContract = false;
          } else  if (this.expenseData.haveFuneralArrangement == "2") {
            this.madePrearrangment = false;
            this.preneedContract = true;
          } else {
            this.madePrearrangment = false;
            this.preneedContract = false;
          }

          this.expensesFormGroup.controls['profileId'].setValue(profileIds);
          this.expensesFormGroup.controls['haveFuneralArrangement'].setValue(this.expenseData.haveFuneralArrangement);
          this.expensesFormGroup.controls['funeralHome'].setValue(this.expenseData.funeralHome);
          this.expensesFormGroup.controls['funeralDirector'].setValue(this.expenseData.funeralDirector);
          this.expensesFormGroup.controls['address'].setValue(this.expenseData.address);
          this.expensesFormGroup.controls['phoneNumber'].setValue(this.expenseData.phoneNumber);
          this.expensesFormGroup.controls['preneedContractLocation'].setValue(this.expenseData.preneedContractLocation);
          this.expensesFormGroup.controls['haveGuarantee'].setValue(this.expenseData.haveGuarantee);   
          
          this.expensesFormGroup.controls['prepaidFuneralServices'].setValue(this.expenseData.prepaidFuneralServices);
          this.expensesFormGroup.controls['havePriceList'].setValue(this.expenseData.havePriceList);
          this.expensesFormGroup.controls['totalAmountPay'].setValue(this.expenseData.totalAmountPay);
          this.expensesFormGroup.controls['haveToPayOnDeath'].setValue(this.expenseData.haveToPayOnDeath);
          this.expensesFormGroup.controls['account'].setValue(this.expenseData.account);
          this.expensesFormGroup.controls['amountInAccount'].setValue(this.expenseData.amountInAccount);
          this.expensesFormGroup.controls['financialInstitution'].setValue(this.expenseData.financialInstitution);

          this.expensesFormGroup.controls['havePooled'].setValue(this.expenseData.havePooled);
          this.expensesFormGroup.controls['pooledAccount'].setValue(this.expenseData.pooledAccount);
          this.expensesFormGroup.controls['pooledAmount'].setValue(this.expenseData.pooledAmount);
          this.expensesFormGroup.controls['pooledInsuranceCompany'].setValue(this.expenseData.pooledInsuranceCompany);
          this.expensesFormGroup.controls['ContactInfo'].setValue(this.expenseData.ContactInfo);
          this.expensesFormGroup.controls['comments'].setValue(this.expenseData.comments);
          this.expensesFormGroup.controls['additionalInstructions'].setValue(this.expenseData.additionalInstructions);

        }   
      }
    }, (err) => {
      console.error(err);
    })
  }

  onlyNumbers(event)
  {  
    if ((event.which != 46 ) && (event.which < 48 || event.which > 57)) {
      event.preventDefault();
    }
  }

  firstCapitalize(e) {
    let re = /(^|[.!?]\s+)([a-z])/g;
    var textBox: HTMLInputElement = <HTMLInputElement>e.target;
    textBox.value = textBox.value.replace(re, (m, $1, $2) => $1 + $2.toUpperCase());
  }

  ExpenseFormSubmit(profileInData = null) {
    var query = {};
    var proquery = {};  
    var profileIds = "";   
    if(this.expensesFormGroup.controls['profileId'].value){
      profileIds = this.expensesFormGroup.controls['profileId'].value;
    }
      
    if(profileIds){
      this.selectedProfileId = profileIds;
    }
    if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'final-wishes') {
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
      folderName:s3Details.funeralExpensesFilePath
    }

    //this.loader.open();     
    this.userapi.apiRequest('post', 'finalwishes/funeral-expense-form-submit', req_vars).subscribe(result => {
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

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
    this.fileErrors = [];
    let totalItemsToBeUpload = this.uploader.queue.length,
        totalUploderFileSize = 0,
        remainingSpace = 0,
        message = ''
        if(this.uploader.isUploading || this.uploaderCopy.isUploading){
          this.snack.open('Please wait! Uploading is in process...', 'OK', { duration: 4000 })
        }else{        
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
        })
      }
      else{
        let proceedToUpload = true
        if( message != '' ) {
          let confirmResponse = await this.confirmService.confirm({ message: message }).toPromise()
          proceedToUpload = true
        }
        if( proceedToUpload ) {
          if(this.selectedProfileId){
            this.uploader.onBeforeUploadItem = (item) => {
              item.url = `${URL}?userId=${this.userId}&ProfileId=${this.selectedProfileId}`;
            }
          }
          if(this.uploader.getNotUploadedItems().length){
            this.currentProgessinPercent = 1;
            this.uploaderCopy = cloneDeep(this.uploader)
            this.uploader.queue.splice(1, this.uploader.queue.length - 1)
            this.uploaderCopy.queue.splice(0, 1)
            
            this.uploader.queue.forEach((fileoOb, ind) => {
              this.expensesFormGroup.controls['documents_temp'].setValue('');
              this.uploader.uploadItem(fileoOb);             
            });

            this.updateProgressBar();
            this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
              this.getExpensesDocuments();
              setTimeout(()=>{    
                this.uploader.clearQueue();
                },800);
            };
            this.uploader.onCompleteAll = () => {
              setTimeout(()=>{    
                this.getExpensesDocuments();
                },5000);
            }
          }
        }
      }
    })
   }
  }

  updateProgressBar(){
    let uploaderLength = 0;  let uploaderCopyLength = 0;

    if(this.currentProgessinPercent==0){
      this.uploader.onProgressItem = (progress:any) => {
        this.currentProgessinPercent = progress;
      }
    }
    this.uploader.onProgressAll = (progress:any) => {
      uploaderLength = progress;
      if(this.uploaderCopy.queue.length==0){
        this.currentProgessinPercent = uploaderLength;
      }
      this.uploaderCopy.onProgressAll = ( progress: any) => {
        uploaderCopyLength = progress;
        this.currentProgessinPercent = (uploaderLength + uploaderCopyLength)/100;
        let totalLength = uploaderLength + uploaderCopyLength;
        this.currentProgessinPercent = totalLength - 100;
      }
    }
  }

  uploadRemainingFiles(profileId) {    
    this.uploaderCopy.onBeforeUploadItem = (item) => {
      item.url = `${URL}?userId=${this.userId}&ProfileId=${profileId}`;
      this.expensesFormGroup.controls['documents_temp'].setValue('');         
    }
    this.uploaderCopy.queue.forEach((fileoOb, ind) => {
        this.uploaderCopy.uploadItem(fileoOb);
        
    });
    this.updateProgressBar();
    this.uploaderCopy.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      this.uploaderCopy.removeFromQueue(item);
      this.getExpensesDocuments({}, false, false);   
    };

    this.uploaderCopy.onCompleteAll = () => {
      setTimeout(()=>{    
        this.getExpensesDocuments();
        },5000);
    }
}

  getExpensesDocuments = (query = {}, search = false, uploadRemained = true) => {    
    let profileIds = this.expensesFormGroup.controls['profileId'].value;
    let req_vars = {
      query: Object.assign({customerId: this.userId,status:"Pending" }),
      fields:{_id:1,documents:1}
    }
    if(profileIds){
       req_vars = {
        query: Object.assign({_id:profileIds }),
        fields:{_id:1,documents:1}
      }
    }
    this.userapi.apiRequest('post', 'finalwishes/view-funeral-expense-details', req_vars).subscribe(result => {
      if (result.status == "error") {
      } else {
        if(result.data){
          profileIds = this.selectedProfileId = result.data._id;
          this.expensesFormGroup.controls['profileId'].setValue(profileIds);
          if(uploadRemained) {
            this.uploadRemainingFiles(result.data._id)
          }

          this.documentsList = result.data.documents;      
          this.expensesFormGroup.controls['documents_temp'].setValue('');
          if(this.documentsList.length>0){
            this.expensesFormGroup.controls['documents_temp'].setValue('1');
            this.documentsMissing = false;
          }    
          if(this.currentProgessinPercent==100){
            this.currentProgessinPercent = 0;
          }                      
      }
    }
    }, (err) => {
      console.error(err);
    })
  }

  documentDelete(doc, name, tmName) {
    let ids = this.expensesFormGroup.controls['profileId'].value;
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
            fileName: Object.assign({ docName: tmName }, query),
            fromId:localStorage.getItem('endUserId'),
            toId:this.toUserId,
            folderName:s3Details.funeralExpensesFilePath,
          }
          this.userapi.apiRequest('post', 'documents/deletefinalwishesFuneralExpensesDoc', req_vars).subscribe(result => {
            if (result.status == "error") {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {           
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            }
       
            if (this.documentsList.length < 1) {
              this.expensesFormGroup.controls['documents_temp'].setValue('');
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

  downloadFile = (filename) => {    
    let query = {};
    let req_vars = {
      query: Object.assign({ docPath: this.docPath, filename: filename }, query),
      fromId:localStorage.getItem('endUserId'),
      toId:this.toUserId,
      folderName:s3Details.funeralExpensesFilePath,
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



  onChange(value){
    if (value == "1") {
      this.madePrearrangment = true;
      this.preneedContract = false;

      this.expensesFormGroup = this._formBuilder.group({
        profileId:new FormControl(this.expensesFormGroup.controls['profileId'].value),
        toppings : new FormControl(this.expensesFormGroup.controls['toppings'].value),
        haveFuneralArrangement : new FormControl(this.expensesFormGroup.controls['haveFuneralArrangement'].value),
        funeralHome : new FormControl(this.expensesFormGroup.controls['funeralHome'].value, Validators.required),
        funeralDirector : new FormControl(this.expensesFormGroup.controls['funeralDirector'].value),
        address : new FormControl(this.expensesFormGroup.controls['address'].value),
        phoneNumber : new FormControl(this.expensesFormGroup.controls['phoneNumber'].value),
  
        preneedContractLocation: [this.expensesFormGroup.controls['preneedContractLocation'].value],
        haveGuarantee : new FormControl(this.expensesFormGroup.controls['haveGuarantee'].value),
        prepaidFuneralServices : new FormControl(this.expensesFormGroup.controls['prepaidFuneralServices'].value),
        havePriceList : new FormControl(this.expensesFormGroup.controls['havePriceList'].value),
        totalAmountPay : new FormControl(this.expensesFormGroup.controls['totalAmountPay'].value),
        haveToPayOnDeath : new FormControl(this.expensesFormGroup.controls['haveToPayOnDeath'].value),
        account : new FormControl(this.expensesFormGroup.controls['account'].value),
  
        amountInAccount: new FormControl(this.expensesFormGroup.controls['amountInAccount'].value),
        financialInstitution : new FormControl(this.expensesFormGroup.controls['financialInstitution'].value),
        havePooled : new FormControl(this.expensesFormGroup.controls['havePooled'].value),
        pooledAccount : new FormControl(this.expensesFormGroup.controls['pooledAccount'].value),
        pooledAmount : new FormControl(this.expensesFormGroup.controls['pooledAmount'].value),
        pooledInsuranceCompany : new FormControl(this.expensesFormGroup.controls['pooledInsuranceCompany'].value),
        ContactInfo : new FormControl(this.expensesFormGroup.controls['ContactInfo'].value),
        documents_temp: new FormControl(this.expensesFormGroup.controls['documents_temp'].value),
        comments : new FormControl(this.expensesFormGroup.controls['comments'].value),
        additionalInstructions : new FormControl(this.expensesFormGroup.controls['additionalInstructions'].value),
        
        
  
      });


    } else  if (value == "2") {
      this.madePrearrangment = false;
      this.preneedContract = true;

      this.expensesFormGroup = this._formBuilder.group({
        profileId:new FormControl(this.expensesFormGroup.controls['profileId'].value),
        toppings : new FormControl(this.expensesFormGroup.controls['toppings'].value),
        haveFuneralArrangement : new FormControl(this.expensesFormGroup.controls['haveFuneralArrangement'].value),
        funeralHome : new FormControl(this.expensesFormGroup.controls['funeralHome'].value),
        funeralDirector : new FormControl(this.expensesFormGroup.controls['funeralDirector'].value),
        address : new FormControl(this.expensesFormGroup.controls['address'].value),
        phoneNumber : new FormControl(this.expensesFormGroup.controls['phoneNumber'].value),
  
        preneedContractLocation: new FormControl(this.expensesFormGroup.controls['preneedContractLocation'].value, Validators.required),
        haveGuarantee : new FormControl(this.expensesFormGroup.controls['haveGuarantee'].value),
        prepaidFuneralServices : new FormControl(this.expensesFormGroup.controls['prepaidFuneralServices'].value),
        havePriceList : new FormControl(this.expensesFormGroup.controls['havePriceList'].value),
        totalAmountPay : new FormControl(this.expensesFormGroup.controls['totalAmountPay'].value),
        haveToPayOnDeath : new FormControl(this.expensesFormGroup.controls['haveToPayOnDeath'].value),
        account : new FormControl(this.expensesFormGroup.controls['account'].value),
  
        amountInAccount: new FormControl(this.expensesFormGroup.controls['amountInAccount'].value),
        financialInstitution : new FormControl(this.expensesFormGroup.controls['financialInstitution'].value),
        havePooled : new FormControl(this.expensesFormGroup.controls['havePooled'].value),
        pooledAccount : new FormControl(this.expensesFormGroup.controls['pooledAccount'].value),
        pooledAmount : new FormControl(this.expensesFormGroup.controls['pooledAmount'].value),
        pooledInsuranceCompany : new FormControl(this.expensesFormGroup.controls['pooledInsuranceCompany'].value),
        ContactInfo : new FormControl(this.expensesFormGroup.controls['ContactInfo'].value),
        documents_temp: new FormControl(this.expensesFormGroup.controls['documents_temp'].value),
        comments : new FormControl(this.expensesFormGroup.controls['comments'].value),
        additionalInstructions : new FormControl(this.expensesFormGroup.controls['additionalInstructions'].value)
        
        
  
      });

    } else {
      this.madePrearrangment = false;
      this.preneedContract = false;

      this.expensesFormGroup = this._formBuilder.group({
        profileId:new FormControl(this.expensesFormGroup.controls['profileId'].value),
        toppings : new FormControl(this.expensesFormGroup.controls['toppings'].value),
        haveFuneralArrangement : new FormControl(this.expensesFormGroup.controls['haveFuneralArrangement'].value),
        funeralHome : new FormControl(this.expensesFormGroup.controls['funeralHome'].value),
        funeralDirector : new FormControl(this.expensesFormGroup.controls['funeralDirector'].value),
        address : new FormControl(this.expensesFormGroup.controls['address'].value),
        phoneNumber : new FormControl(this.expensesFormGroup.controls['phoneNumber'].value),
  
        preneedContractLocation: [this.expensesFormGroup.controls['preneedContractLocation'].value],
        haveGuarantee : new FormControl(this.expensesFormGroup.controls['haveGuarantee'].value),
        prepaidFuneralServices : new FormControl(this.expensesFormGroup.controls['prepaidFuneralServices'].value),
        havePriceList : new FormControl(this.expensesFormGroup.controls['havePriceList'].value),
        totalAmountPay : new FormControl(this.expensesFormGroup.controls['totalAmountPay'].value),
        haveToPayOnDeath : new FormControl(this.expensesFormGroup.controls['haveToPayOnDeath'].value),
        account : new FormControl(this.expensesFormGroup.controls['account'].value),
  
        amountInAccount: new FormControl(this.expensesFormGroup.controls['amountInAccount'].value),
        financialInstitution : new FormControl(this.expensesFormGroup.controls['financialInstitution'].value),
        havePooled : new FormControl(this.expensesFormGroup.controls['havePooled'].value),
        pooledAccount : new FormControl(this.expensesFormGroup.controls['pooledAccount'].value),
        pooledAmount : new FormControl(this.expensesFormGroup.controls['pooledAmount'].value),
        pooledInsuranceCompany : new FormControl(this.expensesFormGroup.controls['pooledInsuranceCompany'].value),
        ContactInfo : new FormControl(this.expensesFormGroup.controls['ContactInfo'].value),
        documents_temp: new FormControl(this.expensesFormGroup.controls['documents_temp'].value),
        comments : new FormControl(this.expensesFormGroup.controls['comments'].value),
        additionalInstructions : new FormControl(this.expensesFormGroup.controls['additionalInstructions'].value),
        
        
  
      });
    }
  }

}
