import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { MatSnackBar } from '@angular/material';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { ToolbarService, LinkService, ImageService, HtmlEditorService, TableService, QuickToolbarService } from '@syncfusion/ej2-angular-richtexteditor';

@Component({
  selector: 'cmsedit',
  templateUrl: './cmsedit.component.html',
  providers: [ToolbarService, LinkService, ImageService, HtmlEditorService,TableService, QuickToolbarService],
})
export class cmseditComponent implements OnInit {

  cmsForm: FormGroup
  cmsPageId: string
  pageTitle: string
  PageBody: string
  row : any
  aceessSection : any;

  public tools: object = {
      items: ['Undo', 'Redo', '|',
          'Bold', 'Italic', 'Underline', 'StrikeThrough', '|',
          'FontName', 'FontSize', 'FontColor', 'BackgroundColor', '|',
          'SubScript', 'SuperScript', '|',
          'LowerCase', 'UpperCase', '|',
          'Formats', 'Alignments', '|', 'OrderedList', 'UnorderedList', '|',
          'Indent', 'Outdent', '|', 'CreateLink','CreateTable',
          'Image', '|', 'ClearFormat', 'Print', 'SourceCode', '|', 'FullScreen']
  };
  public quickTools: object = {
      image: [
          'Replace', 'Align', 'Caption', 'Remove', 'InsertLink', '-', 'Display', 'AltText', 'Dimension']
  };
  // input trim, no white space 
  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }
  constructor(private router: Router, private activeRoute: ActivatedRoute, private snack: MatSnackBar, private api: APIService, private fb: FormBuilder, private loader: AppLoaderService) { }

  ngOnInit() {

    this.aceessSection = this.api.getUserAccess('cms')

    this.cmsForm = new FormGroup({
      pageTitle: new FormControl('', [Validators.required, this.noWhitespaceValidator, Validators.minLength(3)]),
      pageBody: new FormControl('', [Validators.required, this.noWhitespaceValidator, Validators.minLength(3)]),
      pageFor: new FormControl('', [Validators.required]),
    })

    this.activeRoute.params.subscribe(params => {
      this.cmsPageId = params.id;
      this.getPageDetails()
    });
  }

  getPageDetails = (query = {}, search = false) => {  
    const req_vars = {
      _id:this.cmsPageId
    }
    this.api.apiRequest('post', 'cms/view', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.row = result.data
        this.cmsForm.controls['pageTitle'].setValue(this.row.pageTitle); 
        this.cmsForm.controls['pageBody'].setValue(this.row.pageBody);
        this.cmsForm.controls['pageFor'].setValue(this.row.pageFor);
      }
    }, (err) => {
      console.error(err)
    })
  }

  updatePage() {
    let pageData = {
      pageTitle: this.cmsForm.controls['pageTitle'].value,
      pageBody: this.cmsForm.controls['pageBody'].value,
      pageFor: this.cmsForm.controls['pageFor'].value
    }

    const req_vars = {
      "_id":this.row._id,
      "pageTitle": this.cmsForm.controls['pageTitle'].value,
      "pageBody": this.cmsForm.controls['pageBody'].value,
      "pageFor": this.cmsForm.controls['pageFor'].value,
      fromId: localStorage.getItem('userId')
    }

    this.api.apiRequest('post', 'cms/update', req_vars).subscribe(result => {
      if(result.status == "error"){
        //this.errorMessage = result.data
      } else {
        this.snack.open("Data has been updated successfully", 'OK', { duration: 4000 })
        //this.successMessage = result.data
        this.router.navigate(["admin", "cms"]);
      }
      
    }, (err) => {
      console.log("Error in update")
    })
    //this.form.reset()  
  }

}