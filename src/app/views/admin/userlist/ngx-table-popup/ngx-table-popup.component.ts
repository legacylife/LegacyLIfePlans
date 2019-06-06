import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatDialog,MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { APIService } from './../../../../api.service';
import { adminSections } from '../../../../config';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
@Component({
  selector: 'app-ngx-table-popup',
  templateUrl: './ngx-table-popup.component.html'
})
export class NgxTablePopupComponent implements OnInit {
  public itemForm: FormGroup;
  adminSections = [];
  url: string;
  RequestData: any;
  invalidMessage: string;
  EmailExist: boolean;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<NgxTablePopupComponent>,
    private fb: FormBuilder, private api: APIService,public dialog: MatDialog, private loader: AppLoaderService
  ) { }

  ngOnInit() {
    this.buildItemForm(this.data.payload)
    this.adminSections = adminSections;// console.log("Item info", adminSections)
  }
  buildItemForm(item) {
    this.itemForm = this.fb.group({
      firstName: [item.firstName || '', Validators.required],
      lastName: [item.lastName || '', Validators.required],
      username: [item.username || '', Validators.required],
      allowNotifications: [item.allowNotifications || 'no', Validators.required],
      status: [item.status || false],
      usermanagement: [(item.sectionAccess && item.sectionAccess.usermanagement) || 'fullaccess', Validators.required],
      advisormanagement: [(item.sectionAccess && item.sectionAccess.advisormanagement) || 'fullaccess', Validators.required],
      activitylog: [(item.sectionAccess && item.sectionAccess.activitylog) || 'fullaccess', Validators.required],
      zipcodemap: [(item.sectionAccess && item.sectionAccess.zipcodemap) || 'fullaccess', Validators.required],
      cms: [(item.sectionAccess && item.sectionAccess.cms) || 'fullaccess', Validators.required],
      referral: [(item.sectionAccess && item.sectionAccess.referral) || 'fullaccess', Validators.required],
      addmanagement: [(item.sectionAccess && item.sectionAccess.addmanagement) || 'fullaccess', Validators.required],
      deceasedrequest: [(item.sectionAccess && item.sectionAccess.deceasedrequest) || 'fullaccess', Validators.required],
      adminmanagement: [(item.sectionAccess && item.sectionAccess.adminmanagement) || 'fullaccess', Validators.required]
    })
  }

  submit() {
    let userData = this.data.payload;
    this.RequestData = {
      firstName: this.itemForm.controls['firstName'].value,
      lastName: this.itemForm.controls['lastName'].value,
      username: this.itemForm.controls['username'].value,
      allowNotifications: this.itemForm.controls['allowNotifications'].value,
      status: 'Active',
      userType: "sysadmin",
      sectionAccess: {
        "usermanagement": this.itemForm.controls['usermanagement'].value,
        "advisormanagement": this.itemForm.controls['advisormanagement'].value,
        "activitylog": this.itemForm.controls['activitylog'].value,
        "zipcodemap": this.itemForm.controls['zipcodemap'].value,
        "cms": this.itemForm.controls['cms'].value,
        "referral": this.itemForm.controls['referral'].value,
        "addmanagement": this.itemForm.controls['addmanagement'].value,
        "deceasedrequest": this.itemForm.controls['deceasedrequest'].value,
        "adminmanagement": this.itemForm.controls['adminmanagement'].value
      }

    }
    if (userData._id) {
      this.RequestData._id = userData._id;
      this.url = 'userlist/updateadminprofile';
    }
    else {
      this.url = 'userlist/addmember';
    }
    this.loader.open();
    this.api.apiRequest('post', this.url, this.RequestData).subscribe(result => {
      this.loader.close();
      if(result.status == "success") {
        if(result.data.code == "Exist") {
           this.itemForm.controls['username'].markAsUntouched();
        //   this.itemForm.controls['username'].enable();
        this.itemForm.controls['username'].setErrors({'EmailExist' : true})
           this.invalidMessage = result.data.message;
           this.EmailExist = true;
        } else {     
          this.EmailExist = false;
          this.dialogRef.close(this.itemForm.value)
        }
      } else {
        
        //this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }
    }, (err) => {
      console.error(err)
    })
  }
}