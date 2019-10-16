import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { MatSnackBar } from '@angular/material';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { ToolbarService, LinkService, ImageService, HtmlEditorService, TableService, QuickToolbarService,RichTextEditorComponent, CountService } from '@syncfusion/ej2-angular-richtexteditor';
@Component({
  selector: 'file-upload-instructions-edit',
  templateUrl: './file-upload-instructions-edit.component.html',
  providers: [ToolbarService, LinkService, ImageService, HtmlEditorService,TableService, QuickToolbarService],
})
export class fileUploadInstructionsEditComponent implements OnInit {
  @ViewChild('toolsRTE') public rteObj: RichTextEditorComponent;
  cmsForm: FormGroup
  cmsPageId: string
  InstuctionBody: string
  row : any
  aceessSection : any;
  public maxLength = 500;
  public height: number = 300;
  public textArea: HTMLElement;
  // public tools: object = {
  //   items: ['Undo', 'Redo', '|',
  //       'Bold', 'Italic', 'Underline', 'StrikeThrough', '|',
  //       'FontName', 'FontSize', 'FontColor', 'BackgroundColor', '|',
  //       'SubScript', 'SuperScript', '|',
  //       'LowerCase', 'UpperCase', '|',
  //       'Formats', 'Alignments', '|', 'OrderedList', 'UnorderedList', '|',
  //       'Indent', 'Outdent', '|', 'CreateLink','CreateTable',
  //       'Image', '|', 'ClearFormat', 'Print', 'SourceCode']
  // };
  public tools: object = {
    items: ['Undo', 'Redo', '|',
        'Bold', 'Italic', 'Underline', '|',
        'FontName', 'FontSize', '|',
        'LowerCase', 'UpperCase', '|',
        'Formats', 'Alignments', '|', 'OrderedList', 'UnorderedList', '|',
        'SourceCode']
  };
  public quickTools: object = {
      image: [
          'Replace', 'Align', 'Caption', 'Remove', 'InsertLink', '-', 'Display', 'AltText', 'Dimension']
  };

  constructor(private router: Router, private activeRoute: ActivatedRoute,
     private snack: MatSnackBar, private api: APIService,
     private fb: FormBuilder, private loader: AppLoaderService) { }

  ngOnInit() {
    let rteObj: RichTextEditorComponent = this.rteObj;
    setTimeout(() => { this.textArea = rteObj.contentModule.getEditPanel() as HTMLElement; }, 600);
    
    this.aceessSection = this.api.getUserAccess('cms');
    this.cmsForm = new FormGroup({
      folderName: new FormControl('', [Validators.required]),
      InstuctionBody: new FormControl('', [Validators.required])      
    })

    this.activeRoute.params.subscribe(params => {
      this.cmsPageId = params.id;
      this.getPageDetails()
    });

    
  }

  getPageDetails = (query = {}, search = false) => {  
    const params = {
      query: Object.assign({ _id: this.cmsPageId })
    }
    this.api.apiRequest('post', 'cmsFolderInst/view', params).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.row = result.data.cmsDetails        
        this.cmsForm.controls['folderName'].setValue(this.row.folderName);
        this.cmsForm.controls['InstuctionBody'].setValue(this.row.InstuctionBody);       
        this.cmsForm.controls['folderName'].disable();
      }
    }, (err) => {
      console.error(err)
    })
  }

  updatePage() {
    let pageData = {
      InstuctionBody: this.cmsForm.controls['InstuctionBody'].value,
      folderName: this.cmsForm.controls['folderName'].value
    }

    const req_vars = {
      "_id":this.row._id,
      "InstuctionBody": this.cmsForm.controls['InstuctionBody'].value,
      "folderName": this.cmsForm.controls['folderName'].value
    }

    this.api.apiRequest('post', 'cmsFolderInst/update', req_vars).subscribe(result => {
      if(result.status == "error"){
        //this.errorMessage = result.data
      } else {
        this.snack.open("Data has been updated successfully", 'OK', { duration: 4000 })
        //this.successMessage = result.data
        console.log(result.data)
      }
      
    }, (err) => {
      console.log("Error in update")
    })
    //this.form.reset()  
  }

}