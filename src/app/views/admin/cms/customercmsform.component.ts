import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl, FormBuilder,FormArray } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { MatSnackBar } from '@angular/material';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { ToolbarService, LinkService, ImageService, HtmlEditorService, TableService, QuickToolbarService } from '@syncfusion/ej2-angular-richtexteditor';
import { FileUploader } from 'ng2-file-upload';
import { serverUrl, s3Details } from '../../../config';

const URL = serverUrl + '/api/documents/customerHomeDocuments';
const URLProfilePhoto = serverUrl + '/api/documents/landingMutliImages';

@Component({
  selector: 'customercmsform',
  templateUrl: './customercmsform.component.html',
  providers: [ToolbarService, LinkService, ImageService, HtmlEditorService,TableService, QuickToolbarService],
})
export class customercmsformComponent implements OnInit {
  userId = localStorage.getItem("userId");
  public uploader: FileUploader = new FileUploader({ url: `${URL}` });
  public uploaderMiddleBanner: FileUploader = new FileUploader({ url: `${URL}` });
  public uploaderLowerBanner: FileUploader = new FileUploader({ url: `${URL}` });
  public uploaderQOW1: FileUploader = new FileUploader({ url: `${URL}` });
  public uploaderQOW2: FileUploader = new FileUploader({ url: `${URL}` });
  public uploaderProfilePhoto: FileUploader = new FileUploader({ url: `${URL}` });
 
  public hasBaseDropZoneOver: boolean = false;
  invalidMessage: string;
  customerCmsForm: FormGroup
  customercmsPageId: string
  pageTitle: string
  pagesubTitle: string
  topBanner: string
  middleBanner: string
  middleText: string
  lowerBanner: string
  lowerText: string
  bulletPoints: string
  testimonials: string
  selectedFile: File = null;
  selectedFileName:any
  topBannerPath: string
  middlePath: string
  lowerPath: string
  QOW1Path: string
  QOW2Path: string
  filePath = s3Details.awsserverUrl+s3Details.assetsPath+'customer/';
  fileErrors: any;
  fileErrorsMiddile: any;
  fileErrorsLower: any;
  fileErrorsQOW1: any;
  fileErrorsQOW2: any;
  currentProgessinPercent: number = 0;
  currentProgessinPercentMiddle: number = 0;
  currentProgessinPercentLower: number = 0;
  currentProgessinPercentQOW1: number = 0;
  currentProgessinPercentQOW2: number = 0;
  currentProgessinPercentProfilePhoto: number = 0;
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

  constructor(private router: Router, private activeRoute: ActivatedRoute, private snack: MatSnackBar, private api: APIService, private fb: FormBuilder, private loader: AppLoaderService) { }

