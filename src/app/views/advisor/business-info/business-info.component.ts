import { Component, OnInit, ViewChild  } from '@angular/core';//ElementRef, Input
import { MatSnackBar } from '@angular/material';
import { UserAPIService } from './../../../userapi.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
//import { Observable, of } from 'rxjs';
import { MatStepperModule , MatStepper} from '@angular/material/stepper';
//import { states } from '../../../state';
import { yearsOfServiceList, businessTypeList , industryDomainList, licenceHeldList, activeLicense, industryDomain, businessType, yearsOfService } from '../../../selectList';
import { states } from '../../../state';
import { FileUploader } from 'ng2-file-upload';
//import { Http, Response } from '@angular/http';
import "rxjs/add/operator/do";
//import the map function to be used with the http library
import "rxjs/add/operator/map";
import { serverUrl, s3Details } from '../../../config';
const URL = serverUrl+'/api/documents/advisorDocument';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
@Component({
  selector: 'app-business-info',
  templateUrl: './business-info.component.html',
  styleUrls: ['./business-info.component.scss']
})
export class BusinessInfoComponent implements OnInit {
  @ViewChild('stepper') private myStepper: MatStepper;
  userId = localStorage.getItem("endUserId");
  public uploader: FileUploader  =  new FileUploader({url:`${URL}?userId=${this.userId}`});

  public hasBaseDropZoneOver: boolean = false;
  isLinear = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  forthFormGroup: FormGroup;
  //isEditable = true;
  advisorDocuments_temps = false;
  advisorDocumentsList: any;
  yearsOfServiceLists:any;
  businessTypeLists:any;
  industryDomainLists:any;
  licenceHeldLists:any;  
  step:any;
  profile:any;
  stateList:any;
  state_name:string;
  short_code:string;
  showHowManyProducer:boolean = false;
  activeLicenseList: string[] = activeLicense
  industryDomainList: string[] = industryDomain.sort()
  businessTypeList: string[] = businessType.sort()
  yearsOfServiceList: string[] = yearsOfService
  
  constructor(private router: Router, private activeRoute: ActivatedRoute, private stepper: MatStepperModule, private userapi: UserAPIService, private fb: FormBuilder, private snack: MatSnackBar, 
    private loader: AppLoaderService,private confirmService: AppConfirmService) {}//,private http: Http, private el: ElementRef
  
  ngOnInit() {
    localStorage.setItem("step",'0');
    this.userId = localStorage.getItem("endUserId");
    this.stateList = states;
    this.step = localStorage.getItem("step");
    this.myStepper.selectedIndex = Number(this.step);
    this.profile = [];
    if(this.step && this.step==4){
     this.router.navigate(['/', 'advisor', 'signup']);
    }
    
    if(this.step>=3){
      this.getProfileField();
    }

    this.firstFormGroup = new FormGroup({
      firstName: new FormControl('',Validators.required),
      lastName: new FormControl('',Validators.required),
      yearsOfService: new FormControl('',Validators.required),
      businessName: new FormControl('',Validators.required),
      businessType: new FormControl([],Validators.required),
      industryDomain: new FormControl([],Validators.required)
    });
  
    this.secondFormGroup = this.fb.group({
      addressLine1: new FormControl('', Validators.required),
      addressLine2: new FormControl(''),
      city: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      zipcode: new FormControl('', [Validators.required, , Validators.pattern(/^\d{5}(?:[-\s]\d{4})?$/)]),
      businessPhoneNumber: new FormControl('', [Validators.required, Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)])
    });
    
