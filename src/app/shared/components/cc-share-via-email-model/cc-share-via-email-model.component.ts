import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { APIService } from 'app/api.service';
import { MatSnackBar, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-cc-share-via-email-model',
  templateUrl: './cc-share-via-email-model.component.html',
  styleUrls: ['./cc-share-via-email-model.component.scss']
})
export class CcShareViaEmailModelComponent implements OnInit {
  emailIdList = ['']
  emailIdForm: FormGroup
  userId: String = ''
  aliasName: String = ''

  constructor( private fb: FormBuilder, private api: APIService,
    private snack: MatSnackBar, @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CcShareViaEmailModelComponent>)
  {
    this.userId = localStorage.getItem('endUserId')
    this.aliasName = this.data.aliasName
  }

  ngOnInit() {
    this.emailIdForm = this.fb.group({
      itemRows: this.fb.array([this.initItemRows()])
    });
  }
  get formArr() {
    return this.emailIdForm.get('itemRows') as FormArray;
  }

  initItemRows() {
    return this.fb.group({
      // list all your form controls here, which belongs to your form array
      itemname: ['',[Validators.required, Validators.email]]
    });
  }

  addNewRow() {
    this.formArr.push(this.initItemRows());
  }
  
  deleteRow(index: number) {
    this.formArr.removeAt(index);
  }

  shareDetails() {
    const formNumbers = <FormArray>this.emailIdForm.get('itemRows')
    let emailIdLink = formNumbers.controls.map(o => { return o.value })
    let emailList = []
    emailIdLink.forEach(list => {
      emailList.push(list.itemname)
    })
    const req_vars = {
      query: { aliasName: this.aliasName },
      fromId: this.userId,
      userName: localStorage.getItem('endUserFirstName')+' '+localStorage.getItem('endUserLastName'),
      userType: localStorage.getItem('endUserType'),
      emailList: emailList
    }
    
    this.api.apiRequest('post', 'coach-corner-post/share-post', req_vars).subscribe(result => {
      this.snack.open(result.data.message, 'OK', { duration: 4000 })
      this.dialogRef.close()
    }, (err) => {
      console.error(err)
    })
  }
}
