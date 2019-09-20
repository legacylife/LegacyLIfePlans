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
const URL = serverUrl + '/api/documents/advisorHomeDocuments';
const URLProfilePhoto = serverUrl + '/api/documents/landingMutliImages';
@Component({
  selector: 'advisorcmsform',
  templateUrl: './advisorcmsform.component.html',
  providers: [ToolbarService, LinkService, ImageService, HtmlEditorService,TableService, QuickToolbarService],
})
export class advisorcmsformComponent implements OnInit {
  userId = localStorage.getItem("userId");
  public hasBaseDropZoneOver: boolean = false;
  invalidMessage: string;
  advisorCmsForm: FormGroup
  customercmsPageId: string

  public uploaderTopBanner: FileUploader = new FileUploader({ url: `${URL}` });
  topBannerProgessPer: number = 0;
  topBannerPath: string
  middlePath: string
  lowerPath: string
  fileErrorsTop: any;

  public uploaderSectionThree: FileUploader = new FileUploader({ url: `${URL}` });
  sectionThreeProgessPer: number = 0;
  sectionThreePath: string
  fileErrorsSectionThree: any;

  public uploaderSectionFour: FileUploader = new FileUploader({ url: `${URL}` });
  sectionFourProgessPer: number = 0;
  sectionFourPath: string
  fileErrorsSectionFour: any;

  public uploaderFeaturedAdvisors: FileUploader = new FileUploader({ url: `${URL}` });
  sectionFAPer: number = 0;
  sectionFA: string
  fileErrorsFA: any;

  public uploaderSectionEight: FileUploader = new FileUploader({ url: `${URL}` });
  sectionEightProgessPer: number = 0;
  sectionEightPath: string
  fileErrorsSectionEight: any;

  public uploaderProfilePhoto: FileUploader = new FileUploader({ url: `${URL}` });
  currentProgessinPercentProfilePhoto: number = 0;
  fileErrorsProfilePhoto: any;

  selectedFAFile: File = null;
  selectedFAFileName:any

  selectedFile: File = null;
  selectedFileName:any

  // benefitsPoints:any;
  // testimonials:string;
  filePath = s3Details.awsserverUrl+s3Details.assetsPath+'advisor/';
  row : any
  aceessSection : any;
  public tools: object = {
      items: ['Undo', 'Redo', '|', 'Bold', 'Italic', 'Underline', 'StrikeThrough', '|','FontName', 'FontSize', 'FontColor', 'BackgroundColor', '|','SubScript', 'SuperScript', '|','LowerCase', 'UpperCase', '|',
          'Formats', 'Alignments', '|', 'OrderedList', 'UnorderedList', '|','Indent', 'Outdent', '|', 'CreateLink','CreateTable','Image', '|', 'ClearFormat', 'Print', 'SourceCode', '|', 'FullScreen']
  };
  public quickTools: object = {
      image: ['Replace', 'Align', 'Caption', 'Remove', 'InsertLink', '-', 'Display', 'AltText', 'Dimension']
  };

  constructor(private router: Router, private activeRoute: ActivatedRoute, private snack: MatSnackBar, private api: APIService, private fb: FormBuilder, private loader: AppLoaderService) { }

