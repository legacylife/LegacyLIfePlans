import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms'
import { egretAnimations } from '../../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../../userapi.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { AppConfirmService } from '../../../../../shared/services/app-confirm/app-confirm.service';
import { FinanceModalComponent } from './../finance-modal/finance-modal.component';
import { FinancePolicyType } from '../../../../../selectList';  
import { s3Details } from '../../../../../config';

@Component({
  selector: 'app-customer-home',
  templateUrl: './finance-details.component.html',
  styleUrls: ['./finance-details.component.scss'],
  animations: [egretAnimations]
})
export class FinanceDetailsComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;

  userId: string;
  docPath: string;
  selectedProfileId: string = "";
  row: any;
  policyTypeList:any[];
  re =  "/(?:\.([^.]+))?$/" ;
  urlData:any={};
  trusteeLegaciesAction:boolean=true;
  constructor( // private shopService: ShopService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar, private dialog: MatDialog, private confirmService: AppConfirmService,
    private userapi: UserAPIService, private loader: AppLoaderService, private snack: MatSnackBar, private router: Router
  ) { }

  ngOnInit() {  
    this.userId = localStorage.getItem("endUserId");
    const filePath = this.userId+'/'+s3Details.financeFilePath;
    this.docPath = filePath;
    this.urlData = this.userapi.getURLData();
    this.trusteeLegaciesAction = this.urlData.trusteeLegaciesAction
    this.selectedProfileId = this.urlData.lastOne;
    this.getfinanceView();
  }

  //function to get all events
  getfinanceView = (query = {}, search = false) => {
    let profileIds = '';
    let req_vars = {}
    if (this.selectedProfileId) {
      profileIds = this.selectedProfileId;
      req_vars = {
        query: Object.assign({ _id: profileIds })
      }
    }
    this.userapi.apiRequest('post', 'insuranceFinanceDebt/view-finance-details', req_vars).subscribe(result => {     
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if (result.data) {
          if(this.urlData.userType == 'advisor' && !result.data.customerLegacyType){
            this.trusteeLegaciesAction = false;
          }
          this.row = result.data;
        }
      }  
    }, (err) => {
      console.error(err);
    })
  }

  openFinanceModal() {
    let dialogRef: MatDialogRef<any> = this.dialog.open(FinanceModalComponent, {
      width: '720px',
      disableClose: true,
    })
    dialogRef.afterClosed()
      .subscribe(res => {
        this.getfinanceView();
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }

  deleteFinance(customerId='') {
    var statMsg = "Are you sure you want to delete finance details?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          var query = {};
          const req_vars = {
            query: Object.assign({ _id: this.selectedProfileId }, query)
          }
          this.userapi.apiRequest('post', 'insuranceFinanceDebt/delete-finances', req_vars).subscribe(result => {
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
    this.policyTypeList = FinancePolicyType;
    let filteredTyes = this.policyTypeList.filter(dtype => {
      return dtype.opt_code === key
    }).map(el => el.opt_name)[0]
    return filteredTyes
}

downloadFile = (filename) => {    
  let query = {};
  let req_vars = {
    query: Object.assign({ docPath: this.docPath, filename: filename }, query)
  }
  this.userapi.download('documents/downloadDocument', req_vars).subscribe(res => {
    var downloadURL =window.URL.createObjectURL(res)
    let filePath = downloadURL;
    var link=document.createElement('a');
    link.href = filePath;
    link.download = filePath.substr(filePath.lastIndexOf('/') + 1);
    link.click();
  });
}

DownloadZip = () => {      
  let query = {};
  let req_vars = {
    query: Object.assign({ _id: this.selectedProfileId, docPath: this.docPath,downloadFileName:s3Details.financeFilePath,AllDocuments:this.row.documents }, query)
  }
  this.userapi.download('documents/downloadZip', req_vars).subscribe(res => {
    var downloadURL =window.URL.createObjectURL(res)
    let filePath = downloadURL;
    var link=document.createElement('a');
    link.href = filePath;
    link.download = filePath.substr(filePath.lastIndexOf('/') + 1);
    link.click();
  });
}
}
