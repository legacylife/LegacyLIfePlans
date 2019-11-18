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
  styleUrls: ['./cms.component.scss'],
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
  IsVisible: boolean = false;
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
  bulletPoints: any
  testimonials: any;
  selectedFile: File = null;
  selectedFileName:any
  topBannerPath: string
  middlePath: string
  lowerPath: string
  videoLink1: string
  videoLink2: string
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
  currentProgessinPercentProfilePhoto1: number = 0;
  currentProgessinPercentProfilePhoto2: number = 0;
  currentProgessinPercentProfilePhoto3: number = 0;
  profileId: string;
  row : any
  aceessSection : any;
  profilePhotoHiddenVal:boolean = false;
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

editTestimonials(name,certifications,comment,profilePhoto) {
  return this.fb.group({
    name: [name, Validators.required],
    certifications: [certifications, [Validators.required]],
    comment: [comment, [Validators.required]],    
    profilePhoto: [profilePhoto],
  });
}

get testimonialsArray() {
  return this.customerCmsForm.get('testimonials') as FormArray;
}

onFileSelected(event,i) {
  this.selectedFile = <File>event.target.files[0];
  this.selectedFileName = new Date().getTime()+this.selectedFile.name;  
  this.uploadTestimonialsFile(this.selectedFileName,i);  
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
        this.profileId = this.row._id;
        this.customerCmsForm.controls['pageTitle'].setValue(this.row.pageTitle); 
        this.customerCmsForm.controls['pagesubTitle'].setValue(this.row.pagesubTitle);
        this.customerCmsForm.controls['lowerTitle'].setValue(this.row.lowerTitle);
        this.customerCmsForm.controls['middleText'].setValue(this.row.middleText);
        this.customerCmsForm.controls['lowerText'].setValue(this.row.lowerText);

        const ctrl = this.getFormGroup('facts')
        ctrl.controls['title'].setValue(this.row.facts.title ? this.row.facts.title : "")
        ctrl.controls['subTitle'].setValue(this.row.facts.subTitle ? this.row.facts.subTitle : "")
        ctrl.controls['savedFiles'].setValue(this.row.facts.savedFiles ? this.row.facts.savedFiles : "")
        ctrl.controls['trustedAdvisors'].setValue(this.row.facts.trustedAdvisors ? this.row.facts.trustedAdvisors : "")
        ctrl.controls['successLogin'].setValue(this.row.facts.successLogin ? this.row.facts.successLogin : "")
        ctrl.controls['LLPMembers'].setValue(this.row.facts.LLPMembers ? this.row.facts.LLPMembers : "")

        const ctrl2 = this.getFormGroup('quickOverview1')
        ctrl2.controls['title'].setValue(this.row.quickOverview1.title ? this.row.quickOverview1.title : "")
        ctrl2.controls['subTitle'].setValue(this.row.quickOverview1.subTitle ? this.row.quickOverview1.subTitle : "")
      
        const ctrl3 = this.getFormGroup('quickOverview2')
        ctrl3.controls['title'].setValue(this.row.quickOverview2.title ? this.row.quickOverview2.title : "")
        ctrl3.controls['subTitle'].setValue(this.row.quickOverview2.subTitle ? this.row.quickOverview2.subTitle : "")
    
        this.testimonials = this.row.testimonials;
        const testimonialsctrls = this.customerCmsForm.get('testimonials') as FormArray;
        testimonialsctrls.removeAt(0)
        this.testimonials.forEach((element: any, index) => {
          testimonialsctrls.push(this.editTestimonials(element.name,element.certifications,element.comment,element.profilePhoto))          
        })

        this.bulletPoints = this.row.bulletPoints;
        const bulletPointsctrls = this.customerCmsForm.get('bulletPoints') as FormArray;
        bulletPointsctrls.removeAt(0)
        this.bulletPoints.forEach((element: any, index) => {
          bulletPointsctrls.push(this.editGroupPoints(element.name))
        })

        this.topBannerPath = this.filePath+this.row.topBanner;
        this.middlePath = this.filePath+this.row.middleBanner;
        this.lowerPath = this.filePath+this.row.lowerBanner;

        if(this.row.quickOverview1.videoLink){
          this.QOW1Path = this.row.quickOverview1.videoLink;
        }
        if(this.row.quickOverview2.videoLink){
          this.QOW2Path = this.row.quickOverview2.videoLink;
        }
      }
    }, (err) => {
      console.error(err)
    })
  }

  updatePage(formData) {
    var query = {}; var proquery = {};     
 
    let pageData = {
      pageFor:'customer',
      pageTitle: this.customerCmsForm.controls['pageTitle'].value,
      pagesubTitle: this.customerCmsForm.controls['pagesubTitle'].value,
      middleTitle: this.customerCmsForm.controls['middleTitle'].value,
      middleText: this.customerCmsForm.controls['middleText'].value,
      lowerText: this.customerCmsForm.controls['lowerText'].value,
      lowerTitle: this.customerCmsForm.controls['lowerTitle'].value,
      topBannerPath: this.row.topBanner,
      middlePath: this.row.middleBanner,
      lowerPath: this.row.lowerBanner,
      bulletPoints: this.customerCmsForm.controls['bulletPoints'].value,
      quickOverview1: ({
        "title": formData.quickOverview1.title,
        "subTitle": formData.quickOverview1.subTitle,
        "videoLink": this.QOW1Path
      }),
      quickOverview2: ({
        "title": formData.quickOverview2.title,
        "subTitle": formData.quickOverview2.subTitle,
        "videoLink": this.QOW2Path
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
        this.profileId = result.data.newrecord._id;
        // this.uploadFile(returnId);
        // this.uploadMiddleBannerFile(returnId);
        // this.uploadLowerBannerFile(returnId);
        // this.uploadQOW1File(returnId);
        // this.uploadQOW2File(returnId);
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
    
    if(this.uploader.isUploading){
      this.snack.open('Please wait! Uploading is in process...', 'OK', { duration: 4000 })
    }else{

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

    this.uploader.onBeforeUploadItem = (item) => {
      item.url = `${URL}?docId=${this.profileId}&attrName=topBanner`;
    }
    if(this.uploader.getNotUploadedItems().length){
      this.uploader.queue.forEach((fileoOb, ind) => {
            this.uploader.uploadItem(fileoOb);
      });
      this.updateProgressBar();
      this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
        this.uploader.clearQueue();   
        this.getDocument()      
        setTimeout(()=>{    
            this.getDocument()   
            this.currentProgessinPercent = 0;
        },5000);
      };
    }
  }
}

getDocument() {  
  let query = {}
  const req_vars = {
    _id:this.profileId
  }
  this.api.apiRequest('post', 'homecms/view', req_vars).subscribe(result => {
    if (result.status == "error") {
      console.log(result.data)
    } else {
        this.row = result.data;
        this.topBannerPath = this.filePath+this.row.topBanner;
        this.middlePath = this.filePath+this.row.middleBanner;
        this.lowerPath = this.filePath+this.row.lowerBanner;

        if(this.row.quickOverview1.videoLink){
          this.QOW1Path = this.row.quickOverview1.videoLink;
        }
        if(this.row.quickOverview2.videoLink){
          this.QOW2Path = this.row.quickOverview2.videoLink;
        }


        // this.currentProgessinPercentProfilePhoto = 0;
        // this.currentProgessinPercentProfilePhoto1 = 0;
        // this.currentProgessinPercentProfilePhoto2 = 0;


    }
  }, (err) => {
    console.error(err)
  })
}

public fileOverMiddleBannerBase(e: any): void {
  this.hasBaseDropZoneOver = e;
  this.fileErrorsMiddile = [];
  if(this.uploaderMiddleBanner.isUploading){
    this.snack.open('Please wait! Uploading is in process...', 'OK', { duration: 4000 })
  }else{
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

  this.uploaderMiddleBanner.onBeforeUploadItem = (item) => {
    item.url = `${URL}?docId=${this.profileId}&attrName=middleBanner`;
  }
  if(this.uploaderMiddleBanner.getNotUploadedItems().length){
    this.uploaderMiddleBanner.queue.forEach((fileoOb, ind) => {
          this.uploaderMiddleBanner.uploadItem(fileoOb);
    });
    this.updateProgressBarMiddle();
    this.uploaderMiddleBanner.onCompleteItem = (item: any, response: any, status: any, headers: any) => {      
      this.uploaderMiddleBanner.clearQueue();
      this.getDocument()      
      setTimeout(()=>{    
          this.getDocument()   
          this.currentProgessinPercentMiddle = 0;
      },5000);
    };
  }
 }
}

public fileOverLowerBannerBase(e: any): void {
  this.hasBaseDropZoneOver = e;
  this.fileErrorsLower = [];
  if(this.uploaderLowerBanner.isUploading){
    this.snack.open('Please wait! Uploading is in process...', 'OK', { duration: 4000 })
  }else{
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

  this.uploaderLowerBanner.onBeforeUploadItem = (item) => {
    item.url = `${URL}?docId=${this.profileId}&attrName=lowerBanner`;
  }
  if(this.uploaderLowerBanner.getNotUploadedItems().length){
    this.uploaderLowerBanner.queue.forEach((fileoOb, ind) => {
          this.uploaderLowerBanner.uploadItem(fileoOb);
    });
    this.updateProgressBarLower();
    this.uploaderLowerBanner.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      this.uploaderLowerBanner.clearQueue();
      this.getDocument()      
      setTimeout(()=>{    
          this.getDocument()   
          this.currentProgessinPercentLower = 0;
      },5000);
    };
  }
 }
}

public fileOverQOW1Base(e: any): void {
  this.hasBaseDropZoneOver = e;
  this.fileErrorsQOW1 = [];
  if(this.uploaderQOW1.isUploading){
    this.snack.open('Please wait! Uploading is in process...', 'OK', { duration: 4000 })
  }else{
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

  this.uploaderQOW1.onBeforeUploadItem = (item) => {
    item.url = `${URL}?docId=${this.profileId}&attrName=quickOverview1.videoLink`;
  }
  if(this.uploaderQOW1.getNotUploadedItems().length){
    this.uploaderQOW1.queue.forEach((fileoOb, ind) => {
          this.uploaderQOW1.uploadItem(fileoOb);
    });
    this.updateProgressBarQOW1();
    this.uploaderQOW1.onCompleteItem = (item: any, response: any, status: any, headers: any) => {     
      this.uploaderQOW1.clearQueue();
      this.getDocument()      
      setTimeout(()=>{    
          this.getDocument();   
          this.currentProgessinPercentQOW1 = 0;
      },5000);
    };
  }
 }
}


public fileOverQOW2Base(e: any): void {
  this.hasBaseDropZoneOver = e;
  this.fileErrorsQOW2 = [];
  if(this.uploaderQOW2.isUploading){
    this.snack.open('Please wait! Uploading is in process...', 'OK', { duration: 4000 })
  }else{
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

  this.uploaderQOW2.onBeforeUploadItem = (item) => {
    item.url = `${URL}?docId=${this.profileId}&attrName=quickOverview2.videoLink`;
  }
  if(this.uploaderQOW2.getNotUploadedItems().length){
    this.uploaderQOW2.queue.forEach((fileoOb, ind) => {
          this.uploaderQOW2.uploadItem(fileoOb);
    });
    this.updateProgressBarQOW2();
    this.uploaderQOW2.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      this.uploaderQOW2.clearQueue();
      this.getDocument()      
      setTimeout(()=>{    
          this.getDocument()   
          this.currentProgessinPercentQOW2 = 0;
      },5000);
    };
  }
 }
}