  ngOnInit() {
    this.aceessSection = this.api.getUserAccess('cms')
    this.advisorCmsForm = this.fb.group({
      sectionOne: new FormGroup({
        title: new FormControl(''),
        middleTitle: new FormControl(''),
        subTitle: new FormControl(''),
        topBanner: new FormControl('')
      }),
      sectionTwo:  this.fb.array([this.fb.group({title: [''],subTitle: ['']})]),
      sectionThree: new FormGroup({
        title: new FormControl(''),
        subTitle: new FormControl(''),
        bannerImage: new FormControl(''),
      }),
      sectionFour: new FormGroup({
        title: new FormControl(''),
        subTitle: new FormControl(''),
        bannerImage: new FormControl(''),
      }),
      sectionFive:  this.fb.array([this.fb.group({title: [''],subTitle: ['']})]),
      facts: new FormGroup({
        title: new FormControl(''),
        subTitle: new FormControl(''),
        savedFiles: new FormControl(''),
        trustedAdvisors: new FormControl(''),
        LLPMembers: new FormControl(''),
        referralConnection: new FormControl(''),
      }),
      sectionSix: new FormGroup({
        title: new FormControl(''),
        subTitle: new FormControl('')
      }),
      featuredAdvisors:  this.fb.array([this.fb.group({name: [''],certifications: [''],profilePhoto: ['']})]),
      sectionEight: new FormGroup({
        title: new FormControl(''),
        subTitle: new FormControl(''),
        bannerImage: new FormControl(''),
        benefitsPoints: this.fb.array([this.fb.group({name: ['']})]),
      }),
      testimonials: this.fb.array([this.fb.group({name:[''],profilePhoto:[''],certifications:[''],comment:['']})]),
    })
    
    this.activeRoute.params.subscribe(params => {
      if(params.id){
        this.customercmsPageId = params.id;
        ///this.getPageDetails()
      }
    });
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
        this.advisorCmsForm.controls['pageTitle'].setValue(this.row.pageTitle); 
        this.advisorCmsForm.controls['pagesubTitle'].setValue(this.row.pagesubTitle);
        this.advisorCmsForm.controls['middleText'].setValue(this.row.middleText);
        this.advisorCmsForm.controls['lowerText'].setValue(this.row.lowerText);
        this.advisorCmsForm.controls['bulletPoints'].setValue(this.row.bulletPoints);

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
    console.log('formData',formData);
    let pageData = {
      pageFor : 'advisor',
      sectionOne: ({
        "title": formData.sectionOne.title,
        "middleTitle": formData.sectionOne.middleTitle,
        "subTitle": formData.sectionOne.subTitle,
        "topBanner": ''
      }),
      sectionTwo: this.advisorCmsForm.controls['sectionTwo'].value,
      sectionThree: ({
        "title": formData.sectionThree.title,
        "subTitle": formData.sectionThree.subTitle,
        "bannerImage": ''
      }),
      sectionFour: ({
        "title": formData.sectionFour.title,
        "subTitle": formData.sectionFour.subTitle,
        "bannerImage": ''
      }),
      sectionFive: this.advisorCmsForm.controls['sectionFive'].value,
      facts: ({
        "title":formData.facts.title,
        "subTitle":formData.facts.subTitle,
        "savedFiles":formData.facts.savedFiles,
        "trustedAdvisors":formData.facts.trustedAdvisors,       
        "LLPMembers":formData.facts.LLPMembers,
        "referralConnection":formData.facts.referralConnection,
      }),
      featuredAdvisors: this.advisorCmsForm.controls['featuredAdvisors'].value,
      sectionEight: ({
        "title": formData.sectionEight.title,
        "subTitle": formData.sectionEight.subTitle,
        "bannerImage": '',
        "benefitsPoints": formData.sectionEight.benefitsPoints,
      }),
      testimonials: this.advisorCmsForm.controls['testimonials'].value,
      status:"Active"
    }

    // if(this.uploaderProfilePhoto.getNotUploadedItems().length){
    //   this.snack.open("Please wait files uploading is in process..."+this.uploaderProfilePhoto.getNotUploadedItems().length, 'OK', { duration: 4000 })
    // }else{
    console.log('pageData',pageData);
    let profileInData = {userId:this.userId};
    const req_vars = {
      query: pageData,
      proquery: profileInData,
      _id:this.customercmsPageId
    }
    this.api.apiRequest('post', 'homecms/advisorUpdate', req_vars).subscribe(result => {
      if(result.status == "error"){
        this.snack.open("Something error! Please try again later.", 'OK', { duration: 5000 })
      } else {
        let returnId = result.data.newrecord._id;
          
         this.uploadTopBanner(returnId);
         this.uploadThree(returnId);
         this.uploaderFour(returnId);
         this.uploaderEight(returnId);

        this.snack.open("Data has been updated successfully", 'OK', { duration: 5000 })
       //8 this.router.navigateByUrl('/admin/customerCms');
      }      
    }, (err) => {
      console.log("Error in update")
    })
 // }
    //this.form.reset()  
}

getFormGroup(controlName) {
  return <FormGroup>this.advisorCmsForm.get(controlName);
}

get sectionTwoArray() {
  return this.advisorCmsForm.get('sectionTwo') as FormArray;
}

addTwoPoints() {
  this.sectionTwoArray.push(this.fb.group({
    title: ['', [Validators.required]],
    subTitle: ['', [Validators.required]]
  }));
}

deleteTwoPoints(i) {
  const control = <FormArray>this.advisorCmsForm.controls['sectionTwo'];
  control.removeAt(i);
}

get sectionFiveArray() {
  return this.advisorCmsForm.get('sectionFive') as FormArray;
}

addFivePoints() {
  this.sectionFiveArray.push(this.fb.group({
    title: ['', [Validators.required]],
    subTitle: ['', [Validators.required]]
  }));
}

deleteFivePoints(i) {
  const control = <FormArray>this.advisorCmsForm.controls['sectionFive'];
  control.removeAt(i);
}

get featuredAdvisorsArray() {
  return this.advisorCmsForm.get('featuredAdvisors') as FormArray;
}

onFAFileSelected(event,i) {
  this.selectedFAFile = <File>event.target.files[0];
  this.selectedFAFileName = new Date().getTime()+this.selectedFAFile.name;
  this.uploaderFeature(this.selectedFileName,i);
  console.log('selectedFAFileName,',this.selectedFAFileName)
}

uploaderFeature(fileName,index) {
  console.log('fileName--->',fileName)
  this.uploaderFeaturedAdvisors.onBeforeUploadItem = (item) => {
    item.url = `${URLProfilePhoto}?folderName=${'advisor'}&filenewName=${fileName}`;
  }
  if(this.uploaderFeaturedAdvisors.getNotUploadedItems().length){
    this.uploaderFeaturedAdvisors.queue.forEach((fileoOb, ind) => {
          this.uploaderFeaturedAdvisors.uploadItem(fileoOb);
    });
    this.uploaderFeaturedAdvisors.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
       this.uploaderFeatureProgressBar(index);
    };

   if(this.uploaderFeaturedAdvisors.onCompleteAll()){
      this.uploaderFeaturedAdvisors.clearQueue();
    }  
  }
}

