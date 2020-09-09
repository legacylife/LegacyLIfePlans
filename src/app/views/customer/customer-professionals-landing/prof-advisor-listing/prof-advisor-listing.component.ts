import { Component, OnInit, OnDestroy, ViewChild,HostListener } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../userapi.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { s3Details } from '../../../../config';
import { HireAdvisorComponent } from '../../hire-advisor-modal/hire-advisor-modal.component';
import { DataSharingService } from 'app/shared/services/data-sharing.service';
import { legacySettingModalComponent } from '../../customer-home/legacy-setting/legacy-setting-modal/legacy-setting-modal.component';
const profileFilePath = s3Details.url + '/' + s3Details.profilePicturesPath;
@Component({
  selector: 'app-prof-advisor-listing',
  
  templateUrl: './prof-advisor-listing.component.html',
  styleUrls: ['./prof-advisor-listing.component.scss'],
  animations: [egretAnimations]
})
export class ProfAdvisorListingComponent implements OnInit, OnDestroy {
  adListings: any[];
  qualityAdvisor: any[];
  userId: string;
  profileFilePath: string = profileFilePath;
  profilePicture: any = "assets/images/arkenea/default.jpg";
//  interval: any
  nextOffset = 1;
  resultLimit = 20;
  showAdvisorListing: boolean = true;
  searchingFlag: boolean = true;
  showQualityListing: boolean = false;
  showAdvisorListingCnt: any;
  showQualityAdvisorListing: boolean = false;
  throttle = 10;
  scrollDistance = 1;
  scrollUpDistance = 5;  
  showQualityAdvisorListingCnt: any;
  profileUrl = s3Details.url + '/profilePictures/';
  advisorData:any = []
  searchVal:string;
  searchForm: FormGroup;  
  searchStatus: boolean = false
  isProUser = false;
  isFreeProuser = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router, private dialog: MatDialog,private fb: FormBuilder,
    private userapi: UserAPIService, private loader: AppLoaderService,
    private snack: MatSnackBar,
    private data: DataSharingService
  ) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId"); 
    this.isProUser = localStorage.getItem('endUserProSubscription') && localStorage.getItem('endUserProSubscription') == 'yes' ? true : false
    this.isFreeProuser = localStorage.getItem('endUserProFreeSubscription') && localStorage.getItem('endUserProFreeSubscription') == 'yes' ? true : false
    this.getAdvisorLists('','',this.resultLimit,0,false,false,false);
 
    this.data.currentMessage.subscribe( (searchKey) => {
      this.searchVal = searchKey;    
      if(this.searchVal && this.searchVal!=='All'){
        this.advisorData = [];      
        let searchString = this.searchForm.controls['search'].value.trim();
        if(searchString){
          this.searchStatus = true;
        }
        this.getAdvisorLists('',this.searchVal,this.resultLimit,0,this.searchStatus,searchString,true)
      }
    })
    
    this.searchForm = this.fb.group({
      search: new FormControl('')
     });
  }

  onScrollDown (ev) {
    //console.log('scrolled down!!', ev,this.searchVal);
    // this.nextOffset++;
    // this.data.currentMessage.subscribe((searchKey) => { 
    //   this.searchVal = searchKey; 
    //   let searchString = this.searchForm.controls['search'].value.trim();
    //   if(searchString){
    //     this.searchStatus = true;
    //   }
    //   if(this.searchVal && this.searchVal!=='All'){
    //     this.getAdvisorLists('',this.searchVal,this.resultLimit,(this.nextOffset*this.resultLimit),this.searchStatus,searchString,false)
    //   }else{
    //     this.getAdvisorLists('','',this.resultLimit,(this.nextOffset*this.resultLimit),this.searchStatus,searchString,false);
    //   }
    // })
  }
  
  searching() {
    let searchString = this.searchForm.controls['search'].value.trim();
    // console.log("searchValue ->",searchString);
    if(searchString){
      this.searchingFlag = false;
      this.advisorData = [];
      this.getAdvisorLists('','',this.resultLimit,0,true,searchString,true);
    }else{
      this.searchingFlag = true;
    }
  }

  clearSearch() {
    this.searchingFlag = true;
    this.searchForm.reset(); 
    this.getAdvisorLists('','',this.resultLimit,0,false,false,false);     
  }

  toggleSearchSuggestion() {
    let searchValue = this.searchForm.controls['search'].value;
    this.searchStatus = searchValue.trim().length > 0 ? true : false
  }

  onScrollUp(ev) {
    // console.log('scrolled up!', ev);
    // const start = this.sum;
    // this.sum += 20;
    // this.prependItems(start, this.sum);  
    // this.direction = 'up';
  }

  ngOnDestroy() {
   // clearInterval(this.interval);
  }

  getAdvisorLists = (query: any = {},searchbType: any =false,limits,offset,search=false,searchString=false,loader=false) => {
    let req_vars = {
      query: Object.assign({ userType: "advisor", status: "Active" }, query),
      fields: { salt: 0, hash: 0 },
      offset: offset,
      limit: limits,
      order: { "createdOn": -1 },
      search: search,
      searchString: searchString,
      extraQuery: Object.assign({ _id: this.userId }, query),
    }

    if (searchbType) {
      req_vars = {
        query: Object.assign({ userType: "advisor", status: "Active", businessType: searchbType }, query),
        fields: { salt: 0, hash: 0 },
        offset: offset,
        limit: limits,       
        order: { "createdOn": -1 },
        search: search,
        searchString: searchString,
        extraQuery: Object.assign({ _id: this.userId }, query),
      }
    }

    //if(loader){ 
      this.loader.close();
      this.loader.open();
  //  }
    this.userapi.apiRequest('post', 'advisor/professionalsList', req_vars).subscribe(result => {
      if (result.status == "error") {
        this.loader.close();
        console.log(result.data)
      } else {        
        this.advisorData = result.data.distanceUserList;//this.advisorData.concat(result.data.distanceUserList);
        let resultData = this.advisorData;
        if (resultData && resultData.length) {

          this.adListings = resultData.filter(dtype => {
            return dtype.sponsoredAdvisor == 'yes'
          }).map(el => el)
          
          this.showAdvisorListingCnt = result.data.totalUsers;

          if (result.data.totalUsers > 0) {
            this.showAdvisorListing = true;
          } else { 
            this.showAdvisorListing = false; 
          }

          if (this.adListings.length > 0) {
            this.showQualityListing = true;
          } else { 
            this.showQualityListing = false; 
          }

          this.qualityAdvisor = resultData.filter(dtype => {
            return dtype.sponsoredAdvisor == 'no'
          }).map(el => el)

          this.showQualityAdvisorListingCnt = this.qualityAdvisor.length;
          if (this.showQualityAdvisorListingCnt > 0) {
            this.showQualityAdvisorListing = true;
          }
        }else {
          this.showAdvisorListing = false; 
          this.showQualityListing = false; 
        }
        this.loader.close();
        setTimeout(()=>{           
          this.loader.close();
        },1500); 
      }
    }, (err) => {
      this.loader.close();
      console.error(err)
    })
  }

  //function to send contact details of advisor
  sendContactDetails = (advisorDetails, query = {}) => {
    if (!this.isProUser && !this.isFreeProuser) {
      let dialogRef: MatDialogRef<any> = this.dialog.open(legacySettingModalComponent, {     
        width: '720px',
        disableClose: true,
      });
      dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
      })
    }else{
      let search = false;
      const req_vars = {
        query: Object.assign({ _id: this.userId }, query),
        advisorDetails: {
          "advisorFullname": advisorDetails.firstName + ' ' + advisorDetails.lastName,
          "advisorEmail": advisorDetails.username,
          "advisorPhone": advisorDetails.businessPhoneNumber,
          "advisorAddress": advisorDetails.addressLine1 + ' ' + advisorDetails.city + ' ' + advisorDetails.state + ' ' + advisorDetails.zipcode,
          "advisorId": advisorDetails._id
        }
      }
      this.userapi.apiRequest('post', 'advisor/contactadvisor', req_vars).subscribe(result => {
        if (result.status == "error") {
          console.log(result.data)
        } else {
          if (result.status == "error") {
            this.loader.close();
            this.snack.open(result.data.message, 'OK', { duration: 4000 })
          } else {
            this.loader.close();
            this.snack.open(result.data.message, 'OK', { duration: 4000 })
          }
        }
      }, (err) => {
        console.error(err)
      })
    }
  }

  getProfileImage(fileName) {
    if (fileName) {
      return profileFilePath + fileName;
    }
    else {
      return this.profilePicture;
    }
  }

  openHireAdvisorModal(id: any = {}, update: any = {}, isNew?, hireFullName='') {
    if (!this.isProUser && !this.isFreeProuser) {
      let dialogRef: MatDialogRef<any> = this.dialog.open(legacySettingModalComponent, {     
        width: '720px',
        disableClose: true,
      });
      dialogRef.afterClosed()
      .subscribe(res => {
        if (!res) {
          // If user press cancel
          return;
        }
      })
    }else{
      let dialogRef: MatDialogRef<any> = this.dialog.open(HireAdvisorComponent, {
        width: '720px',
        disableClose: true,
        data: {
          id: id,
          update: update,
          hireFullName:hireFullName
        },
      })
    }
  }

  CalculateDistance() {  //Test function not in use
    let query = {};
    let zipcode1 = '89103';
    let zipcode2 = '16103';
    const req_vars = {
      query: Object.assign({ from: zipcode1, to: zipcode2 }, query),
    }
    this.userapi.apiRequest('post', 'distance/calculateZipDistance', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }
    }, (err) => {
      console.error(err);
    })
  }

  getAdvisorSpecilities(businessType) {
    if (businessType)
      return businessType.join(", ")
    else
      return ""
  }
}
