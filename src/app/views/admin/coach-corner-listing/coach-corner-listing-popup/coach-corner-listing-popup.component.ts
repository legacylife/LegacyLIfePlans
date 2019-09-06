/**
 * @copyright: Arkenea technology
 * @author: Nilesh Yadav
 * @since: 05 Sept 2019 04:00 PM
 * @summary: Coach Corner Post Popup Component
 * @description: Component for add / edit coach corner posts
 */
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatDialog,MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { APIService } from './../../../../api.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { ToolbarService, LinkService, ImageService, HtmlEditorService, TableService, QuickToolbarService } from '@syncfusion/ej2-angular-richtexteditor';
import { Router } from '@angular/router';

@Component({
  selector: 'app-coach-corner-popup',
  templateUrl: './coach-corner-listing-popup.component.html',
  styleUrls: ['./coach-corner-listing-popup.component.scss'],
  providers: [ToolbarService, LinkService, ImageService, HtmlEditorService,TableService, QuickToolbarService],
})

export class CoachCornerPopupComponent implements OnInit {
  
  public itemForm: FormGroup;
  url: String;
  RequestData: any;
  oldStatus: String = ''
  oldTitle: String = ''
  categoryList: any = []

  public tools: object = {
    items: ['Undo', 'Redo', '|',
            'Bold', 'Italic', 'Underline', 'StrikeThrough', '|',
            'FontName', 'FontSize', 'FontColor', 'BackgroundColor', '|',
            'SubScript', 'SuperScript', '|',
            'LowerCase', 'UpperCase', '|',
            'Formats', 'Alignments', '|',
            'OrderedList', 'UnorderedList', '|',
            'Indent', 'Outdent', '|',
            'CreateLink','CreateTable', '|',
            'Image', 'ClearFormat', '|',
            'Print', 'SourceCode', 'FullScreen','|'
          ]
  };
  public quickTools: object = {
      image: [
          'Replace', 'Align', 'Caption', 'Remove', 'InsertLink', '-', 'Display', 'AltText', 'Dimension']
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CoachCornerPopupComponent>,
    private fb: FormBuilder, private api: APIService,public dialog: MatDialog, private loader: AppLoaderService,
    private router:Router )
  { 
    this.getCategoryList()
  }

  ngOnInit() {
    let item = this.data.payload

    if(this.data.title=='Update Post') {
      this.itemForm = this.fb.group({
        title: ['',Validators.required],
        description: ['',Validators.required],
        category: ['',Validators.required],
        image: [''],
        status: [true,Validators.required],
      })
      this.oldStatus = item.status
      this.oldTitle  = item.title
      this.itemForm.controls['title'].setValue(item.title)
      this.itemForm.controls['category'].setValue(item.category._id)
      this.itemForm.controls['description'].setValue(item.description)
      this.itemForm.controls['status'].setValue(item.status == 'On'? true : false )
    }
    else{   
      this.itemForm = this.fb.group({
        title: [item.title || '', Validators.required],
        description: [item.description || '', Validators.required],
        category: [item.category._id || '', Validators.required],
        image: [item.image || ''],
        status: [item.status || true, Validators.required]
      })
    }
  }

  /**
   * @description : get category list from db
   */
  getCategoryList = async() => {
    const req_vars = {
      query: {},
      fields: {},
      offset: '',
      limit: '',
      order: {"orderNo": -1},
    }
    let result = await this.api.apiRequest('post', 'coach-corner-category/list', req_vars).toPromise()
      
    if (result.status == "error") {
      this.categoryList = [];
    }
    else {
      this.categoryList = result.data.categoryList
    }
  }

  /**
   * @description : if category not exists then redirect to add category page
   */
  addCategory() {
    this.dialogRef.close()
    this.router.navigate(['admin/coach-corner-category-management'])
  }

  /**
   * @description : submit post form to add / update post details
   */
  submit() {
    let postData = this.data.payload;
    this.RequestData = {
      fromId : localStorage.getItem('userId'),
      data: {
        title: this.itemForm.controls['title'].value,
        description: this.itemForm.controls['description'].value,
        category: this.itemForm.controls['category'].value,
        image: '',
        status: this.itemForm.controls['status'].value ? 'On' : 'Off'
      }
    }
    if (postData._id) {
      this.RequestData.data._id   = postData._id;
      this.RequestData.oldTitle   = this.oldTitle;
      this.RequestData.oldStatus  = this.oldStatus;
      this.url = 'coach-corner-post/update';
    }
    else {
      this.url = 'coach-corner-post/create';
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
