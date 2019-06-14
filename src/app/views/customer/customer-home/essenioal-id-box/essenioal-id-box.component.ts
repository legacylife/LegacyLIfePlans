import { Component, OnInit } from '@angular/core';
import { APIService } from './../../../../api.service';
import { UserAPIService } from './../../../../userapi.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { AppConfirmService } from '../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { documentTypes } from '../../../../selectList';
import { FileUploader } from 'ng2-file-upload';
import { serverUrl, s3Details } from '../../../../config';
import { states } from '../../../../state';
import { cloneDeep } from 'lodash'
const URL = serverUrl + '/api/documents/myEssentialsID';
@Component({
  selector: 'app-essenioal-id-box',
  templateUrl: './essenioal-id-box.component.html',
  styleUrls: ['./essenioal-id-box.component.scss']
})
export class EssenioalIdBoxComponent implements OnInit {
  //selected = 'option1';
  userId = localStorage.getItem("endUserId");
  public uploader: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
  public uploaderCopy: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
  public hasBaseDropZoneOver: boolean = false;
  public hasAnotherDropZoneOver: boolean = false;
  advisorDocumentsHide = false;
  invalidMessage: string;
  advisorDocumentsMissing: boolean = false;
  IDForm: FormGroup;
  documentTypeList: any[] = documentTypes;
  idProofDocumentsList: any;
  idProofDocumentsMissing = false;
  idProofDocuments_temps = false;
  fileErrors: any;
  stateList: any;

