import { Component, OnInit, HostListener } from '@angular/core';
import { MatDialogRef,MatDialog, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms'
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { UserAPIService } from 'app/userapi.service';
import { RelationshipType } from '../../../../selectList';
import { ManageTrusteeModalComponent } from '../manage-trustee-modal/manage-trustee-modal.component';
import { DataSharingService } from 'app/shared/services/data-sharing.service';
import { AsYouType } from 'libphonenumber-js'
@Component({
  selector: 'app-emergency-contacts',
  templateUrl: './emergency-contacts.component.html',
  styleUrls: ['./emergency-contacts.component.scss']
})
export class EmergencyContactsComponent implements OnInit {
  closeResult: string
  modalRef: any = null
  eContactFormGroup: FormGroup;
  showContactListing = true;
  showContactCnt: string;
  userId: string
  relationshipList: any[]
  eContactList: any = []
  updateContact: any = []
  selectedProfileId: string;
  dynamicRoute:string;
  trusteeLegaciesAction:boolean=true;
  showTrusteeCntboolean=true;
  showTrusteeCnt:boolean=true;
  urlData:any={};
  customerLegaciesId: string;
  customerLegacyType:string='customer';	
  emergencyContactsManagementSection:string='now';
  LegacyPermissionError:string="You don't have access to this section";
  instruction_data:any;
  instruction_data_flag:boolean=false;  

  toUserId:string = ''
  subFolderName:string = 'Contacts'

  constructor(private route: ActivatedRoute,
    private snack: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private loader: AppLoaderService,
    private userapi: UserAPIService,
    private sharedata: DataSharingService) {
  }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.relationshipList = RelationshipType;
    this.eContactFormGroup = this.fb.group({
      name: new FormControl('', Validators.required),
      relationship: new FormControl('',Validators.required),
      address: new FormControl(''),
      phone: new FormControl('',[Validators.pattern(/^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]*$/),Validators.minLength(10)]),
      mobile: new FormControl('',[Validators.pattern(/^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]*$/),Validators.minLength(10)]),
      emailAddress: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i)]),
      profileId: new FormControl('')
    });

    this.urlData = this.userapi.getURLData();
    this.selectedProfileId = this.urlData.lastOne;
    this.dynamicRoute = this.urlData.dynamicRoute;
    this.trusteeLegaciesAction = this.urlData.trusteeLegaciesAction

    if (this.selectedProfileId && this.selectedProfileId == 'emergency-contacts' && this.urlData.lastThird != "legacies") {
      this.selectedProfileId = "";
    }     
     
   
    if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'emergency-contacts') {
        this.customerLegaciesId = this.userId;
        this.customerLegacyType =  this.urlData.userType;
        this.userId = this.urlData.lastOne;          
        this.selectedProfileId = "";
        
        this.userapi.getUserAccess(this.userId, (userAccess,userDeathFilesCnt,userLockoutPeriod,userDeceased) => { 
          if(userLockoutPeriod || userDeceased){
            this.trusteeLegaciesAction = false;
          }
          this.sharedata.shareLegacyDeathfileCountData(userDeathFilesCnt);
          this.emergencyContactsManagementSection = userAccess.emergencyContactsManagement 
          if(userAccess.emergencyContactsManagement!='now'){        
            this.trusteeLegaciesAction = false;
          }   
        }); 
        this.showTrusteeCnt = false;
      }else{      
        this.userapi.getFolderInstructions('emergency_contacts', (returnData) => {
          this.instruction_data = returnData;
          if(this.instruction_data){this.instruction_data_flag = true;}
        });
      }    
      this.toUserId = this.userId
    this.getEmergencyContacts()
  }
  @HostListener('document:click', ['$event']) clickedOutside(event){
    if(event.srcElement.textContent=='Send an Invite'){
      this.getEmergencyContacts();
    }
  }
  openModal(content: any = {}, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(content, {
      width: '720px',
      disableClose: true,
    })
    dialogRef.afterClosed()
      .subscribe(res => {
        this.getEmergencyContacts();
        if (!res) {
          // If user press cancel
          return;
        }
    })
  }

  eContactFormSubmit(profileInData = null) {
    var query = {};
    var proquery = {};     
    let profileIds = this.eContactFormGroup.controls['profileId'].value;
      if(profileIds){
        this.selectedProfileId = profileIds;
      }

    if (this.urlData.lastThird == "legacies" && this.urlData.lastTwo == 'emergency-contacts') {
      profileInData.customerLegacyId = this.customerLegaciesId
      profileInData.customerLegacyType = this.customerLegacyType
    }
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId  }),
      proquery: Object.assign(profileInData),   
      from: Object.assign({ customerId: this.userId }) ,
      fromId:localStorage.getItem('endUserId'),
      toId:this.toUserId,
      folderName:'Emergency Contacts',
      subFolderName:this.subFolderName
    }
    
    this.loader.open();     
    this.userapi.apiRequest('post', 'customer/emergency-contacts', req_vars).subscribe(result => {
     this.loader.close();
      if (result.status == "error") {
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      } else {
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
        this.eContactFormGroup.reset();
        this.dialog.closeAll(); 
      }
    }, (err) => {
      console.error(err)
    })
  }

  getEmergencyContacts() {
    let trusteeQuery = {};
    const params = {
      query: Object.assign({"customerId": this.userId,"status":"Active"}),
      trusteeQuery: Object.assign({ customerId: this.userId,"userAccess.emergencyContactsManagement" : "now", status:"Active" }, trusteeQuery),
      order: {"createdOn": -1},
    }
    this.userapi.apiRequest('post', 'customer/get-emergency-contacts', params).subscribe(result => {    
      if (result.data.eContactsList.length > 0) {
        this.showContactListing = true;
        this.eContactList = result.data.eContactsList;
        this.showContactCnt = result.data.totalTrusteeRecords;
      }
      else {
        this.showContactListing = false;
      }
    })
  }  
  
  getType(key) {
    this.relationshipList = RelationshipType;
    let filteredTyes = this.relationshipList.filter(dtype => {
      return dtype.opt_code === key
    }).map(el => el.opt_name)[0]
    return filteredTyes
  }

  firstCapitalize(e) {
    let re = /(^|[.!?]\s+)([a-z])/g;
    var textBox: HTMLInputElement = <HTMLInputElement>e.target;
    textBox.value = textBox.value.replace(re, (m, $1, $2) => $1 + $2.toUpperCase());
  }  

  checkSpecialChar(event)
  {
    var key;  
    key = event.charCode;
    return((key > 64 && key < 91) || (key> 96 && key < 123) || key == 8 || key == 32 || (key >= 48 && key <= 57)); 
  }

  onlyNumbers(event)
  {  
    if ((event.which != 46 ) && (event.which < 48 || event.which > 57)) {
      event.preventDefault();
    }
  }

  openManageTrusteeModal(title,code,isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(ManageTrusteeModalComponent, {
      width: '720px',
      disableClose: true, 
      data: {
        title: title,
        code:code
      }
    }) 
    dialogRef.afterClosed()
    .subscribe(res => {
      this.getEmergencyContacts();
      if (!res) {
        // If user press cancel
        return;
      }
    })
   }

   
  checkPhoneNumber(from,event)
  {  
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }else{
      const AsouType = new AsYouType('US');
      let phoneNumber = AsouType.input(this.eContactFormGroup.controls[from].value);
      this.eContactFormGroup.controls[from].setValue(phoneNumber);
    }
  }
   
}