uploadTestimonialsFile(fileName,index) {
  this.uploaderProfilePhoto.onBeforeUploadItem = (item) => {
    item.url = `${URLProfilePhoto}?folderName=${'customer'}&filenewName=${fileName}`;
  }
  if(this.uploaderProfilePhoto.getNotUploadedItems().length){
    this.uploaderProfilePhoto.queue.forEach((fileoOb, ind) => {
          this.uploaderProfilePhoto.uploadItem(fileoOb);
    }); 

    this.updateProgressBarProfilePhoto(index);

    this.uploaderProfilePhoto.onCompleteItem = (item: any, response: any, status: any, headers: any) => {   
      this.uploaderProfilePhoto.clearQueue();   
       setTimeout(()=>{    
        this.testimonialsArray.at(index).patchValue({profilePhoto:fileName});
      }, 5000);
    };

    if(this.uploaderProfilePhoto.onCompleteAll()){
      this.uploaderProfilePhoto.clearQueue();
      this.getDocument()      
      setTimeout(()=>{    
          this.getDocument()   
          this.currentProgessinPercentProfilePhoto = 0;
          this.currentProgessinPercentProfilePhoto1 = 0;
          this.currentProgessinPercentProfilePhoto2 = 0;
      },5000);
    }  
  }
}