  ngOnInit() {
    this.aceessSection = this.api.getUserAccess('cms')

    this.customerCmsForm = this.fb.group({
      pageTitle: new FormControl('', [Validators.required]),
      pagesubTitle: new FormControl(''),
      topBanner: new FormControl('', []),
      middleBanner: new FormControl(''),
      middleTitle: new FormControl(''),
      middleText: new FormControl(''),
      lowerTitle: new FormControl(''),
      lowerText: new FormControl(''),
      lowerBanner: new FormControl(''),
      bulletPoints:  this.fb.array([this.fb.group({name: ['']})]),
      facts: new FormGroup({
        title: new FormControl(''),
        subTitle: new FormControl(''),
        savedFiles: new FormControl(''),
        trustedAdvisors: new FormControl(''),
        successLogin: new FormControl(''),
        LLPMembers: new FormControl('')
      }),
      quickOverview1: new FormGroup({
        title: new FormControl(''),
        subTitle: new FormControl(''),
       // videoLink: new FormControl('')
      }),
      quickOverview2: new FormGroup({
        title: new FormControl(''),
        subTitle: new FormControl(''),
        //videoLink: new FormControl('')
      }),
      testimonials: this.fb.array([this.fb.group({name:[''],profilePhoto:[''],certifications:[''],comment:['']})]),
    })
    
    this.activeRoute.params.subscribe(params => {
      if(params.id){
        this.customercmsPageId = params.id;
        this.getPageDetails()
      }
    });
}

getFormGroup(controlName) {
  return <FormGroup>this.customerCmsForm.get(controlName);
}

editGroupPoints(name) {
  return this.fb.group({
    name: [name, Validators.required]
  });
}

get bulletsPointsArray() {
  return this.customerCmsForm.get('bulletPoints') as FormArray;
}

addBulletsPoints() {
  this.bulletsPointsArray.push(this.fb.group({
    name: ['', [Validators.required]]
  }));
}

deleteBulletsPoints(i) {
  const control = <FormArray>this.customerCmsForm.controls['bulletPoints'];
  control.removeAt(i);
}

editTestimonials(name) {
  return this.fb.group({
    name: [name, Validators.required],
    certifications: ['', [Validators.required]],
    comment: ['', [Validators.required]],    
  });
}

get testimonialsArray() {
  return this.customerCmsForm.get('testimonials') as FormArray;
}

onFileSelected(event,i) {
  this.selectedFile = <File>event.target.files[0];
  this.selectedFileName = new Date().getTime()+this.selectedFile.name;
  this.uploadTestimonialsFile(this.selectedFileName,i);
  console.log('selectedFileName,',this.selectedFileName)
}

addTestimonialsPoints() {
  this.testimonialsArray.push(this.fb.group({
    name:['',[Validators.required]],
    profilePhoto:[this.selectedFileName],
    certifications:['',[Validators.required]],
    comment:['',[Validators.required]],    
  }));
}

deleteTestimonialsPoints(i) {
  const control = <FormArray>this.customerCmsForm.controls['testimonials'];
  control.removeAt(i);
}

getPageDetails = (query = {}, search = false) => {  
    const req_vars = {
      _id:this.customercmsPageId
    }
    this.api.apiRequest('post', 'homecms/view', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.row = result.data;
        this.customerCmsForm.controls['pageTitle'].setValue(this.row.pageTitle); 
        this.customerCmsForm.controls['pagesubTitle'].setValue(this.row.pagesubTitle);
        this.customerCmsForm.controls['middleText'].setValue(this.row.middleText);
        this.customerCmsForm.controls['lowerText'].setValue(this.row.lowerText);
        //this.customerCmsForm.controls['bulletPoints'].setValue(this.row.bulletPoints);

        this.topBannerPath = this.filePath+this.row.topBanner;
        this.middlePath = this.filePath+this.row.middleBanner;
        this.lowerPath = this.filePath+this.row.lowerBanner;
        console.log("Data",this.row)
      }
    }, (err) => {
      console.error(err)
    })
  }

  updatePage(formData) {
    var query = {}; var proquery = {};     
 
    let pageData = {
      pageFor : 'customer',
      pageTitle: this.customerCmsForm.controls['pageTitle'].value,
      pagesubTitle: this.customerCmsForm.controls['pagesubTitle'].value,
      middleText: this.customerCmsForm.controls['middleText'].value,
      lowerText: this.customerCmsForm.controls['lowerText'].value,
      bulletPoints: this.customerCmsForm.controls['bulletPoints'].value,
      quickOverview1: ({
        "title": formData.quickOverview1.title,
        "subTitle": formData.quickOverview1.subTitle,
        "videoLink": ''
      }),
      quickOverview2: ({
        "title": formData.quickOverview2.title,
        "subTitle": formData.quickOverview2.subTitle,
        "videoLink": ''
      }),
      facts: ({
        "title":formData.facts.title,
        "subTitle":formData.facts.subTitle,
        "savedFiles":formData.facts.savedFiles,
        "trustedAdvisors":formData.facts.trustedAdvisors,
        "successLogin":formData.facts.successLogin,
        "LLPMembers":formData.facts.LLPMembers,
      }),
      testimonials: this.customerCmsForm.controls['testimonials'].value,
      status:"Active"
    }

    if(this.uploaderProfilePhoto.getNotUploadedItems().length){
      this.snack.open("Please wait files uploading is in process..."+this.uploaderProfilePhoto.getNotUploadedItems().length, 'OK', { duration: 4000 })
    }else{
    console.log('pageData',pageData);
    console.log('formData',formData);
    let profileInData = {userId:this.userId};
    const req_vars = {
      query: pageData,
      proquery: profileInData,
      _id:this.customercmsPageId
    }
    this.api.apiRequest('post', 'homecms/update', req_vars).subscribe(result => {
      if(result.status == "error"){
        this.snack.open("Something error! Please try again later.", 'OK', { duration: 5000 })
      } else {
        let returnId = result.data.newrecord._id;
        this.uploadFile(returnId);
        this.uploadMiddleBannerFile(returnId);
        this.uploadLowerBannerFile(returnId);
        this.uploadQOW1File(returnId);
        this.uploadQOW2File(returnId);
        this.snack.open("Data has been updated successfully", 'OK', { duration: 5000 })
        this.router.navigateByUrl('/admin/customerCms');
      }      
    }, (err) => {
      console.log("Error in update")
    })
  }
    //this.form.reset()  
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
      }
    });
}
  
uploadFile(id) {
  this.uploader.onBeforeUploadItem = (item) => {
    item.url = `${URL}?docId=${id}&attrName=topBanner`;
  }
  if(this.uploader.getNotUploadedItems().length){
    this.uploader.queue.forEach((fileoOb, ind) => {
          this.uploader.uploadItem(fileoOb);
    });
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      this.updateProgressBar();
      this.uploader.clearQueue();      
    };
  }
}

