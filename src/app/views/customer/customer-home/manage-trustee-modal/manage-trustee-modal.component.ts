import { Component, OnInit, Inject, AfterViewInit} from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms'
import { UserAPIService } from './../../../../userapi.service';
import { AppConfirmService } from '../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { MatDialogRef,MatDialog, MatSnackBar,MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { userSections } from '../../../../config';
import { addTrusteeModalComponent } from '../add-trustee-modal/add-trustee-modal.component';
@Component({
  selector: 'app-manage-trustee-modal',
  templateUrl: './manage-trustee-modal.component.html',
  styleUrls: ['./manage-trustee-modal.component.scss']
})
export class ManageTrusteeModalComponent implements OnInit, AfterViewInit {
  invalidMessage: string;
  trusteeFormGroup: FormGroup;
  userSections = [];
  userId = localStorage.getItem("endUserId");
  RequestData: any;
  selectedProfileId: string;
  profileIdHiddenVal = false;
  listingCnt = false;
  trust_id: any;
  listLength: any;
  hdtitle: string;
  code: string;
  rows: any = [];
  accessManagement: any;
  rowUserAccess: any;
  HiddenVal = false;
  constructor(
    private snack: MatSnackBar,public dialog: MatDialog, private fb: FormBuilder, private confirmService: AppConfirmService,private loader: AppLoaderService,
    private router: Router,private dialogRef2: MatDialogRef<ManageTrusteeModalComponent>, private userapi: UserAPIService,@Inject(MAT_DIALOG_DATA) public data: any
  ) { this.hdtitle = data.title;this.code = data.code; }
 
ngOnInit() {
    this.buildItemForm();
    this.userSections = userSections;  
    if(this.hdtitle && this.hdtitle!=='undefined'){
      this.getTrusteeList();
   }    
}

buildItemForm() {
    this.trusteeFormGroup = this.fb.group({ 
      code: new FormControl(this.code,[]),
      accessManagement: this.fb.array([this.fb.group({ ids: [''],oldValue:[] })]), 
    });
}

ngAfterViewInit(){ 
}
 
manageTrusteeSubmit(insert = null) {console.log("insert",insert)
    const  req_vars = {
      query: Object.assign({ insertArray: insert,customerId: this.userId  })
    } 
    this.userapi.apiRequest('post', 'trustee/subSections-form-submit', req_vars).subscribe(result => {
      if (result.status == "success") {
         this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }
      this.dialog.closeAll(); 
    }, (err) => {
      this.snack.open(err, 'OK', { duration: 4000 })         
    })
}

 getTrusteeList = (query = {}, search = false) => {    
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status:"Active" }, query),
      //idQuery: Object.assign({ customerId: this.userId,"userAccess.accessManagement" : "now", status:"Active" }, idQuery),
      fields: {},
      offset: '',
      limit: '',
      order: {"modifiedOn": -1},
    }
    this.loader.open(); 
    this.userapi.apiRequest('post', 'trustee/subSectionsList', req_vars).subscribe(result => {
    this.loader.close();
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if(result.data){    
          this.rows = result.data.trusteeUsersList;   
          if(this.rows.length>0){
              this.listingCnt = true;
              this.listLength = this.rows.length-1;
            
              this.trusteeFormGroup.controls['code'].setValue(this.code);
              this.accessManagement = this.trusteeFormGroup.get('accessManagement') as FormArray;
              this.accessManagement.removeAt(0);
              this.rows.forEach((element: any, index) => {
                  this.accessManagement.push(this.createDefinition(element.userAccess[this.code],element._id));
              })
          }
        }       
      }
    }, (err) => {
      console.error(err);
    })
  }

  createDefinition(values,documentId): FormGroup {
    return this.fb.group({
      ids: [documentId+'##'+values],
      oldValue: [values],
    });
  }

  getAccessVal(accessArray,sectionName,value){
    //let keys = this.accessManagement
    //console.log("access key>>>>>",Object.keys(sectionName))
    //return Object.keys(sectionName);
    return accessArray[sectionName];
 }

 openAddTrusteeModal(id, isNew?) {
  this.dialogRef2.close(ManageTrusteeModalComponent);
   let dialogRef: MatDialogRef<any> = this.dialog.open(addTrusteeModalComponent, {
     width: '720px',
     disableClose: true,
     data: {
      id: id,
    }
   })
 }

}


