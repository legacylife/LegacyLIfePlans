import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';

import { Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { MatSnackBar } from '@angular/material';
import { ToolbarService, LinkService, ImageService, HtmlEditorService, TableService, QuickToolbarService } from '@syncfusion/ej2-angular-richtexteditor';
@Component({
  selector: 'referral-program',
  templateUrl: './referral-program.component.html',
  providers: [ToolbarService, LinkService, ImageService, HtmlEditorService,TableService, QuickToolbarService],
})
export class ReferralProgramComponent implements OnInit {
  aceessSection : any;
  my_messages:any;
  
  rows : any
  referEarnForm: FormGroup

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
    this.getReferrelSettings()
  }

  ngOnInit() {
    this.aceessSection = this.api.getUserAccess('referral')
    this.referEarnForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      targetCount: new FormControl('', [Validators.required, Validators.min(1), Validators.max(999)]),
      extendedDays: new FormControl('', [Validators.required, Validators.min(1), Validators.max(999)]),
      status: new FormControl('', [Validators.required]),
    })
  }

  async getReferrelSettings() {
    let returnArr = await this.api.apiRequest('get', 'referearnsettings/getdetails', {}).toPromise()
    this.rows     = returnArr.data
    this.referEarnForm.controls['title'].setValue(this.rows.title); 
    this.referEarnForm.controls['description'].setValue(this.rows.description);
    this.referEarnForm.controls['targetCount'].setValue(this.rows.targetCount);
    this.referEarnForm.controls['extendedDays'].setValue(this.rows.extendedDays);
    this.referEarnForm.controls['status'].setValue( this.rows.status == 'On'? true : false );
  }

  updateDetails() {    
    let req_vars = this.referEarnForm.value
        delete req_vars.status
        req_vars = Object.assign( { _id: this.rows._id, status: this.referEarnForm.controls['status'].value ? 'On' : 'Off' }, req_vars )

    this.api.apiRequest('post', 'referearnsettings/update', req_vars).subscribe(result => {
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