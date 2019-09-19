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
const URLProfilePhoto = serverUrl + '/api/documents/advisorHomeTestimonialsphoto';

@Component({
  selector: 'advisorcmsform',
  templateUrl: './advisorcmsform.component.html',
  providers: [ToolbarService, LinkService, ImageService, HtmlEditorService,TableService, QuickToolbarService],
})
export class advisorcmsformComponent implements OnInit {
  userId = localStorage.getItem("userId");
  public hasBaseDropZoneOver: boolean = false;
  invalidMessage: string;
  customerCmsForm: FormGroup
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
    this.customerCmsForm = this.fb.group({
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
      featuredAdvisors:  this.fb.array([this.fb.group({title: [''],subTitle: [''],name: [''],certifications: [''],profilePhoto: ['']})]),
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
        this.getPageDetails()
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
        this.customerCmsForm.controls['pageTitle'].setValue(this.row.pageTitle); 
        this.customerCmsForm.controls['pagesubTitle'].setValue(this.row.pagesubTitle);
        this.customerCmsForm.controls['middleText'].setValue(this.row.middleText);
        this.customerCmsForm.controls['lowerText'].setValue(this.row.lowerText);
        this.customerCmsForm.controls['bulletPoints'].setValue(this.row.bulletPoints);

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
    }

    // if(this.uploaderProfilePhoto.getNotUploadedItems().length){
    //   this.snack.open("Please wait files uploading is in process..."+this.uploaderProfilePhoto.getNotUploadedItems().length, 'OK', { duration: 4000 })
    // }else{
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
       
        this.snack.open("Data has been updated successfully", 'OK', { duration: 5000 })
        this.router.navigateByUrl('/admin/customerCms');
      }      
    }, (err) => {
      console.log("Error in update")
    })
 // }
    //this.form.reset()  
}

getFormGroup(controlName) {
  return <FormGroup>this.customerCmsForm.get(controlName);
}

get sectionTwoArray() {
  return this.customerCmsForm.get('sectionTwo') as FormArray;
}

addTwoPoints() {
  this.sectionTwoArray.push(this.fb.group({
    title: ['', [Validators.required]],
    subTitle: ['', [Validators.required]]
  }));
}

deleteTwoPoints(i) {
  const control = <FormArray>this.customerCmsForm.controls['sectionTwo'];
  control.removeAt(i);
}

get sectionFiveArray() {
  return this.customerCmsForm.get('sectionFive') as FormArray;
}

addFivePoints() {
  this.sectionFiveArray.push(this.fb.group({
    title: ['', [Validators.required]],
    subTitle: ['', [Validators.required]]
  }));
}

deleteFivePoints(i) {
  const control = <FormArray>this.customerCmsForm.controls['sectionFive'];
  control.removeAt(i);
}

get featuredAdvisorsArray() {
  return this.customerCmsForm.get('featuredAdvisors') as FormArray;
}

onFAFileSelected(event,i) {
  this.selectedFAFile = <File>event.target.files[0];
  this.selectedFAFileName = new Date().getTime()+this.selectedFAFile.name;
  //this.uploadTestimonialsFile(this.selectedFileName,i);
  console.log('selectedFAFileName,',this.selectedFAFileName)
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
  const control = <FormArray>this.customerCmsForm.controls['featuredAdvisors'];
  control.removeAt(i);
}


get testimonialsArray() {
  return this.customerCmsForm.get('testimonials') as FormArray;
}


onFileSelected(event,i) {
  this.selectedFile = <File>event.target.files[0];
  this.selectedFileName = new Date().getTime()+this.selectedFile.name;
 // this.uploadTestimonialsFile(this.selectedFileName,i);
  console.log('selectedFileName,',this.selectedFileName)
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
  const control = <FormArray>this.customerCmsForm.controls['testimonials'];
  control.removeAt(i);
}

get benefitsPointsArray() {
  return this.customerCmsForm.controls.sectionEight.get('benefitsPoints') as FormArray;
}

addBenefitsPoints() {
  this.benefitsPointsArray.push(this.fb.group({
    name: ['', [Validators.required]]
  }));
}

deleteBenefitsPoints(i) {
  const control = <FormArray>this.customerCmsForm.controls['benefitsPoints'];
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