  typeOne: boolean = false;
  typeOneTwo: boolean = false;
  typeOneTwoSixSeven: boolean = false;
  typeThree: boolean = false;
  typeTwo: boolean = false;
  typeFour: boolean = false;
  typeFive: boolean = false;
  typeSix: boolean = false;
  typeSeven: boolean = false;
  typeSixSeven: boolean = false;
  essentialIDList:any = [];
  showIDListingCnt:any;
  profileIdHiddenVal:boolean = false;
  selectedProfileId: string;
  constructor(private snack: MatSnackBar,public dialog: MatDialog, private fb: FormBuilder, 
    private confirmService: AppConfirmService,private loader: AppLoaderService, private router: Router,
    private userapi: UserAPIService  ) 
  { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.stateList = states.sort();
    this.IDForm = this.fb.group({
      documentType: new FormControl('', Validators.required),
      socialSecurityNumber: new FormControl(''),
      locationSocialSecurityCard: new FormControl(''),
      licenseNumber: new FormControl(''),
      nonDriverIDNumber: new FormControl(''),
      DoDIDNumber: new FormControl(''),
      placeOfBirth: new FormControl(''),
      countryOfIssue: new FormControl(''),
      DBN: new FormControl(''),
      fileNumber: new FormControl(''),
      state: new FormControl(''),
      passportNumber: new FormControl(''),
      locationDriverLicense: new FormControl(''),
      locationDoDID: new FormControl(''),
      expirationDate: new FormControl(''),
      locationPassport: new FormControl(''),
      LocationWorkPermitVisa: new FormControl(''),  
      idProofDocuments_temp: new FormControl([], Validators.required),
      comments: new FormControl(''), 
      profileId: new FormControl('')
     });
     this.idProofDocumentsList = [];

     const locationArray = location.href.split('/')
     this.selectedProfileId = locationArray[locationArray.length - 1];

    if(this.selectedProfileId && this.selectedProfileId == 'essential-day-one'){
      this.selectedProfileId = "";   
    }
    
     this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${this.selectedProfileId}` });
     this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${this.selectedProfileId}` });

     this.getEssentialIdView();
    }
   
    onChangeDocumentType(key) {
      this.typeOne = false;
      this.typeOneTwo = false;
      this.typeOneTwoSixSeven = false;
      this.typeThree = false;
      this.typeTwo = false;
      this.typeFour = false;
      this.typeFive = false;
      this.typeSix = false;
      this.typeSeven = false;
      this.typeSixSeven = false;

      if(key==1){  
        this.typeOne = true;      
        this.typeOneTwo = true;      
        this.typeOneTwoSixSeven = true;        
      }else if(key==2){  
        this.typeTwo = true;      
        this.typeOneTwo = true;      
        this.typeOneTwoSixSeven = true;
      }else if(key==3){  
        this.typeThree = true;              
      }else if(key==4){  
        this.typeFour = true;              
      }else if(key==5){  
       // this.typeThree = true;       
        this.typeFive = true;             
      }else if(key==6){  
        this.typeSix = true;  
        this.typeOneTwoSixSeven = true;         
        this.typeSixSeven = true;        
      }else if(key==7){  
        this.typeSeven = true;     
        this.typeOneTwoSixSeven = true;     
        this.typeSixSeven = true;         
      }
  }

    IdFormSubmit(profileInData = null) {
      var query = {};
      var proquery = {};     
      
      let profileIds = this.IDForm.controls['profileId'].value;
      if(profileIds){
        this.selectedProfileId = profileIds;
      }
      const req_vars = {
        query: Object.assign({ _id: this.selectedProfileId  }),
        proquery: Object.assign(profileInData),   
        from: Object.assign({ customerId: this.userId }) 
      }

      this.loader.open();     
      this.userapi.apiRequest('post', 'customer/essentials-id-form-submit', req_vars).subscribe(result => {
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
  
    getEssentialIdView = (query = {}, search = false) => { 
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
      this.userapi.apiRequest('post', 'customer/view-id-details', req_vars).subscribe(result => {
        this.loader.close();
        if (result.status == "error") {
          console.log(result.data)
        } else {
          if(result.data){    
            this.essentialIDList = result.data;                    
            let profileIds = this.essentialIDList._id;
            this.IDForm.controls['profileId'].setValue(profileIds);
            this.uploader = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });
            this.uploaderCopy = new FileUploader({ url: `${URL}?userId=${this.userId}&ProfileId=${profileIds}` });

            this.idProofDocumentsList = result.data.idProofDocuments;
            if(this.essentialIDList.idProofDocuments.length>0){
              this.IDForm.controls['idProofDocuments_temp'].setValue('1');
            }
            this.IDForm.controls['documentType'].setValue(this.essentialIDList.documentType);
            if(this.essentialIDList.documentType){
              this.onChangeDocumentType(this.essentialIDList.documentType);
            }
            
            this.IDForm.controls['socialSecurityNumber'].setValue(this.essentialIDList.socialSecurityNumber);
            this.IDForm.controls['locationSocialSecurityCard'].setValue(this.essentialIDList.locationSocialSecurityCard);
            this.IDForm.controls['state'].setValue(this.essentialIDList.state);
            this.IDForm.controls['licenseNumber'].setValue(this.essentialIDList.licenseNumber);
            this.IDForm.controls['nonDriverIDNumber'].setValue(this.essentialIDList.nonDriverIDNumber);
            this.IDForm.controls['DoDIDNumber'].setValue(this.essentialIDList.DoDIDNumber);
            this.IDForm.controls['placeOfBirth'].setValue(this.essentialIDList.placeOfBirth);
            this.IDForm.controls['countryOfIssue'].setValue(this.essentialIDList.countryOfIssue);
            this.IDForm.controls['DBN'].setValue(this.essentialIDList.DBN);
            this.IDForm.controls['fileNumber'].setValue(this.essentialIDList.fileNumber);
            this.IDForm.controls['passportNumber'].setValue(this.essentialIDList.passportNumber);
            this.IDForm.controls['locationDriverLicense'].setValue(this.essentialIDList.locationDriverLicense);
            this.IDForm.controls['locationDoDID'].setValue(this.essentialIDList.locationDoDID); 
            this.IDForm.controls['expirationDate'].setValue(this.essentialIDList.expirationDate);
            this.IDForm.controls['locationPassport'].setValue(this.essentialIDList.locationPassport);
            this.IDForm.controls['LocationWorkPermitVisa'].setValue(this.essentialIDList.LocationWorkPermitVisa); 
            this.IDForm.controls['comments'].setValue(this.essentialIDList.comments);
          }       
        }
      }, (err) => {
        console.error(err);
      })
  }  

  IDDelete(doc, name, tmName) {
      let ids = this.IDForm.controls['profileId'].value;
      var statMsg = "Are you sure you want to delete '" + name + "' file?"
      this.confirmService.confirm({ message: statMsg })
        .subscribe(res => {
          if (res) {
            this.loader.open();
            this.idProofDocumentsList.splice(doc, 1)
            var query = {};
            const req_vars = {
              query: Object.assign({ _id: ids }, query),
              proquery: Object.assign({ idProofDocuments: this.idProofDocumentsList }, query),
              fileName: Object.assign({ docName: tmName }, query)
            }
            this.userapi.apiRequest('post', 'documents/deleteIdDoc', req_vars).subscribe(result => {
              if (result.status == "error") {
                this.loader.close();
                this.snack.open(result.data.message, 'OK', { duration: 4000 })
              } else {
                if(this.idProofDocumentsList.length<1){
                  this.IDForm.controls['idProofDocuments_temp'].setValue('');
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
  
      // if(this.uploader.getNotUploadedItems().length){
      //   this.uploader.uploadAll();
      //   this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      //     this.getIdDocuments();
      //   };
      // }

      if(this.uploader.getNotUploadedItems().length){
        this.uploaderCopy = cloneDeep(this.uploader)
        this.uploader.queue.splice(1, this.uploader.queue.length - 1)
        this.uploaderCopy.queue.splice(0, 1)
        
        this.uploader.queue.forEach((fileoOb, ind) => {
              this.uploader.uploadItem(fileoOb);
         });
   
         this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
           this.getIdDocuments();
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
        this.getIdDocuments({}, false, false);
      
      };
    }

    getIdDocuments = (query = {}, search = false, uploadRemained = true) => {     
      let profileIds = this.IDForm.controls['profileId'].value;
      let req_vars = {
        query: Object.assign({customerId: this.userId,status:"Pending" }),
        fields:{_id:1,idProofDocuments:1}
      }
      if(profileIds){
         req_vars = {
          query: Object.assign({ _id:profileIds, customerId: this.userId  }),
          fields:{_id:1,idProofDocuments:1}
        }
      }    
      this.userapi.apiRequest('post', 'customer/view-id-details', req_vars).subscribe(result => {
        if (result.status == "error") {
        } else {
          this.IDForm.controls['profileId'].setValue(result.data._id);
          if(uploadRemained) {
            this.uploadRemainingFiles(result.data._id)
          }
          this.idProofDocumentsList = result.data.idProofDocuments;
          if(result.data.idProofDocuments.length>0){
            this.IDForm.controls['idProofDocuments_temp'].setValue('1');
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
  
}