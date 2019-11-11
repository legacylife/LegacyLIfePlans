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
import { DataSharingService } from 'app/shared/services/data-sharing.service';
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
  accessCount: any;
  dynamicRoute:string;
  trusteeLegaciesAction:boolean=true;
  showTrusteeCnt:boolean=true;
  urlData:any={};
  fileLevelAccess:any;
  LegacyLifeLettersMessagesManagementSection:string='now';
  LegacyPermissionError:string="You don't have access to this section";
  instruction_data:any;
  instruction_data_flag:boolean=false;  
  shareLegacFlag:boolean=false;
  trusteeLettersMessageRecords:any;  
  constructor(private route: ActivatedRoute,private router: Router, private dialog: MatDialog,private userapi: UserAPIService, private loader: AppLoaderService,private sharedata: DataSharingService) {  }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.urlData = this.userapi.getURLData();
    this.dynamicRoute = this.urlData.dynamicRoute;
    this.trusteeLegaciesAction = this.urlData.trusteeLegaciesAction
    if (this.urlData.lastThird == "legacies") {
      this.userId = this.urlData.lastOne;
      this.userapi.getUserAccess(this.userId, (userAccess,userDeathFilesCnt,userLockoutPeriod,userDeceased) => { 
        if(userLockoutPeriod || userDeceased){
          this.trusteeLegaciesAction = false;
        }
        let array = '';// ['letter_id':"asdasdasdasd"];
       // this.LegacyLifeLettersMessagesManagementSection = userAccess.LegacyLifeLettersMessagesManagement
        this.fileLevelAccess = userAccess.LegacyLifeLettersMessagesManagement;
        console.log("letter listing",this.fileLevelAccess)
        this.getLetterMessageList('',this.fileLevelAccess);
      });
      this.showTrusteeCnt = false;this.shareLegacFlag = true;
    }else{ 
      this.userapi.getFolderInstructions('legacy_life_letters_messages', (returnData) => {
        this.instruction_data = returnData;
        if(this.instruction_data){this.instruction_data_flag = true;}
      });
      this.getLetterMessageList('','');
    } 
   
  }
  @HostListener('document:click', ['$event']) clickedOutside(event){
    if(event.srcElement.textContent=='Send an Invite'){
      setTimeout(()=>{
        this.getLetterMessageList('','');    
      },2000);   
    }
  }

  getLetterMessageList = (query = {},fileLevelAccess) => {
    console.log("getLetterMessageList")
    let trusteeQuery = {};
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" }, query),
      trusteeQuery: Object.assign({ customerId: this.userId,status:"Active"}, trusteeQuery),
      //loginUserId: localStorage.getItem("endUserId"),
      fields: {},
      order: {"createdOn": -1},
    }
    this.userapi.apiRequest('post', 'lettersMessages/letters-message-listing', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.lettersMessagesList = result.data.lettersMessagesList;
        let accessFiles = [];

        if(!this.showTrusteeCnt){
          this.lettersMessagesList.forEach(function(item, index, array) {
            fileLevelAccess.forEach(function(item2, index2, array2) {  
              if(item._id == item2.letterId && item2.access == 'now'){
                accessFiles.push(item)
              }
            });
          });
          this.lettersMessagesList = accessFiles;
        }



        this.trusteeLettersMessageRecords = result.data.trusteeRecords;
        if(this.shareLegacFlag){
          let lettersMessagesList = '';
          if(this.LegacyLifeLettersMessagesManagementSection=='now'){
            lettersMessagesList = this.lettersMessagesList;
          }
          let shareLettersMessagesList = {lettersMessagesList: lettersMessagesList };        
          this.sharedata.shareLegacyData(shareLettersMessagesList);
        }
        this.showListingCnt = this.lettersMessagesList.length;  
        this.trusteeLettersMessagesCnt = result.data.totalTrusteeRecords;
       // this.accessCount = result.data.accessCount;
  
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
  
  checkAccess(id) {
    //console.log("Here",id,this.fileLevelAccess)
    this.fileLevelAccess.filter(dtype => {
      if(dtype.letterId==id){
      console.log(id,'===',dtype.access)
        if(dtype.access=='now'){
          return true  
        }else{
          return false  
        }      
      }
    });//.map(el => el)
    //return 'now';
  }

  getTrusteeCount(letterId){ 
    let totalCount=0;
    if(this.trusteeLettersMessageRecords && this.trusteeLettersMessageRecords.length > 0){
      const nowRecords =  this.trusteeLettersMessageRecords.map(f=>{ 
        
        let filterRecord = f.LegacyLifeLettersMessagesManagement.filter(        
          book => book.letterId == letterId && book.access == "now"); 
            
        return filterRecord.length;
      })
      totalCount = nowRecords.reduce((a, b) => a + b, 0)
    }    
    return totalCount;
  }


  openLettersMessagesModal() {
    let dialogRef: MatDialogRef<any> = this.dialog.open(LettersMessagesModelComponent, {
      width: '720px',
      disableClose: true,
    });
    dialogRef.afterClosed()
    .subscribe(res => {
      this.getLetterMessageList('','');
      if (!res) {
        // If user press cancel
        return;
      }
    })
  }
 
  openManageTrusteeModal(title,code,letterId,letterTitle,isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(ManageTrusteeModalComponent, {
      width: '720px',
      disableClose: true,
      data: {
        title: title,
        code:code,
        letterId:letterId,
        letterTitle:letterTitle
      }
    }) 
    dialogRef.afterClosed()
    .subscribe(res => {
      this.getLetterMessageList('','');
      if (!res) {
        // If user press cancel
        return;
      }
    })
   }
}
