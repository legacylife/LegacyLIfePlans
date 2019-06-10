import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms'
import { CustomValidators } from 'ng2-validation';
import { MatDialog, MatSnackBar } from '@angular/material';
import { MatStepperModule , MatStepper} from '@angular/material/stepper';
import { Router, ActivatedRoute } from '@angular/router';
import { forEach } from "lodash";
import { countries } from '../../../../country';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { UserAPIService } from './../../../../userapi.service';

@Component({
  selector: 'app-personal-profile-modal',
  templateUrl: './personal-profile-modal.component.html',
  styleUrls: ['./personal-profile-modal.component.scss']
})
export class PersonalProfileModalComponent implements OnInit {
  isLinear = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  userId: string;
  countryList: any;
  step: string;
  country_name: string;
  short_code: string;
  ppemails: any;
  ppLandlineNumbers: any;
  wpLandlineNumbers: any;
  ccWorkLandlineNumbers:any; 
  ccChurchLandlineNumbers:any; 
  essentials: any;
  constructor(private router: Router,private snack: MatSnackBar, public dialog: MatDialog,private fb: FormBuilder,private loader: AppLoaderService,private userapi: UserAPIService,  ) {}

  ngOnInit() {
    this.countryList = countries;
    this.userId = localStorage.getItem("endUserId");
 
      this.step = localStorage.getItem("ID_step");
      console.log('>>>',this.step);
  this.firstFormGroup = this.fb.group({
      ppFirstName: new FormControl('', Validators.required),
      ppMiddleName: new FormControl('', Validators.required),
      ppLastName: new FormControl('', Validators.required),
      ppEmails: this.fb.array([this.fb.group({email: ['', Validators.required]})]),
      //ppLandlineNumbers: this.fb.array([this.fb.group({phone: ['', Validators.required, Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]})]),
      ppLandlineNumbers: this.fb.array([this.fb.group({phone: ['']})]),
      ppDateOfBirth: new FormControl('', ),      
      ppAddressLine1: new FormControl('', Validators.required),
      ppAddressLine2: new FormControl(''),
      ppCountry: new FormControl('', Validators.required),
      ppCity: new FormControl('', Validators.required),
      ppState: new FormControl('', Validators.required),
      ppZipCode: new FormControl('', [Validators.required, , Validators.pattern(/^\d{5}(?:[-\s]\d{4})?$/)])
    });
 
  this.secondFormGroup = this.fb.group({
    wpWorkBusiness: new FormControl('', Validators.required),
    wpCompanyName: new FormControl('', Validators.required),
    wpTitlePosition: new FormControl('', Validators.required),
    wpDepartment: new FormControl('', Validators.required),
    wpContactPersonName: new FormControl('', Validators.required),
   // wpLandlineNumbers: this.fb.array([this.fb.group({phone: ['', Validators.required, Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]})]),
    wpLandlineNumbers: this.fb.array([this.fb.group({phone: ['']})]),
    wpAddressLine1: new FormControl('', Validators.required),
    wpAddressLine2: new FormControl(''),
    wpCountry: new FormControl('', Validators.required),
    wpCity: new FormControl('', Validators.required),
    wpState: new FormControl('', Validators.required),
    wpZipCode: new FormControl('', [Validators.required, , Validators.pattern(/^\d{5}(?:[-\s]\d{4})?$/)])
  });


  this.thirdFormGroup = this.fb.group({
    ccName: new FormControl('', Validators.required),
    ccAddressLine1: new FormControl('', Validators.required),
    ccAddressLine2: new FormControl(''),
    ccZipCode: new FormControl('', [Validators.required, , Validators.pattern(/^\d{5}(?:[-\s]\d{4})?$/)]),
    //ccWorkLandlineNumbers: this.fb.array([this.fb.group({phone: ['', Validators.required, Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]})]),
    ccWorkLandlineNumbers: this.fb.array([this.fb.group({phone: ['']})]),
    ccContactPersonName: new FormControl('', Validators.required),            
    //cclandlineNumbers: this.fb.array([this.fb.group({phone: ['', Validators.required, Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]})]),
    cclandlineNumbers: this.fb.array([this.fb.group({phone: ['']})]),    
    ccChurchName: new FormControl('', Validators.required),            
    ccChurchAddressLine1: new FormControl('', Validators.required),
    ccChurchAddressLine2: new FormControl(''),      
    ccChurchZipCode: new FormControl('', [Validators.required, Validators.pattern(/^\d{5}(?:[-\s]\d{4})?$/)]),
    //ccChurchLandlineNumbers: this.fb.array([this.fb.group({phone: ['', Validators.required, Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]})]),    
    ccChurchLandlineNumbers: this.fb.array([this.fb.group({phone: ['']})]),        
    ccChurchContactPersonName: new FormControl('', Validators.required),
  });
 // if(this.step){
    this.getDetails();    
 // }
}

getDetails = (query = {}, search = false) => {
  const req_vars = {
    query: Object.assign({ customerId: this.userId }, query)
  }
  this.loader.open();
  this.userapi.apiRequest('post', 'customer/get_details', req_vars).subscribe(result => {
    if (result.status == "error") {
      this.loader.close();
    } else {
      if(result.data.custData){
        this.essentials = result.data.custData;//console.log("here data >> ",result.data.custData);
        this.firstFormGroup.controls['ppFirstName'].setValue(this.essentials.ppFirstName ? this.essentials.ppFirstName : "");
        this.firstFormGroup.controls['ppMiddleName'].setValue(this.essentials.ppMiddleName ? this.essentials.ppMiddleName : "");
        this.firstFormGroup.controls['ppLastName'].setValue(this.essentials.ppLastName ? this.essentials.ppLastName : "");
        this.firstFormGroup.controls['ppDateOfBirth'].setValue(this.essentials.ppDateOfBirth ? this.essentials.ppDateOfBirth : "");
        this.firstFormGroup.controls['ppAddressLine1'].setValue(this.essentials.ppAddressLine1 ? this.essentials.ppAddressLine1 : "");
        this.firstFormGroup.controls['ppAddressLine2'].setValue(this.essentials.ppAddressLine2 ? this.essentials.ppAddressLine2 : "");
        this.firstFormGroup.controls['ppCountry'].setValue(this.essentials.ppCountry ? this.essentials.ppCountry : "");
        this.firstFormGroup.controls['ppCity'].setValue(this.essentials.ppCity ? this.essentials.ppCity : ""); 
        this.firstFormGroup.controls['ppState'].setValue(this.essentials.ppState ? this.essentials.ppState : "");
        this.firstFormGroup.controls['ppZipCode'].setValue(this.essentials.ppZipCode ? this.essentials.ppZipCode : ""); 


        this.secondFormGroup.controls['wpWorkBusiness'].setValue(this.essentials.wpWorkBusiness ? this.essentials.wpWorkBusiness : "");
        this.secondFormGroup.controls['wpCompanyName'].setValue(this.essentials.wpCompanyName ? this.essentials.wpCompanyName : "");
        this.secondFormGroup.controls['wpTitlePosition'].setValue(this.essentials.wpTitlePosition ? this.essentials.wpTitlePosition : "");
        this.secondFormGroup.controls['wpDepartment'].setValue(this.essentials.wpDepartment ? this.essentials.wpDepartment : ""); 
        this.secondFormGroup.controls['wpContactPersonName'].setValue(this.essentials.wpContactPersonName ? this.essentials.wpContactPersonName : "");
      //  this.secondFormGroup.controls['wpLandlineNumbers'].setValue(this.essentials.wpLandlineNumbers ? this.essentials.wpLandlineNumbers : ""); 
        this.secondFormGroup.controls['wpAddressLine1'].setValue(this.essentials.wpAddressLine1 ? this.essentials.wpAddressLine1 : "");
        this.secondFormGroup.controls['wpAddressLine2'].setValue(this.essentials.wpAddressLine2 ? this.essentials.wpAddressLine2 : "");
        this.secondFormGroup.controls['wpCountry'].setValue(this.essentials.wpCountry ? this.essentials.wpCountry : "");
        this.secondFormGroup.controls['wpCity'].setValue(this.essentials.wpCity ? this.essentials.wpCity : ""); 
        this.secondFormGroup.controls['wpState'].setValue(this.essentials.wpState ? this.essentials.wpState : "");
        this.secondFormGroup.controls['wpZipCode'].setValue(this.essentials.wpZipCode ? this.essentials.wpZipCode : ""); 

        this.thirdFormGroup.controls['ccName'].setValue(this.essentials.ccName ? this.essentials.ccName : "");
        this.thirdFormGroup.controls['ccAddressLine1'].setValue(this.essentials.ccAddressLine1 ? this.essentials.ccAddressLine1 : "");
        this.thirdFormGroup.controls['ccContactPersonName'].setValue(this.essentials.ccContactPersonName ? this.essentials.ccContactPersonName : "");
        this.thirdFormGroup.controls['ccChurchName'].setValue(this.essentials.ccChurchName ? this.essentials.ccChurchName : ""); 
        this.thirdFormGroup.controls['ccChurchAddressLine1'].setValue(this.essentials.ccChurchAddressLine1 ? this.essentials.ccChurchAddressLine1 : "");
        this.thirdFormGroup.controls['ccChurchAddressLine2'].setValue(this.essentials.ccChurchAddressLine2 ? this.essentials.ccChurchAddressLine2 : "");
        this.thirdFormGroup.controls['ccChurchZipCode'].setValue(this.essentials.ccChurchZipCode ? this.essentials.ccChurchZipCode : "");
        this.thirdFormGroup.controls['ccChurchContactPersonName'].setValue(this.essentials.ccChurchContactPersonName ? this.essentials.ccChurchContactPersonName : ""); 
      
      }
      this.loader.close();
    }
  }, (err) => {
    console.error(err);
    this.loader.close();
  })
}

FormSubmit(steps = null, profileInData = null) {
    //console.log("as dasd asd asd asd",steps);
    let msgName = '';
    if (steps == 1) msgName = "personal profile";
    else if (steps == 2) msgName = "work profile";
    else if (steps == 3) {
      msgName = 'Civic/Club, Religious Info';
     }
    var query = {};
    var proquery = {};
    
    const req_vars = {
      query: Object.assign({ customerId: this.userId }),
      proquery: Object.assign(profileInData),
      from: Object.assign({ fromname: msgName })
    }
    this.loader.open();
    console.log("req_vars", req_vars);
    this.userapi.apiRequest('post', 'customer/my_essentials_req', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      } else {
        localStorage.setItem("ID_step", steps);
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
        if (steps == 3) {  this.dialog.closeAll(); }
      }
    }, (err) => {
      console.error(err)
    })
  }

  addNewEmail() {
    this.emailList.push(this.fb.group({
      email: ['', Validators.required]
    }));
  }

  get emailList() {  
    return this.firstFormGroup.get('ppEmails') as FormArray;
  }

