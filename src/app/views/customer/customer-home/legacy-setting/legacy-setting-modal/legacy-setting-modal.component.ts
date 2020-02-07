import { Component, OnInit } from '@angular/core';
import { UserAPIService } from './../../../../../userapi.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { FileHandlingService } from 'app/shared/services/file-handling.service';
import { DataSharingService } from 'app/shared/services/data-sharing.service';
import { SubscriptionService } from 'app/shared/services/subscription.service';
@Component({
  selector: 'app-essenioal-id-box',
  templateUrl: './legacy-setting-modal.component.html',
  styleUrls: ['./legacy-setting-modal.component.scss'],
  providers: [SubscriptionService]
})
export class legacySettingModalComponent implements OnInit {
  userId = localStorage.getItem("endUserId");
  urlData:any={};



  productId:any = ""
  planId:any = ""
  planInterval:string = ""
  planAmount:number = 0
  planCurrency:string = ""
  defaultSpace:number = 0
  spaceDimension:string = 'GB'
  premiumExpired:boolean = false
  freePremiumExpired:boolean = false
  isDialogOpen:boolean = false
  addOnSpace:number = 0
  isAddOnPurchased:boolean = false
  subscriptionData :any;



  constructor(private snack: MatSnackBar,public dialog: MatDialog,private loader: AppLoaderService, private router: Router,
    private userapi: UserAPIService, private fileHandlingService: FileHandlingService,private sharedata: DataSharingService, private subscriptionservice:SubscriptionService) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.urlData = this.userapi.getURLData();

    this.getProductDetails();
  }


    // get product plan
    getProductDetails = (query = {}) => {
      this.subscriptionservice.getProductDetails({}, (returnArr)=>{
        this.productId    = returnArr.productId
        this.planId       = returnArr.planId
        this.planInterval = returnArr.planInterval
        this.planAmount   = returnArr.planAmount
        this.planCurrency = returnArr.planCurrency
        this.defaultSpace = returnArr.defaultSpace
        this.spaceDimension = returnArr.spaceDimension,
        this.addOnSpace = returnArr.addOnSpace,
        this.isAddOnPurchased = returnArr.isAddOnPurchased
      })
    }

}