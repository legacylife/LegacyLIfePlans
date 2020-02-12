import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { egretAnimations } from '../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../userapi.service';
import { s3Details } from '../../../config';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
const filePath = s3Details.url+'/'+s3Details.profilePicturesPath;
@Component({
  selector: 'app-customer-professionals',
  templateUrl: './customer-profile.component.html',
  styleUrls: ['./customer-profile.component.scss'],
  animations: [egretAnimations]
})
export class CustomerProfileComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  profilePicture: any = "assets/images/arkenea/default.jpg"  
  selectedProfileId:string;
  row: any;
  userId : string;
  fullName: string;
  isPremiumExpired: boolean = false
  isSubscribePlan: boolean = false
  constructor(
    private route: ActivatedRoute,private userapi: UserAPIService, 
    private router: Router, private dialog: MatDialog, 
    private loader: AppLoaderService,private snack: MatSnackBar,private confirmService: AppConfirmService
  ) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    const locationArray = location.href.split('/')
    this.selectedProfileId = locationArray[locationArray.length - 1];
    this.getCustomerView();
  }

  getCustomerView = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ _id: this.selectedProfileId }, query)
    }
    this.userapi.apiRequest('post', 'userlist/viewall', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.row = result.data;  
        this.fullName  = result.data.firstName+' '+result.data.lastName;  
        if(result.data.profilePicture){
          this.profilePicture = filePath + result.data.profilePicture;
        }        

        let subscriptionDetails = this.row.subscriptionDetails
        if( subscriptionDetails && subscriptionDetails.length > 0 ) {
          //get last element from array i.e current subscription details
          let currentSubscription     = subscriptionDetails.slice(-1)[0]
            this.isPremiumExpired = currentSubscription.isPremiumExpired
            this.isSubscribePlan = currentSubscription.isSubscribePlan;
        }

      }
    }, (err) => {
      console.error(err)
    })
  }

  toggleSideNav() {
    this.sideNav.opened = !this.sideNav.opened;
  }
}