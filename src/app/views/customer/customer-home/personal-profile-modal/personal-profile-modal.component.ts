import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms'
import { CustomValidators } from 'ng2-validation';
import { MatDialog, MatSnackBar } from '@angular/material';
import { MatStepperModule , MatStepper} from '@angular/material/stepper';
import { Router, ActivatedRoute } from '@angular/router';
import { forEach } from "lodash";
import { countries } from '../../../../country';


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
  country_name: string;
  short_code: string;
  ppemails: any;
  ppLandlineNumbers: any;
  wpLandlineNumbers: any;
  ccWorkLandlineNumbers:any; 
  ccChurchLandlineNumbers:any; 
  constructor(private snack: MatSnackBar, public dialog: MatDialog,private fb: FormBuilder, ) {}

  ngOnInit() {
    this.countryList = countries;

    this.userId = localStorage.getItem("endUserId");
//this.firstFormGroup = new FormGroup({

  this.firstFormGroup = this.fb.group({
      ppFirstName: new FormControl('', Validators.required),
      ppMiddleName: new FormControl('', Validators.required),
      ppLastName: new FormControl('', Validators.required),
      ppEmails: this.fb.array([this.fb.group({email: ['', Validators.required]})]),
      ppLandlineNumbers: this.fb.array([this.fb.group({phone: ['', Validators.required, Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]})]),
      //phoneNumber: new FormControl('', [Validators.required, Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]),
     // landlineNumbers: new FormControl('', [Validators.required, Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]),
      ppDateOfBirth: new FormControl('', ),      
      ppAddressLine1: new FormControl('', Validators.required),
      ppAddressLine2: new FormControl(''),
      ppCountry: new FormControl('', Validators.required),
      ppCity: new FormControl('', Validators.required),
      ppState: new FormControl('', Validators.required),
      ppZipCode: new FormControl('', [Validators.required, , Validators.pattern(/^\d{5}(?:[-\s]\d{4})?$/)])
    });
 //ppEmails   this.emailList this.firstFormGroup.controls['firstName'].setValue(this.profile.firstName ? this.profile.firstName : "");

  this.secondFormGroup = this.fb.group({
    wpWorkBusiness: new FormControl('', Validators.required),
    wpCompanyName: new FormControl('', Validators.required),
    wpTitlePosition: new FormControl('', Validators.required),
    wpDepartment: new FormControl('', Validators.required),
    wpContactPersonName: new FormControl('', Validators.required),
    wpLandlineNumbers: this.fb.array([this.fb.group({phone: ['', Validators.required, Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]})]),
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
    ccWorkLandlineNumbers: this.fb.array([this.fb.group({phone: ['', Validators.required, Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]})]),
    ccContactPersonName: new FormControl('', Validators.required),            
    cclandlineNumbers: this.fb.array([this.fb.group({phone: ['', Validators.required, Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]})]),
    ccChurchName: new FormControl('', Validators.required),            
    ccChurchAddressLine1: new FormControl('', Validators.required),
    ccChurchAddressLine2: new FormControl(''),      
    ccChurchZipCode: new FormControl('', [Validators.required, Validators.pattern(/^\d{5}(?:[-\s]\d{4})?$/)]),
    ccChurchLandlineNumbers: this.fb.array([this.fb.group({phone: ['', Validators.required, Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]})]),    
    ccChurchContactPersonName: new FormControl('', Validators.required),
  });

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
      phone: ['', Validators.required,Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]
    }));
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
      phone: ['', Validators.required,Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]
    }));
  }

  get ccWorkLandlineNumberList() {  
    return this.thirdFormGroup.get('ccWorkLandlineNumbers') as FormArray;
  }
  
  /////
  addNewCCLandlineNum() {
    this.cclandlineNumbersList.push(this.fb.group({
      phone: ['', Validators.required,Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]
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





}


