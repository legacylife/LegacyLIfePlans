import { Component, OnInit} from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material'
import { Router, ActivatedRoute } from '@angular/router';
import { UserAPIService } from './../../../../userapi.service';
import { AppLoaderService } from '../../../../shared/services/app-loader/app-loader.service';
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { HireAdvisorComponent } from '../../hire-advisor-modal/hire-advisor-modal.component';
import { s3Details } from '../../../../config';
const profileFilePath = s3Details.url + '/' + s3Details.profilePicturesPath;

@Component({
  selector: 'app-customer-hired-advisors',
  templateUrl: './customer-hired-advisors.component.html',
  styleUrls: ['./customer-hired-advisors.component.scss'],
  animations: [egretAnimations]
})
export class CustomerHiredAdvisorComponent implements OnInit {
  allPeoples: any[];
  advisorListing: any[];
  showAdvisorListing  : boolean = false;
  listingAsc  : boolean = true;
  showAdvisorListingCnt: any;
  userId: string;
  profileFilePath: string = profileFilePath;
  profilePicture: any = "assets/images/arkenea/default.jpg";
  abc: string;
  interval: any
  constructor(
    private route: ActivatedRoute,private router: Router, private dialog: MatDialog,private userapi: UserAPIService, private loader: AppLoaderService,private snack: MatSnackBar
  ) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    //this.getAdvisorList();
    this.getAdvisorList('All','-1');
  }

  getAdvisorList = (search,sort) => {
    if(sort){
      localStorage.setItem("trustee_sort", sort);
    }
    let query = {};
    let req_vars = {};
    if(search=='All'){
      req_vars = {
        //query: Object.assign({ customerId: this.userId, status: "Active" }, query),//'Rejected',
        query: Object.assign({customerId:this.userId, status: { $nin:['Deleted', 'Rejected'] }}),
       fields: {},
       order: {"modifiedOn": sort},
     }
   }else{
      let custSearch = { $nin: ['Deleted'] };    
      if(search!=''){
        custSearch = search;
      }
      req_vars = {
       query: Object.assign({ customerId: this.userId, status: custSearch }, query),
      // query: Object.assign({customerId:this.userId, status: { $nin:['Deleted'] }}),
       fields: {},
       order: {"modifiedOn": sort},
     }
   }
   
   this.userapi.apiRequest('post', 'advisor/hireAdvisorListing', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if(sort==1){
          this.listingAsc = false;
        }else{
          this.listingAsc = true;
        }
        this.advisorListing = result.data.advisorList;
        this.showAdvisorListingCnt = this.advisorListing.length;
        if (result.data.totalRecords>'0') {
          this.showAdvisorListing = true;
        }else{ 
           this.showAdvisorListing = false;
          }
      }
    }, (err) => {
      console.error(err);
    })
  }

  openHireAdvisorModal(id: any = {},update: any = {}, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(HireAdvisorComponent, {
      width: '720px',
      disableClose: true,
      data: {
        id: id,
        update: update,
      },
    })
  }

  getProfileImage(fileName) {
    if (fileName) {
      return profileFilePath + fileName;
    }
    else {
      return this.profilePicture;
    }
  }

}
