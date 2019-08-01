import { Component, OnInit, ViewChild,Inject,AfterViewInit, } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MatDialog, MatSnackBar,MAT_DIALOG_DATA } from '@angular/material';
import { MatStepperModule , MatStepper} from '@angular/material/stepper';
import { Router, ActivatedRoute } from '@angular/router';
import { UserAPIService } from './../../../userapi.service';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { forEach, keysIn, flatMap } from "lodash";
import { RelationshipType } from '../../../selectList';
import { userSections } from '../../../config';
//import { ProfAddTrusteeModalComponent } from '../customer-professionals/prof-add-trustee-modal/prof-add-trustee-modal.component';
@Component({
  selector: 'app-hire-advisor-modal',
  templateUrl: './hire-advisor-modal.component.html',
  styleUrls: ['./hire-advisor-modal.component.scss']
})
export class HireAdvisorComponent implements OnInit, AfterViewInit  {
  isLinear = true;
  @ViewChild('stepper') private myStepper: MatStepper;
  relationTypeList: any[] = RelationshipType;
  hireFormGroup: FormGroup;
  trusteeFormGroup: FormGroup;
  userSections = [];
  userId = localStorage.getItem("endUserId");
  RequestData: any;
  selectedProfileId: string;
  profileIdHiddenVal = false;
  SubHeaderName = false;
  trust_id: string;
  headerName = true;
  ids: string;
  updates: string;
  hireFullName:string;
  alreadyRequestSend:boolean = true;
  hideFirstStep : Boolean = true;
  row: any = [];
  defaultPermission:boolean = true;
  constructor(
    private snack: MatSnackBar,public dialog: MatDialog, private fb: FormBuilder, private stepper: MatStepperModule,
    private confirmService: AppConfirmService,private loader: AppLoaderService, private router: Router,
    private userapi: UserAPIService,@Inject(MAT_DIALOG_DATA) public data: any
  ) {this.ids = data.id;this.updates = data.update; this.hireFullName = data.hireFullName}

  ngOnInit() {
    this.buildItemForm();
    this.userSections = userSections;  
    this.selectedProfileId = '';   
    if(this.ids){     
      this.checkAdvisorView();
    }   
    if(this.updates=='update'){
      this.hideFirstStep = false;
      this.defaultPermission = false;
    }
  }

  ngAfterViewInit(){ 
    if(this.selectedProfileId){
      this.trusteeFormGroup.controls['selectAll'].setValue('never');
        this.onRadioChange('never');     
    }
  }

