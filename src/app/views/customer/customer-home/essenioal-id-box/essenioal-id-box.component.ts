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

const URL = serverUrl + '/api/documents/myEssentials';
@Component({
  selector: 'app-essenioal-id-box',
  templateUrl: './essenioal-id-box.component.html',
  styleUrls: ['./essenioal-id-box.component.scss']
})
export class EssenioalIdBoxComponent implements OnInit {
  //selected = 'option1';
  userId = localStorage.getItem("endUserId");
  public uploader: FileUploader = new FileUploader({ url: `${URL}?userId=${this.userId}` });
 
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

  constructor(private snack: MatSnackBar, private fb: FormBuilder, private confirmService: AppConfirmService,private loader: AppLoaderService, private userapi: UserAPIService  ) { }


  onChangeDocumentType(key) {
      //console.log("--- >>  ",key);
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
        this.typeOneTwoSixSeven = true;        
      }else if(key==2){  
        this.typeTwo = true;      
        this.typeOneTwoSixSeven = true;
      }else if(key==3){  
        this.typeThree = true;              
      }else if(key==4){  
        this.typeFour = true;              
      }else if(key==5){  
        this.typeThree = true;       
        this.typeFive = true;             
      }else if(key==6){  
        this.typeSix = true;      
        this.typeSixSeven = true;        
      }else if(key==7){  
        this.typeSeven = true;     
        this.typeSixSeven = true;         
      }
      
  }



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
      idProofDocuments_temp: new FormControl([],Validators.required),
      comments: new FormControl('', Validators.required)    
    });
   }

    IDDelete(doc, name, tmName) {
      var statMsg = "Are you sure you want to delete '" + name + "' file name?"
      this.confirmService.confirm({ message: statMsg })
        .subscribe(res => {
          if (res) {
            this.loader.open();
            this.idProofDocumentsList.splice(doc, 1)
            var query = {};
            const req_vars = {
              query: Object.assign({ _id: this.userId }, query),
              proquery: Object.assign({ advisorDocuments: this.idProofDocumentsList }, query),
              fileName: Object.assign({ docName: tmName }, query)
            }
            this.userapi.apiRequest('post', 'documents/deleteAdvDoc', req_vars).subscribe(result => {
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
  
      if(this.uploader.getNotUploadedItems().length){
        this.uploader.uploadAll();
        this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
          this.getProfileField();
        };
      }
    }

    getProfileField = (query = {}, search = false) => {
      const req_vars = {
        query: Object.assign({ _id: this.userId, userType: "advisor" }, query)
      }
      this.userapi.apiRequest('post', 'userlist/getprofile', req_vars).subscribe(result => {
        if (result.status == "error") {
        } else {
         // this.profile = result.data.userProfile;
         // this.idProofDocumentsList = this.profile.idProofDocuments;
          //if(this.profile.idProofDocuments.length>0){
            this.IDForm.controls['idProofDocuments_temp'].setValue('1');
         // }
         
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