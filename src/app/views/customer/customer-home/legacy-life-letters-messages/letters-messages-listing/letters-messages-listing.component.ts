import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from 'app/shared/animations/egret-animations';
import { UserAPIService } from 'app/userapi.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { LettersMessagesModelComponent } from '../letters-messages-model/letters-messages-model.component';
import { ManageTrusteeModalComponent } from '../../manage-trustee-modal/manage-trustee-modal.component';
@Component({
  selector: 'app-letters-messages-listing',
  templateUrl: './letters-messages-listing.component.html',
  styleUrls: ['./letters-messages-listing.component.scss']
})
export class LettersMessagesListingComponent implements OnInit {
  userId: string;
  showListing = true;
  lettersMessagesList: any = [];
  selectedProfileId:string = "";
  showListingCnt: any;
  trusteeLettersMessagesCnt: any;
  dynamicRoute:string;
  trusteeLegaciesAction:boolean=true;
  showTrusteeCnt:boolean=true;
  urlData:any={};
  LegacyLifeLettersMessagesManagementSection:string='now';
  LegacyPermissionError:string="You don't have permission of this section";
  constructor(private route: ActivatedRoute,private router: Router, private dialog: MatDialog,private userapi: UserAPIService, private loader: AppLoaderService) {  }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.urlData = this.userapi.getURLData();
    this.dynamicRoute = this.urlData.dynamicRoute;
    this.trusteeLegaciesAction = this.urlData.trusteeLegaciesAction
    if (this.urlData.lastThird == "legacies") {
      this.userId = this.urlData.lastOne;
      this.userapi.getUserAccess(this.userId, (userAccess) => {
        this.LegacyLifeLettersMessagesManagementSection = userAccess.LegacyLifeLettersMessagesManagement
      });
      this.showTrusteeCnt = false;
    }
    this.getLetterMessageList();
  }
  @HostListener('document:click', ['$event']) clickedOutside(event){
    if(event.srcElement.outerText=='Send an Invite'){
      setTimeout(()=>{
        this.getLetterMessageList();    
      },2000);   
    }
  }

  getLetterMessageList = (query = {}) => {
    let trusteeQuery = {};
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" }, query),
      trusteeQuery: Object.assign({ customerId: this.userId,"userAccess.LegacyLifeLettersMessagesManagement" : "now", status:"Active" }, trusteeQuery),
      fields: {},
      order: {"createdOn": -1},
    }
    this.userapi.apiRequest('post', 'lettersMessages/letters-message-listing', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.lettersMessagesList = result.data.lettersMessagesList;
        this.showListingCnt = this.lettersMessagesList.length;  
        this.trusteeLettersMessagesCnt = result.data.totalTrusteeRecords;
        if (this.showListingCnt>0) {
          this.showListing = true;
        }
        else {
          this.showListing = false;
        }
      }
    }, (err) => {
      console.error(err);
    })
  }
  
  openLettersMessagesModal() {
    let dialogRef: MatDialogRef<any> = this.dialog.open(LettersMessagesModelComponent, {
      width: '720px',
      disableClose: true,
    });
    dialogRef.afterClosed()
    .subscribe(res => {
      this.getLetterMessageList();
      if (!res) {
        // If user press cancel
        return;
      }
    })
  }
 
  openManageTrusteeModal(title,code,isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(ManageTrusteeModalComponent, {
      width: '720px',
      disableClose: true, 
      data: {
        title: title,
        code:code
      }
    }) 
    dialogRef.afterClosed()
    .subscribe(res => {
      this.getLetterMessageList();
      if (!res) {
        // If user press cancel
        return;
      }
    })
   }
}
