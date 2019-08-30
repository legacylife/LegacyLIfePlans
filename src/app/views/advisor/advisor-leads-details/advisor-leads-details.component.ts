import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
//import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import { ProspectPeoplesModalComponent } from './prospect-peoples-modal/prospect-peoples-modal.component';
import { UserAPIService } from './../../../userapi.service';
import { s3Details } from '../../../config';
import { egretAnimations } from "../../../shared/animations/egret-animations";
const filePath = s3Details.url+'/'+s3Details.profilePicturesPath;
@Component({
  selector: 'app-advisor-leads-details',
  templateUrl: './advisor-leads-details.component.html',
  styleUrls: ['./advisor-leads-details.component.scss'],
  animations: egretAnimations
})
export class AdvisorLeadsDetailsComponent implements OnInit {
  allPeoples: any[];
  profilePicture: any = "assets/images/arkenea/default.jpg"  
  selectedProfileId:string;
  row: any;
  filesCount: any;
  recordCount: any;
  profileData: any;
  about: string;
  userId : string;
  urlData:any={};
  ownLegacyFilesCount:number=0;
  ownLegacyFilesCountEnable:boolean= false;

  mutualFriendList: string;
  firstMutualFriend:string='';
  mutualFriendCount:number=0
  mutualFriendAvailable = false
  @ViewChild(MatBottomSheet) private sideNav: MatBottomSheet;
  constructor(private _bottomSheet: MatBottomSheet, _elementRef: ElementRef, private route: ActivatedRoute,private userapi: UserAPIService,private router: Router) { }
  ngOnInit() {
    this.userId = localStorage.getItem("endUserId"); 
    this.urlData = this.userapi.getURLData();
    this.selectedProfileId = this.urlData.lastOne;
    
    this.getUserView();
    this.getMutualFriend();
    this.getOwnLegacyFilesCount();
  }

  getUserView = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId }, query),
      fromId: this.userId
    }
    this.userapi.apiRequest('post', 'lead/view-details', req_vars).subscribe(result => { 
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.row = result.data.userDetails;  
        this.filesCount = result.data.filesCount;  
        this.recordCount = result.data.recordCount;  
        if(result.data.userDetails.profilePicture){
          this.profilePicture = filePath + result.data.userDetails.profilePicture;
        }                   
      }
    }, (err) => {
      console.error(err)
    })
  }

  openMorePeople(): void {
    this._bottomSheet.open(ProspectPeoplesModalComponent);
  }

  getOwnLegacyFilesCount(){
    const params = {
      query: Object.assign({ customerId: this.selectedProfileId, status: 'Active'})
    }
    this.userapi.apiRequest('post', 'lead/get-own-legacy-files-count', params).subscribe(result => {
        this.ownLegacyFilesCount = result.data.ownLegacyFilesCount
        this.ownLegacyFilesCountEnable = true
    }, (err) => {
      console.error("error : ", err)
    })
  }

  getMutualFriend(){
    const params = {
      query: Object.assign({ customerId: this.selectedProfileId, advisorId :this.userId })
    }
    this.userapi.apiRequest('post', 'lead/get-mutual-friend', params).subscribe(result => {
        var fData = result.data
        if(result.status == 'success' && fData.length > 0){
          this.firstMutualFriend = fData[0].firstName + " " + fData[0].lastName
          this.mutualFriendCount = (fData.length - 1)
          var namesData = [];
          for(var index = 1;index<fData.length;index++){
            namesData.push(fData[index].firstName + " " + fData[index].lastName)
          }
          this.mutualFriendList = namesData.join(",")
          this.mutualFriendAvailable = true
        }
    }, (err) => {
      console.error("error : ", err)
    })
  }

}