import { Component, OnInit, HostListener } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { CardDetailsComponent } from 'app/shared/components/card-details-modal/card-details-modal.component';
import { SubscriptionService } from '../../../shared/services/subscription.service';
import { LocationStrategy } from '@angular/common';

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

  premiumExpired:boolean = false
  freePremiumExpired:boolean = false

  isDialogOpen:boolean = false

  constructor( private dialog: MatDialog, private subscriptionservice:SubscriptionService, private locationStrategy: LocationStrategy ) { 
    this.premiumExpired = localStorage.getItem('endUserProSubscription') && localStorage.getItem('endUserProSubscription') == 'yes' ? false : true
    this.freePremiumExpired = localStorage.getItem('endUserProFreeSubscription') && localStorage.getItem('endUserProFreeSubscription') == 'yes' ? false : true
    this.preventBackButton()
  }

  preventBackButton() {
    this.locationStrategy.onPopState(() => {
      if(this.isDialogOpen) {
        alert("Click on back button will be terminated your transaction. Please wait while completion of your transaction or close the payment popup to proceed.")
        history.pushState(null, null, location.href);
      }
    })
  }
  
  @HostListener("window:beforeunload", ["$event"])
  unloadHandler(event: Event) {
    if(this.isDialogOpen) {
      // Do more processing...
      event.returnValue = false;
    }
  }

  ngOnInit() {
    this.dialog.closeAll(); 
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
    dialogRef.afterOpened().subscribe(result => {
      this.isDialogOpen = true
      history.pushState(null, null, location.href);
    })
    dialogRef.afterClosed().subscribe(result => {
      this.isDialogOpen = false
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