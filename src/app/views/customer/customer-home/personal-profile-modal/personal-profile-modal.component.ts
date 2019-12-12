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
import { AsYouType } from 'libphonenumber-js'
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
  maxDate = new Date(new Date());
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
  dynamicRoute:string;
  ccChurchlandlineNumbers: any;
  customerLegaciesId:string='';
  customerLegacyType:string='customer';
  urlData:any={};
  trusteeLegaciesAction:boolean=true;
  LegacyPermissionError:string="You don't have access to this section";
  constructor(private router: Router, private snack: MatSnackBar, public dialog: MatDialog, private fb: FormBuilder, private loader: AppLoaderService, private userapi: UserAPIService, ) { }

  ngOnInit() {
    this.countryList = countries;
    this.userId = localStorage.getItem("endUserId");
    this.urlData = this.userapi.getURLData();

    this.selectedProfileId = this.urlData.lastOne;
    if (this.selectedProfileId && this.selectedProfileId == 'essential-day-one' && this.urlData.lastThird != "legacies") {
      this.selectedProfileId = "";
    }
    
    if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'essential-day-one') {
        this.customerLegaciesId = this.userId;
        this.customerLegacyType =  this.urlData.userType;
        this.userId = this.urlData.lastOne;          
        this.userapi.getUserAccess(this.userId,(userAccess,userDeathFilesCnt,userLockoutPeriod,userDeceased) => { 
          if(userLockoutPeriod || userDeceased){
            this.trusteeLegaciesAction = false;
          }
         if(userAccess.PersonalProfileManagement!='now'){
          this.trusteeLegaciesAction = false;
         }           
        }); 
        this.selectedProfileId = "";        
    }

    this.step = localStorage.getItem("ID_step");
    this.firstFormGroup = this.fb.group({
      ppFirstName: new FormControl('', Validators.required),
      ppMiddleName: new FormControl(''),
      ppLastName: new FormControl('', Validators.required),
      ppEmails: this.fb.array([this.fb.group({ email: ['',Validators.pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i)]})]),
      //ppLandlineNumbers: this.fb.array([this.fb.group({phone: ['',  , Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]})]),
      ppLandlineNumbers: this.fb.array([this.fb.group({ phone: ['',[Validators.pattern(/^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]*$/),Validators.minLength(10)]]})]),
      // Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)
      ppDateOfBirth: new FormControl(''),
      ppAddressLine1: new FormControl(''),
      ppAddressLine2: new FormControl(''),
      ppCountry: new FormControl(''),
      ppCity: new FormControl(''),
      ppState: new FormControl(''),
      ppZipCode: new FormControl(''),
      profileId: new FormControl('')
    });

    this.secondFormGroup = this.fb.group({
      wpWorkBusiness: new FormControl(''),
      wpCompanyName: new FormControl(''),
      wpTitlePosition: new FormControl(''),
      wpDepartment: new FormControl(''),
      wpContactPersonName: new FormControl(''),
      // wpLandlineNumbers: this.fb.array([this.fb.group({phone: ['', Validators.required, Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]})]),
     // wpLandlineNumbers: this.fb.array([this.fb.group({ phone: ['', Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)] })]),
      wpLandlineNumbers: this.fb.array([this.fb.group({ phone: ['', [Validators.pattern(/^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]*$/),Validators.minLength(10)]]})]),
      wpAddressLine1: new FormControl(''),
      wpAddressLine2: new FormControl(''),
      wpCountry: new FormControl(''),
      wpCity: new FormControl(''),
      wpState: new FormControl(''),
      wpZipCode: new FormControl(''),
      profileId: new FormControl('')
    });


    this.thirdFormGroup = this.fb.group({
      ccName: new FormControl(''),
      ccAddressLine1: new FormControl(''),
      ccAddressLine2: new FormControl(''),
      ccZipCode: new FormControl(''),
      //ccWorkLandlineNumbers: this.fb.array([this.fb.group({phone: ['', Validators.required, Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]})]),
      ccWorkLandlineNumbers: this.fb.array([this.fb.group({ phone: ['',[Validators.pattern(/^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]*$/),Validators.minLength(10)]]})]),
      ccContactPersonName: new FormControl(''),
      //cclandlineNumbers: this.fb.array([this.fb.group({phone: ['', Validators.required, Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]})]),
      cclandlineNumbers: this.fb.array([this.fb.group({ phone: ['',[Validators.pattern(/^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]*$/),Validators.minLength(10)]]})]),
      ccChurchName: new FormControl(''),
      ccChurchAddressLine1: new FormControl(''),
      ccChurchAddressLine2: new FormControl(''),
      ccChurchZipCode: new FormControl(''),
      //ccChurchLandlineNumbers: this.fb.array([this.fb.group({phone: ['', Validators.required, Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]})]),    
      ccChurchLandlineNumbers: this.fb.array([this.fb.group({ phone: ['',[Validators.pattern(/^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]*$/),Validators.minLength(10)]]})]),
      ccChurchContactPersonName: new FormControl(''),
      profileId: new FormControl('')
    });

    if (this.selectedProfileId && this.selectedProfileId != '') {
      this.getDetails();
    }  
  }


  checkPhoneNumber(from,index,event)
  {  
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }else{
      const AsouType = new AsYouType('US');
      let control =<any> '';
      if(from=='ppLandlineNumbers'){
         control = <FormArray>this.firstFormGroup.controls[from];
      }else if(from=='wpLandlineNumbers'){
         control = <FormArray>this.secondFormGroup.controls[from];
      }else if(from=='ccWorkLandlineNumbers'){
          control = <FormArray>this.thirdFormGroup.controls[from];
      }else if(from=='cclandlineNumbers'){
          control = <FormArray>this.thirdFormGroup.controls[from];
     }else if(from=='ccChurchLandlineNumbers'){
          control = <FormArray>this.thirdFormGroup.controls[from];
      }
      
      let phoneValue = control.controls[index].value;
       phoneValue = JSON.stringify(phoneValue);
       phoneValue = phoneValue.toString();
       let phoneNumber = AsouType.input(phoneValue);
       control.controls[index].setValue({phone:phoneNumber});
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
          this.essentials = result.data;
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

    if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'essential-day-one') {
      profileInData.customerLegacyId = this.customerLegaciesId
      profileInData.customerLegacyType = this.customerLegacyType
    }
    
    if (profileInData.profileId) {
      this.selectedProfileId = profileInData.profileId;
    }
    var query = {};
    var proquery = {};

   var personalProfileAction = localStorage.getItem("personalProfileAction") ? localStorage.getItem("personalProfileAction") : "added"

    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId }),
      proquery: Object.assign(profileInData),
      from: Object.assign({ fromname: msgName, customerId: this.userId, "personalProfileAction": personalProfileAction })
    }
    this.loader.open();
    this.userapi.apiRequest('post', 'customer/my-essentials-req', req_vars).subscribe(result => {
      this.loader.close();
      if (result.status == "error") {
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      } else {
        localStorage.setItem("ID_step", steps);
        this.firstFormGroup.controls['profileId'].setValue(result.data.ppID);
        this.secondFormGroup.controls['profileId'].setValue(result.data.ppID);
        this.thirdFormGroup.controls['profileId'].setValue(result.data.ppID);       
        
        if (steps == 3) {
          this.snack.open(result.data.message, 'OK', { duration: 4000 })
          if(this.urlData.userType == 'advisor'){
            this.router.navigate(['/', 'advisor', 'legacies', 'essential-detail-view', result.data.ppID])
          }else{
            this.router.navigate(['/', 'customer', 'dashboard', 'essential-detail-view', result.data.ppID])
          }
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
      phone: [phone,[Validators.pattern(/^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]*$/),Validators.minLength(10)]]
    });
  }
  

  editWpLandlineGroup(phone) {
    return this.fb.group({
      phone: [phone,[Validators.pattern(/^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]*$/),Validators.minLength(10)]]
    });
  }

  editCcLandlineGroup(phone) {
    return this.fb.group({
      phone: [phone,[Validators.pattern(/^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]*$/),Validators.minLength(10)]]
    });
  }

  editCccontactLandlineGroup(phone) {
    return this.fb.group({
      phone: [phone,[Validators.pattern(/^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]*$/),Validators.minLength(10)]]
    });
  }

  editCcChurchLandlineGroup(phone) {
    return this.fb.group({
      phone: [phone,[Validators.pattern(/^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]*$/),Validators.minLength(10)]]
    });
  }

  addNewEmail() {
    this.emailList.push(this.fb.group({
      email: ['',Validators.pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i)]
    }));
  }

  get emailList() {
    return this.firstFormGroup.get('ppEmails') as FormArray;
  }

  /////
  addNewLandlineNum() {
    this.landlineNumbersList.push(this.fb.group({
      //phone: ['', Validators.pattern(/^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]*$/)]
      phone: ['',[Validators.pattern(/^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]*$/),Validators.minLength(10)]]
    }));
    //  phone: ['', Validators.required,Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]
  }

  get landlineNumbersList() {
    return this.firstFormGroup.get('ppLandlineNumbers') as FormArray;
  }

  /////
  addNewWorkLandLineNum() {
    this.wpLandlineNumberList.push(this.fb.group({
      phone: ['',[Validators.pattern(/^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]*$/),Validators.minLength(10)]]
    }));
  }

  get wpLandlineNumberList() {
    return this.secondFormGroup.get('wpLandlineNumbers') as FormArray;
  }

  /////
  addNewWorkLandlineNum() {
    this.ccWorkLandlineNumberList.push(this.fb.group({
      phone: ['',[Validators.pattern(/^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]*$/),Validators.minLength(10)]]// phone: ['', Validators.required,Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]
    }));
  }

  get ccWorkLandlineNumberList() {
    return this.thirdFormGroup.get('ccWorkLandlineNumbers') as FormArray;
  }

  /////
  addNewCCLandlineNum() {
    this.cclandlineNumbersList.push(this.fb.group({
      phone: ['',[Validators.pattern(/^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]*$/),Validators.minLength(10)]]//phone: ['', Validators.required,Validators.pattern(/^(1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s\-]?[\0-9]{3}[\s\-]?[0-9]{4}$/)]
    }));
  }

  get cclandlineNumbersList() {
    return this.thirdFormGroup.get('cclandlineNumbers') as FormArray;
  }

  /////
  addNewChurchLandlineNum() {
    this.ChurchlandlineNumbersList.push(this.fb.group({
      phone: ['',[Validators.pattern(/^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]*$/),Validators.minLength(10)]]
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

    let stepHeader = document.getElementsByClassName('mat-horizontal-stepper-header');    
    forEach(stepHeader, (element, index) => {
      element.classList = String(element.classList).replace('proActive', '')
      element.classList = String(element.classList).replace('proDone', '')
      element.classList.focus();
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

  scroll(event)
  {
  }
  
  checkSpecialChar(event)
  {
    var key;  
    key = event.charCode;
    return((key > 64 && key < 91) || (key> 96 && key < 123) || key == 8 || key == 32 || (key >= 48 && key <= 57)); 
  }

}