import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatDialog,MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { APIService } from './../../../../api.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
@Component({
  selector: 'app-coach-corner-popup',
  templateUrl: './coach-corner-popup.component.html',
  styleUrls: ['./coach-corner-popup.component.scss']
})
export class CoachCornerPopupComponent implements OnInit {
  public itemForm: FormGroup;
  
  url: string;
  RequestData: any;
  invalidMessage: string;
  EmailExist: boolean;
  radioCheck: boolean;
  radioCheckNoti: boolean;
  oldStatus:String = ''

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CoachCornerPopupComponent>,
    private fb: FormBuilder, private api: APIService,public dialog: MatDialog, private loader: AppLoaderService )
  { }

  ngOnInit() {
    let item = this.data.payload

    if(this.data.title=='Update category') {
      this.itemForm = this.fb.group({
        title: ['',Validators.required],
        status: ['',Validators.required],
      })
      this.oldStatus = item.status
      this.itemForm.controls['title'].setValue(item.title)
      this.itemForm.controls['status'].setValue(item.status == 'On'? true : false )
    }
    else{   
      this.itemForm = this.fb.group({
        title: [item.title || '', Validators.required],
        status: [item.status || '', Validators.required]
      })
    }
  }

  submit() {
    let categoryData = this.data.payload;
    this.RequestData = {
      fromId : localStorage.getItem('userId'),
      title: this.itemForm.controls['title'].value,
      status: this.itemForm.controls['status'].value ? 'On' : 'Off'
    }
    if (categoryData._id) {
      this.RequestData._id = categoryData._id;
      this.RequestData.oldStatus = this.oldStatus;
      this.url = 'coach-corner-category/update';
    }
    else {
      this.url = 'coach-corner-category/create';
    }
    this.loader.open();
    this.api.apiRequest('post', this.url, this.RequestData).subscribe(result => {    
      if(result.status == "success") {
        if(result.data.code == "Exist") {
           this.loader.close();
           this.invalidMessage = result.data.message;
        }
        else {
          this.loader.close();
          this.dialogRef.close(this.itemForm.value)
        }
      }
      else {
        this.loader.close();
      }
    }, (err) => {
      console.error(err)
    })
  }
}