public fileOverMiddleBannerBase(e: any): void {
  this.hasBaseDropZoneOver = e;
  this.fileErrorsMiddile = [];
  this.uploaderMiddleBanner.queue.forEach((fileoOb) => {
    let filename = fileoOb.file.name;
    var extension = filename.substring(filename.lastIndexOf('.') + 1);
    var fileExts = ["jpg", "jpeg", "png"];
    let resp = this.isExtension(extension,fileExts);
    if(!resp){
      var FileMsg = "This file '" + filename + "' is not supported";
      this.uploaderMiddleBanner.removeFromQueue(fileoOb);
      let pushArry = {"error":FileMsg} 
      this.fileErrorsMiddile.push(pushArry); 
      setTimeout(()=>{    
        this.fileErrorsMiddile = []
      }, 5000);
    }
  });
}

uploadMiddleBannerFile(id) {
  this.uploaderMiddleBanner.onBeforeUploadItem = (item) => {
    item.url = `${URL}?docId=${id}&attrName=middleBanner`;
  }
  if(this.uploaderMiddleBanner.getNotUploadedItems().length){
    this.uploaderMiddleBanner.queue.forEach((fileoOb, ind) => {
          this.uploaderMiddleBanner.uploadItem(fileoOb);
    });
    this.uploaderMiddleBanner.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      this.updateProgressBarMiddle();
      this.uploaderMiddleBanner.clearQueue();
      //this.router.navigateByUrl('/admin/customerCms');
    };
  }
}

public fileOverLowerBannerBase(e: any): void {
  this.hasBaseDropZoneOver = e;
  this.fileErrorsLower = [];
  this.uploaderLowerBanner.queue.forEach((fileoOb) => {
    let filename = fileoOb.file.name;
    var extension = filename.substring(filename.lastIndexOf('.') + 1);
    var fileExts = ["jpg", "jpeg", "png"];
    let resp = this.isExtension(extension,fileExts);
    if(!resp){
      var FileMsg = "This file '" + filename + "' is not supported";
      this.uploaderLowerBanner.removeFromQueue(fileoOb);
      let pushArry = {"error":FileMsg} 
      this.fileErrorsLower.push(pushArry); 
      setTimeout(()=>{    
        this.fileErrorsLower = []
      }, 5000);
    }
  });
}

uploadLowerBannerFile(id) {
  this.uploaderLowerBanner.onBeforeUploadItem = (item) => {
    item.url = `${URL}?docId=${id}&attrName=lowerBanner`;
  }
  if(this.uploaderLowerBanner.getNotUploadedItems().length){
    this.uploaderLowerBanner.queue.forEach((fileoOb, ind) => {
          this.uploaderLowerBanner.uploadItem(fileoOb);
    });
    this.uploaderLowerBanner.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      this.updateProgressBarLower();
      this.uploaderLowerBanner.clearQueue();
      //this.router.navigateByUrl('/admin/customerCms');
    };
  }
}

public fileOverQOW1Base(e: any): void {
  this.hasBaseDropZoneOver = e;
  this.fileErrorsQOW1 = [];
  this.uploaderQOW1.queue.forEach((fileoOb) => {
    let filename = fileoOb.file.name;
    var extension = filename.substring(filename.lastIndexOf('.') + 1);
    var fileExts = ["mov","mp3", "mpeg", "wav", "ogg", "opus", "bmp", "tiff", "svg", "webm", "mpeg4", "3gpp", "avi", "mpegps", "wmv", "flv"];
    let resp = this.isExtension(extension,fileExts);
    if(!resp){
      var FileMsg = "This file '" + filename + "' is not supported";
      this.uploaderQOW1.removeFromQueue(fileoOb);
      let pushArry = {"error":FileMsg} 
      this.fileErrorsQOW1.push(pushArry); 
      setTimeout(()=>{    
        this.fileErrorsQOW1 = []
      }, 5000);
    }
  });
}

uploadQOW1File(id) {
  this.uploaderQOW1.onBeforeUploadItem = (item) => {
    item.url = `${URL}?docId=${id}&attrName=quickOverview1.videoLink`;
  }
  if(this.uploaderQOW1.getNotUploadedItems().length){
    this.uploaderQOW1.queue.forEach((fileoOb, ind) => {
          this.uploaderQOW1.uploadItem(fileoOb);
    });
    this.uploaderQOW1.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      this.updateProgressBarQOW1();
      this.uploaderQOW1.clearQueue();
      //this.router.navigateByUrl('/admin/customerCms');
    };
  }
}