    this.thirdFormGroup = this.fb.group({
      activeLicenceHeld: new FormControl([], Validators.required),
      agencyOversees: new FormControl(''),
      managingPrincipleName: new FormControl('', Validators.required),
      manageOtherProceducers: new FormControl(''),
      howManyProducers: new FormControl('',[Validators.pattern(/^[0-9]*$/)]),
      
    });
    this.forthFormGroup = this.fb.group({
      advisorDocuments_temp: new FormControl([],Validators.required)
    });
    if(this.step || this.userId){
      this.getAdvDetails(this.step);
    }
  }

 /*  conditionalRequired() {
    //console.log("asdasdasd",this.thirdFormGroup.controls['manageOtherProceducers'].value);
    return (control: FormControl): { [s: string]: boolean } => {
      let required: boolean = false;
     console.log("asdasdasd",this.thirdFormGroup.controls['manageOtherProceducers'].value)
      if (this.thirdFormGroup.controls['manageOtherProceducers'].value=='1') {
        return { required: true };
      }
    }
  }
/*
  uploadAll() {
    let inputEl: HTMLInputElement = this.el.nativeElement.querySelector('#advisorDocs');
    console.log("iam+ "+inputEl);
    let fileCount: number = inputEl.files.length;
    let formData = new FormData();

    console.log(fileCount,formData)
    if (fileCount > 0) { // a file was selected
      formData.append('userId', this.userId);
        for (let i = 0; i < fileCount; i++) {
            formData.append('advisorDocuments', inputEl.files.item(i));
        }
        this.userapi.apiRequest('post', 'documents/advisorDocument', formData).map((res:any) => res).subscribe(//this.http.post(URL, formData).map((res:any) => res).subscribe(
                (success) => {
                 alert(success._body);
              },
                (error) => alert(error)
            );
          
    }
   }
*/


