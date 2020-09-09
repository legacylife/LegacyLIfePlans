import { Component, OnInit, Inject } from '@angular/core';
import { UserAPIService } from './../../../userapi.service';
import { Elements, Element as StripeElement, ElementsOptions } from 'ngx-stripe';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { ProfilePicService } from 'app/shared/services/profile-pic.service';
import { SubscriptionService } from 'app/shared/services/subscription.service';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatSnackBar } from '@angular/material';
import  * as moment  from 'moment'
@Component({
  selector: 'renew-subscription-modal',
  templateUrl: './renew-subscription-modal.component.html',
  styleUrls: ['./renew-subscription-modal.component.scss']
})
export class RenewSubscriptionComponent implements OnInit {
  for:string = 'subscription'
  elements: Elements
  card: StripeElement
  elementsOptions: ElementsOptions = { locale: 'en' }
  userId = ""
  endUserType = ""
  userName:string='';
  forUserId:string='';
  forUserType: any;
  expiryDate: any;
  planAmount: any = 0;
  planCurrency:string = ""
  today: Date = moment().toDate()
  constructor( private userapi: UserAPIService, private loader: AppLoaderService, 
    private picService: ProfilePicService, private subscriptionservice:SubscriptionService, 
    private router: Router, @Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog, private snack: MatSnackBar ) {
      this.userId = localStorage.getItem("endUserId");
      this.endUserType = localStorage.getItem("endUserType");
      // get data from popup to check fro which the popup is open i.e for subscription charges or addon payment
      this.for = data.for
    }

  ngOnInit() {
    this.userName = this.data.userName
    this.forUserId = this.data.userId
    this.forUserType = this.data.endUserType
    this.expiryDate = this.data.expiryDate

    let daysRemaining = this.data.daysRemaining
    let isPremiumExpired=this.data.isPremiumExpired
    let isSubscribePlan=this.data.isSubscribePlan
    this.getPlanDetails({_id: this.forUserId,userType: this.forUserType})
  }

    // get product plan
    getPlanDetails = (query = {}) => {
      this.subscriptionservice.getPlanDetails( (returnArr) => {
        let subscriptionDate = moment( localStorage.getItem("endUserSubscriptionEndDate") )
        let diff = Math.round(this.subscriptionservice.getDateDiff( this.today, subscriptionDate.toDate() ))
        let addOnCharges = Number (returnArr.metadata.addOnCharges)
        let addOnAmount =  (addOnCharges).toFixed(2);
        let subsctiptionAmount =  (returnArr.amount)/100;
      //  let finalAddOnAmount = Number(addOnAmount) + Number(subsctiptionAmount);
        let finalAddOnAmount = Number(subsctiptionAmount);
        this.planAmount = finalAddOnAmount < 0.5 ? 0.5 : finalAddOnAmount
        this.planCurrency = (returnArr.currency).toLocaleUpperCase()
      })
    }

}