  buildItemForm() {
    this.trusteeFormGroup = this.fb.group({      
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
      profileId: new FormControl(''), 
     });
}

checkAdvisorView(insert = null) {
  const req_vars = {
      query: Object.assign({customerId:this.userId,advisorId:this.ids, status: { $nin: ['Deleted', 'Rejected'] }}),
    }    
    this.loader.open();
    this.userapi.apiRequest('post', 'advisor/checkHireAdvisor', req_vars).subscribe(result => {
    this.loader.close();
      if(result.status == "error"){
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      } else {
        if(result.data.code=='Exist'){
          this.row = result.data.RequestData;
          this.selectedProfileId = result.data.RequestData._id;   
          if(this.updates=='update'){
            this.alreadyRequestSend = true;
            this.trusteeFormGroup.controls['selectAll'].setValue(this.row.selectAll);
            this.trusteeFormGroup.controls['PersonalProfileManagement'].setValue(this.row.userAccess.PersonalProfileManagement);
            this.trusteeFormGroup.controls['IDBoxManagement'].setValue(this.row.userAccess.IDBoxManagement);
            this.trusteeFormGroup.controls['MyProfessionalsManagement'].setValue(this.row.userAccess.MyProfessionalsManagement);
            this.trusteeFormGroup.controls['EstateManagement'].setValue(this.row.userAccess.EstateManagement);          
            this.trusteeFormGroup.controls['HealthcareManagement'].setValue(this.row.userAccess.HealthcareManagement);
            this.trusteeFormGroup.controls['PersonalAffairsManagement'].setValue(this.row.userAccess.PersonalAffairsManagement);
            this.trusteeFormGroup.controls['DevicesManagement'].setValue(this.row.userAccess.DevicesManagement);
            this.trusteeFormGroup.controls['ElectronicMediaManagement'].setValue(this.row.userAccess.ElectronicMediaManagement);
            this.trusteeFormGroup.controls['RealEstateManagement'].setValue(this.row.userAccess.RealEstateManagement);
            this.trusteeFormGroup.controls['emergencyContactsManagement'].setValue(this.row.userAccess.emergencyContactsManagement);
            this.trusteeFormGroup.controls['VehiclesManagement'].setValue(this.row.userAccess.VehiclesManagement);
            this.trusteeFormGroup.controls['AssetsManagement'].setValue(this.row.userAccess.AssetsManagement);
            this.trusteeFormGroup.controls['InsuranceManagement'].setValue(this.row.userAccess.InsuranceManagement);
            this.trusteeFormGroup.controls['FinancesManagement'].setValue(this.row.userAccess.FinancesManagement);
            this.trusteeFormGroup.controls['DebtManagement'].setValue(this.row.userAccess.DebtManagement);
            this.trusteeFormGroup.controls['PetsManagement'].setValue(this.row.userAccess.PetsManagement);
            this.trusteeFormGroup.controls['YoungChildrenManagement'].setValue(this.row.userAccess.YoungChildrenManagement);
            this.trusteeFormGroup.controls['ChildParentDisabilityManagement'].setValue(this.row.userAccess.ChildParentDisabilityManagement);
            this.trusteeFormGroup.controls['FriendNeighborCareManagement'].setValue(this.row.userAccess.FriendNeighborCareManagement);
            this.trusteeFormGroup.controls['TimeCapsuleManagement'].setValue(this.row.userAccess.TimeCapsuleManagement);
            this.trusteeFormGroup.controls['LegacyLifeLettersMessagesManagement'].setValue(this.row.userAccess.LegacyLifeLettersMessagesManagement);
            this.trusteeFormGroup.controls['FuneralPlansManagement'].setValue(this.row.userAccess.FuneralPlansManagement);
            this.trusteeFormGroup.controls['ObituaryManagement'].setValue(this.row.userAccess.ObituaryManagement);
            this.trusteeFormGroup.controls['CelebrationLifeManagement'].setValue(this.row.userAccess.CelebrationLifeManagement);
            this.trusteeFormGroup.controls['profileId'].setValue(this.selectedProfileId);
          }else{
            this.alreadyRequestSend = false;
          }          
        }        
      }
    }, (err) => {
      console.error(err)
    })

}

trusteeFormGroupSubmit(insert = null) {
    var query = {};
    var proquery = {};
    let userAccessDatas = [];
    userAccessDatas = [{
        "PersonalProfileManagement":this.trusteeFormGroup.controls['PersonalProfileManagement'].value,
        "IDBoxManagement": this.trusteeFormGroup.controls['IDBoxManagement'].value,
        "MyProfessionalsManagement": this.trusteeFormGroup.controls['MyProfessionalsManagement'].value,
        "InsuranceManagement": this.trusteeFormGroup.controls['InsuranceManagement'].value,
        "FinancesManagement": this.trusteeFormGroup.controls['FinancesManagement'].value,
        "DebtManagement": this.trusteeFormGroup.controls['DebtManagement'].value,
        "PetsManagement": this.trusteeFormGroup.controls['PetsManagement'].value,
        "YoungChildrenManagement": this.trusteeFormGroup.controls['YoungChildrenManagement'].value,
        "ChildParentDisabilityManagement": this.trusteeFormGroup.controls['ChildParentDisabilityManagement'].value,
        "FriendNeighborCareManagement": this.trusteeFormGroup.controls['FriendNeighborCareManagement'].value,
        "EstateManagement": this.trusteeFormGroup.controls['EstateManagement'].value,
        "HealthcareManagement": this.trusteeFormGroup.controls['HealthcareManagement'].value,
        "PersonalAffairsManagement": this.trusteeFormGroup.controls['PersonalAffairsManagement'].value,
        "DevicesManagement": this.trusteeFormGroup.controls['DevicesManagement'].value,
        "ElectronicMediaManagement": this.trusteeFormGroup.controls['ElectronicMediaManagement'].value,  
        "emergencyContactsManagement": this.trusteeFormGroup.controls['emergencyContactsManagement'].value,
        "RealEstateManagement": this.trusteeFormGroup.controls['RealEstateManagement'].value,
        "VehiclesManagement": this.trusteeFormGroup.controls['VehiclesManagement'].value,
        "AssetsManagement": this.trusteeFormGroup.controls['AssetsManagement'].value,
        "TimeCapsuleManagement": this.trusteeFormGroup.controls['TimeCapsuleManagement'].value,
        "LegacyLifeLettersMessagesManagement": this.trusteeFormGroup.controls['LegacyLifeLettersMessagesManagement'].value,
        "FuneralPlansManagement": this.trusteeFormGroup.controls['FuneralPlansManagement'].value,
        "ObituaryManagement": this.trusteeFormGroup.controls['ObituaryManagement'].value,
        "CelebrationLifeManagement": this.trusteeFormGroup.controls['CelebrationLifeManagement'].value,
    }];
    userAccessDatas = userAccessDatas[0];    
   // console.log("userAccessDatas",userAccessDatas)
    var fileCnt  = keysIn(userAccessDatas) .filter(key => {
      return userAccessDatas[key] == 'now'
    })
    let userSectionsCnt = '';
    if(fileCnt.length>0){
      userSectionsCnt = flatMap(userSections).filter(userSection=>{
        return userSection.fileNames.filter(fn => fileCnt.includes(fn.code)).length > 0 ? userSection.id : null;
      })
    }

    this.RequestData = {
      selectAll: this.trusteeFormGroup.controls['selectAll'].value,
      advisorId: this.ids,
      userAccess: userAccessDatas,
      filesCount:  fileCnt.length,
      folderCount: userSectionsCnt.length,
      hirestatus:'Pending'
    }
   
    let profileIds = this.trusteeFormGroup.controls['profileId'].value;
    
    if(profileIds){
        this.selectedProfileId = profileIds;
    }        

    let inviteByName = localStorage.getItem("endUserFirstName") + " " + localStorage.getItem("endUserLastName");
    const req_vars = {
      query: Object.assign({_id:this.selectedProfileId,customerId:this.userId,advisorId:this.ids}),
      proquery: Object.assign(this.RequestData),
      from: Object.assign({ logId: "" }),
      extraFields: Object.assign({ inviteByName:inviteByName})
    }
    
    this.loader.open();
    this.userapi.apiRequest('post', 'advisor/hireadvisor', req_vars).subscribe(result => {
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

onChangeFormIndex(event){
  const {selectedIndex} = event;
  if(selectedIndex=='1'){
    this.headerName = false;
    this.SubHeaderName = true;
  }else{
    this.headerName = true;
    this.SubHeaderName = false;
  }
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
           this.trusteeFormGroup.controls[rows.code].setValue(values);
        }
      }      
    }
  }

  onFileChange(values){
    this.trusteeFormGroup.controls['selectAll'].setValue('');
  }
  

}

