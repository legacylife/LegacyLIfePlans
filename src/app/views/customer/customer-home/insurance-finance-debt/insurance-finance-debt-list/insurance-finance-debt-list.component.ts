import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { egretAnimations } from '../../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../../userapi.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { InsuranceModalComponent } from './../insurance-modal/insurance-modal.component';
import { FinanceModalComponent } from './../finance-modal/finance-modal.component';
import { DebtModalComponent } from './../debt-modal/debt-modal.component';
import { ManageTrusteeModalComponent } from '../../manage-trustee-modal/manage-trustee-modal.component';
import { InsurancePolicyType,FinancePolicyType,DebtType } from '../../../../../selectList';
import { DataSharingService } from 'app/shared/services/data-sharing.service';
@Component({
  selector: 'app-customer-home',
  templateUrl: './insurance-finance-debt-list.component.html',
  styleUrls: ['./insurance-finance-debt-list.component.scss'],
  animations: [egretAnimations]
})
export class InsuranceFinanceDebtListComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  showInsuranceListing = true;
  showInsuranceListingCnt: any;
  showFinanceListing = true; 
  showFinanceListingCnt: any;
  showDebtListing = true;
  showDebtListingCnt: any;
  userId: string;
  insuranceListing:any = [];
  financeListing:any = [];
  debtListing:any = [];
  modifiedDate:any;
  policyTypeList:any[];
  financeTypeList:any[];
  dynamicRoute:string;
  trusteeLegaciesAction:boolean=true;
  showTrusteeCnt:boolean=true;
  urlData:any={};
  trusteeInsuranceCnt:any;
  trusteeDebtCnt:any;  
  trusteeFinanceCnt:any;
  InsuranceManagementSection:string='now';
  FinancesManagementSection:string='now';
  DebtManagementSection:string='now';
  LegacyPermissionError:string="You don't have access to this section";
  instruction_data:any;
  instruction_data_flag:boolean=false;  
  shareLegacFlag:boolean=false;  
  constructor(private route: ActivatedRoute,private router: Router, private dialog: MatDialog,private userapi: UserAPIService, private loader: AppLoaderService,private sharedata: DataSharingService) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.urlData = this.userapi.getURLData();
    this.dynamicRoute = this.urlData.dynamicRoute;
    this.trusteeLegaciesAction = this.urlData.trusteeLegaciesAction;
    if (this.urlData.lastThird == "legacies") {
      this.userId = this.urlData.lastOne;
      this.userapi.getUserAccess(this.userId, (userAccess,userDeathFilesCnt,userLockoutPeriod,userDeceased) => { 
        if(userLockoutPeriod || userDeceased){
          this.trusteeLegaciesAction = false;
        }
        this.sharedata.shareLegacyDeathfileCountData(userDeathFilesCnt);
        this.InsuranceManagementSection = userAccess.InsuranceManagement 
        this.FinancesManagementSection= userAccess.FinancesManagement 
        this.DebtManagementSection= userAccess.DebtManagement
      });
      this.showTrusteeCnt = false;      this.shareLegacFlag = true;
    }else{      
      this.userapi.getFolderInstructions('Insurance_Finance_Debt', (returnData) => {
        this.instruction_data = returnData;
        if(this.instruction_data){this.instruction_data_flag = true;}
      });
    }   
    this.getInsuranceList();
    if(this.shareLegacFlag==false){
      this.getFinanceList();
    }    
    this.getDebtList();    
  }
  @HostListener('document:click', ['$event']) clickedOutside(event){
    if(event.srcElement.textContent=='Send an Invite'){
      setTimeout(()=>{
        this.getInsuranceList();
        this.getFinanceList();
       this.getDebtList();    
      },2000);       
    }
  }

  getInsuranceList = (query = {}) => {
    let trusteeQuery = {};
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" }, query),
      trusteeQuery: Object.assign({ customerId: this.userId,"userAccess.InsuranceManagement" : "now", status:"Active" }, trusteeQuery),
      fields: {},
      order: {"createdOn": -1},
    }
    this.loader.open(); 
    this.userapi.apiRequest('post', 'insuranceFinanceDebt/insuranceListing', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.insuranceListing = result.data.insuranceList;
        if(this.shareLegacFlag){
          this.getFinanceList();
        }
        this.showInsuranceListingCnt = this.insuranceListing.length;  
        this.trusteeInsuranceCnt = result.data.totalTrusteeRecords;   
        if (this.showInsuranceListingCnt>0) {
          this.showInsuranceListing = true;
        }
        else {
          this.showInsuranceListing = false;
        }
      }
      
    }, (err) => {
      console.error(err);
    })
    this.loader.close();
  }

  openInsuranceModal() {
    let dialogRef: MatDialogRef<any> = this.dialog.open(InsuranceModalComponent, {     
      width: '720px',
      disableClose: true,
    });
    dialogRef.afterClosed()
    .subscribe(res => {
      this.getInsuranceList();
      if (!res) {
        // If user press cancel
        return;
      }
    })
  } 

  getFinanceList = (query = {}) => {
    let trusteeQuery = {};
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" }, query),
      trusteeQuery: Object.assign({ customerId: this.userId,"userAccess.FinancesManagement" : "now", status:"Active" }, trusteeQuery),
      fields: {},
      order: {"createdOn": -1},
    }
    this.loader.open(); 
    this.userapi.apiRequest('post', 'insuranceFinanceDebt/financeListing', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.financeListing = result.data.financeList;
        if(this.shareLegacFlag){
          this.creatNewObjectData()
        }
        this.showFinanceListingCnt = this.financeListing.length;  
        this.trusteeFinanceCnt = result.data.totalTrusteeRecords; 
        if (this.showFinanceListingCnt>0) {
          this.showFinanceListing = true;
        }
        else {
          this.showFinanceListing = false;
        }
      }      
    }, (err) => {
      console.error(err);
    })
    this.loader.close();
  }


  creatNewObjectData() {
    if(this.shareLegacFlag){
      let insuranceList = '';
      if(this.InsuranceManagementSection=='now'){
        insuranceList = this.insuranceListing;
      }
      let shareInsuranceList = {insuranceList: insuranceList };       
      
      let FinancesList = '';
      if(this.FinancesManagementSection=='now'){
        FinancesList = this.financeListing;
      }
      let shareFinancesList = {financesList: FinancesList };      
      let shareBothLists = Object.assign(shareInsuranceList, shareFinancesList);
      this.sharedata.shareLegacyData(shareBothLists);
    }
  }

  getDebtList = (query = {}) => {
    let trusteeQuery = {};
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" }, query),
      trusteeQuery: Object.assign({ customerId: this.userId,"userAccess.DebtManagement" : "now", status:"Active" }, trusteeQuery),
      fields: {},
      order: {"createdOn": -1},
    }
    this.loader.open(); 
    this.userapi.apiRequest('post', 'insuranceFinanceDebt/debtListing', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.debtListing = result.data.debtList;
        this.showDebtListingCnt = this.debtListing.length;  
        this.trusteeDebtCnt = result.data.totalTrusteeRecords;
        if (this.showDebtListingCnt>0) {
          this.showDebtListing = true;
        }
        else {
          this.showDebtListing = false;
        }
      }
     
    }, (err) => {
      console.error(err);
    })
    this.loader.close();
  }

  openDebtModal() {
    let dialogRef: MatDialogRef<any> = this.dialog.open(DebtModalComponent, {     
      width: '720px',
      disableClose: true,
    });
    dialogRef.afterClosed()
    .subscribe(res => {
      this.getDebtList();
      if (!res) {
        // If user press cancel
        return;
      }
    })
  }


  openFinanceModal() {
    let dialogRef: MatDialogRef<any> = this.dialog.open(FinanceModalComponent, {     
      width: '720px',
      disableClose: true,
    });
    dialogRef.afterClosed()
    .subscribe(res => {
      this.getFinanceList();
      if (!res) {
        // If user press cancel
        return;
      }
    })
  }

  getType(key,folderName) {
      if(folderName=='insurance'){
        this.policyTypeList = InsurancePolicyType;
      }else if(folderName=='finance'){
        this.policyTypeList = FinancePolicyType;
      }else if(folderName=='debts'){
        this.policyTypeList = DebtType;
      }     

      let filteredTyes = this.policyTypeList.filter(dtype => {
        return dtype.opt_code === key
      }).map(el => el.opt_name)[0];
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
        if(code=='InsuranceManagement'){
          this.getInsuranceList();
        }else if(code=='FinancesManagement'){
          this.getFinanceList();
        }else if(code=='DebtManagement'){
          this.getDebtList();
        }
      if (!res) {
        // If user press cancel
        return;
      }
    })
   }

 
}