updateProgressBarProfilePhoto(index){

  if(index==0){
    if(this.currentProgessinPercentProfilePhoto==0){
      this.uploaderProfilePhoto.onProgressItem = (progress:any) => {
        this.currentProgessinPercentProfilePhoto = progress;
      }
    }

    this.uploaderProfilePhoto.onProgressAll = (progress:any) => {
      this.currentProgessinPercentProfilePhoto = progress;
    }
  }
  if(index==1){

    if(this.currentProgessinPercentProfilePhoto1==0){
      this.uploaderProfilePhoto.onProgressItem = (progress:any) => {
        this.currentProgessinPercentProfilePhoto1 = progress;
      }
    }

    this.uploaderProfilePhoto.onProgressAll = (progress:any) => {
      this.currentProgessinPercentProfilePhoto1 = progress;
    }
  }

    if(index==2){    
    this.uploaderProfilePhoto.onProgressAll = (progress:any) => {
      this.currentProgessinPercentProfilePhoto2 = progress;
    }

    this.uploaderProfilePhoto.onProgressAll = (progress:any) => {
      this.currentProgessinPercentProfilePhoto2 = progress;
    }
  }
}

updateProgressBar(){
  // let totalLength = this.uploader.queue.length;
  // let remainingLength =  this.uploader.getNotUploadedItems().length;    
  // this.currentProgessinPercent = 100 - (remainingLength * 100 / totalLength);
  // this.currentProgessinPercent = Number(this.currentProgessinPercent.toFixed());
  if(this.currentProgessinPercent==0){
    this.uploader.onProgressItem = (progress:any) => {
      this.currentProgessinPercent = progress;
    }
  }
  this.uploader.onProgressAll = (progress:any) => {
    this.currentProgessinPercent = progress;
  }
}

