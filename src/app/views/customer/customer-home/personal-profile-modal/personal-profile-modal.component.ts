import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms'
import { CustomValidators } from 'ng2-validation';
import { MatDialog, MatSnackBar } from '@angular/material';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
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
  ccWorkLandlineNumbers: any;
  cclandlineNumbers: any;
  ccChurchLandlineNumbers: any;
  essentials: any;
  selectedProfileId: string;
  profileIdHiddenVal: boolean = false;
  ppEmails: any;
  emails: any;
  landlineNumbers: any;
  wplandlineNumbers: any;
  ccwklandlineNumbers: any;
  cccontactlandline: any;
  ccChurchlandlineNumbers: any;
  constructor(private router: Router, private snack: MatSnackBar, public dialog: MatDialog, private fb: FormBuilder, private loader: AppLoaderService, private userapi: UserAPIService, ) { }

  ngOnInit() {
    this.countryList = countries;
    this.userId = localStorage.getItem("endUserId");
    const locationArray = location.href.split('/')
    this.selectedProfileId = locationArray[locationArray.length - 1];
    if (this.selectedProfileId && this.selectedProfileId == 'essential-day-one') {
      this.selectedProfileId = "";
    }

    this.step = localStorage.getItem("ID_step");
    console.log('>>>', this.step);
    this.firstFormGroup = this.fb.group({
      ppFirstName: new FormControl('', Validators.required),
      ppMiddleName: new FormControl(''),
      ppLastName: new FormControl('', Validators.required),
      ppEmails: this.fb.array([this.fb.group({ email: [''] })]),
      //ppLandlineNumbers: this.fb.array([this.fb.group({phone: ['',  , Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]})]),
      ppLandlineNumbers: this.fb.array([this.fb.group({ phone: [''] })]),
      ppDateOfBirth: new FormControl(''),
      ppAddressLine1: new FormControl(''),
      ppAddressLine2: new FormControl(''),
      ppCountry: new FormControl(''),
      ppCity: new FormControl(''),
      ppState: new FormControl(''),
      ppZipCode: new FormControl('', [Validators.pattern(/^\d{5}(?:[-\s]\d{4})?$/)]),
      profileId: new FormControl('')
    });

    this.secondFormGroup = this.fb.group({
      wpWorkBusiness: new FormControl(''),
      wpCompanyName: new FormControl(''),
      wpTitlePosition: new FormControl(''),
      wpDepartment: new FormControl(''),
      wpContactPersonName: new FormControl(''),
      // wpLandlineNumbers: this.fb.array([this.fb.group({phone: ['', Validators.required, Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]})]),
      wpLandlineNumbers: this.fb.array([this.fb.group({ phone: [''] })]),
      wpAddressLine1: new FormControl(''),
      wpAddressLine2: new FormControl(''),
      wpCountry: new FormControl(''),
      wpCity: new FormControl(''),
      wpState: new FormControl(''),
      wpZipCode: new FormControl('', [Validators.pattern(/^\d{5}(?:[-\s]\d{4})?$/)]),
      profileId: new FormControl('')
    });


    this.thirdFormGroup = this.fb.group({
      ccName: new FormControl(''),
      ccAddressLine1: new FormControl(''),
      ccAddressLine2: new FormControl(''),
      ccZipCode: new FormControl('', [Validators.pattern(/^\d{5}(?:[-\s]\d{4})?$/)]),
      //ccWorkLandlineNumbers: this.fb.array([this.fb.group({phone: ['', Validators.required, Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]})]),
      ccWorkLandlineNumbers: this.fb.array([this.fb.group({ phone: [''] })]),
      ccContactPersonName: new FormControl(''),
      //cclandlineNumbers: this.fb.array([this.fb.group({phone: ['', Validators.required, Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]})]),
      cclandlineNumbers: this.fb.array([this.fb.group({ phone: [''] })]),
      ccChurchName: new FormControl(''),
      ccChurchAddressLine1: new FormControl(''),
      ccChurchAddressLine2: new FormControl(''),
      ccChurchZipCode: new FormControl('', [Validators.pattern(/^\d{5}(?:[-\s]\d{4})?$/)]),
      //ccChurchLandlineNumbers: this.fb.array([this.fb.group({phone: ['', Validators.required, Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]})]),    
      ccChurchLandlineNumbers: this.fb.array([this.fb.group({ phone: [''] })]),
      ccChurchContactPersonName: new FormControl(''),
      profileId: new FormControl('')
    });

    if (this.selectedProfileId && this.selectedProfileId != '') {
      this.getDetails();
    }


  }

  getDetails = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId }, query)
    }
    this.loader.open();
    this.userapi.apiRequest('post', 'customer/view-essential-profile', req_vars).subscribe(result => {
      if (result.status == "error") {
        this.loader.close();
      } else {
        if (result.data) {
          this.essentials = result.data;//console.log("here data >> ",result.data.custData);
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
          this.firstFormGroup.controls['profileId'].setValue(this.essentials._id ? this.essentials._id : "");

          if (this.essentials.ppEmails) {
            this.emails = this.essentials.ppEmails;
            const ctrls = this.firstFormGroup.get('ppEmails') as FormArray;
            ctrls.removeAt(0)
            this.emails.forEach((element: any, index) => {
              ctrls.push(this.editGroup(element.email))
            })
          }

          if (this.essentials.ppLandlineNumbers) {
            this.landlineNumbers = this.essentials.ppLandlineNumbers;
            const ppctrls = this.firstFormGroup.get('ppLandlineNumbers') as FormArray;
            ppctrls.removeAt(0)
            this.landlineNumbers.forEach((element: any, index) => {
              ppctrls.push(this.editPpLandlineGroup(element.phone))
            })
          }


          this.secondFormGroup.controls['wpWorkBusiness'].setValue(this.essentials.wpWorkBusiness ? this.essentials.wpWorkBusiness : "");
          this.secondFormGroup.controls['wpCompanyName'].setValue(this.essentials.wpCompanyName ? this.essentials.wpCompanyName : "");
          this.secondFormGroup.controls['wpTitlePosition'].setValue(this.essentials.wpTitlePosition ? this.essentials.wpTitlePosition : "");
          this.secondFormGroup.controls['wpDepartment'].setValue(this.essentials.wpDepartment ? this.essentials.wpDepartment : "");
          this.secondFormGroup.controls['wpContactPersonName'].setValue(this.essentials.wpContactPersonName ? this.essentials.wpContactPersonName : "");
          //this.secondFormGroup.controls['wpLandlineNumbers'].setValue(this.essentials.wpLandlineNumbers ? this.essentials.wpLandlineNumbers : []); 
          this.secondFormGroup.controls['wpAddressLine1'].setValue(this.essentials.wpAddressLine1 ? this.essentials.wpAddressLine1 : "");
          this.secondFormGroup.controls['wpAddressLine2'].setValue(this.essentials.wpAddressLine2 ? this.essentials.wpAddressLine2 : "");
          this.secondFormGroup.controls['wpCountry'].setValue(this.essentials.wpCountry ? this.essentials.wpCountry : "");
          this.secondFormGroup.controls['wpCity'].setValue(this.essentials.wpCity ? this.essentials.wpCity : "");
          this.secondFormGroup.controls['wpState'].setValue(this.essentials.wpState ? this.essentials.wpState : "");
          this.secondFormGroup.controls['wpZipCode'].setValue(this.essentials.wpZipCode ? this.essentials.wpZipCode : "");
          this.secondFormGroup.controls['profileId'].setValue(this.essentials._id ? this.essentials._id : "");

          if (this.essentials.wpLandlineNumbers) {
            this.wplandlineNumbers = this.essentials.wpLandlineNumbers;
            const wpctrls = this.secondFormGroup.get('wpLandlineNumbers') as FormArray;
            wpctrls.removeAt(0)
            this.wplandlineNumbers.forEach((element: any, index) => {
              wpctrls.push(this.editWpLandlineGroup(element.phone))
            })
          }


          this.thirdFormGroup.controls['ccName'].setValue(this.essentials.ccName ? this.essentials.ccName : "");
          this.thirdFormGroup.controls['ccAddressLine1'].setValue(this.essentials.ccAddressLine1 ? this.essentials.ccAddressLine1 : "");
          this.thirdFormGroup.controls['ccAddressLine2'].setValue(this.essentials.ccAddressLine2 ? this.essentials.ccAddressLine2 : "");
          this.thirdFormGroup.controls['ccZipCode'].setValue(this.essentials.ccZipCode ? this.essentials.ccZipCode : "");
          this.thirdFormGroup.controls['ccContactPersonName'].setValue(this.essentials.ccContactPersonName ? this.essentials.ccContactPersonName : "");
          this.thirdFormGroup.controls['ccChurchName'].setValue(this.essentials.ccChurchName ? this.essentials.ccChurchName : "");
          this.thirdFormGroup.controls['ccChurchAddressLine1'].setValue(this.essentials.ccChurchAddressLine1 ? this.essentials.ccChurchAddressLine1 : "");
          this.thirdFormGroup.controls['ccChurchAddressLine2'].setValue(this.essentials.ccChurchAddressLine2 ? this.essentials.ccChurchAddressLine2 : "");
          this.thirdFormGroup.controls['ccChurchZipCode'].setValue(this.essentials.ccChurchZipCode ? this.essentials.ccChurchZipCode : "");
          this.thirdFormGroup.controls['ccChurchContactPersonName'].setValue(this.essentials.ccChurchContactPersonName ? this.essentials.ccChurchContactPersonName : "");

          if (this.essentials.ccWorkLandlineNumbers) {
            this.ccwklandlineNumbers = this.essentials.ccWorkLandlineNumbers;
            const ccctrls = this.thirdFormGroup.get('ccWorkLandlineNumbers') as FormArray;
            ccctrls.removeAt(0)
            this.ccwklandlineNumbers.forEach((element: any, index) => {
              ccctrls.push(this.editCcLandlineGroup(element.phone))
            })
          }


          if (this.essentials.cclandlineNumbers) {
            this.cccontactlandline = this.essentials.cclandlineNumbers;
            const cccontactctrls = this.thirdFormGroup.get('cclandlineNumbers') as FormArray;
            cccontactctrls.removeAt(0)
            this.cccontactlandline.forEach((element: any, index) => {
              cccontactctrls.push(this.editCccontactLandlineGroup(element.phone))
            })
          }

          if (this.essentials.ccChurchLandlineNumbers) {
            this.ccChurchlandlineNumbers = this.essentials.ccChurchLandlineNumbers;
            const churchtrls = this.thirdFormGroup.get('ccChurchLandlineNumbers') as FormArray;
            churchtrls.removeAt(0)
            this.ccChurchlandlineNumbers.forEach((element: any, index) => {
              churchtrls.push(this.editCcChurchLandlineGroup(element.phone))
            })
          }


          this.thirdFormGroup.controls['profileId'].setValue(this.essentials._id ? this.essentials._id : "");
        }
        this.loader.close();
      }
    }, (err) => {
      console.error(err);
      this.loader.close();
    })
  }

  FormSubmit(steps = null, profileInData = null) {
    let msgName = '';
    if (steps == 1) {
      msgName = "personal profile";
    }
    else if (steps == 2) {
      msgName = "work profile";
    }
    else if (steps == 3) {
      msgName = 'Civic/Club, Religious Info';
    }
    console.log("profile id >>>>>>" + this.selectedProfileId)


    const ppEmailsArr = <FormArray>this.firstFormGroup.get('ppEmails')
    this.ppEmails = ppEmailsArr.controls.map(o => { return o.value })
    profileInData.ppEmails = this.ppEmails

    const ppLandlineNumbersArr = <FormArray>this.firstFormGroup.get('ppLandlineNumbers')
    this.ppLandlineNumbers = ppLandlineNumbersArr.controls.map(o => { return o.value })
    profileInData.ppLandlineNumbers = this.ppLandlineNumbers

    const wpLandlineNumbersArr = <FormArray>this.secondFormGroup.get('wpLandlineNumbers')
    this.wpLandlineNumbers = wpLandlineNumbersArr.controls.map(o => { return o.value })
    profileInData.wpLandlineNumbers = this.wpLandlineNumbers

    const ccWorkLandlineNumbersArr = <FormArray>this.thirdFormGroup.get('ccWorkLandlineNumbers')
    this.ccWorkLandlineNumbers = ccWorkLandlineNumbersArr.controls.map(o => { return o.value })
    profileInData.ccWorkLandlineNumbers = this.ccWorkLandlineNumbers

    const cclandlineNumbersArr = <FormArray>this.thirdFormGroup.get('cclandlineNumbers')
    this.cclandlineNumbers = cclandlineNumbersArr.controls.map(o => { return o.value })
    profileInData.cclandlineNumbers = this.cclandlineNumbers

    const ccChurchLandlineNumbersArr = <FormArray>this.thirdFormGroup.get('ccChurchLandlineNumbers')
    this.ccChurchLandlineNumbers = ccChurchLandlineNumbersArr.controls.map(o => { return o.value })
    profileInData.ccChurchLandlineNumbers = this.ccChurchLandlineNumbers


    if (profileInData.profileId) {
      this.selectedProfileId = profileInData.profileId;
    }
    var query = {};
    var proquery = {};
    console.log(this.selectedProfileId)
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId }),
      proquery: Object.assign(profileInData),
      from: Object.assign({ fromname: msgName, customerId: this.userId })
    }
    this.loader.open();
    this.userapi.apiRequest('post', 'customer/my-essentials-req', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      } else {
        localStorage.setItem("ID_step", steps);
        console.log("IDS=>", result.data.ppID)
        this.firstFormGroup.controls['profileId'].setValue(result.data.ppID);
        this.secondFormGroup.controls['profileId'].setValue(result.data.ppID);
        this.thirdFormGroup.controls['profileId'].setValue(result.data.ppID);
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
        if (steps == 3) {
          this.router.navigate(['/', 'customer', 'dashboard', 'essential-detail-view', result.data.ppID])
          this.dialog.closeAll();

        }
      }
    }, (err) => {
      console.error(err)
    })
  }

  editGroup(email) {
    return this.fb.group({
      email: [email]
    });
  }

  editPpLandlineGroup(phone) {
    return this.fb.group({
      phone: [phone]
    });
  }

  editWpLandlineGroup(phone) {
    return this.fb.group({
      phone: [phone]
    });
  }

  editCcLandlineGroup(phone) {
    return this.fb.group({
      phone: [phone]
    });
  }

  editCccontactLandlineGroup(phone) {
    return this.fb.group({
      phone: [phone]
    });
  }

  editCcChurchLandlineGroup(phone) {
    return this.fb.group({
      phone: [phone]
    });
  }

  addNewEmail() {
    this.emailList.push(this.fb.group({
      email: ['']
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
      phone: ['', Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]
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
      phone: ['', Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]
    }));
  }

  get ChurchlandlineNumbersList() {
    return this.thirdFormGroup.get('ccChurchLandlineNumbers') as FormArray;
  }


  // all add new fields function
  delete(i, arryName) {
    const control = <FormArray>this.firstFormGroup.controls[arryName];
    control.removeAt(i);
  }

  deletewp(i, arryName) {
    const control = <FormArray>this.secondFormGroup.controls[arryName];
    control.removeAt(i);
  }

  deletecc(i, arryName) {
    const control = <FormArray>this.thirdFormGroup.controls[arryName];
    control.removeAt(i);
  }




  onChangeFormIndex(event) {
    const { selectedIndex } = event;
    let stepHeader = document.getElementsByClassName('mat-horizontal-stepper-header')
    forEach(stepHeader, (element, index) => {
      element.classList = String(element.classList).replace('proActive', '')
      element.classList = String(element.classList).replace('proDone', '')
      if (index === selectedIndex) {
        element.classList += ' proActive';
      }
      if (index < selectedIndex) {
        element.classList += ' proDone';
      }
    });
  }

  firstCapitalize(e) {
    let re = /(^|[.!?]\s+)([a-z])/g;
    var textBox: HTMLInputElement = <HTMLInputElement>e.target;
    textBox.value = textBox.value.replace(re, (m, $1, $2) => $1 + $2.toUpperCase());
  }

}


