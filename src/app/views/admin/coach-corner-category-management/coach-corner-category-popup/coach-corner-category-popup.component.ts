/**
 * @copyright: Arkenea technology
 * @author: Nilesh Yadav
 * @since: 05 Sept 2019 04:00 PM
 * @summary: Coach Corner Add Category Popup Component
 * @description: Component for add / edit coach corner category
 */
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatDialog,MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { APIService } from './../../../../api.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';

@Component({
  selector: 'app-coach-corner-popup',
  templateUrl: './coach-corner-category-popup.component.html',
  styleUrls: ['./coach-corner-category-popup.component.scss']
})

export class CoachCornerCategoryPopupComponent implements OnInit {
  
  public itemForm: FormGroup;
  url: string;
  RequestData: any;
  oldStatus:String = ''
  oldTitle: String = ''

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CoachCornerCategoryPopupComponent>,
    private fb: FormBuilder, private api: APIService,public dialog: MatDialog, private loader: AppLoaderService )
  { }

  ngOnInit() {
    let item = this.data.payload

    if(this.data.title=='Update category') {
      this.itemForm = this.fb.group({
        title: ['',Validators.required],
        status: [true,Validators.required],
      })
      this.oldTitle  = item.title
      this.oldStatus = item.status
      this.itemForm.controls['title'].setValue(item.title)
      this.itemForm.controls['status'].setValue(item.status == 'On'? true : false )
    }
    else{   
      this.itemForm = this.fb.group({
        title: [item.title || '', Validators.required],
        status: [item.status || true, Validators.required]
      })
    }
  }

  /**
   * @description : post category form data to server for add / update in db
   */
  submit() {
    let categoryData = this.data.payload;
    this.RequestData = {
      fromId : localStorage.getItem('userId'),
      data: {
        title: this.itemForm.controls['title'].value,
        status: this.itemForm.controls['status'].value ? 'On' : 'Off'
      }
    }
    if (categoryData._id) {
      this.RequestData._id = categoryData._id;
      this.RequestData.oldTitle   = this.oldTitle;
      this.RequestData.oldStatus = this.oldStatus;
      this.url = 'coach-corner-category/update';
    }
    else {
      this.url = 'coach-corner-category/create';
    }
    this.loader.open();
    this.api.apiRequest('post', this.url, this.RequestData).subscribe(result => {    
      if(result.status == "success") {
        this.loader.close();
        this.oldTitle = this.RequestData.data.title
        this.dialogRef.close(result.data.message)
      }
      else {
        this.loader.close();
      }
    }, (err) => {
      console.error(err)
    })
  }
}