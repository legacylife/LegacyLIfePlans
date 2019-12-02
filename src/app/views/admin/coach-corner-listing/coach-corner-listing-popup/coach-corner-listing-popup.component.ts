/**
 * @copyright: Arkenea technology
 * @author: Nilesh Yadav
 * @since: 05 Sept 2019 04:00 PM
 * @summary: Coach Corner Post Popup Component
 * @description: Component for add / edit coach corner posts
 */
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatDialog,MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { APIService } from './../../../../api.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { ToolbarService, LinkService, ImageService, HtmlEditorService, TableService, QuickToolbarService } from '@syncfusion/ej2-angular-richtexteditor';
import { Router } from '@angular/router';
import { FileUploader } from 'ng2-file-upload';
import { cloneDeep } from 'lodash'
import { serverUrl, s3Details } from '../../../../config';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
const URL = serverUrl + '/api/documents/coachCornerArticle';
@Component({
  selector: 'app-coach-corner-popup',
  templateUrl: './coach-corner-listing-popup.component.html',
  styleUrls: ['./coach-corner-listing-popup.component.scss'],
  providers: [ToolbarService, LinkService, ImageService, HtmlEditorService,TableService, QuickToolbarService],
})

export class CoachCornerPopupComponent implements OnInit {
  
  userId = localStorage.getItem("userId");
  public uploader: FileUploader = new FileUploader({ url: `${URL}?ProfileId=&userId=${this.userId}&prevImage=` });
  public hasBaseDropZoneOver: boolean = false;
  public hasAnotherDropZoneOver: boolean = false;
  fileErrors: any;
  currentProgessinPercent: number = 0;
  documentsMissing = false;
  invalidMessage: string;
  public itemForm: FormGroup;
  articleURL: String;
  RequestData: any;
  oldStatus: String = ''
  oldTitle: String = ''
  categoryList: any = []
  uploadedImage: any = ''
  imageList:any = []
  documents_temps = false;
  profileIdHiddenVal:boolean = false;
  selectedProfileId: string;
  docPath = ''
  tmpName: string;
  imageTitle: string;
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

