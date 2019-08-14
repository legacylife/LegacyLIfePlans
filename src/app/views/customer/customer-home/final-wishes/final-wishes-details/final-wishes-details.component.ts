import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms'
import { egretAnimations } from '../../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../../userapi.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { AppConfirmService } from '../../../../../shared/services/app-confirm/app-confirm.service';
import { FinalWishesFormModalComponent } from './../final-wishes-form-modal/final-wishes-form-modal.component';
import { s3Details } from '../../../../../config';
@Component({
  selector: 'app-customer-home',
  templateUrl: './final-wishes-details.component.html',
  styleUrls: ['./final-wishes-details.component.scss'],
  animations: [egretAnimations]
})
export class FinalWishesDetailsComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  userId: string;
  selectedProfileId: string = "";
  row: any;
  docPath: string;
  re =  "/(?:\.([^.]+))?$/" ;
  trusteeLegaciesAction:boolean=true;
  urlData:any={};
  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar, private dialog: MatDialog, private confirmService: AppConfirmService,
    private userapi: UserAPIService, private loader: AppLoaderService, private snack: MatSnackBar, private router: Router
  ) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    const filePath = this.userId+'/'+s3Details.finalWishesFilePath;
    this.docPath = filePath;
    this.urlData = this.userapi.getURLData();
    this.selectedProfileId = this.urlData.lastOne;
    this.trusteeLegaciesAction = this.urlData.trusteeLegaciesAction
    this.getFinalWishView();
  }
  //function to get all events
  getFinalWishView = (query = {}, search = false) => {
    let profileIds = '';
    let req_vars = {}
    if (this.selectedProfileId) {
      profileIds = this.selectedProfileId;
      req_vars = {
        query: Object.assign({ _id: profileIds })
      }
    }
    this.userapi.apiRequest('post', 'finalWish/view-wish-details', req_vars).subscribe(result => {     
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if (result.data) {
          if(this.urlData.userType == 'advisor' && !result.data.customerLegacyType){
            this.trusteeLegaciesAction = false;
          }          
          this.row = result.data;
          if(this.row){
            this.docPath = this.row.customerId+'/'+s3Details.finalWishesFilePath;
          }
        }
      }  
    }, (err) => {
      console.error(err);
    })
  }

  openFinalWishModal(FolderNames, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(FinalWishesFormModalComponent, {
      data: {
        FolderName: FolderNames,
        newName: FolderNames,
      },
      width: '720px',
      disableClose: true,
    })
    dialogRef.afterClosed()
      .subscribe(res => {
        this.getFinalWishView();
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }

  deleteFinalWish(FolderNames, customerId='') {
    let folder = "";
    if(FolderNames == 'Funeral Plans'){ folder = 'funeral plan details'}
    if(FolderNames == 'Obituary'){ folder = 'obituary details'}
    if(FolderNames == 'Celebration of Life'){ folder = 'celebration of life details'}
    var statMsg = "Are you sure you want to delete "+folder+"?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          var query = {};
          const req_vars = {
            query: Object.assign({ _id: this.selectedProfileId }, query)
          }
          this.userapi.apiRequest('post', 'finalWish/delete-finalWish', req_vars).subscribe(result => {
            if (result.status == "error") {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {
              this.loader.close();
              if(this.urlData.userType == 'advisor'){
                this.router.navigate(['/', 'advisor', 'legacies', 'final-wishes', customerId])
              }else{
                this.router.navigate(['/', 'customer', 'dashboard', 'final-wishes'])
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

  downloadFile = (filename) => {    
    let query = {};
    let req_vars = {
      query: Object.assign({ docPath: this.docPath, filename: filename }, query)
    }
    this.snack.open("Downloading file is in process, Please wait some time!", 'OK');
    this.userapi.download('documents/downloadDocument', req_vars).subscribe(res => {
      var newBlob = new Blob([res])
      var downloadURL = window.URL.createObjectURL(newBlob);
      let filePath = downloadURL;
      var link=document.createElement('a');
      link.href = filePath;
      link.download = filename;
      document.body.appendChild(link);
      link.click(); 
      this.snack.dismiss();
    });
  }

  DownloadZip = () => {      
    let query = {};
    var ZipName = "final-wishes-"+Math.floor(Math.random() * Math.floor(999999999999999))+".zip"; 
    let req_vars = {
      query: Object.assign({ _id: this.selectedProfileId, docPath: this.docPath,downloadFileName:ZipName,AllDocuments:this.row.documents }, query)
    }
    this.snack.open("Downloading zip file is in process, Please wait some time!", 'OK');
    this.userapi.download('documents/downloadZip', req_vars).subscribe(res => {
      var downloadURL =window.URL.createObjectURL(res)
      let filePath = downloadURL;
      var link=document.createElement('a');
      link.href = filePath;
      link.download = ZipName;
      link.click();
      this.snack.dismiss();
    });
  }
}
