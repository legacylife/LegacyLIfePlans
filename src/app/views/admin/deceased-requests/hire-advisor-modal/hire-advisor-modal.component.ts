import { Component, OnInit, ViewChild,Inject,AfterViewInit, } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MatDialog, MatSnackBar,MAT_DIALOG_DATA } from '@angular/material';
import { MatStepperModule , MatStepper} from '@angular/material/stepper';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../../api.service';
import { AppConfirmService } from '../../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { forEach, keysIn, flatMap } from "lodash";
import { RelationshipType } from '../../../../selectList';
import { userSections } from '../../../../config';
import { SubscriptionService } from 'app/shared/services/subscription.service';
@Component({
  selector: 'app-hire-advisor-modal',
  templateUrl: './hire-advisor-modal.component.html',
  styleUrls: ['./hire-advisor-modal.component.scss']
})
export class AdminHireAdvisorComponent implements OnInit, AfterViewInit  {
  isLinear = false;
  @ViewChild('stepper') private myStepper: MatStepper;
  relationTypeList: any[] = RelationshipType;
  hireFormGroup: FormGroup;
  trusteeFormGroup: FormGroup;
  userSections = [];
  userId = localStorage.getItem("userId");
  RequestData: any;
  profileIdHiddenVal = false;
  SubHeaderName = false;
  profileId: string;
  customerId: string;
  advisorId: string;
  legacyHolderName: string;
  legacyHolderFirstName: string;
  legacyCustomerEmail: string;
  headerName = true;
  ids: string;
  updates: string;
  hireFullName:string;
  alreadyRequestSend:boolean = true;
  hideFirstStep : Boolean = true;
  row: any = [];
  defaultPermission:boolean = true;
  rows = [];
  temp = [];
  advisorlistdata = [];
  my_messages:any;
  constructor(
    private snack: MatSnackBar,public dialog: MatDialog, private fb: FormBuilder, private stepper: MatStepperModule,
    private confirmService: AppConfirmService,private loader: AppLoaderService, private router: Router, private subscriptionservice:SubscriptionService,
    private api: APIService,@Inject(MAT_DIALOG_DATA) public data: any
  ) {this.customerId = data.customerId,this.profileId = data.profileId,this.updates = data.update,this.legacyHolderName = data.legacyHolderName,this.legacyHolderFirstName = data.legacyHolderFirstName,this.legacyCustomerEmail = data.legacyCustomerEmail;}

  ngOnInit() {
    this.buildItemForm();
    this.userSections = userSections;  
    this.SubHeaderName = false;
    if(this.profileId){     
      this.checkAdvisorView();
    }   
    if(this.updates=='update'){
      this.hideFirstStep = false;
      this.defaultPermission = false;
    }
    this.my_messages = {'emptyMessage': 'No records Found'};
    this.getAdvisorsLists();
  }

  ngAfterViewInit(){ 
    if(this.profileId){
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

//function to get all events
getAdvisorsLists = (query = {}, search = false) => {
  const req_vars = {
    query: Object.assign({ userType: "advisor",status:"Active" }, query),
    fields: {},
    offset: '',
    limit: '',
    order: {"createdOn": -1},
  }
  this.api.apiRequest('post', 'deceased/advisorList', req_vars).subscribe(result => {
    if (result.status == "error") {
      console.log(result.data)
    } else {
      this.advisorlistdata = this.rows = this.temp = result.data.userList;
    }
  }, (err) => {
    console.error(err)
  })
}

  //table
  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    var columns = Object.keys(this.temp[0]);
    // Removes last "$$index" from "column"
    columns.splice(columns.length - 1);

    if (!columns.length)
      return;
    const rows = this.temp.filter(function (d) {
      for (let i = 0; i <= columns.length; i++) {
        let column = columns[i];
        if (d[column] && d[column].toString().toLowerCase().indexOf(val) > -1) {
          return true;
        }
      }
    });
    this.rows = rows;
}


checkAdvisorView(insert = null) {
  const req_vars = {
      query: Object.assign({_id:this.profileId}),
    }    
    this.loader.open();
    this.api.apiRequest('post', 'advisor/checkHireAdvisor', req_vars).subscribe(result => {
    this.loader.close();
      if(result.status == "error"){
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      } else {
        if(result.data.code=='Exist'){
          this.row = result.data.RequestData;
          let profileId = result.data.RequestData._id;   
            //if(this.updates=='update')
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
            this.trusteeFormGroup.controls['profileId'].setValue(profileId);
            if(this.row.advisorId.firstName && this.row.advisorId.lastName){
              this.hireFullName = this.row.advisorId.firstName+' '+this.row.advisorId.lastName;
            }
        }        
      }
    }, (err) => {
      console.error(err)
    })
}

trusteeFormGroupSubmit(insert = null) {
  if(this.advisorId){
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
      advisorId: this.advisorId,
      userAccess: userAccessDatas,
      filesCount: fileCnt.length,
      folderCount: userSectionsCnt.length,
      adminBy:this.userId,
      hirestatus:'Active'
    }

    let profileIds = this.trusteeFormGroup.controls['profileId'].value;
    
    if(profileIds){
        profileIds = '';
    }        

    let inviteByName = localStorage.getItem("firstName") + " " + localStorage.getItem("lastName");
    const req_vars = {
      query: Object.assign({_id:profileIds,customerId:this.customerId,advisorId:this.advisorId}),
      proquery: Object.assign(this.RequestData),
      from: Object.assign({ logId: "" }),
      extraFields: Object.assign({inviteByName:inviteByName,legacyHolderFirstName:this.legacyHolderFirstName,legacyHolderName:this.legacyHolderName,legacyCustomerEmail:this.legacyCustomerEmail})
    }
    this.loader.open();
    this.api.apiRequest('post', 'advisor/hireadvisor', req_vars).subscribe(result => {
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
  }else{
    this.snack.open('Please select any one advisor first', 'OK', { duration: 6000 })
  }
}
  
selectAdvisor(row) {
    this.advisorId = row._id;
    this.hireFullName = row.firstName+' '+row.lastName;
    if(this.advisorId){
      this.trusteeFormGroup.controls['selectAll'].setValue('never');
      this.onRadioChange('never');     
    }
    this.myStepper.next();
}
  
onChangeFormIndex(event){
  const {selectedIndex} = event;
  if(selectedIndex=='1'){
    this.headerName = false;
    this.SubHeaderName = true;
  }else{
    this.headerName = true;
    this.SubHeaderName = false;
    this.ids = '';
    this.hireFullName = '';
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