public fileOverQOW2Base(e: any): void {
  this.hasBaseDropZoneOver = e;
  this.fileErrorsQOW2 = [];
  this.uploaderQOW2.queue.forEach((fileoOb) => {
    let filename = fileoOb.file.name;
    var extension = filename.substring(filename.lastIndexOf('.') + 1);
    var fileExts = ["mov","mp3", "mpeg", "wav", "ogg", "opus", "bmp", "tiff", "svg", "webm", "mpeg4", "3gpp", "avi", "mpegps", "wmv", "flv"];
    let resp = this.isExtension(extension,fileExts);
    if(!resp){
      var FileMsg = "This file '" + filename + "' is not supported";
      this.uploaderQOW2.removeFromQueue(fileoOb);
      let pushArry = {"error":FileMsg} 
      this.fileErrorsQOW2.push(pushArry); 
      setTimeout(()=>{    
        this.fileErrorsQOW2 = []
      }, 5000);
    }
  });
}

uploadQOW2File(id) {
  this.uploaderQOW2.onBeforeUploadItem = (item) => {
    item.url = `${URL}?docId=${id}&attrName=quickOverview2.videoLink`;
  }
  if(this.uploaderQOW2.getNotUploadedItems().length){
    this.uploaderQOW2.queue.forEach((fileoOb, ind) => {
          this.uploaderQOW2.uploadItem(fileoOb);
    });
    this.uploaderQOW2.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      this.updateProgressBarQOW2();
      this.uploaderQOW2.clearQueue();
      //this.router.navigateByUrl('/admin/customerCms');
    };
  }
}

uploadTestimonialsFile(fileName,index) {
  console.log('fileName--->',fileName)
  this.uploaderProfilePhoto.onBeforeUploadItem = (item) => {
    item.url = `${URLProfilePhoto}?folderName=${'customer'}&filenewName=${fileName}`;
  }
  if(this.uploaderProfilePhoto.getNotUploadedItems().length){
    this.uploaderProfilePhoto.queue.forEach((fileoOb, ind) => {
          this.uploaderProfilePhoto.uploadItem(fileoOb);
    });
    this.uploaderProfilePhoto.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
       this.updateProgressBarProfilePhoto(index);
    };


    if(this.uploaderProfilePhoto.onCompleteAll()){
      console.log('All Done');
      this.uploaderProfilePhoto.clearQueue();
    }  
  }
}


updateProgressBarProfilePhoto(index){
  let totalLength = this.uploaderProfilePhoto.queue.length;console.log('Pro photos',totalLength);
  let remainingLength =  this.uploaderProfilePhoto.getNotUploadedItems().length;    
  this.currentProgessinPercentProfilePhoto = 100 - (remainingLength * 100 / totalLength);
  this.currentProgessinPercentProfilePhoto = Number(this.currentProgessinPercentProfilePhoto.toFixed());
}

updateProgressBar(){
  let totalLength = this.uploader.queue.length;
  let remainingLength =  this.uploader.getNotUploadedItems().length;    
  this.currentProgessinPercent = 100 - (remainingLength * 100 / totalLength);
  this.currentProgessinPercent = Number(this.currentProgessinPercent.toFixed());
}

updateProgressBarMiddle(){
  let totalLength = this.uploaderMiddleBanner.queue.length;
  let remainingLength =  this.uploaderMiddleBanner.getNotUploadedItems().length;    
  this.currentProgessinPercentMiddle = 100 - (remainingLength * 100 / totalLength);
  this.currentProgessinPercentMiddle = Number(this.currentProgessinPercentMiddle.toFixed());
}

updateProgressBarLower(){
  let totalLength = this.uploaderLowerBanner.queue.length;
  let remainingLength =  this.uploaderLowerBanner.getNotUploadedItems().length;    
  this.currentProgessinPercentLower = 100 - (remainingLength * 100 / totalLength);
  this.currentProgessinPercentLower = Number(this.currentProgessinPercentLower.toFixed());
}

updateProgressBarQOW1(){
  let totalLength = this.uploaderQOW1.queue.length;
  let remainingLength =  this.uploaderQOW1.getNotUploadedItems().length;    
  this.currentProgessinPercentQOW1 = 100 - (remainingLength * 100 / totalLength);
  this.currentProgessinPercentQOW1 = Number(this.currentProgessinPercentQOW1.toFixed());
}

updateProgressBarQOW2(){
  let totalLength = this.uploaderQOW2.queue.length;
  let remainingLength =  this.uploaderQOW2.getNotUploadedItems().length;    
  this.currentProgessinPercentQOW2 = 100 - (remainingLength * 100 / totalLength);
  this.currentProgessinPercentQOW2 = Number(this.currentProgessinPercentQOW2.toFixed());
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


}