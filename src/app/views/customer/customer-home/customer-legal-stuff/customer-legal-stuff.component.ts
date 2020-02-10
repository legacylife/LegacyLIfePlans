import { Component, OnInit, OnDestroy, ViewChild,HostListener } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { UserAPIService } from './../../../../userapi.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { legalStuffModalComponent } from '../legal-stuff-modal/legal-stuff-modal.component';
import { EstateTypeOfDocument,HealthcareTypeOfDocument,PersonalAffairsTypeOfDocument } from '../../../../selectList';
import { ManageTrusteeModalComponent } from '../manage-trustee-modal/manage-trustee-modal.component';
import { DataSharingService } from 'app/shared/services/data-sharing.service';
import { forEach } from "lodash";
@Component({
  selector: 'app-customer-legal-stuff',
  templateUrl: './customer-legal-stuff.component.html',
  styleUrls: ['./customer-legal-stuff.component.scss'],
  animations: [egretAnimations]
})
export class CustomerLegalStuffComponent implements OnInit {
  showEstateListingCnt: any;
  showEstateListing = true;
  showaffairsListingCnt: any;
  showaffairsListing = true;
  showhealthcareListingCnt: any;
  showhealthcareListing = true;
  estateList: any = [];
  healthcareList: any = [];
  affairsList: any = [];
  legaStuffList: any = [];
  selectedProfileId:string = "";
  typeOfDocumentList: any[];
  userId: string;
  trusteeEstateCnt: any;  trusteeHealthcareCnt: any;  trusteePrAffCnt: any;
  urlData:any={};
  dynamicRoute:string;
  trusteeLegaciesAction:boolean=true;
  customerLegaciesId: string;
  customerLegacyType:string='customer';					
  showTrusteeCnt:boolean=true;
  EstateManagementSection:string='now';
  HealthcareManagementSection:string='now';
  PersonalAffairsManagementSection:string='now';
  LegacyPermissionError:string="You don't have access to this section";
  instruction_data:any;
  instruction_data_flag:boolean=false;  
  shareLegacFlag:boolean=false;  
  isProUser = false;
  isFreeProuser = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router, private dialog: MatDialog,
    private userapi: UserAPIService, private loader: AppLoaderService,private sharedata: DataSharingService
  ) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.showEstateListingCnt = 0;    
    this.urlData = this.userapi.getURLData();
    this.dynamicRoute = this.urlData.dynamicRoute;
    this.trusteeLegaciesAction = this.urlData.trusteeLegaciesAction
    
    if (this.urlData.lastThird == "legacies") {
      this.userId = this.urlData.lastOne;
      this.userapi.getUserAccess(this.userId, (userAccess,userDeathFilesCnt,userLockoutPeriod,userDeceased) => { 
        if(userLockoutPeriod || userDeceased){
          this.trusteeLegaciesAction = false;
        }
        this.sharedata.shareLegacyDeathfileCountData(userDeathFilesCnt);
        this.EstateManagementSection = userAccess.EstateManagement 
        this.HealthcareManagementSection= userAccess.HealthcareManagement
        this.PersonalAffairsManagementSection= userAccess.PersonalAffairsManagement
      });
      this.showTrusteeCnt = false;
      this.shareLegacFlag = true;
      //this.clearMessages();
    }else{      
      this.isProUser = localStorage.getItem('endUserProSubscription') && localStorage.getItem('endUserProSubscription') == 'yes' ? true : false
      this.isFreeProuser = localStorage.getItem('endUserProFreeSubscription') && localStorage.getItem('endUserProFreeSubscription') == 'yes' ? true : false
      if (!this.isProUser && !this.isFreeProuser) {
        this.router.navigate(['/', 'customer', 'dashboard']);
      }
      this.userapi.getFolderInstructions('legal_stuff', (returnData) => {
        this.instruction_data = returnData;
        if(this.instruction_data){this.instruction_data_flag = true;}
      });
    } 
    this.getEstateList();
  }
  @HostListener('document:click', ['$event']) clickedOutside(event){
    if(event.srcElement.textContent=='Send an Invite'){
      setTimeout(()=>{
        this.getEstateList();
      },2000);     
    }   
  }

  getEstateList = (query = {}) => {    
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" }, query),      
      fields: {},
      order: {"createdOn": -1},
    }

    this.userapi.apiRequest('post', 'customer/legal-estate-list', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.legaStuffList = result.data.legalList;
        this.estateList = this.legaStuffList.filter(dtype => {
          return dtype.subFolderName == 'Estate'
        }).map(el => el)
        
        this.showEstateListingCnt = this.estateList.length
        if (this.showEstateListingCnt > 0) {
          this.showEstateListing = true;
        }
        else {
          this.showEstateListing = false;
        }

        this.healthcareList = this.legaStuffList.filter(dtype => {
          return dtype.subFolderName == 'Healthcare'
        }).map(el => el)
        this.showhealthcareListingCnt = this.healthcareList.length;

        if (this.showhealthcareListingCnt > 0) {
          this.showhealthcareListing = true;
        }
        else {
          this.showhealthcareListing = false;
        }

        this.affairsList = this.legaStuffList.filter(dtype => {
          return dtype.subFolderName == 'Personal Affairs'
        }).map(el => el)
        this.showaffairsListingCnt = this.affairsList.length;

        if(this.shareLegacFlag){
          let estateList = '';let healthcareList = '';let affairsList = '';
          if(this.EstateManagementSection=='now'){
           estateList = this.estateList;
          }
          if(this.HealthcareManagementSection=='now'){
            healthcareList = this.healthcareList;
          }
          if(this.PersonalAffairsManagementSection=='now'){
            affairsList = this.affairsList;
          }
          let shareLegalStuff = {legalStuffEstate: estateList ,legalStuffHealthcare: healthcareList,legalStuffAffairs: affairsList };        
          this.sharedata.shareLegacyData(shareLegalStuff);
        }
     
        this.trusteeEstateCnt = result.data.totalEstateTrusteeRecords;
        this.trusteeHealthcareCnt = result.data.totalHealthTrusteeRecords
        this.trusteePrAffCnt = result.data.totalPerAffTrusteeRecords;

        if (this.showaffairsListingCnt > 0) {
          this.showaffairsListing = true;
        }
        else {
          this.showaffairsListing = false;
        }
      }
    }, (err) => {
      console.error(err);
    })
  }

  openLegalStuffModal(FolderName, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(legalStuffModalComponent, {
      data: {
        FolderName: FolderName,
      },
      width: '720px',
      disableClose: true,
    });
    dialogRef.afterClosed()
    .subscribe(res => {
      this.getEstateList();
      if (!res) {
        // If user press cancel
        return;
      }
    })
  }

  getType(key, folderName) {
    if (folderName) {
      if(folderName=='Estate'){
        this.typeOfDocumentList = EstateTypeOfDocument;
      }else if(folderName=='Healthcare'){
        this.typeOfDocumentList = HealthcareTypeOfDocument;
      }else if(folderName=='Personal Affairs'){
        this.typeOfDocumentList = PersonalAffairsTypeOfDocument;      
      }    

      let filteredTyes = this.typeOfDocumentList.filter(dtype => {
        return dtype.opt_code === key
      }).map(el => el.opt_name)[0]
      return filteredTyes
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
           this.getEstateList();
          if (!res) {
            // If user press cancel
            return;
          }
        })
   }
    
   clearMessages(): void {
    this.sharedata.clearData();
  }

}