/////
  addNewLandlineNum() {
    this.landlineNumbersList.push(this.fb.group({
      phone: ['']
    }));
    //  phone: ['', Validators.required,Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]
  }

  get landlineNumbersList() {  
    return this.firstFormGroup.get('ppLandlineNumbers') as FormArray;
  }

/////
  addNewWorkLandLineNum() {
    this.wpLandlineNumberList.push(this.fb.group({
      phone: ['', Validators.required,Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]
    }));
  }

  get wpLandlineNumberList() {  
    return this.secondFormGroup.get('wpLandlineNumbers') as FormArray;
  }

  /////
  addNewWorkLandlineNum() {
    this.ccWorkLandlineNumberList.push(this.fb.group({
      phone: ['']// phone: ['', Validators.required,Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]
    }));
  }

  get ccWorkLandlineNumberList() {  
    return this.thirdFormGroup.get('ccWorkLandlineNumbers') as FormArray;
  }
  
  /////
  addNewCCLandlineNum() {
    this.cclandlineNumbersList.push(this.fb.group({
      phone: ['']//phone: ['', Validators.required,Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]
    }));
  }

  get cclandlineNumbersList() {  
    return this.thirdFormGroup.get('cclandlineNumbers') as FormArray;
  }

  /////
  addNewChurchLandlineNum() {
    this.ChurchlandlineNumbersList.push(this.fb.group({
      phone: ['', Validators.required,Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]
    }));
  }

  get ChurchlandlineNumbersList() {  
    return this.thirdFormGroup.get('ccChurchLandlineNumbers') as FormArray;
  }
  
  
  // all add new fields function
  delete(i,arryName) {
    const control = <FormArray>this.firstFormGroup.controls[arryName];
    control.removeAt(i);
  }

  deletewp(i,arryName) {
    const control = <FormArray>this.secondFormGroup.controls[arryName];
    control.removeAt(i);
  }

  deletecc(i,arryName) {
    const control = <FormArray>this.thirdFormGroup.controls[arryName];
    control.removeAt(i);
  }




  onChangeFormIndex(event){
    const {selectedIndex} = event;
    let stepHeader = document.getElementsByClassName('mat-horizontal-stepper-header')
    forEach(stepHeader, (element, index) => {
      element.classList = String(element.classList).replace('proActive', '')
      element.classList = String(element.classList).replace('proDone', '')
       if(index === selectedIndex){
         element.classList += ' proActive';
       }
       if(index < selectedIndex){
        element.classList += ' proDone';
       }
    });
  }

}


