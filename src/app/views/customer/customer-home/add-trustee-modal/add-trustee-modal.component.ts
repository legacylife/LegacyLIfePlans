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
  profileIdHiddenVal = false;
  trust_id: any;
  ids: string;
  row: any = [];
  constructor(
    private snack: MatSnackBar,public dialog: MatDialog, private fb: FormBuilder, private stepper: MatStepperModule,
    private confirmService: AppConfirmService,private loader: AppLoaderService, private router: Router,
    private userapi: UserAPIService,@Inject(MAT_DIALOG_DATA) public data: any
  ) { this.ids = data.id; }
 
  ngOnInit() {
    this.buildItemForm();
    this.userSections = userSections;  

    if(this.ids && this.ids!=='undefined'){
      this.selectedProfileId = this.ids;   
      this.getTrusteeView();
    }    
  }

  buildItemForm() {
      this.trustFormGroup = this.fb.group({
        firstName: new FormControl('',[Validators.required]),
        lastName: new FormControl('',[Validators.required]),
        email: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i)]),
        relation: new FormControl('',[Validators.required]),        
        emailValidation: new FormControl('',[Validators.required]),          
        profileId: new FormControl('')
       });

      this.secondFormGroup = this.fb.group({      
        selectAll: new FormControl(''),      
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
       });

     
       this.thirdFormGroup = this.fb.group({
        messages: new FormControl(''),           
       });
  }

  ngAfterViewInit(){ 
    if(!this.selectedProfileId){
      this.secondFormGroup.controls['selectAll'].setValue('never');
      this.onRadioChange('never');     
    }
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
    this.secondFormGroup.controls['selectAll'].setValue('');
  }
  
  trustFormGroupSubmit(step, insert = null) {
    var query = {};
    var proquery = {};
    let req_vars = {};
    let profileIds = this.selectedProfileId;

    if(profileIds && profileIds!=='undefined'){
      this.trustFormGroup.controls['emailValidation'].setValue('');
       req_vars = {
        query: Object.assign({_id:{ $ne: profileIds}, email: this.trustFormGroup.controls['email'].value,customerId: this.userId  })
        }
    }else{
      req_vars = {
        query: Object.assign({ email: this.trustFormGroup.controls['email'].value,customerId: this.userId  })
      } 
    }

    this.userapi.apiRequest('post', 'trustee/get-user', req_vars).subscribe(result => {
      if (result.status == "success") {
        if (result.data.code == "Exist") {
          this.trustFormGroup.controls['email'].enable();
          this.invalidMessage = result.data.message;
          this.EmailExist = true;
          this.trustFormGroup.controls['email'].setErrors({ 'EmailExist': true })          
        } else {                       
          this.trustFormGroup.controls['emailValidation'].setValue('1');
          this.invalidMessage = '';
          this.EmailExist = false;         
          this.Email_USER = this.trustFormGroup.controls['email'].value;     
          this.trust_id = '';
          if(result.data.userDetails){
            this.trust_id = result.data.userDetails._id;
            this.trustFormGroup.controls['firstName'].setValue(result.data.userDetails.firstName);
            this.trustFormGroup.controls['lastName'].setValue(result.data.userDetails.lastName);
            this.trustFormGroup.controls['firstName'].disable();
            this.trustFormGroup.controls['lastName'].disable();
          }
        }
      } else {      
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }
    }, (err) => {
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
          "PersonalProfileManagement":this.secondFormGroup.controls['PersonalProfileManagement'].value,
          "IDBoxManagement": this.secondFormGroup.controls['IDBoxManagement'].value,
          "MyProfessionalsManagement": this.secondFormGroup.controls['MyProfessionalsManagement'].value,
          "InsuranceManagement": this.secondFormGroup.controls['InsuranceManagement'].value,
          "FinancesManagement": this.secondFormGroup.controls['FinancesManagement'].value,
          "DebtManagement": this.secondFormGroup.controls['DebtManagement'].value,
          "PetsManagement": this.secondFormGroup.controls['PetsManagement'].value,
          "YoungChildrenManagement": this.secondFormGroup.controls['YoungChildrenManagement'].value,
          "ChildParentDisabilityManagement": this.secondFormGroup.controls['ChildParentDisabilityManagement'].value,
          "FriendNeighborCareManagement": this.secondFormGroup.controls['FriendNeighborCareManagement'].value,
          "EstateManagement": this.secondFormGroup.controls['EstateManagement'].value,
          "HealthcareManagement": this.secondFormGroup.controls['HealthcareManagement'].value,
          "PersonalAffairsManagement": this.secondFormGroup.controls['PersonalAffairsManagement'].value,
          "DevicesManagement": this.secondFormGroup.controls['DevicesManagement'].value,
          "ElectronicMediaManagement": this.secondFormGroup.controls['ElectronicMediaManagement'].value,  
          "emergencyContactsManagement": this.secondFormGroup.controls['emergencyContactsManagement'].value,
          "RealEstateManagement": this.secondFormGroup.controls['RealEstateManagement'].value,
          "VehiclesManagement": this.secondFormGroup.controls['VehiclesManagement'].value,
          "AssetsManagement": this.secondFormGroup.controls['AssetsManagement'].value,
          "TimeCapsuleManagement": this.secondFormGroup.controls['TimeCapsuleManagement'].value,
          "LegacyLifeLettersMessagesManagement": this.secondFormGroup.controls['LegacyLifeLettersMessagesManagement'].value,
          "FuneralPlansManagement": this.secondFormGroup.controls['FuneralPlansManagement'].value,
          "ObituaryManagement": this.secondFormGroup.controls['ObituaryManagement'].value,
          "CelebrationLifeManagement": this.secondFormGroup.controls['CelebrationLifeManagement'].value,
      }];
      userAccessDatas = userAccessDatas[0];    

      var fileCnt  = keysIn(userAccessDatas) .filter(key => {
        return userAccessDatas[key] == 'now'
      })
      let userSectionsCnt = '';
      if(fileCnt.length>0){
        userSectionsCnt = flatMap(userSections).filter(userSection=>{
          return userSection.fileNames.filter(fn => fileCnt.includes(fn.code)).length > 0 ? userSection.id : null;
        })
      }
    //console.log(" Count => ",fileCnt,fileCnt.length,userSectionsCnt,userSectionsCnt.length)       
    this.RequestData = {
      firstName: this.trustFormGroup.controls['firstName'].value,
      lastName: this.trustFormGroup.controls['lastName'].value,
      email: this.trustFormGroup.controls['email'].value,
      relation: this.trustFormGroup.controls['relation'].value,
      messages: this.thirdFormGroup.controls['messages'].value,
      selectAll: this.secondFormGroup.controls['selectAll'].value,
      trustId: this.trust_id,
      userAccess: userAccessDatas,
      filesCount:  fileCnt.length,
      folderCount: userSectionsCnt.length,
     }

      let profileIds = this.trustFormGroup.controls['profileId'].value;
      if(profileIds){
          this.selectedProfileId = profileIds;
      }        
      const req_vars = {
        query: Object.assign({_id: this.selectedProfileId,customerId: this.userId}),
        proquery: Object.assign(this.RequestData),
        extrafields: Object.assign({inviteByName:localStorage.getItem("endUserFirstName") + " " + localStorage.getItem("endUserLastName")})
      }
      this.loader.open();
      this.userapi.apiRequest('post', 'trustee/form-submit', req_vars).subscribe(result => {
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

  getTrusteeView = (query = {}, search = false) => {    
    let  profileIds = this.selectedProfileId;
    let  req_vars = {
      query: Object.assign({status:"blanck"})
    }
    if (profileIds) {
        req_vars = {
          query: Object.assign({_id:profileIds})
      }
    }
    this.loader.open(); 
    this.userapi.apiRequest('post', 'trustee/view-details', req_vars).subscribe(result => {
    this.loader.close();
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if(result.data){    
          this.row = result.data;   
          let profileIds = this.row._id;
      
          this.trustFormGroup.controls['profileId'].setValue(profileIds);
          this.trustFormGroup.controls['firstName'].setValue(this.row.firstName);
          this.trustFormGroup.controls['lastName'].setValue(this.row.lastName);           
          this.trustFormGroup.controls['email'].setValue(this.row.email);
          this.trustFormGroup.controls['email'].disable();
          this.trustFormGroup.controls['emailValidation'].setValue('1');
          this.trustFormGroup.controls['relation'].setValue(this.row.relation);

          this.secondFormGroup.controls['selectAll'].setValue(this.row.selectAll);
          this.secondFormGroup.controls['PersonalProfileManagement'].setValue(this.row.userAccess.PersonalProfileManagement);
          this.secondFormGroup.controls['IDBoxManagement'].setValue(this.row.userAccess.IDBoxManagement);
          this.secondFormGroup.controls['MyProfessionalsManagement'].setValue(this.row.userAccess.MyProfessionalsManagement);
          this.secondFormGroup.controls['EstateManagement'].setValue(this.row.userAccess.EstateManagement);          
          this.secondFormGroup.controls['HealthcareManagement'].setValue(this.row.userAccess.HealthcareManagement);
          this.secondFormGroup.controls['PersonalAffairsManagement'].setValue(this.row.userAccess.PersonalAffairsManagement);
          this.secondFormGroup.controls['DevicesManagement'].setValue(this.row.userAccess.DevicesManagement);
          this.secondFormGroup.controls['ElectronicMediaManagement'].setValue(this.row.userAccess.ElectronicMediaManagement);
          this.secondFormGroup.controls['RealEstateManagement'].setValue(this.row.userAccess.RealEstateManagement);
          this.secondFormGroup.controls['emergencyContactsManagement'].setValue(this.row.userAccess.emergencyContactsManagement);
          this.secondFormGroup.controls['VehiclesManagement'].setValue(this.row.userAccess.VehiclesManagement);
          this.secondFormGroup.controls['AssetsManagement'].setValue(this.row.userAccess.AssetsManagement);
          this.secondFormGroup.controls['InsuranceManagement'].setValue(this.row.userAccess.InsuranceManagement);
          this.secondFormGroup.controls['FinancesManagement'].setValue(this.row.userAccess.FinancesManagement);
          this.secondFormGroup.controls['DebtManagement'].setValue(this.row.userAccess.DebtManagement);
          this.secondFormGroup.controls['PetsManagement'].setValue(this.row.userAccess.PetsManagement);
          this.secondFormGroup.controls['YoungChildrenManagement'].setValue(this.row.userAccess.YoungChildrenManagement);
          this.secondFormGroup.controls['ChildParentDisabilityManagement'].setValue(this.row.userAccess.ChildParentDisabilityManagement);
          this.secondFormGroup.controls['FriendNeighborCareManagement'].setValue(this.row.userAccess.FriendNeighborCareManagement);
          this.secondFormGroup.controls['TimeCapsuleManagement'].setValue(this.row.userAccess.TimeCapsuleManagement);
          this.secondFormGroup.controls['LegacyLifeLettersMessagesManagement'].setValue(this.row.userAccess.LegacyLifeLettersMessagesManagement);
          this.secondFormGroup.controls['FuneralPlansManagement'].setValue(this.row.userAccess.FuneralPlansManagement);
          this.secondFormGroup.controls['ObituaryManagement'].setValue(this.row.userAccess.ObituaryManagement);
          this.secondFormGroup.controls['CelebrationLifeManagement'].setValue(this.row.userAccess.CelebrationLifeManagement);
  
          this.thirdFormGroup.controls['messages'].setValue(this.row.messages);

        }       
      }
    }, (err) => {
      console.error(err);
    })
  }

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


