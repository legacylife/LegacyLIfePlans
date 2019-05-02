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
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<NgxTablePopupComponent>,
    private fb: FormBuilder,private api: APIService
  ) { }

  ngOnInit() {
    this.buildItemForm(this.data.payload)
  }
  buildItemForm(item) {
  console.log('buildItemForm')
    this.itemForm = this.fb.group({
      fullName: [item.fullName || '', Validators.required],
      username: [item.username || '', Validators.required],
      status: [item.status || false]
    })
  }

  submit() {
	  console.log(this.itemForm.value);
   this.api.apiRequest('post', 'userlist/addmember', this.itemForm.value).subscribe(result => {
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