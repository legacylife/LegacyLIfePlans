import { Component, OnInit, OnDestroy, ViewChild,HostListener } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { EssenioalIdBoxComponent } from '../essenioal-id-box/essenioal-id-box.component';
import { PersonalProfileModalComponent } from '../personal-profile-modal/personal-profile-modal.component';
import { UserAPIService } from './../../../../userapi.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { essentialsMyProfessionalsComponent } from './../../customer-home/essentials-my-professionals/essentials-my-professionals.component';
import { documentTypes } from '../../../../selectList';
import { ManageTrusteeModalComponent } from '../manage-trustee-modal/manage-trustee-modal.component';
@Component({
  selector: 'app-customer-home',
  templateUrl: './customer-essential-day-one.component.html',
  styleUrls: ['./customer-essential-day-one.component.scss'],
  animations: [egretAnimations]
})
export class CustomerEssentialDayOneComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  userId: string;
  urlData:any={};
  showProfileListing = true;
  showIdProofListing = true;
  showProfessionalsListing = true;  
  essentialProfileList:any = [];
  essentialIDList:any = [];
  essentialProfessionalList:any = [];
  showProfessionalCnt:any;
  showProfileListingCnt:any;
  trusteeProfileCnt:any;
  trusteeIdCnt:any;
  trusteeProfessionalCnt:any;
  showIDListingCnt:any;
  documentTypeList: any[] = documentTypes;
  modifiedDate:any;
  dynamicRoute:string;
  customerLegaciesId: string;
  trusteeLegaciesAction:boolean=true;  
  showTrusteeCnt:boolean=true;  
  PersonalProfileManagementSection:string='now';
  IDBoxManagementSection:string='now';
  MyProfessionalsManagementSection:string='now';
  LegacyPermissionError:string="You don't have permission of this section";
  constructor(
    private route: ActivatedRoute,
    private router: Router, private dialog: MatDialog,
    private userapi: UserAPIService, private loader: AppLoaderService
  ) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.showProfileListingCnt = 0;
    this.showIDListingCnt = 0;
    
    this.urlData = this.userapi.getURLData();
    this.customerLegaciesId = this.urlData.lastOne;
    this.dynamicRoute = this.urlData.dynamicRoute;
    this.trusteeLegaciesAction = this.urlData.trusteeLegaciesAction
   
    if (this.urlData.lastThird == "legacies") {
      this.userId = this.urlData.lastOne;
      this.userapi.getUserAccess(this.userId, (userAccess) => {
        this.PersonalProfileManagementSection = userAccess.PersonalProfileManagement 
        this.IDBoxManagementSection= userAccess.IDBoxManagement 
        this.MyProfessionalsManagementSection= userAccess.MyProfessionalsManagement 
      });
      this.showTrusteeCnt = false;
    }
    this.getEssentialProfileList();
    this.getEssentialIdList();
    this.getEssentialProfessionalList();
  }
  @HostListener('document:click', ['$event']) clickedOutside(event){
    if(event.srcElement.outerText=='Send an Invite'){
      setTimeout(()=>{
        this.getEssentialProfileList();
        this.getEssentialIdList();
        this.getEssentialProfessionalList();
      },2000);     
    }
  }

  getEssentialProfileList = (query = {}, search = false) => {
    let personalProfileQuery = {};
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status:"Active" }, query),
      personalProfileQuery: Object.assign({ customerId: this.userId,"userAccess.PersonalProfileManagement" : "now", status:"Active" }, personalProfileQuery),
      fields: {},
      offset: '',
      limit: '',
      order: {"modifiedOn": -1},
    }   
    this.loader.open(); 
    this.userapi.apiRequest('post', 'customer/essential-profile-list', req_vars).subscribe(result => {     
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.essentialProfileList = result.data.essentialList;        
        this.trusteeProfileCnt = result.data.totalTrusteeRecords;   
        if(result.data.totalRecords > 0){
          this.showProfileListingCnt = result.data.totalRecords;
          this.showProfileListing = true;
        }  
        else {
          this.showProfileListing = false;
        }      
      }      
    }, (err) => {
      console.error(err);
    })
    this.loader.close();
  }
  
  getEssentialIdList = (query = {}, search = false) => { 
    let idQuery = {};
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status:"Active" }, query),
      idQuery: Object.assign({ customerId: this.userId,"userAccess.IDBoxManagement" : "now", status:"Active" }, idQuery),
      fields: {},
      offset: '',
      limit: '',
      order: {"modifiedOn": -1},
    }
    this.loader.open(); 
    this.userapi.apiRequest('post', 'customer/essential-id-list', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.essentialIDList = result.data.essentialIDList;        
        this.trusteeIdCnt = result.data.totalTrusteeIDRecords;   
        if(result.data.totalIDRecords > 0){         
          this.showIDListingCnt = result.data.totalIDRecords;
          this.showIdProofListing = true;
        }   
        else {
          this.showIdProofListing = false;
        }    
      }      
    }, (err) => {
      console.error(err);
    })
    this.loader.close();
  }

  getEssentialProfessionalList = (query = {}, search = false) => { 
    let professionalsQuery = {};
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status:"Active" }, query),
      professionalsQuery: Object.assign({ customerId: this.userId,"userAccess.MyProfessionalsManagement" : "now", status:"Active" }, professionalsQuery),
      fields: {},
      offset: '',
      limit: '',
      order: {"modifiedOn": -1},
    }
    this.loader.open();
    this.userapi.apiRequest('post', 'customer/essential-professional-list', req_vars).subscribe(result => {
    
    if (result.status == "error") {
      console.log(result.data)
    } else {
      this.essentialProfessionalList = result.data.essentialProfessionalList;
      this.trusteeProfessionalCnt = result.data.totalTrusteeProfessionalsRecords;
      //console.log("trusteeProfessionalCnt",this.trusteeProfessionalCnt)
      if(result.data.totalProfessionalRecords > 0){         
        this.showProfessionalCnt = result.data.totalProfessionalRecords;
        this.showProfessionalsListing = true;
      } 
      else {
        this.showProfessionalsListing = false;
      }      
    }
  
  }, (err) => {
    console.error(err);
  })
  this.loader.close();
 }

 openAddIdBoxModal(data: any = {}, isNew?) {
    let title = isNew ? 'Add new member' : 'Update member';
    let dialogRef: MatDialogRef<any> = this.dialog.open(EssenioalIdBoxComponent, {
      width: '720px',
      disableClose: true,
    }) 
    dialogRef.afterClosed()
    .subscribe(res => {
      this.getEssentialIdList();
      if (!res) {
        // If user press cancel
        return;
      }
    })
 }

  openProfileModal(data: any = {}, isNew?) {
    localStorage.setItem("personalProfileAction", "added");
    let dialogRef: MatDialogRef<any> = this.dialog.open(PersonalProfileModalComponent, {
      width: '720px',
      disableClose: true,
    })
    dialogRef.afterClosed()
    .subscribe(res => {
      this.getEssentialProfileList();
      if (!res) {
        // If user press cancel
        return;
      }
    })
  }

  openProfessionalBoxModal(data: any = {}, isNew?) {
    let title = isNew ? 'Add professionals' : 'Update professionals';
    let dialogRef: MatDialogRef<any> = this.dialog.open(essentialsMyProfessionalsComponent, {
      width: '720px',
      disableClose: true,
    })
    dialogRef.afterClosed()
    .subscribe(res => {
      this.getEssentialProfessionalList();
      if (!res) {
        // If user press cancel
        return;
      }
    })
  }

  getDocType(key){
    let filteredTyes =this.documentTypeList.filter(dtype =>{
      return dtype.opt_code === key
    }).map(el => el.opt_name)[0]
    return filteredTyes
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
        if(code=='PersonalProfileManagement'){
          this.getEssentialProfileList();
        }else if(code=='IDBoxManagement'){
          this.getEssentialIdList();
        }else if(code=='MyProfessionalsManagement'){
          this.getEssentialProfessionalList();
        }
      if (!res) {
        // If user press cancel
        return;
      }
    })
   }
}