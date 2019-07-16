import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { egretAnimations } from '../../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../../userapi.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { InsuranceModalComponent } from './../insurance-modal/insurance-modal.component';
import { FinanceModalComponent } from './../finance-modal/finance-modal.component';
import { DebtModalComponent } from './../debt-modal/debt-modal.component';

import { InsurancePolicyType,FinancePolicyType,DebtType } from '../../../../../selectList';
@Component({
  selector: 'app-customer-home',
  templateUrl: './insurance-finance-debt-list.component.html',
  styleUrls: ['./insurance-finance-debt-list.component.scss'],
  animations: [egretAnimations]
})
export class InsuranceFinanceDebtListComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  showInsuranceListing = false;
  showInsuranceListingCnt: any;
  showFinanceListing = false;
  showFinanceListingCnt: any;
  showDebtListing = false;
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
  urlData:any={};

  constructor(private route: ActivatedRoute,private router: Router, private dialog: MatDialog,private userapi: UserAPIService, private loader: AppLoaderService) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.urlData = this.userapi.getURLData();
    this.dynamicRoute = this.urlData.dynamicRoute;
    this.trusteeLegaciesAction = this.urlData.trusteeLegaciesAction;
    if (this.urlData.lastThird == "legacies") {
      this.userId = this.urlData.lastOne;
    }
    this.getInsuranceList();
    this.getFinanceList();
    this.getDebtList();    
  }

  getInsuranceList = (query = {}) => {
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" }, query),
      fields: {},
      order: {"createdOn": -1},
    }
    this.userapi.apiRequest('post', 'insuranceFinanceDebt/insuranceListing', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.insuranceListing = result.data.insuranceList;
        this.showInsuranceListingCnt = this.insuranceListing.length;  
        if (this.showInsuranceListingCnt>0) {
          this.showInsuranceListing = true;
        }
      }
    }, (err) => {
      console.error(err);
    })
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
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" }, query),
      fields: {},
      order: {"createdOn": -1},
    }
    this.userapi.apiRequest('post', 'insuranceFinanceDebt/financeListing', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.financeListing = result.data.financeList;
        this.showFinanceListingCnt = this.financeListing.length;  
        if (this.showFinanceListingCnt>0) {
          this.showFinanceListing = true;
        }
      }
    }, (err) => {
      console.error(err);
    })
  }

  getDebtList = (query = {}) => {
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" }, query),
      fields: {},
      order: {"createdOn": -1},
    }
    this.userapi.apiRequest('post', 'insuranceFinanceDebt/debtListing', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.debtListing = result.data.debtList;
        this.showDebtListingCnt = this.debtListing.length;  
        if (this.showDebtListingCnt>0) {
          this.showDebtListing = true;
        }
      }
    }, (err) => {
      console.error(err);
    })
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


 
}