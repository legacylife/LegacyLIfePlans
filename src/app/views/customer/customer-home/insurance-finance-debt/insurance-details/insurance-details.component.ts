import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms'
import { egretAnimations } from '../../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../../userapi.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { AppConfirmService } from '../../../../../shared/services/app-confirm/app-confirm.service';
import { InsuranceModalComponent } from './../insurance-modal/insurance-modal.component';
import { InsurancePolicyType } from '../../../../../selectList';  
import { s3Details } from '../../../../../config';
@Component({
  selector: 'app-customer-home',
  templateUrl: './insurance-details.component.html',
  styleUrls: ['./insurance-details.component.scss'],
  animations: [egretAnimations]
})
export class InsuranceDetailsComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;

  userId: string;
  docPath: string;
  selectedProfileId: string = "";
  row: any;
  policyTypeList:any[];
  re =  "/(?:\.([^.]+))?$/" ;
  constructor( // private shopService: ShopService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar, private dialog: MatDialog, private confirmService: AppConfirmService,
    private userapi: UserAPIService, private loader: AppLoaderService, private snack: MatSnackBar, private router: Router
  ) { }

  ngOnInit() {  
    this.userId = localStorage.getItem("endUserId");
    const filePath = this.userId+'/'+s3Details.insuranceFilePath;
    this.docPath = filePath;
    const locationArray = location.href.split('/')
    this.selectedProfileId = locationArray[locationArray.length - 1];
    this.getInsuranceView();
  }

  //function to get all events
  getInsuranceView = (query = {}, search = false) => {
    let profileIds = '';
    let req_vars = {}
    if (this.selectedProfileId) {
      profileIds = this.selectedProfileId;
      req_vars = {
        query: Object.assign({ _id: profileIds })
      }
    }
    this.userapi.apiRequest('post', 'insuranceFinanceDebt/view-insurance-details', req_vars).subscribe(result => {     
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if (result.data) {
          this.row = result.data;
        }
      }  
    }, (err) => {
      console.error(err);
    })
  }

  openInsuranceModal(FolderNames, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(InsuranceModalComponent, {
      width: '720px',
      disableClose: true,
    })
    dialogRef.afterClosed()
      .subscribe(res => {
        this.getInsuranceView();
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }

  deleteInsurance() {
    var statMsg = "Are you sure you want to delete insurance details?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          var query = {};
          const req_vars = {
            query: Object.assign({ _id: this.selectedProfileId }, query)
          }
          this.userapi.apiRequest('post', 'insuranceFinanceDebt/delete-insurance', req_vars).subscribe(result => {
            if (result.status == "error") {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {
              this.loader.close();
              this.router.navigate(['/', 'customer', 'dashboard', 'insurance-finance-debt'])
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
    this.policyTypeList = InsurancePolicyType;
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
    window.open(window.URL.createObjectURL(res));
    let filePath = s3Details.url+'/'+this.docPath+filename;
    var link=document.createElement('a');
    link.href = filePath;
    link.download = filePath.substr(filePath.lastIndexOf('/') + 1);
    link.click();
  });
}

}
