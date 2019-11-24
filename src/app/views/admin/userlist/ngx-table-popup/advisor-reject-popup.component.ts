import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { APIService } from './../../../../api.service';

@Component({
  selector: 'app-advisor-reject-popup',
  templateUrl: './advisor-reject-popup.component.html'
})
export class AdvisorRejectPopupComponent implements OnInit {
  public itemForm: FormGroup;
  adminSections = [];
  url: string;
  RequestData: any;
  selectedUserId : string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AdvisorRejectPopupComponent>,
    private fb: FormBuilder, private api: APIService
  ) { }

  ngOnInit() {
    this.buildRejectForm(this.data.payload)
    const locationArray = location.href.split('/')
    this.selectedUserId = locationArray[locationArray.length - 1]
  }
  buildRejectForm(item) {
    this.itemForm = this.fb.group({
      //approveRejectReason: [item.approveRejectReason || '', Validators.required]
      approveRejectReason: new FormControl(item.approveRejectReason || '', Validators.compose([ Validators.required, this.noWhitespaceValidator, Validators.minLength(1)]))
    })
  }

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  submit() {
 
    this.RequestData = {
      approveRejectReason: this.itemForm.controls['approveRejectReason'].value
    }
    this.RequestData._id = this.selectedUserId;
    this.RequestData.fromId = localStorage.getItem('userId')
    this.url = 'advisor/rejectadvisor';

    this.api.apiRequest('post', this.url, this.RequestData).subscribe(result => {
      if (result.status == "error") {
        this.dialogRef.close(this.itemForm.value)
      } else {
        this.dialogRef.close(this.itemForm.value)
      }
    }, (err) => {
      console.error(err)
    })
  }
}