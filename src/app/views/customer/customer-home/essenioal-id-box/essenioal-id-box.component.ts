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
  documentTypeList: string[] = documentTypes;
  idProofDocumentsList: any;
  idProofDocumentsMissing = false;
  idProofDocuments_temps = false;

  constructor(private snack: MatSnackBar, private fb: FormBuilder, private confirmService: AppConfirmService,private loader: AppLoaderService, private userapi: UserAPIService  ) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");

    this.IDForm = this.fb.group({
      documentType: new FormControl('', Validators.required),
      socialSecurityNumber: new FormControl('', Validators.required),
      locationSocialSecurityCard: new FormControl('', Validators.required),
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
                  this.IDForm.controls['advisorDocuments_temp'].setValue('');
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

  }

