import { Component, OnInit,ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms'
import { UserAPIService } from './../../../../../userapi.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { AppConfirmService } from '../../../../../shared/services/app-confirm/app-confirm.service';
import { LettersMessagesModelComponent } from '../letters-messages-model/letters-messages-model.component';
import { s3Details } from '../../../../../config';
@Component({
  selector: 'app-letters-messages-details',
  templateUrl: './letters-messages-details.component.html',
  styleUrls: ['./letters-messages-details.component.scss']
})
export class LettersMessagesDetailsComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  userId: string;
  selectedProfileId: string = "";
  row: any;
  re =  "/(?:\.([^.]+))?$/" ;
  docPath: string; 
  trusteeLegaciesAction:boolean=true;
  urlData:any={};
  toUserId:string = ''
  subFolderName:string = ''
  fileLevelAccess:any;
  LegacyPermissionError:string="You don't have access to this section";
  constructor( // private shopService: ShopService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar, private dialog: MatDialog, private confirmService: AppConfirmService,
    private userapi: UserAPIService, private loader: AppLoaderService, private snack: MatSnackBar, private router: Router
  ) { }

  ngOnInit() {  
    this.userId = localStorage.getItem("endUserId");
    const filePath = this.userId+'/'+s3Details.letterMessageDocumentsPath;
    this.docPath = filePath;
    
    this.urlData = this.userapi.getURLData();
    this.selectedProfileId = this.urlData.lastOne;
    this.trusteeLegaciesAction = this.urlData.trusteeLegaciesAction
    this.toUserId = this.userId
    this.getLettersMessageView();
  }

  //function to get all events
  getLettersMessageView = (query = {}, search = false) => {
    let profileIds = '';
    let req_vars = {}
    if (this.selectedProfileId) {
      profileIds = this.selectedProfileId;
      req_vars = {
        query: Object.assign({ _id: profileIds })
      }
    }
    this.userapi.apiRequest('post', 'lettersMessages/view-lettersMessages-details', req_vars).subscribe(result => {     
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if (result.data) {
          if(this.urlData.userType == 'advisor' && !result.data.customerLegacyType){
            this.trusteeLegaciesAction = false;
          }
          this.row = result.data;
          this.customerisValid(this.row);
          if(this.row){
            this.toUserId = this.row.customerId 
            this.docPath = this.row.customerId+'/'+s3Details.letterMessageDocumentsPath;
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
        this.fileLevelAccess = userAccess.LegacyLifeLettersMessagesManagement;

        this.fileLevelAccess.forEach(function(item, index, array) {  
          if(data._id == item.letterId && item.access != 'now'){
            this.snack.open(this.LegacyPermissionError, 'OK', { duration: 4000 })
            this.router.navigateByUrl('/'+localStorage.getItem("endUserType")+'/dashboard');
          }
        });
      });    
    }else{      
      if(data.customerId!=this.userId){
        this.snack.open(this.LegacyPermissionError, 'OK', { duration: 4000 })
        this.router.navigateByUrl('/'+localStorage.getItem("endUserType")+'/dashboard');
      }
    } 
  }

  openLettersMessageModal() {
    let dialogRef: MatDialogRef<any> = this.dialog.open(LettersMessagesModelComponent, {     
      width: '720px',
      disableClose: true,
    })
    dialogRef.afterClosed()
      .subscribe(res => {
        this.getLettersMessageView();
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }

  deleteLettersMessage(customerId='') {
    var statMsg = "Are you sure you want to delete letter and message details?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          var query = {};
          const req_vars = {
            query: Object.assign({ _id: this.selectedProfileId }, query),
            fromId:this.userId,
            toId:this.toUserId,
            folderName:'Emergency Contacts',
            subFolderName:this.subFolderName
          }
          this.userapi.apiRequest('post', 'lettersMessages/delete-lettersMessages', req_vars).subscribe(result => {
            if (result.status == "error") {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {
              this.loader.close();
              if(this.urlData.userType == 'advisor'){
                this.router.navigate(['/', 'advisor', 'legacies', 'letters-messages', customerId])
              }else{
                this.router.navigate(['/', 'customer', 'dashboard', 'letters-messages'])
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

  downloadFile = (filename,fileTitle) => {    
    let query = {};
    let req_vars = {
      query: Object.assign({ docPath: this.docPath, filename: filename }, query),
      fromId:this.userId,
      toId:this.toUserId,
      folderName:fileTitle,
      subFolderName:this.subFolderName
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
    var ZipName = "Insurance-"+Math.floor(Math.random() * Math.floor(999999999999999))+".zip"; 
    let req_vars = {
      query: Object.assign({ _id: this.selectedProfileId, docPath: this.docPath,downloadFileName:ZipName,AllDocuments:this.row.documents }, query),
      fromId:this.userId,
      toId:this.toUserId,
      folderName:s3Details.letterMessageDocumentsPath,
      subFolderName:this.subFolderName
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