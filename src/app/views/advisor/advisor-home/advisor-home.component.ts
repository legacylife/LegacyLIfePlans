import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { MatSnackBar, MatSidenav, MatDialogRef, MatDialog } from '@angular/material';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from 'app/shared/animations/egret-animations';
import { UserAPIService } from 'app/userapi.service';
import { MarkAsDeceasedComponent } from './../../../views/mark-as-deceased-modal/mark-as-deceased-modal.component';
import { Router } from '@angular/router';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { DataSharingService } from 'app/shared/services/data-sharing.service';
@Component({
  selector: 'app-advisor-home',
  templateUrl: './advisor-home.component.html',
  styleUrls: ['./advisor-home.component.scss'],
  animations: [egretAnimations]
})
export class AdvisorHomeComponent implements OnInit, OnDestroy {
  userId = localStorage.getItem("endUserId");
  lockoutLegacyDate: string;
  DeceasedFlag: string;
  deceasedDataFlag:boolean = false;
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  customerLegaicesId:string=''
  activeHeading: string = "";
  shareDeathFileCount: string = "0";
  documentId: string = "";
  revokeId: string = "";
  myLegacy:boolean = true
  sharedLegacies:boolean = false;
  markAsDeceased:boolean = false;
  revokeAsDeceased:boolean = false;
  alreadyRevokeAsDeceased:boolean = false;
  finallyDeceased:boolean = false;
  datas: any;
  constructor(
    private fb: FormBuilder,private snack: MatSnackBar,private userapi: UserAPIService,
    private router: Router,private loader: AppLoaderService,private dialog: MatDialog,private confirmService: AppConfirmService,private shareData: DataSharingService   
  ) { }

  ngOnInit() {
   
    let urlData = this.userapi.getURLData();
    if(urlData.lastThird == 'legacies' && urlData.lastOne){
      this.customerLegaicesId = urlData.lastOne
      this.myLegacy= false
      this.sharedLegacies =true 
      this.checkDeceasedStatus();
    }
    const loc = location.href;
    const locArray = loc.split('/')
    this.activeHeading = '';
    if(locArray && locArray[5]){
      this.activeHeading = locArray[5];
    }  
  }

  @HostListener('document:click', ['$event']) clickedOutside(event){
    const loc = location.href;
    const locArray = loc.split('/')
    this.activeHeading = '';
    if(locArray && locArray[5]){
      this.activeHeading = locArray[5];
    }   
}

  ngOnDestroy() {

  }

  checkDeceasedStatus(query = {}){
    let  req_vars = {
        query: Object.assign({ customerId: this.customerLegaicesId,advisorId:this.userId,status:"Active" })
      }
    this.userapi.apiRequest('post', 'deceased/viewDeceaseDetails', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.documentId = '';
        this.markAsDeceased = true;
        this.revokeAsDeceased = false;
        this.revokeId = this.userId;
        if(result.data.deceasedData){    
            this.datas = result.data.deceasedData;       
            this.documentId = this.datas._id;
            this.markAsDeceased = false;
            this.revokeAsDeceased = true;
            if(this.datas.customerId.deceased && this.datas.customerId.deceased.status=='Active'){
              this.revokeAsDeceased = false;
              this.finallyDeceased = true;
            }
        }

        if(result.data.alreadyDeceased){    
          this.documentId = result.data.alreadyDeceased._id;
          //this.alreadyRevokeAsDeceased = true;
          this.revokeAsDeceased = true;
          if(result.data.alreadyDeceased.customerId.deceased && result.data.alreadyDeceased.customerId.deceased.status=='Active'){
            this.markAsDeceased = false;
            this.revokeAsDeceased = false;
            this.finallyDeceased = true;
          }
        }
        this.shareData.userShareDataDeathFileSource.subscribe((shareDeathFileCount) => {
          this.shareDeathFileCount = shareDeathFileCount;
        })
      }
    }, (err) => {
      console.error(err);
    })
  }

  toggleSideNav() {
    this.sideNav.opened = !this.sideNav.opened;
  }

  markAsDeceasedModal(data: any = {}) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(MarkAsDeceasedComponent, {
      width: '720px',
      disableClose: true,
    });
    dialogRef.afterClosed()
    .subscribe(res => {
      this.checkDeceasedStatus();
      if (!res) {
        return;
      }
    })
  }


  revokeAsDeceasedModal() {
    // if(!this.documentId){
    //   this.snack.open("Something wrong, Please try again", 'OK', { duration: 4000 })
    // }else{
    var statMsg = "Are you sure you want to revoke the deceased request?"
    this.confirmService.confirm({ message: statMsg })
      .subscribe(res => {
        if (res) {
          this.loader.open();
          var query = {};
          let criteria = {};
          if(this.documentId){
            criteria = {_id:this.documentId};
          }else{
            criteria = {customerId:this.customerLegaicesId,status:'Active'};
          }
          const req_vars = {
            query: Object.assign(criteria, query),
            revokeId:this.userId,
            userType:localStorage.getItem("endUserType"),
            deceasedFromName:localStorage.getItem("endUserFirstName") + " " + localStorage.getItem("endUserLastName"),
            fromId:this.userId,
            toId:this.customerLegaicesId,
            folderName:'',
            subFolderName:''
          }
          this.userapi.apiRequest('post', 'deceased/revokeAsDeceased', req_vars).subscribe(result => {
            if (result.status == "error") {              
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            } else {
              this.checkDeceasedStatus();              
              this.snack.open(result.data.message, 'OK', { duration: 4000 })
            }
            this.loader.close();
          }, (err) => {
            console.error(err)
            this.loader.close();
          })
        }
      })
    //}
  }

  
}
