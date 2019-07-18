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
  tootltipList: string;
  @ViewChild(MatBottomSheet) private sideNav: MatBottomSheet;
  constructor(private _bottomSheet: MatBottomSheet, _elementRef: ElementRef, private route: ActivatedRoute,private userapi: UserAPIService,private router: Router) { }
  ngOnInit() {
    this.userId = localStorage.getItem("endUserId"); 
    const locationArray = location.href.split('/')
    this.selectedProfileId = locationArray[locationArray.length - 1];
    this.tootltipList = 'Bernice Hutchison, Mark McLoud, Christopher Harrison, Charles Nicholson, Melissa Boynton';
    this.getUserView();
  }

  getUserView = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId }, query)
    }
    this.userapi.apiRequest('post', 'lead/view-details', req_vars).subscribe(result => {   //userlist/viewall
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



//  trustee/acting-as-trustee
  openMorePeople(): void {
    this._bottomSheet.open(ProspectPeoplesModalComponent);
  }

  // openBottomSheet() {
  //   const bottomSheet: MatBottomSheetRef<any> = this._bottomSheet.open(ProspectPeoplesModalComponent, {
  //     width: '720px'
  //   });
  // }


}
