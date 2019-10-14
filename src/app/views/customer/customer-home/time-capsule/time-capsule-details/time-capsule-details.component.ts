import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms'
import { egretAnimations } from '../../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../../userapi.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { AppConfirmService } from '../../../../../shared/services/app-confirm/app-confirm.service';
import { TimeCapsuleMoalComponent } from './../time-capsule-modal/time-capsule-modal.component';
import { s3Details } from '../../../../../config';
@Component({
  selector: 'app-customer-home',
  templateUrl: './time-capsule-details.component.html',
  styleUrls: ['./time-capsule-details.component.scss'],
  animations: [egretAnimations]
})
export class TimeCapsuleDetailsComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;

  userId: string;
  docPath: string;
  selectedProfileId: string = "";
  row: any;
  re =  "/(?:\.([^.]+))?$/" ;
  urlData:any={};
  trusteeLegaciesAction:boolean=true;
  toUserId:string = ''
  subFolderName:string = ''
  LegacyPermissionError:string="You don't have access to this section";
  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar, private dialog: MatDialog, private confirmService: AppConfirmService,
    private userapi: UserAPIService, private loader: AppLoaderService, private snack: MatSnackBar, private router: Router
  ) { }

  ngOnInit() {  
    this.userId = localStorage.getItem("endUserId");
    const filePath = this.userId+'/'+s3Details.timeCapsuleFilePath;
    this.docPath = filePath;
    this.urlData = this.userapi.getURLData();
    this.selectedProfileId = this.urlData.lastOne;
    this.trusteeLegaciesAction = this.urlData.trusteeLegaciesAction
    this.toUserId = this.userId
    this.getTimeCapsuleView();
  }

  //function to get all events
  getTimeCapsuleView = (query = {}, search = false) => {
    let profileIds = '';
    let req_vars = {}
    if (this.selectedProfileId) {
      profileIds = this.selectedProfileId;
      req_vars = {
        query: Object.assign({ _id: profileIds })
      }
    }
    this.userapi.apiRequest('post', 'timeCapsule/view-timeCapsule-details', req_vars).subscribe(result => {     
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if (result.data) {
          if(this.urlData.userType == 'advisor' && !result.data.customerLegacyType){
            this.trusteeLegaciesAction = false;
          }
          this.row = result.data;
          if(this.row){
            this.toUserId = this.row.customerId 
            this.docPath = this.row.customerId+'/'+s3Details.timeCapsuleFilePath;
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
        if((data.subFolderName=='Young_Children' && userAccess.YoungChildrenManagement!='now') || (data.subFolderName=='Child_Parent' && userAccess.ChildParentDisabilityManagement!='now') || (data.subFolderName=='Friend_Neighbor' && userAccess.FriendNeighborCareManagement!='now')){
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

  openTimeCapsuleModal(FolderNames, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(TimeCapsuleMoalComponent, {
      width: '720px',
      disableClose: true,
    })
    dialogRef.afterClosed()
      .subscribe(res => {
        this.getTimeCapsuleView();
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }

  deleteTimeCapsule(customerId='') {
    var statMsg = "Are you sure you want to delete Time Capsule details?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          var query = {};
          const req_vars = {
            query: Object.assign({ _id: this.selectedProfileId }, query),
            fromId:this.userId,
            toId:this.toUserId,
            folderName:s3Details.timeCapsuleFilePath,
            subFolderName:this.subFolderName
          }
          this.userapi.apiRequest('post', 'timeCapsule/delete-timeCapsule', req_vars).subscribe(result => {
            if (result.status == "error") {
              this.loader.close();
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {
              this.loader.close();
              if(this.urlData.userType == 'advisor'){
                this.router.navigate(['/', 'advisor', 'legacies', 'time-capsule', customerId])
              }else{
                this.router.navigate(['/', 'customer', 'dashboard', 'time-capsule'])
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
      query: Object.assign({ docPath: this.docPath, filename: filename }, query),
      fromId:this.userId,
      toId:this.toUserId,
      folderName:s3Details.timeCapsuleFilePath,
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
    var ZipName = "pets-"+Math.floor(Math.random() * Math.floor(999999999999999))+".zip"; 
    let req_vars = {
      query: Object.assign({ _id: this.selectedProfileId, docPath: this.docPath,downloadFileName:ZipName,AllDocuments:this.row.documents }, query),
      fromId:this.userId,
      toId:this.toUserId,
      folderName:s3Details.timeCapsuleFilePath,
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

  checkExt = (ext) => {    
  let extensions  = ['doc','DOC','DOCX','docx','pdf','PDF','jpg','JPG','png','PNG','jpeg','JPEG','txt','TXT','flv','FLV','avi','AVI','wmv','WMV','mpeg','MPEG','webm','WEBM','mov','MOV'];
    let resp = this.isExtension(ext,extensions);
    if(!resp){
      return true;
    }else{
     return false;
    }    
  }

  isExtension(ext, extnArray) {
    var result = false;
    var i;
    if (ext) {
        ext = ext.toLowerCase();
        for (i = 0; i < extnArray.length; i++) {
            if (extnArray[i].toLowerCase() === ext) {
                result = true;
                break;
            }
        }
    }
    return result;
  }
}
