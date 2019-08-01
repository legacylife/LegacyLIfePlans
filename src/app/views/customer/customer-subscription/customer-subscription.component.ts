import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { CardDetailsComponent } from 'app/shared/components/card-details-modal/card-details-modal.component';
import { SubscriptionService } from '../../../shared/services/subscription.service';

@Component({
  selector: 'app-customer-subscription',
  templateUrl: './customer-subscription.component.html',
  styleUrls: ['./customer-subscription.component.scss'],
  providers: [SubscriptionService]
})
 export class CustomerSubscriptionComponent implements OnInit {

  /**
   * declaration: user plan data
   */
  productId:any = ""
  planId:any = ""
  planInterval:string = ""
  planAmount:number = 0
  planCurrency:string = ""
  defaultSpace:number = 0
  spaceDimension:string = 'GB'

  premiumExpired:boolean = false
  freePremiumExpired:boolean = false

  constructor(private dialog: MatDialog, private subscriptionservice:SubscriptionService) { 
    this.premiumExpired = localStorage.getItem('endUserProSubscription') && localStorage.getItem('endUserProSubscription') == 'yes' ? false : true
    this.freePremiumExpired = localStorage.getItem('endUserProFreeSubscription') && localStorage.getItem('endUserProFreeSubscription') == 'yes' ? false : true
  }

  ngOnInit() {
    this.dialog.closeAll();
    this.getProductDetails()
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
      this.spaceDimension = returnArr.spaceDimension
    })
  }

  openCardDetailsModal() {
     let dialogRef: MatDialogRef<any> = this.dialog.open(CardDetailsComponent, {
       width: '500px',
       disableClose: true,
       data: {
        for: 'subscription',
      }
     })
   }

}
  