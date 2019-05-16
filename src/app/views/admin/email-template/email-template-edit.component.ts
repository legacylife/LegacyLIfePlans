import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { MatSnackBar } from '@angular/material';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';


@Component({
  selector: 'email-template-edit',
  templateUrl: './email-template-edit.component.html'
})
export class EmailTemplateEditComponent implements OnInit {

  EmailTempForm: FormGroup
  emailTemplateId: string
  title: string
  mailBody: string
  mailSubject: string
  code: string
  row: any
  constructor(private router: Router, private activeRoute: ActivatedRoute, private api: APIService, private fb: FormBuilder, private loader: AppLoaderService, private snack: MatSnackBar) { }

  ngOnInit() {

    this.EmailTempForm = new FormGroup({
      code: new FormControl('', [Validators.required]),
      title: new FormControl('', [Validators.required]),
      mailSubject: new FormControl('', [Validators.required]),
      mailBody: new FormControl('', [Validators.required]),
    })

    this.activeRoute.params.subscribe(params => {
      this.emailTemplateId = params.id;
      this.getPageDetails()
    });
  }

  getPageDetails = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ _id: this.emailTemplateId }, query),
    }

    this.api.apiRequest('post', 'emailtemp/view', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.row = result.data
        this.EmailTempForm.controls['code'].setValue(this.row.code);
        this.EmailTempForm.controls['title'].setValue(this.row.title);
        this.EmailTempForm.controls['mailSubject'].setValue(this.row.mailSubject);
        this.EmailTempForm.controls['mailBody'].setValue(this.row.mailBody);
      }
    }, (err) => {
      console.error(err)
    })
  }

  updatePage() {
    let pageData = {
      code: this.EmailTempForm.controls['code'].value,
      title: this.EmailTempForm.controls['title'].value,
      mailSubject: this.EmailTempForm.controls['mailSubject'].value,
      mailBody: this.EmailTempForm.controls['mailBody'].value
    }

    this.loader.open();
    const req_vars = {
      "_id": this.row._id,
      "title": this.EmailTempForm.controls['title'].value,
      "mailSubject": this.EmailTempForm.controls['mailSubject'].value,
      "mailBody": this.EmailTempForm.controls['mailBody'].value
    }

    this.api.apiRequest('post', 'emailtemp/update', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        this.snack.open(result.data, 'OK', { duration: 4000 })
      } else {
        this.snack.open(result.data, 'OK', { duration: 4000 })
      }

    }, (err) => {
      console.log("Error in update")
    })
    //this.form.reset()  
  }

}