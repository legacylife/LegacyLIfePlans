import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

@Component({
  selector: 'app-cc-share-via-email-model',
  templateUrl: './cc-share-via-email-model.component.html',
  styleUrls: ['./cc-share-via-email-model.component.scss']
})
export class CcShareViaEmailModelComponent implements OnInit {
  emailIdList = ['']
  emailIdForm: FormGroup
  
  constructor( private _fb: FormBuilder ) { }

  ngOnInit() {
    this.emailIdForm = this._fb.group({
      itemRows: this._fb.array([this.initItemRows()])
    });
  }
  get formArr() {
    return this.emailIdForm.get('itemRows') as FormArray;
  }

  initItemRows() {
    return this._fb.group({
      // list all your form controls here, which belongs to your form array
      itemname: ['',Validators.required, Validators.email]
    });
  }

  addNewRow() {
    this.formArr.push(this.initItemRows());
  }
  
  deleteRow(index: number) {
    this.formArr.removeAt(index);
  }

  shareDetails() {
    console.log("this.emailIdForm",this.emailIdForm.value)
  }
}
