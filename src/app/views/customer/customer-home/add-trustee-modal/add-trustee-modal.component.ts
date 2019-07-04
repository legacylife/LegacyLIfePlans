import { Component, OnInit, ViewChild,Inject,AfterViewInit,Pipe, PipeTransform } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms'
import { CustomValidators } from 'ng2-validation';
import { UserAPIService } from './../../../../userapi.service';
import { AppConfirmService } from '../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { MatDialogRef, MatDialog, MatSnackBar,MAT_DIALOG_DATA } from '@angular/material';
import { MatStepperModule , MatStepper} from '@angular/material/stepper';
import { Router, ActivatedRoute } from '@angular/router';
import { forEach, keysIn, flatMap } from "lodash";
import { RelationshipType } from '../../../../selectList';
import { userSections } from '../../../../config';
// import { map } from 'rxjs/operators/map'
// import { filter } from 'rxjs/operators/filter';
// import { Subscription } from 'rxjs';
// import { Observable } from 'rxjs/Observable';
@Component({
  selector: 'app-add-trustee-modal',
  templateUrl: './add-trustee-modal.component.html',
  styleUrls: ['./add-trustee-modal.component.scss']
})
export class addTrusteeModalComponent implements OnInit, AfterViewInit {
  isLinear = true;
  @ViewChild('stepper') private myStepper: MatStepper;
  invalidMessage: string;
  EmailExist: boolean;
  Email_USER: string;
  relationTypeList: any[] = RelationshipType;
  trustFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  userSections = [];
  userId = localStorage.getItem("endUserId");
  RequestData: any;
  selectedProfileId: string;
  validationEmailVal = false;

  constructor(
    private snack: MatSnackBar,public dialog: MatDialog, private fb: FormBuilder, private stepper: MatStepperModule,
    private confirmService: AppConfirmService,private loader: AppLoaderService, private router: Router,
    private userapi: UserAPIService
  ) { }
 
  ngOnInit() {
    //this.myStepper.selectedIndex = Number('0');
    this.buildItemForm();
    this.userSections = userSections;  
    const locationArray = location.href.split('/')
    this.selectedProfileId = locationArray[locationArray.length - 1];

    if(this.selectedProfileId && this.selectedProfileId == 'dashboard'){
      this.selectedProfileId = "";   
    }    
  }

