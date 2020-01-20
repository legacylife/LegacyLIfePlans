import { Component, OnInit } from '@angular/core';
import { UserAPIService } from './../../../../../userapi.service';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { AppConfirmService } from '../../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { documentTypes } from '../../../../../selectList';
import { FileUploader } from 'ng2-file-upload';
import { serverUrl, s3Details } from '../../../../../config';
import { cloneDeep } from 'lodash'
import { controlNameBinding } from '@angular/forms/src/directives/reactive_directives/form_control_name';
import { FileHandlingService } from 'app/shared/services/file-handling.service';
import { DataSharingService } from 'app/shared/services/data-sharing.service';
const URL = serverUrl + '/api/documents/petsdocuments';
@Component({
  selector: 'app-essenioal-id-box',
  templateUrl: './legacy-setting-modal.component.html',
  styleUrls: ['./legacy-setting-modal.component.scss']
})
export class legacySettingModalComponent implements OnInit {
  userId = localStorage.getItem("endUserId");
  SettingsForm: FormGroup;
  urlData:any={};
  settingFlag:string = 'no'  
  constructor(private snack: MatSnackBar,public dialog: MatDialog, private fb: FormBuilder, 
    private confirmService: AppConfirmService,private loader: AppLoaderService, private router: Router,
    private userapi: UserAPIService, private fileHandlingService: FileHandlingService,private sharedata: DataSharingService) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
  
    this.SettingsForm = this.fb.group({
      legacySetting: new FormControl('',Validators.required)
     });

    this.urlData = this.userapi.getURLData();

    if(localStorage.getItem("endUserlegacySetting") && localStorage.getItem("endUserlegacySetting")!=''){
      this.SettingsForm.controls['legacySetting'].setValue(localStorage.getItem("endUserlegacySetting"));
      this.settingFlag = localStorage.getItem("endUserlegacySetting");
    }
  }

  SettingsFormSubmit(profileInData = null) {
      var query = {}; var proquery = {};     
      const req_vars = {
        query: Object.assign({ _id: this.userId }),
        proquery: Object.assign(profileInData),
      }
      this.loader.open();     
      this.userapi.apiRequest('post', 'customer/legacy-setting', req_vars).subscribe(result => {
        this.loader.close();
        if (result.status == "error") {
          this.snack.open(result.data.message, 'OK', { duration: 4000 })
        } else {
            if(profileInData.legacySetting){
              localStorage.setItem("endUserlegacySetting",profileInData.legacySetting);
              this.settingFlag = profileInData.legacySetting;
                if(profileInData.legacySetting=='yes'){
                  this.router.navigate(['/customer/customer-subscription'])
                }
            }
          this.snack.open(result.data.message, 'OK', { duration: 4000 })
          this.dialog.closeAll(); 
        }
      }, (err) => {
        console.error(err)
      })
  }
 
}