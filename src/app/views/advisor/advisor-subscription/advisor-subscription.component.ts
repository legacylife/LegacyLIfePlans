import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { CardDetailsComponent } from 'app/shared/components/card-details-modal/card-details-modal.component';
import { SubscriptionService } from '../../../shared/services/subscription.service';

@Component({
  selector: 'app-advisor-subscription',
  templateUrl: './advisor-subscription.component.html',
  styleUrls: ['./advisor-subscription.component.scss'],
  providers: [SubscriptionService]
})
 export class AdvisorSubscriptionComponent implements OnInit {
  /**
   * declaration: user plan data
   */
  productId:any = ""
  planId:any = ""
  planInterval:string = ""
  planAmount:number = 0
  planCurrency:string = ""

  constructor( private dialog: MatDialog, private subscriptionservice:SubscriptionService ) { }

  ngOnInit() {
    this.getProductDetails()
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

  // get product plan
  getProductDetails = (query = {}) => {
    this.subscriptionservice.getProductDetails({}, (returnArr)=>{
      this.productId    = returnArr.productId
      this.planId       = returnArr.planId
      this.planInterval = returnArr.planInterval
      this.planAmount   = returnArr.planAmount
      this.planCurrency = returnArr.planCurrency
    })
  }
}