uploaderFeatureProgressBar(index){
  let totalLength = this.uploaderFeaturedAdvisors.queue.length;console.log('Pro photos',totalLength);
  let remainingLength =  this.uploaderFeaturedAdvisors.getNotUploadedItems().length;    
  this.sectionFAPer = 100 - (remainingLength * 100 / totalLength);
  this.sectionFAPer = Number(this.sectionFAPer.toFixed());
}


addFaturedAdvisors() {
  this.featuredAdvisorsArray.push(this.fb.group({
    title: ['', [Validators.required]],
    subTitle: ['', [Validators.required]],
    certifications: ['', [Validators.required]],
    name: ['', [Validators.required]],
    profilePhoto: [this.selectedFAFileName],
  }));
}

deleteFaturedAdvisors(i) {
  const control = <FormArray>this.advisorCmsForm.controls['featuredAdvisors'];
  control.removeAt(i);
}


get testimonialsArray() {
  return this.advisorCmsForm.get('testimonials') as FormArray;
}


onFileSelected(event,i) {
  this.selectedFile = <File>event.target.files[0];
  this.selectedFileName = new Date().getTime()+this.selectedFile.name;
  this.uploadTestimonialsFile(this.selectedFileName,i);
  console.log('selectedFileName,',this.selectedFileName)
}


uploadTestimonialsFile(fileName,index) {
  console.log('fileName--->',fileName)
  this.uploaderProfilePhoto.onBeforeUploadItem = (item) => {
    item.url = `${URLProfilePhoto}?folderName=${'advisor'}&filenewName=${fileName}`;
  }
  if(this.uploaderProfilePhoto.getNotUploadedItems().length){
    this.uploaderProfilePhoto.queue.forEach((fileoOb, ind) => {
          this.uploaderProfilePhoto.uploadItem(fileoOb);
    });
    this.uploaderProfilePhoto.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
       this.uploaderTestimonialsProgressBar(index);
    };

   if(this.uploaderProfilePhoto.onCompleteAll()){
      this.uploaderProfilePhoto.clearQueue();
    }  
  }
}

