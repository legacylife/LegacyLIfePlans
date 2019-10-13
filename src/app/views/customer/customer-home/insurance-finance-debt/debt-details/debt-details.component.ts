import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms'
import { egretAnimations } from '../../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../../userapi.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { AppConfirmService } from '../../../../../shared/services/app-confirm/app-confirm.service';
import { DebtModalComponent } from './../debt-modal/debt-modal.component';
import { DebtType } from '../../../../../selectList';  
import { s3Details } from '../../../../../config';

@Component({
  selector: 'app-customer-home',
  templateUrl: './debt-details.component.html',
  styleUrls: ['./debt-details.component.scss'],
  animations: [egretAnimations]
})
export class DebtDetailsComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;

  userId: string;
  docPath: string;
  selectedProfileId: string = "";
  row: any;
  policyTypeList:any[];
  re =  "/(?:\.([^.]+))?$/" ;
  trusteeLegaciesAction:boolean=true;
  LegacyPermissionError:string="You don't have access to this section";
  urlData:any={};
  constructor( // private shopService: ShopService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar, private dialog: MatDialog, private confirmService: AppConfirmService,
    private userapi: UserAPIService, private loader: AppLoaderService, private snack: MatSnackBar, private router: Router
  ) { }

  ngOnInit() {  
    this.userId = localStorage.getItem("endUserId");
    const filePath = this.userId+'/'+s3Details.debtFilePath;
    this.docPath = filePath;
    this.urlData = this.userapi.getURLData();
    this.selectedProfileId = this.urlData.lastOne;
    this.trusteeLegaciesAction = this.urlData.trusteeLegaciesAction
    this.getdebtView();
  }

  //function to get all events
  getdebtView = (query = {}, search = false) => {
    let profileIds = '';
    let req_vars = {}
    if (this.selectedProfileId) {
      profileIds = this.selectedProfileId;
      req_vars = {
        query: Object.assign({ _id: profileIds })
      }
    }
    this.userapi.apiRequest('post', 'insuranceFinanceDebt/view-debt-details', req_vars).subscribe(result => {     
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if (result.data) {
          if(this.urlData.userType == 'advisor' && !result.data.customerLegacyType){
            this.trusteeLegaciesAction = false;
          }
          this.row = result.data;
          if(this.row){
            this.docPath = this.row.customerId+'/'+s3Details.debtFilePath;
            this.customerisValid(this.row);
          }
        }
      }  
    }, (err) => {
      console.error(err);
    })
  }

  customerisValid(data){
    if (this.urlData.lastThird == "legacies") {
      this.userapi.getUserAccess(data.customerId,(userAccess,userDeathFilesCnt,userLockoutPeriod,userDeceased) => { 
        if(userLockoutPeriod || userDeceased){
          this.trusteeLegaciesAction = false;
        }
       if(userAccess.DebtManagement!='now'){
        this.snack.open(this.LegacyPermissionError, 'OK', { duration: 4000 })
        this.router.navigateByUrl('/'+localStorage.getItem("endUserType")+'/dashboard');
       }          
      });    
    }else{      
      if(data.customerId!=this.userId){
        this.snack.open(this.LegacyPermissionError, 'OK', { duration: 4000 })
        this.router.navigateByUrl('/'+localStorage.getItem("endUserType")+'/dashboard');
      }
    } 
  }

  openDebtModal() {
    let dialogRef: MatDialogRef<any> = this.dialog.open(DebtModalComponent, {
      width: '720px',
      disableClose: true,
    })
    dialogRef.afterClosed()
      .subscribe(res => {
        this.getdebtView();
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }

  deleteDebt(customerId='') {
    var statMsg = "Are you sure you want to delete debt details?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          var query = {};
          const req_vars = {
            query: Object.assign({ _id: this.selectedProfileId }, query)
          }
          this.userapi.apiRequest('post', 'insuranceFinanceDebt/delete-debt', req_vars).subscribe(result => {
            if (result.status == "error") {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {
              this.loader.close();
              if(this.urlData.userType == 'advisor'){
                this.router.navigate(['/', 'advisor', 'legacies', 'insurance-finance-debt', customerId])
              }else{
                this.router.navigate(['/', 'customer', 'dashboard', 'insurance-finance-debt'])
              }
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            }
          }, (err) => {
            console.error(err)
            this.loader.close();
          })
        }
      })
  }

  getType(key) {
    this.policyTypeList = DebtType;
    let filteredTyes = this.policyTypeList.filter(dtype => {
      return dtype.opt_code === key
    }).map(el => el.opt_name)[0]
    return filteredTyes
}

}