  buildItemForm() {
      this.trustFormGroup = this.fb.group({
        firstName: new FormControl('',[Validators.required]),
        lastName: new FormControl('',[Validators.required]),
        email: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i)]),
        relation: new FormControl('',[Validators.required]),        
        emailValidation: new FormControl('',[Validators.required]),          
      //  profileId: new FormControl('')
       });

      this.secondFormGroup = this.fb.group({      
        SelectAll: new FormControl(''),      
        PersonalProfileManagement:new FormControl(''),     
        IDBoxManagement: new FormControl(''),     
        MyProfessionalsManagement: new FormControl(''),     
        EstateManagement: new FormControl(''),     
        HealthcareManagement: new FormControl(''), 
        PersonalAffairsManagement: new FormControl(''), 
        DevicesManagement: new FormControl(''), 
        ElectronicMediaManagement: new FormControl(''), 
        RealEstateManagement: new FormControl(''), 
        emergencyContactsManagement: new FormControl(''), 
        VehiclesManagement: new FormControl(''), 
        AssetsManagement: new FormControl(''), 
        InsuranceManagement: new FormControl(''), 
        FinancesManagement: new FormControl(''), 
        DebtManagement: new FormControl(''), 
        PetsManagement: new FormControl(''), 
        YoungChildrenManagement: new FormControl(''), 
        ChildParentDisabilityManagement: new FormControl(''), 
        FriendNeighborCareManagement: new FormControl(''), 
        TimeCapsuleManagement: new FormControl(''), 
        LegacyLifeLettersMessagesManagement: new FormControl(''), 
        FuneralPlansManagement: new FormControl(''), 
        ObituaryManagement: new FormControl(''), 
        CelebrationLifeManagement: new FormControl(''), 
       // profileId: new FormControl('')
       });

       this.thirdFormGroup = this.fb.group({
        comments: new FormControl(''),           
      //  profileId: new FormControl('')
       });
  }

  ngAfterViewInit(){
   this.secondFormGroup.controls['SelectAll'].setValue('never');
   this.onRadioChange('never');     
  }

  onChangeFormIndex(event){
    const {selectedIndex} = event;
    console.log("here We go => ",event,selectedIndex)
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

  onRadioChange(values){
    if(userSections){      
      for(let row of userSections)
      {
        for(let rows of row.fileNames)
        {       
           this.secondFormGroup.controls[rows.code].setValue(values);
        }
      }      
    }
  }

  onFileChange(values){
    this.secondFormGroup.controls['SelectAll'].setValue('');
  }
  
  // onContinue(values){
  //   this.Email_USER = this.trustFormGroup.controls['firstName'].value;    
  //    //this.trustFormGroup.controls['comments'].setValue('');
  // }

  trustFormGroupSubmit(step, insert = null) {
    var query = {};
    var proquery = {};
    const req_vars = {
      query: Object.assign({ email: this.trustFormGroup.controls['email'].value,customerId: this.userId  })
    }  
    //this.myStepper.reset();
    this.loader.open();    
    this.userapi.apiRequest('post', 'trustee/trust-get-user', req_vars).subscribe(result => {
      if (result.status == "success") {
        this.loader.close();
        if (result.data.code == "Exist") {
          this.trustFormGroup.controls['email'].enable();
          this.invalidMessage = result.data.message;
          this.EmailExist = true;
          this.trustFormGroup.controls['email'].setErrors({ 'EmailExist': true })          
        } else {                       
          this.trustFormGroup.controls['emailValidation'].setValue('1');
         // this.trustFormGroup.controls['email'].enable();
          this.invalidMessage = '';
        //  this.trustFormGroup.controls['email'].setErrors({ 'EmailExist': false })
          this.EmailExist = false;         
          this.Email_USER = this.trustFormGroup.controls['email'].value;              
        }
      } else {      
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }
    }, (err) => {
      this.loader.close();
      this.snack.open(err, 'OK', { duration: 4000 })         
    })
  }

  secondFormGroupSubmit(step, insert = null) {
  }

  thirdFormGroupSubmit(step, insert = null) {
      var query = {};
      var proquery = {};
      let userAccessDatas = [];
      userAccessDatas = [{
          "PersonalProfileManagement": insert.PersonalProfileManagement,
          "IDBoxManagement": insert.IDBoxManagement,
          "MyProfessionalsManagement": insert.MyProfessionalsManagement,
          "InsuranceManagement": insert.InsuranceManagement,
          "FinancesManagement": insert.FinancesManagement,
          "DebtManagement": insert.DebtManagement,
          "PetsManagement": insert.PetsManagement,
          "YoungChildrenManagement": insert.YoungChildrenManagement,
          "ChildParentDisabilityManagement": insert.ChildParentDisabilityManagement,
          "FriendNeighborCareManagement": insert.FriendNeighborCareManagement,
          "EstateManagement": insert.EstateManagement,
          "HealthcareManagement": insert.HealthcareManagement,
          "PersonalAffairsManagement": insert.PersonalAffairsManagement,
          "DevicesManagement": insert.DevicesManagement,
          "ElectronicMediaManagement": insert.ElectronicMediaManagement,          
          "emergencyContactsManagement": insert.emergencyContactsManagement,
          "RealEstateManagement": insert.RealEstateManagement,
          "VehiclesManagement": insert.VehiclesManagement,
          "AssetsManagement": insert.AssetsManagement,
          "TimeCapsuleManagement": insert.TimeCapsuleManagement,
          "LegacyLifeLettersMessagesManagement": insert.LegacyLifeLettersMessagesManagement,
          "FuneralPlansManagement": insert.FuneralPlansManagement,
          "ObituaryManagement": insert.ObituaryManagement,
          "CelebrationLifeManagement": insert.CelebrationLifeManagement,
      }];
      userAccessDatas = userAccessDatas[0];     
      var fileCnt  = keysIn(userAccessDatas) .filter(key => {
        return userAccessDatas[key] == 'now'
      })

      let userSectionsCnt = flatMap(userSections).filter(userSection=>{
          return userSection.fileNames.filter(fn => fileCnt.includes(fn.code)).length > 0 ? userSection.id : null;
      })
      console.log(" Count => ",fileCnt,fileCnt.length,userSectionsCnt,userSectionsCnt.length)
   
    this.RequestData = {
      firstName: this.trustFormGroup.controls['firstName'].value,
      lastName: this.trustFormGroup.controls['lastName'].value,
      email: this.trustFormGroup.controls['email'].value,
      relation: this.trustFormGroup.controls['relation'].value,
      comments: this.thirdFormGroup.controls['comments'].value,
      userAccess: userAccessDatas,
      filesCount:  fileCnt.length,
      folderCount: userSectionsCnt.length,
     }
    
      //"MyPeopleManagement": insert.MyPeopleManagement,
      let profileIds = this.trustFormGroup.controls['profileId'].value;
      if(profileIds){
          this.selectedProfileId = profileIds;
      }        
      const req_vars = {
        query: Object.assign({ _id: this.selectedProfileId,customerId: this.userId  }),
        proquery: Object.assign(this.RequestData)
      }
      this.loader.open();
      this.userapi.apiRequest('post', 'trustee/trust-form-submit', req_vars).subscribe(result => {
      this.loader.close();
        if(result.status == "error"){
          this.snack.open(result.data.message, 'OK', { duration: 4000 })
        } else {
          this.snack.open(result.data.message, 'OK', { duration: 4000 })
          this.dialog.closeAll(); 
        }
      }, (err) => {
        console.error(err)
      })
  }

  // getArrayId(userAccessDatas) {
  //   let filesCnt =0;
  //   var returnData = [];
  //   let returnId = '';
  //   var that = this;
  //   forEach(userAccessDatas[0], function(value, searchKey) {
  //     if(value=='now'){
  //        returnData['returnId'] = that.getParentId(searchKey);
  //        filesCnt ++;
  //     }      
  //   });

  //   returnData['filesCnt'] = filesCnt;
  //   return returnData;
  // }
  // getParentId = (searchKey) => {
  //   let returnId = '';
  //   if(userSections){      
  //     for(let row of userSections)
  //     {
  //       for(let rows of row.fileNames)
  //       {       
  //         if(rows.code==searchKey){
  //           returnId =  row.id
  //         }          
  //       }
  //     }      
  //   }
  //   return returnId;
  // }

  firstCapitalize(e) {
    let re = /(^|[.!?]\s+)([a-z])/g;
    var textBox: HTMLInputElement = <HTMLInputElement>e.target;
    textBox.value = textBox.value.replace(re, (m, $1, $2) => $1 + $2.toUpperCase());
  }
  
  checkSpecialChar(event){  
    var key;  
    key = event.charCode;
    return((key > 64 && key < 91) || (key> 96 && key < 123) || key == 8 || key == 32 || (key >= 48 && key <= 57)); 
  }

}


