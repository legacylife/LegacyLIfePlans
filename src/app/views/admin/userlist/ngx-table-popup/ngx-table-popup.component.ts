import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatDialog,MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, Validators, FormGroup,FormControl } from '@angular/forms';
import { APIService } from './../../../../api.service';
import { adminSections } from '../../../../config';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
@Component({
  selector: 'app-ngx-table-popup',
  templateUrl: './ngx-table-popup.component.html',
  styleUrls: ['./ngx-table-popup.component.scss']
})
export class NgxTablePopupComponent implements OnInit {
  public itemForm: FormGroup;
  adminSections = [];
  url: string;
  RequestData: any;
  invalidMessage: string;
  EmailExist: boolean;
  radioCheck: boolean;
  radioCheckNoti: boolean;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<NgxTablePopupComponent>,
    private fb: FormBuilder, private api: APIService,public dialog: MatDialog, private loader: AppLoaderService
  ) { }

  ngOnInit() {
    this.radioCheck= true;
    this.radioCheckNoti= false;
   if(this.data.title=='Update member'){
      this.radioCheck= false;
   }
    
    this.buildItemForm(this.data.payload)
    this.adminSections = adminSections;// console.log("Item info", adminSections)
  }

  buildItemForm(item) {
    if(this.data.title=='Update member'){  
      this.itemForm = this.fb.group({
        firstName: new FormControl('', Validators.compose([ Validators.required, this.noWhitespaceValidator, Validators.minLength(1), Validators.maxLength(50)])),
        lastName: new FormControl('', Validators.compose([ Validators.required, this.noWhitespaceValidator, Validators.minLength(1), Validators.maxLength(50)])),
        //username: ['', Validators.required],
        username: new FormControl('', Validators.compose([Validators.required, Validators.pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i)])),
        allowNotifications: [ '',Validators.required],
        status: [false],
        usermanagement: ['', Validators.required],
        advisormanagement: ['', Validators.required],
        activitylog: ['', Validators.required],
        zipcodemap: ['', Validators.required],
        cms: ['', Validators.required],
        referral: ['', Validators.required],
        addmanagement: ['', Validators.required],
        deceasedrequest: [ '', Validators.required],
        adminmanagement: ['', Validators.required]
      })
      this.itemForm.controls['username'].disable();
      this.itemForm.controls['firstName'].setValue(item.firstName);
      this.itemForm.controls['lastName'].setValue(item.lastName);
      this.itemForm.controls['username'].setValue(item.username);
      this.itemForm.controls['allowNotifications'].setValue(item.allowNotifications);          
      this.itemForm.controls['usermanagement'].setValue(item.sectionAccess.usermanagement);
      this.itemForm.controls['advisormanagement'].setValue(item.sectionAccess.advisormanagement);
      this.itemForm.controls['activitylog'].setValue(item.sectionAccess.activitylog);
      this.itemForm.controls['zipcodemap'].setValue(item.sectionAccess.zipcodemap);
      this.itemForm.controls['cms'].setValue(item.sectionAccess.cms);
      this.itemForm.controls['referral'].setValue(item.sectionAccess.referral);
      this.itemForm.controls['addmanagement'].setValue(item.sectionAccess.addmanagement);
      this.itemForm.controls['deceasedrequest'].setValue(item.sectionAccess.deceasedrequest);
      this.itemForm.controls['adminmanagement'].setValue(item.sectionAccess.adminmanagement);
    }else{   
      console.log('item',item)
    this.itemForm = this.fb.group({
      firstName: new FormControl('', Validators.compose([Validators.required, this.noWhitespaceValidator, Validators.minLength(1), Validators.maxLength(50)])),
      lastName: new FormControl('', Validators.compose([Validators.required, this.noWhitespaceValidator, Validators.minLength(1), Validators.maxLength(50)])),
      // firstName: [item.firstName || '', Validators.required,this.noWhitespaceValidator, Validators.minLength(1), Validators.maxLength(50)],
      // lastName: [item.lastName || '', Validators.required,this.noWhitespaceValidator, Validators.minLength(1), Validators.maxLength(50)],
      username: new FormControl('', Validators.compose([item.username,Validators.required, Validators.pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i)])),
      //username: [item.username || '', Validators.required, Validators.pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i)],
      allowNotifications: [Validators.required],
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
    
    this.itemForm.controls['allowNotifications'].setValue('no');          
    this.itemForm.controls['usermanagement'].setValue('fullaccess');
    this.itemForm.controls['advisormanagement'].setValue('fullaccess');
    this.itemForm.controls['activitylog'].setValue('fullaccess');
    this.itemForm.controls['zipcodemap'].setValue('fullaccess');
    this.itemForm.controls['cms'].setValue('fullaccess');
    this.itemForm.controls['referral'].setValue('fullaccess');
    this.itemForm.controls['addmanagement'].setValue('fullaccess');
    this.itemForm.controls['deceasedrequest'].setValue('fullaccess');
    this.itemForm.controls['adminmanagement'].setValue('fullaccess');
  }
}

public noWhitespaceValidator(control: FormControl) {
  const isWhitespace = (control.value || '').trim().length === 0;
  const isValid = !isWhitespace;
  return isValid ? null : { 'whitespace': true };
}
  submit() {
    let userData = this.data.payload;
    this.RequestData = {
      fromId : localStorage.getItem('userId'),
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
      this.RequestData.status = userData.status;
      this.RequestData._id = userData._id;
      this.url = 'userlist/updateadminprofile';
    }
    else {
      this.url = 'userlist/addmember';
    }
    //8 this.loader.open();
    this.api.apiRequest('post', this.url, this.RequestData).subscribe(result => {    
      if(result.status == "success") {
        if(result.data.code == "Exist") {
           this.loader.close();
           this.itemForm.controls['username'].markAsUntouched();
           //this.itemForm.controls['username'].enable();
           this.itemForm.controls['username'].setErrors({'EmailExist' : true})
           this.invalidMessage = result.data.message;
           this.EmailExist = true;
        } else {     
          this.EmailExist = false;
          //setTimeout(function(){ 
            this.loader.close();
           this.dialogRef.close(this.itemForm.value)
         //}, 2000);
        }
      } else {
        this.loader.close();
        //this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }
    }, (err) => {
      console.error(err)
    })
  }
}