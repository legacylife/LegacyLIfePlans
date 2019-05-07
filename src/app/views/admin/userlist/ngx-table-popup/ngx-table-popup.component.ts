import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { APIService } from './../../../../api.service';
import { adminSections } from '../../../../config';

@Component({
  selector: 'app-ngx-table-popup',
  templateUrl: './ngx-table-popup.component.html'
})
export class NgxTablePopupComponent implements OnInit {
  public itemForm: FormGroup;
  adminSections = [];
  url : string;
  RequestData : any;
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<NgxTablePopupComponent>,
    private fb: FormBuilder,private api: APIService
  ) { }

  ngOnInit() {
    this.buildItemForm(this.data.payload) 
    this.adminSections = adminSections
  }
  buildItemForm(item) {
  console.log("Item info",item)
   
    this.itemForm = this.fb.group({
      firstName: [item.firstName || '', Validators.required],
      lastName: [item.lastName || '', Validators.required],
      username: [item.username || '', Validators.required],
      status: [item.status || false],
      usermanagement: [(item.sectionAccess && item.sectionAccess.usermanagement) || '', Validators.required],
      advisormanagement: [(item.sectionAccess && item.sectionAccess.advisormanagement) || '', Validators.required],
      activitylog: [(item.sectionAccess && item.sectionAccess.activitylog) || '', Validators.required],
      zipcodemap: [(item.sectionAccess && item.sectionAccess.zipcodemap) || '', Validators.required],
      cms: [(item.sectionAccess && item.sectionAccess.cms) || '', Validators.required],
      referral: [(item.sectionAccess && item.sectionAccess.referral) || '', Validators.required],
      addmanagement: [(item.sectionAccess && item.sectionAccess.addmanagement) || '', Validators.required],
      deceasedrequest: [(item.sectionAccess && item.sectionAccess.deceasedrequest) || '', Validators.required],
      adminmanagement: [(item.sectionAccess && item.sectionAccess.adminmanagement) || '', Validators.required]
    })
  }

  submit() {
    let userData = this.data.payload;
    this.RequestData = {
      firstName: this.itemForm.controls['firstName'].value,
      lastName: this.itemForm.controls['lastName'].value,
      username: this.itemForm.controls['username'].value,
      status: 'Active',      
      userType: "sysadmin",      
      sectionAccess : {
        "usermanagement" : this.itemForm.controls['usermanagement'].value,
        "advisormanagement" : this.itemForm.controls['advisormanagement'].value,
        "activitylog" : this.itemForm.controls['activitylog'].value,
        "zipcodemap" : this.itemForm.controls['zipcodemap'].value,
        "cms" : this.itemForm.controls['cms'].value,
        "referral" : this.itemForm.controls['referral'].value,
        "addmanagement" : this.itemForm.controls['addmanagement'].value,
        "deceasedrequest" : this.itemForm.controls['deceasedrequest'].value,
        "adminmanagement" : this.itemForm.controls['adminmanagement'].value
      }
      
    }
    if(userData._id){
      this.RequestData._id = userData._id;
      this.url = 'userlist/updateadminprofile';
    }
    else {
      this.url = 'userlist/addmember';
    }
   
   this.api.apiRequest('post', this.url, this.RequestData).subscribe(result => {
      if(result.status == "error"){
		 this.dialogRef.close(this.itemForm.value)
      } else {
		 this.dialogRef.close(this.itemForm.value)
      }
    }, (err) => {
      console.error(err)      
    })
  
  
  }
}