uploaderTestimonialsProgressBar(index){
  let totalLength = this.uploaderProfilePhoto.queue.length;console.log('Testimonials -->>> ',totalLength);
  let remainingLength =  this.uploaderProfilePhoto.getNotUploadedItems().length;    
  this.currentProgessinPercentProfilePhoto = 100 - (remainingLength * 100 / totalLength);
  this.currentProgessinPercentProfilePhoto = Number(this.currentProgessinPercentProfilePhoto.toFixed());
}


addTestimonialsPoints() {
  this.testimonialsArray.push(this.fb.group({
    name: ['', [Validators.required]],
    profilePhoto: [this.selectedFileName],
    certifications: ['', [Validators.required]],
    comment: ['', [Validators.required]]
  }));
}

deleteTestimonialsPoints(i) {
  const control = <FormArray>this.advisorCmsForm.controls['testimonials'];
  control.removeAt(i);
}

get benefitsPointsArray() {
  return this.advisorCmsForm.controls.sectionEight.get('benefitsPoints') as FormArray;
}

addBenefitsPoints() {
  this.benefitsPointsArray.push(this.fb.group({
    name: ['', [Validators.required]]
  }));
}

deleteBenefitsPoints(i) {
  const control = <FormArray>this.advisorCmsForm.controls['benefitsPoints'];
  control.removeAt(i);
}


public fileOverTopBannerBase(e: any): void {
  this.hasBaseDropZoneOver = e;
  this.fileErrorsTop = [];
  this.uploaderTopBanner.queue.forEach((fileoOb) => {
    let filename = fileoOb.file.name;
    var extension = filename.substring(filename.lastIndexOf('.') + 1);
    var fileExts = ["jpg", "jpeg", "png"];
    let resp = this.isExtension(extension,fileExts);
    if(!resp){
      var FileMsg = "This file '" + filename + "' is not supported";
      this.uploaderTopBanner.removeFromQueue(fileoOb);
      let pushArry = {"error":FileMsg} 
      this.fileErrorsTop.push(pushArry); 
      setTimeout(()=>{    
        this.fileErrorsTop = []
      }, 5000);
    }
  });
}

public fileOverSectionThreeBase(e: any): void {
  this.hasBaseDropZoneOver = e;
  this.fileErrorsSectionThree = [];
  this.uploaderSectionThree.queue.forEach((fileoOb) => {
    let filename = fileoOb.file.name;
    var extension = filename.substring(filename.lastIndexOf('.') + 1);
    var fileExts = ["jpg", "jpeg", "png"];
    let resp = this.isExtension(extension,fileExts);
    if(!resp){
      var FileMsg = "This file '" + filename + "' is not supported";
      this.uploaderSectionThree.removeFromQueue(fileoOb);
      let pushArry = {"error":FileMsg} 
      this.fileErrorsSectionThree.push(pushArry); 
      setTimeout(()=>{    
        this.fileErrorsSectionThree = []
      }, 5000);
    }
  });
}

public fileOverSectionFourBase(e: any): void {
  this.hasBaseDropZoneOver = e;
  this.fileErrorsSectionFour = [];
  this.uploaderSectionFour.queue.forEach((fileoOb) => {
    let filename = fileoOb.file.name;
    var extension = filename.substring(filename.lastIndexOf('.') + 1);
    var fileExts = ["jpg", "jpeg", "png"];
    let resp = this.isExtension(extension,fileExts);
    if(!resp){
      var FileMsg = "This file '" + filename + "' is not supported";
      this.uploaderSectionFour.removeFromQueue(fileoOb);
      let pushArry = {"error":FileMsg} 
      this.fileErrorsSectionFour.push(pushArry); 
      setTimeout(()=>{    
        this.fileErrorsSectionFour = []
      }, 5000);
    }
  });
}

public fileOverSectionEightBase(e: any): void {
  this.hasBaseDropZoneOver = e;
  this.fileErrorsSectionEight = [];
  this.uploaderSectionEight.queue.forEach((fileoOb) => {
    let filename = fileoOb.file.name;
    var extension = filename.substring(filename.lastIndexOf('.') + 1);
    var fileExts = ["jpg", "jpeg", "png"];
    let resp = this.isExtension(extension,fileExts);
    if(!resp){
      var FileMsg = "This file '" + filename + "' is not supported";
      this.uploaderSectionEight.removeFromQueue(fileoOb);
      let pushArry = {"error":FileMsg} 
      this.fileErrorsSectionEight.push(pushArry); 
      setTimeout(()=>{    
        this.fileErrorsSectionEight = []
      }, 5000);
    }
  });
}

