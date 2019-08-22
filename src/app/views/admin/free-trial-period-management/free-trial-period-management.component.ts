import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';

import { Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { MatSnackBar } from '@angular/material';
import { ToolbarService, LinkService, ImageService, HtmlEditorService, TableService, QuickToolbarService } from '@syncfusion/ej2-angular-richtexteditor';
@Component({
  selector: 'free-trial-period-management',
  templateUrl: './free-trial-period-management.component.html',
  providers: [ToolbarService, LinkService, ImageService, HtmlEditorService,TableService, QuickToolbarService],
})
export class FreeTrialPeriodManagementComponent implements OnInit {
  aceessSection : any;
  my_messages:any;
  
  rows : any
  freeTrialForm: FormGroup

  public tools: object = {
    items: ['Undo', 'Redo', '|',
            'Bold', 'Italic', 'Underline', 'StrikeThrough', '|',
            'FontName', 'FontSize', 'FontColor', 'BackgroundColor', '|',
            'SubScript', 'SuperScript', '|',
            'LowerCase', 'UpperCase', '|',
            'Formats', 'Alignments', '|', 'OrderedList', 'UnorderedList', '|',
            'Indent', 'Outdent', '|', 'CreateLink','CreateTable', '|', 'ClearFormat', 'Print', 'SourceCode', '|']
  };
  public quickTools: object = {
      image: [
          'Replace', 'Align', 'Caption', 'Remove', 'InsertLink', '-', 'Display', 'AltText', 'Dimension']
  };

  constructor( private api: APIService, private route: ActivatedRoute, private router:Router, private snack: MatSnackBar ) {
    this.getFreeTrialPeriodSettings()
  }

  ngOnInit() {
    this.aceessSection = this.api.getUserAccess('referral')
    this.freeTrialForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      customerFreeAccessDays: new FormControl('', [Validators.required, Validators.min(1), Validators.max(999)]),
      customerAftrFreeAccessDays: new FormControl('', [Validators.required, Validators.min(1), Validators.max(999)]),
      advisorFreeDays: new FormControl('', [Validators.required, Validators.min(1), Validators.max(999)]),
      customerStatus: new FormControl('', [Validators.required]),
      advisorStatus: new FormControl('', [Validators.required]),
    })
  }

  async getFreeTrialPeriodSettings() {
    let returnArr = await this.api.apiRequest('get', 'freetrialsettings/getdetails', {}).toPromise()
    this.rows     = returnArr.data
    this.freeTrialForm.controls['title'].setValue(this.rows.title)
    this.freeTrialForm.controls['customerFreeAccessDays'].setValue(this.rows.customerFreeAccessDays)
    this.freeTrialForm.controls['customerAftrFreeAccessDays'].setValue(this.rows.customerAftrFreeAccessDays)
    this.freeTrialForm.controls['advisorFreeDays'].setValue(this.rows.advisorFreeDays)
    this.freeTrialForm.controls['customerStatus'].setValue( this.rows.customerStatus == 'On'? true : false )
    this.freeTrialForm.controls['advisorStatus'].setValue( this.rows.advisorStatus == 'On'? true : false )
  }

  updateDetails() {    
    let req_vars = this.freeTrialForm.value
        delete req_vars.customerStatus
        delete req_vars.advisorStatus
        req_vars = Object.assign( { _id: this.rows._id, customerStatus: this.freeTrialForm.controls['customerStatus'].value ? 'On' : 'Off', advisorStatus: this.freeTrialForm.controls['advisorStatus'].value ? 'On' : 'Off' }, req_vars )

    this.api.apiRequest('post', 'freetrialsettings/update', req_vars).subscribe(result => {
      if(result.status == "error") {
        this.snack.open(result.data, 'OK', { duration: 4000 })
      }
      else {
        this.snack.open(result.data, 'OK', { duration: 4000 })
      }
    }, (err) => {
      this.snack.open( "Error in update", 'OK', { duration: 4000 })
    })
  }
}