  alphaNumSpechar = "([A-Za-z0-9!@#$%^&'*)(_+}{/.,><-}]+ )+[A-Za-z0-9!@#$%^&'*)(_+}{/.,><-]+$|^[A-Za-z0-9!@#$%^&'*)(_+}{/.,><-]*$";
  showButton = false
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CoachCornerPopupComponent>,
    private fb: FormBuilder, private api: APIService,public dialog: MatDialog, private loader: AppLoaderService,
    private router:Router, private confirmService: AppConfirmService, private snack: MatSnackBar)
  { 
    this.getCategoryList()
  }

  ngOnInit() {
    const filePath  = s3Details.coachCornerArticlePath;
    this.docPath    = filePath;
    let item = this.data.payload;     
  console.log('Item title',this.data.title);
    if(this.data.title=='Update Post') {
      this.selectedProfileId = item;
      this.itemForm = this.fb.group({
        title: ['', [Validators.required,Validators.pattern(this.alphaNumSpechar)]],
        description: ['', Validators.required],
        category: [ '', Validators.required],
        // image: [item.image || ''],
        profileId: [item],
        documents_temp: ['', Validators.required],
        status: ['', Validators.required]
      })
      this.itemForm.controls['profileId'].setValue(item);     
    } else {
      console.log('Item title ------>>',this.data.title);
      this.itemForm = this.fb.group({
        title: [item.title || '', [Validators.required,Validators.pattern(this.alphaNumSpechar)]],
        description: [item.description || '', Validators.required],
        category: [item.category ? item.category._id || '' : '', Validators.required],
        // image: [item.image || ''],
        profileId: [item._id],
        documents_temp: [(item.image && item.image.tmpName) ? item.image.tmpName : '', Validators.required],
        status: [item.status || true, Validators.required]
      })
    }
    this.getDocuments();
  }

  /**
   * @description : get category list from db
   */
  getCategoryList = async() => {
    const req_vars = {
      query: {'status':'On'},
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
      this.categoryList = result.data.categoryList;
      if(this.categoryList.length>0){
        this.showButton =  false;
      }else{
        this.showButton =  true;
      }
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
    let description = this.itemForm.controls['description'].value.replace(/\&nbsp;/g, '')    
    this.RequestData = {
      fromId : localStorage.getItem('userId'),
      data: {
        title: this.itemForm.controls['title'].value,
        description: description,
        category: this.itemForm.controls['category'].value,
        image: this.uploadedImage,
        status: this.itemForm.controls['status'].value ? 'On' : 'Off'
      }
    }
    if (this.selectedProfileId) {
      this.RequestData.data._id   = this.selectedProfileId;
      this.RequestData.oldTitle   = this.oldTitle;
      this.RequestData.oldStatus  = this.oldStatus;
      this.articleURL = 'coach-corner-post/update';
    }
    else {
      this.articleURL = 'coach-corner-post/create';
    }
    this.loader.open();
    this.api.apiRequest('post', this.articleURL, this.RequestData).subscribe(result => {    
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

  public fileOverBase(e: any): void {    
    this.hasBaseDropZoneOver = e;
    this.fileErrors = [];
    this.uploader.queue.forEach((fileoOb) => {
      let filename = fileoOb.file.name;
      var extension = filename.substring(filename.lastIndexOf('.') + 1);
      var fileExts = ["jpg", "jpeg", "png"];
      let resp = this.isExtension(extension,fileExts);
      
      if(!resp){
        var FileMsg = "This file '" + filename + "' is not supported";
        this.uploader.removeFromQueue(fileoOb);
        let pushArry = {"error":FileMsg} 
        this.fileErrors.push(pushArry);  
        setTimeout(()=>{    
          this.fileErrors = []
        }, 5000);       
      } else {
        let proceed = false;
        // if(this.imageTitle){
        //   var statMsg = "Old image '" + this.imageTitle + "' will be replace with new image file. Can we proceed?"
        //   this.confirmService.confirm({ message: statMsg }).subscribe(res => {
        //     if (res) {
        //       console.log('res >>>>>',res)
        //       proceed = res;
        //     }
        //   });
        // }else{
        //   proceed = true;
        // }
        // if(proceed){

          if(this.selectedProfileId){
            this.uploader.onBeforeUploadItem = (item) => {
              item.url = `${URL}?ProfileId=${this.selectedProfileId}&userId=${this.userId}&prevImage=${this.tmpName}`;
            }
          }
    
          this.uploader.uploadItem(fileoOb);
          this.uploader.onProgressItem = (fileItem: any, progress: any) => {
            this.currentProgessinPercent = progress
          }

          this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
            if( item && item.isUploaded ) {
              //this.imageList = []
              //this.imageList.push(item.file)
             // this.uploadedImage = item.file.name
            }
          }
          this.uploader.onCompleteAll=()=>{
            this.uploader.clearQueue();
              this.currentProgessinPercent = 0;
              setTimeout(()=>{    
                this.getUploadedDocuments();
              },2000);
          }
        //}
      }
    });
  }

  isExtension(ext, extnArray) {
    var result = false;
    var i;
    if (ext) {
        ext = ext.toLowerCase();
        for (i = 0; i < extnArray.length; i++) {
            if (extnArray[i].toLowerCase() === ext) {
                result = true;
                break;
            }
        }
    }
    return result;
  }
  
  updateProgressBar(){
    let totalLength = this.uploader.queue.length;
    let remainingLength =  this.uploader.getNotUploadedItems().length;
    this.currentProgessinPercent = 100 - (remainingLength * 100 / totalLength);
    this.currentProgessinPercent = Number(this.currentProgessinPercent.toFixed());
  }

  downloadFile = filename => {
    let query = {};
    let req_vars = {
      query: Object.assign({ docPath: this.docPath, filename: filename }, query),
      fromId: localStorage.getItem('userId'),
      toId: localStorage.getItem('userId'),
      folderName: s3Details.coachCornerArticlePath,
      subFolderName: ''
    };

    this.api.download("documents/downloadDocument", req_vars).subscribe(res => {
      var downloadURL = window.URL.createObjectURL(res);
      let filePath    = downloadURL;
      var link        = document.createElement('a');
      link.href       = filePath;
      link.download   = filename;
      link.click();
    });
  }
  
  ImageDelete(doc, name, tmName) {
    //let ids = this.itemForm.controls['profileId'].value;
    var statMsg = "Are you sure you want to delete '" + name + "' file?"
    this.confirmService.confirm({ message: statMsg }).subscribe(res => {
      if (res) {
        this.loader.open();
        this.imageList = {'title':"","size":"","extention":"","tmpName":""};//.splice(doc, 1)
        var query = {};
        const req_vars = {
          query: Object.assign({_id:this.selectedProfileId}, query),
          proquery: Object.assign({documents:this.imageList}, query),
          fileName: tmName,
          fromId: localStorage.getItem('userId'),
          toId: localStorage.getItem('userId'),
          folderName: s3Details.coachCornerArticlePath,
          subFolderName: ''
        }
        this.api.apiRequest('post', 'documents/deleteCoachCornerImage', req_vars).subscribe(result => {
          if (result.status == "error") {
            this.loader.close();
            this.snack.open(result.data.message, 'OK', { duration: 4000 })
          } else {
            this.loader.close();
            this.snack.open(result.data.message, 'OK', { duration: 4000 })
          }
        }, (err) => {
          console.error(err)
          this.loader.close();
        })
      }
    })
  }


  getUploadedDocuments = (query = {}) => {     
    let profileIds = this.itemForm.controls['profileId'].value;
    let req_vars = {
      query: Object.assign({createdBy: this.userId,status:"Pending" }),
      fields:{}
    }
    if(profileIds){
       req_vars = {
        query: Object.assign({ _id:profileIds}),
        fields:{}
      }
    }    
    this.api.apiRequest('post', 'coach-corner-post/get-post-details', req_vars).subscribe(result => {
      if (result.status == "error") {
      } else {
        profileIds = this.selectedProfileId = result.data._id;
        this.data.payload = result.data;
        this.itemForm.controls['profileId'].setValue(profileIds);
        this.itemForm.controls['documents_temp'].setValue('');
        this.documentsMissing = false;
        if(result.data.image){
          this.imageList = result.data.image;       
          this.uploadedImage = result.data.image;    
          this.itemForm.controls['documents_temp'].setValue('1');
          this.documentsMissing = false;
          this.tmpName = result.data.image.tmpName; 
        } 
        if(this.currentProgessinPercent==100){
          this.currentProgessinPercent = 0;
        }        
      }
    }, (err) => {
      console.error(err);
    })
  }

  getDocuments = (query = {}) => {     
      let profileIds = this.itemForm.controls['profileId'].value;
      let req_vars = {
        query: Object.assign({createdBy:this.userId,status:"Pending"}),
        fields:{}
      }
      
      if(profileIds) {
          req_vars = {
          query: Object.assign({_id:profileIds}),
          fields:{}
        }
      } 

      this.loader.open();
      this.api.apiRequest('post', 'coach-corner-post/get-post-details', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        console.log('coach-corner Error',result)
      } else {
        profileIds = this.selectedProfileId = result.data._id;
        let item = result.data;
        this.data.payload = result.data;
        this.oldStatus = item.status;
        this.oldTitle  = item.title;
        this.itemForm.controls['title'].setValue(item.title);
        this.itemForm.controls['category'].setValue('');
        if(item.category) {
          this.itemForm.controls['category'].setValue(item.category._id);
        }
        if(item.description){
           this.itemForm.controls['description'].setValue(item.description);
        }
        this.itemForm.controls['status'].setValue(item.status == 'On'? true : false );
        this.itemForm.controls['documents_temp'].setValue('');
        this.tmpName = '';this.imageTitle =  '';
        if(item.image && item.image.tmpName) {
            this.uploadedImage =  this.imageList = item.image;
            this.itemForm.controls['documents_temp'].setValue('1');
            this.imageTitle = item.image.title;
            this.tmpName = item.image.tmpName;
        }
        this.uploader = new FileUploader({ url: `${URL}?ProfileId=${item._id}&userId=${this.userId}&prevImage=${this.tmpName}` });
    }
   }, (err) => {
    console.error(err);
   })

}
}