isExtension(ext, extnArray) {
  var result = false; var i;
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

uploadTopBanner(id) {
  this.uploaderTopBanner.onBeforeUploadItem = (item) => {
    item.url = `${URL}?docId=${id}&attrName=sectionOne.topBanner`;
  }
  if(this.uploaderTopBanner.getNotUploadedItems().length){
    this.uploaderTopBanner.queue.forEach((fileoOb, ind) => {
          this.uploaderTopBanner.uploadItem(fileoOb);
    });
    this.uploaderTopBanner.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      this.updateProgressBarTopBanner();
      this.uploaderTopBanner.clearQueue();      
    };
  }
}

updateProgressBarTopBanner(){
  let totalLength = this.uploaderTopBanner.queue.length;
  let remainingLength =  this.uploaderTopBanner.getNotUploadedItems().length;    
  this.topBannerProgessPer = 100 - (remainingLength * 100 / totalLength);
  this.topBannerProgessPer = Number(this.topBannerProgessPer.toFixed());
}

uploadThree(id) {
  this.uploaderSectionThree.onBeforeUploadItem = (item) => {
    item.url = `${URL}?docId=${id}&attrName=sectionThree.bannerImage`;
  }
  if(this.uploaderSectionThree.getNotUploadedItems().length){
    this.uploaderSectionThree.queue.forEach((fileoOb, ind) => {
          this.uploaderSectionThree.uploadItem(fileoOb);
    });
    this.uploaderSectionThree.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      this.updateProgressBarSectionThree();
      this.uploaderSectionThree.clearQueue();      
    };
  }
}

updateProgressBarSectionThree(){
  let totalLength = this.uploaderSectionThree.queue.length;
  let remainingLength =  this.uploaderSectionThree.getNotUploadedItems().length;    
  this.sectionThreeProgessPer = 100 - (remainingLength * 100 / totalLength);
  this.sectionThreeProgessPer = Number(this.sectionThreeProgessPer.toFixed());
}

uploaderFour(id) {
  this.uploaderSectionFour.onBeforeUploadItem = (item) => {
    item.url = `${URL}?docId=${id}&attrName=sectionFour.bannerImage`;
  }
  if(this.uploaderSectionFour.getNotUploadedItems().length){
    this.uploaderSectionFour.queue.forEach((fileoOb, ind) => {
          this.uploaderSectionFour.uploadItem(fileoOb);
    });
    this.uploaderSectionFour.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      this.updateProgressBarSectionFour();
      this.uploaderSectionFour.clearQueue();      
    };
  }
}

updateProgressBarSectionFour(){
  let totalLength = this.uploaderSectionFour.queue.length;
  let remainingLength =  this.uploaderSectionFour.getNotUploadedItems().length;    
  this.sectionFourProgessPer = 100 - (remainingLength * 100 / totalLength);
  this.sectionFourProgessPer = Number(this.sectionFourProgessPer.toFixed());
}

uploaderEight(id) {
  this.uploaderSectionEight.onBeforeUploadItem = (item) => {
    item.url = `${URL}?docId=${id}&attrName=sectionEight.bannerImage`;
  }
  if(this.uploaderSectionEight.getNotUploadedItems().length){
    this.uploaderSectionEight.queue.forEach((fileoOb, ind) => {
          this.uploaderSectionEight.uploadItem(fileoOb);
    });
    this.uploaderSectionEight.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      this.updateProgressBarSectionEight();
      this.uploaderSectionEight.clearQueue();      
    };
  }
}

updateProgressBarSectionEight(){
  let totalLength = this.uploaderSectionEight.queue.length;
  let remainingLength =  this.uploaderSectionEight.getNotUploadedItems().length;    
  this.sectionEightProgessPer = 100 - (remainingLength * 100 / totalLength);
  this.sectionEightProgessPer = Number(this.sectionEightProgessPer.toFixed());
}


}