docDelete(doc, name,tmName) {
  var statMsg = "Are you sure you want to delete '" + name + "' file name?"
  this.confirmService.confirm({ message: statMsg })
    .subscribe(res => {
      if (res) {
        this.loader.open();
        this.advisorDocumentsList.splice(doc, 1)
        var query = {};
        const req_vars = {
          query: Object.assign({ _id: this.userId }, query),
          proquery: Object.assign({ advisorDocuments: this.advisorDocumentsList }, query),
          fileName: Object.assign({ docName: tmName }, query)
        }
        this.userapi.apiRequest('post', 'documents/deleteAdvDoc', req_vars).subscribe(result => {
          if (result.status == "error") {
            this.loader.close();
            this.snack.open(result.data.message, 'OK', { duration: 4000 })
          } else {    
            if(this.advisorDocumentsList.length<1){
              this.forthFormGroup.controls['advisorDocuments_temp'].setValue('');
            }            
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

  signupSubmit(steps=null,profileInData=null) {  console.log(steps);
   let msgName = '';
   if(steps==1) msgName = "business information";
   else if(steps==2) msgName ="business address";
   else if(steps==3) msgName ="license information";
  var query = {};
  var proquery = {};
    if(steps==4){
      profileInData.profileSetup = 'yes';
      //if(this.uploader.getNotUploadedItems().length){
        //console.log("image",this.uploader.getNotUploadedItems().length)
        //this.uploader =  new FileUploader({url:`${URL}?userId=${this.userId}`,itemAlias: 'advisorDocs'});
     // }
    }
    
    const req_vars = {
      query: Object.assign({ _id: this.userId, userType: "advisor" }),
      proquery: Object.assign(profileInData),
      from: Object.assign({ fromname: msgName })
    }
    this.loader.open();

    this.userapi.apiRequest('post', 'auth/cust-profile-update', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      } else {
        //this.prodata = result.data.userProfile;
        localStorage.setItem("step",steps);       
        if(steps==4){
          // if(this.uploader.getNotUploadedItems().length){
          //   this.loader.open();
          //   this.uploader.uploadAll();

          //   this.uploader.onCompleteItem = (item:any, response:any, status:any, headers:any) => {
              
          //       if(status==0){
          //         this.loader.close();
          //         this.snack.open(result.data.message, 'OK', { duration: 4000 })
          //         this.router.navigate(['/', 'advisor', 'thank-you']);
          //       }
          //   };
          // }else{//no need this else
          //   this.router.navigate(['/', 'advisor', 'thank-you']);
          // }   
          this.router.navigate(['/', 'advisor', 'thank-you']);
        }       
      }
    }, (err) => {
      console.error(err)
    })
  }

  getAdvDetails(step,query = {}){
      const req_vars = {
        query: Object.assign({ _id: this.userId, userType: "advisor" }, query)
      }
     // this.loader.open();
      this.userapi.apiRequest('post', 'userlist/getprofile', req_vars).subscribe(result => {
       if (result.status == "error") {
          this.profile = [];
          this.loader.close();
        } else {
          this.profile = result.data.userProfile;

          this.firstFormGroup.controls['firstName'].setValue(this.profile.firstName);
          this.firstFormGroup.controls['lastName'].setValue(this.profile.lastName);
          this.firstFormGroup.controls['yearsOfService'].setValue(this.profile.yearsOfService ? this.profile.yearsOfService : "");
          this.firstFormGroup.controls['businessName'].setValue(this.profile.businessName ? this.profile.businessName : "");
          this.firstFormGroup.controls['businessType'].setValue(this.profile.businessType ? this.profile.businessType : []);
          this.firstFormGroup.controls['industryDomain'].setValue(this.profile.industryDomain ? this.profile.industryDomain : []);

          this.secondFormGroup.controls['addressLine1'].setValue(this.profile.addressLine1);
          this.secondFormGroup.controls['addressLine2'].setValue(this.profile.addressLine2);
          this.secondFormGroup.controls['zipcode'].setValue(this.profile.zipcode);
          this.secondFormGroup.controls['city'].setValue(this.profile.city);
          this.secondFormGroup.controls['state'].setValue(this.profile.state);
          this.secondFormGroup.controls['businessPhoneNumber'].setValue(this.profile.businessPhoneNumber);

          this.thirdFormGroup.controls['activeLicenceHeld'].setValue(this.profile.activeLicenceHeld ? this.profile.activeLicenceHeld : []);
          this.thirdFormGroup.controls['agencyOversees'].setValue(this.profile.agencyOversees);
          this.thirdFormGroup.controls['managingPrincipleName'].setValue(this.profile.managingPrincipleName);
          this.thirdFormGroup.controls['manageOtherProceducers'].setValue(this.profile.manageOtherProceducers);
          this.thirdFormGroup.controls['howManyProducers'].setValue(this.profile.howManyProducers);
          this.profile.manageOtherProceducers == 1 ? this.showHowManyProducer = true : this.showHowManyProducer = false;
          this.forthFormGroup.controls['advisorDocuments_temp'].setValue('');
          console.log("-----",this.profile.advisorDocuments)
          if(this.profile.advisorDocuments.length>0){
            console.log("*****",this.profile.advisorDocuments)
            this.forthFormGroup.controls['advisorDocuments_temp'].setValue('1');
          }
          
          this.loader.close();
        }
      }, (err) => {
        console.error(err);
        this.loader.close();
      }) 
  }

  public fileOverBase(e:any):void {
    this.hasBaseDropZoneOver = e;
    if(this.uploader.getNotUploadedItems().length){
        this.uploader.uploadAll(); 
        this.uploader.onCompleteItem = (item:any, response:any, status:any, headers:any) => { 
        this.getProfileField();
        };
    }
  }

  getProfileField = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ _id: this.userId, userType: "advisor" }, query)
    }
    this.userapi.apiRequest('post', 'userlist/getprofile', req_vars).subscribe(result => {
      if (result.status == "error") {
      } else {
        this.profile = result.data.userProfile;
        this.advisorDocumentsList = this.profile.advisorDocuments;
        console.log("-----",this.advisorDocumentsList.length);
        if(this.profile.advisorDocuments.length>0){
          console.log("*****",this.profile.advisorDocuments)
          this.forthFormGroup.controls['advisorDocuments_temp'].setValue('1');
        }
       
      }
    }, (err) => {
      console.error(err);
    })
  }

  showHowManyProducts(showVal) {
    console.log("Asdasd",showVal, '-----',this.thirdFormGroup.controls['manageOtherProceducers'].value);
    !showVal || showVal == 1 ? this.showHowManyProducer = true : this.showHowManyProducer = false
  }
    // if(this.thirdFormGroup.controls['manageOtherProceducers'].value=='' || this.thirdFormGroup.controls['manageOtherProceducers'].value=='1'){
    //     this.thirdFormGroup = this.fb.group({
    //       activeLicenceHeld: new FormControl([], Validators.required),
    //       agencyOversees: new FormControl(''),
    //       managingPrincipleName: new FormControl('', Validators.required),
    //       manageOtherProceducers: new FormControl(''),
    //       howManyProducers: new FormControl('',[Validators.required,Validators.pattern(/^[0-9]$/)]),
    //     });

    //     this.thirdFormGroup.controls['activeLicenceHeld'].setValue(this.profile.activeLicenceHeld ? this.profile.activeLicenceHeld : []);
    //     this.thirdFormGroup.controls['agencyOversees'].setValue(this.profile.agencyOversees);
    //     this.thirdFormGroup.controls['managingPrincipleName'].setValue(this.profile.managingPrincipleName);
    //     this.thirdFormGroup.controls['manageOtherProceducers'].setValue(this.profile.manageOtherProceducers);
    //     this.thirdFormGroup.controls['howManyProducers'].setValue(this.profile.howManyProducers);
    //   }
}