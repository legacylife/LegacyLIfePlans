import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms'
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../userapi.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { AppConfirmService } from '../../../../shared/services/app-confirm/app-confirm.service';
import { legalStuffModalComponent } from './../legal-stuff-modal/legal-stuff-modal.component';
import { EstateTypeOfDocument,HealthcareTypeOfDocument,PersonalAffairsTypeOfDocument } from '../../../../selectList';
import { s3Details } from '../../../../config';

@Component({
  selector: 'app-customer-home',
  templateUrl: './customer-legal-stuff-details.component.html',
  styleUrls: ['./customer-legal-stuff-details.component.scss'],
  animations: [egretAnimations]
})
export class CustomerLegalStuffDetailsComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;  
  userId: string;
  selectedProfileId: string = "";
  row: any;
  typeOfDocumentList: any[];
  docPath: string = "";
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
    const filePath = this.userId+'/'+s3Details.legalStuffDocumentsPath;
    this.docPath = filePath;   
    this.urlData = this.userapi.getURLData();
    this.selectedProfileId = this.urlData.lastOne;
    this.trusteeLegaciesAction = this.urlData.trusteeLegaciesAction
    this.getEssentialLegalView();
  }

  //function to get all events
  getEssentialLegalView = (query = {}, search = false) => {
    let profileIds = '';
    let req_vars = {}
    if (this.selectedProfileId) {
      profileIds = this.selectedProfileId;
      req_vars = {
        query: Object.assign({ _id: profileIds })
      }
    }
    this.userapi.apiRequest('post', 'customer/view-legalStuff-details', req_vars).subscribe(result => {     
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if (result.data) {
          if(this.urlData.userType == 'advisor' && !result.data.customerLegacyType){
            this.trusteeLegaciesAction = false;
          }
          this.row = result.data;
          if(this.row){
            this.docPath = this.row.customerId+'/'+s3Details.legalStuffDocumentsPath;
          }
        }
      }  
    }, (err) => {
      console.error(err);
    })
  }

  openLegalStuffModals(FolderNames, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(legalStuffModalComponent, {
      data: {
        FolderName: FolderNames,
        newName: FolderNames,
      },
      width: '720px',
      disableClose: true,
    })
    dialogRef.afterClosed()
      .subscribe(res => {
        this.getEssentialLegalView();
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }

  deleteLegalStuff(customerId='') {
    var statMsg = "Are you sure you want to delete legal stuff?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          var query = {};
          const req_vars = {
            query: Object.assign({ _id: this.selectedProfileId }, query)
          }
          this.userapi.apiRequest('post', 'customer/delete-legal-stuff', req_vars).subscribe(result => {
            if (result.status == "error") {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {
              this.loader.close();              
              if(this.urlData.userType == 'advisor'){
                this.router.navigate(['/', 'advisor', 'legacies', 'legal-stuff', customerId])
              }else{
                this.router.navigate(['/', 'customer', 'dashboard', 'legal-stuff'])
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
    if (key!= null && this.row.subFolderName) {
      if(this.row.subFolderName=='Estate'){
        this.typeOfDocumentList = EstateTypeOfDocument;
      }else if(this.row.subFolderName=='Healthcare'){
        this.typeOfDocumentList = HealthcareTypeOfDocument;
      }else if(this.row.subFolderName=='Personal Affairs'){
        this.typeOfDocumentList = PersonalAffairsTypeOfDocument;      
      }
      let filteredTyes = this.typeOfDocumentList.filter(dtype => {
        return dtype.opt_code === key
      }).map(el => el.opt_name)[0]
      return filteredTyes
    }
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
    var ZipName = "legal-stuff-"+Math.floor(Math.random() * Math.floor(999999999999999))+".zip"; 
    let req_vars = {
      query: Object.assign({ _id: this.selectedProfileId, docPath: this.docPath,downloadFileName:ZipName,AllDocuments:this.row.subFolderDocuments }, query)
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