updateProgressBarMiddle(){
  // let totalLength = this.uploaderMiddleBanner.queue.length;
  // let remainingLength =  this.uploaderMiddleBanner.getNotUploadedItems().length;    
  // this.currentProgessinPercentMiddle = 100 - (remainingLength * 100 / totalLength);
  // this.currentProgessinPercentMiddle = Number(this.currentProgessinPercentMiddle.toFixed());
  if(this.currentProgessinPercentMiddle==0){
    this.uploaderMiddleBanner.onProgressItem = (progress:any) => {
      this.currentProgessinPercentMiddle = progress;
    }
  }
  this.uploaderMiddleBanner.onProgressAll = (progress:any) => {
    this.currentProgessinPercentMiddle = progress;  
  }
}

updateProgressBarLower(){
  // let totalLength = this.uploaderLowerBanner.queue.length;
  // let remainingLength =  this.uploaderLowerBanner.getNotUploadedItems().length;    
  // this.currentProgessinPercentLower = 100 - (remainingLength * 100 / totalLength);
  // this.currentProgessinPercentLower = Number(this.currentProgessinPercentLower.toFixed());
  if(this.currentProgessinPercentLower==0){
    this.uploaderLowerBanner.onProgressItem = (progress:any) => {
      this.currentProgessinPercentLower = progress;
    }
  }
  this.uploaderLowerBanner.onProgressAll = (progress:any) => {
    this.currentProgessinPercentLower = progress;    
  }
}

updateProgressBarQOW1(){
  // let totalLength = this.uploaderQOW1.queue.length;
  // let remainingLength =  this.uploaderQOW1.getNotUploadedItems().length;    
  // this.currentProgessinPercentQOW1 = 100 - (remainingLength * 100 / totalLength);
  // this.currentProgessinPercentQOW1 = Number(this.currentProgessinPercentQOW1.toFixed());
  if(this.currentProgessinPercentQOW1==0){
    this.uploaderQOW1.onProgressItem = (progress:any) => {
      this.currentProgessinPercentQOW1 = progress;
    }
  }
  this.uploaderQOW1.onProgressAll = (progress:any) => {
    this.currentProgessinPercentQOW1 = progress;
  }
}

updateProgressBarQOW2(){
  // let totalLength = this.uploaderQOW2.queue.length;
  // let remainingLength =  this.uploaderQOW2.getNotUploadedItems().length;    
  // this.currentProgessinPercentQOW2 = 100 - (remainingLength * 100 / totalLength);
  // this.currentProgessinPercentQOW2 = Number(this.currentProgessinPercentQOW2.toFixed());
  if(this.currentProgessinPercentQOW2==0){
    this.uploaderQOW2.onProgressItem = (progress:any) => {
      this.currentProgessinPercentQOW2 = progress;
    }
  }
  this.uploaderQOW1.onProgressAll = (progress:any) => {
    this.currentProgessinPercentQOW2 = progress;
    if(progress==100){
      setTimeout(()=>{    
        this.currentProgessinPercent = 0;
      },5000);
    }
  }
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