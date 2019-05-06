import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { APIService } from './../../../../api.service';

@Component({
  selector: 'app-ngx-table-popup',
  templateUrl: './ngx-table-popup.component.html'
})
export class NgxTablePopupComponent implements OnInit {
  public itemForm: FormGroup;
  adminSections = [];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<NgxTablePopupComponent>,
    private fb: FormBuilder,private api: APIService
  ) { }

  ngOnInit() {
    this.buildItemForm(this.data.payload)

    this.adminSections = [{
      name: 'User Management',
      code: "usermanagement"
    }, {
      name: 'Advisor Management',
      code: "advisormanagement"
    }, {
      name: 'Activity Log',
      code: "activitylog"
    }, {
      name: 'Zip Code map',
      code: "zipcodemap"
    }, {
      name: 'CMS pages',
      code: "cms"
    },{
      name: 'Referral program',
      code: "referral"
    }, {
      name: 'Advertisement management',
      code: "addmanagement"
    }, {
      name: 'Deceased requests',
      code: "deceasedrequest"
    }, {
      name: 'Admin Management',
      code: "adminmanagement"
    }]



  }
  buildItemForm(item) {
  console.log('buildItemForm')
  
    this.itemForm = this.fb.group({
      firstName: [item.firstName || '', Validators.required],
      lastName: [item.lastName || '', Validators.required],
      username: [item.username || '', Validators.required],
      status: [item.status || false],
      usermanagement: [item.usermanagement || '', Validators.required],
      advisormanagement: [item.advisormanagement || '', Validators.required],
      activitylog: [item.activitylog || '', Validators.required],
      zipcodemap: [item.zipcodemap || '', Validators.required],
      cms: [item.cms || '', Validators.required],
      referral: [item.referral || '', Validators.required],
      addmanagement: [item.addmanagement || '', Validators.required],
      deceasedrequest: [item.deceasedrequest || '', Validators.required],
      adminmanagement: [item.adminmanagement || '', Validators.required]
    })
  }

  submit() {
    let RequestData = {
      firstName: this.itemForm.controls['firstName'].value,
      lastName: this.itemForm.controls['lastName'].value,
      username: this.itemForm.controls['username'].value,
      status: this.itemForm.controls['status'].value,      
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
   
   this.api.apiRequest('post', 'userlist/addmember', RequestData).subscribe(result => {
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