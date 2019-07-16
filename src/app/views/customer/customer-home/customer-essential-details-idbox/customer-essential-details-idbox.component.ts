import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Product } from '../../../../shared/models/product.model';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { Router } from '@angular/router';
import { UserAPIService } from './../../../../userapi.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { AppConfirmService } from '../../../../shared/services/app-confirm/app-confirm.service';
import { documentTypes } from '../../../../selectList';
import { EssenioalIdBoxComponent } from './../essenioal-id-box/essenioal-id-box.component';
import {  s3Details } from '../../../../config';

@Component({
  selector: 'app-customer-home',
  templateUrl: './customer-essential-details-idbox.component.html',
  styleUrls: ['./customer-essential-details-idbox.component.scss'],
  animations: [egretAnimations]
})
export class CustomerEssentialDetailsIdboxComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  userId: string;
  selectedProfileId: string = "";
  row: any;
  docPath: string;
  documentTypeList: any[] = documentTypes;
  constructor(  
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog, private confirmService: AppConfirmService,
    private userapi: UserAPIService, private loader: AppLoaderService, private snack: MatSnackBar, private router: Router
  ) { }
  
  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    const filePath = this.userId+'/'+s3Details.myEssentialsDocumentsPath;
    this.docPath = filePath;
    const locationArray = location.href.split('/')
    this.selectedProfileId = locationArray[locationArray.length - 1];
    this.getEssentialIDDetails();
  }

  //function to get all events
  getEssentialIDDetails = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId }, query)
    }
    this.userapi.apiRequest('post', 'customer/view-id-details', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.row = result.data;
      }
    }, (err) => {
      console.error(err)
    })
  }

  openIdBoxModal(data: any = {}, isNew?) {
    console.log('asd')
    let dialogRef: MatDialogRef<any> = this.dialog.open(EssenioalIdBoxComponent, {
      width: '720px',
      disableClose: true,
    })
    dialogRef.afterClosed()
      .subscribe(res => {
        this.getEssentialIDDetails();
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }

  deleteIdProofRecord() {
    var statMsg = "Are you sure you want to delete ID Box?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          var query = {};
          const req_vars = {
            query: Object.assign({ _id: this.selectedProfileId }, query)
          }
          this.userapi.apiRequest('post', 'customer/delete-id-box', req_vars).subscribe(result => {
            if (result.status == "error") {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {
              this.loader.close();
              this.router.navigate(['/', 'customer', 'dashboard', 'essential-day-one'])
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            }
          }, (err) => {
            console.error(err)
            this.loader.close();
          })
        }
      })
  }

  getDocType(key){
    let filteredTyes =this.documentTypeList.filter(dtype =>{
      return dtype.opt_code === key
    }).map(el => el.opt_name)[0]
    return filteredTyes
  }

  downloadDocs() {
   var query = {};
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId }, query)
    }
    console.log(" > >>> >>> >> ",req_vars);
    this.userapi.apiRequest('post', 'documents/downloadDocs', req_vars).subscribe(result => {
  
      if (result.status == "error") {
        this.loader.close();
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      } else {
        this.loader.close();
        this.router.navigate(['/', 'customer', 'dashboard', 'essential-day-one'])
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }
    }, (err) => {
      console.error(err)
      this.loader.close();
    })
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
}