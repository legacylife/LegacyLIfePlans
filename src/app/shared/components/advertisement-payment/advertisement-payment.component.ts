import { Component, OnInit, HostListener } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { AdvertisementPaymentModalComponent } from 'app/shared/components/advertisement-payment-modal/advertisement-payment-modal.component';
import { LocationStrategy } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserAPIService } from 'app/userapi.service';
import { routerNgProbeToken } from '@angular/router/src/router_module';

@Component({
  selector: 'app-advisor-subscription',
  templateUrl: './advertisement-payment.component.html',
  styleUrls: ['./advertisement-payment.component.scss'],
})
 export class AdvertisementPaymentComponent {
  /**
   * declaration: user plan data
   */
  planInterval:string = ""
  planAmount:number = 0
  planCurrency:string = "USD"

  isDialogOpen:boolean = false
  userId: string = ''
  invoiceId: string = ''
  uniqueId:String = ''

  userName:String = ''
  isuserLoggedIn:Boolean = false
  activeInvoice:Boolean = false
  isPaymentDone:Boolean = false
  invoiceSentDays = 0
  invoiceFromDate:String = ''
  invoiceToDate:String = ''

  constructor( private dialog: MatDialog, private locationStrategy: LocationStrategy, private route: ActivatedRoute, private userApi: UserAPIService, private router: Router ) { 
    this.preventBackButton()
    
    this.route.parent.params.subscribe(params => {
      this.userId     = params.userId
      this.invoiceId  = params.invoiceId
      this.uniqueId   = params.uniqueId
      /*this.userId = atob(params.userId)
      this.invoiceId = atob(params.invoiceId)
      this.userId = Buffer.from(String(params.userId), 'base64').toString('binary')
      this.invoiceId = Buffer.from(String(params.invoiceId), 'base64').toString('binary') */
    });
    
    this.isuserLoggedIn = (localStorage.getItem("endUserId") && localStorage.getItem("endUserType") === 'advisor') ? ( localStorage.getItem("endUserId") === this.userId ? true : false) : false
    this.checkInvoiceDetails()
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
  }

  checkInvoiceDetails = async () => {
    let req_var = {userId:this.userId, invoice: this.invoiceId, uniqueId: this.uniqueId}
    let invoiceDetails = await this.userApi.apiRequest('post','advertisement/get-invoice-details', req_var).toPromise()
    if( invoiceDetails ) {
      if( invoiceDetails.data.cost ) {
        if( invoiceDetails.data.status === 'Pending' ) {
          this.planAmount = Number(invoiceDetails.data.cost)
          this.planInterval = invoiceDetails.data.totalDays+' days'
          this.activeInvoice = invoiceDetails.data.status === 'Pending' ? true : false
          this.userName = invoiceDetails.data.userName
          this.invoiceSentDays = invoiceDetails.data.invoiceSentDays
          this.invoiceFromDate = invoiceDetails.data.fromDate
          this.invoiceToDate = invoiceDetails.data.toDate
        }
        else if(invoiceDetails.data.status === 'Done') {
          this.isPaymentDone = true
        }
        else{
          this.isPaymentDone = false
        }
      }
      else{
        this.activeInvoice = false
      }
    }
  }
  
  openCardDetailsModal() {
    let dialogRef: MatDialogRef<any> = this.dialog.open(AdvertisementPaymentModalComponent, {
      width: '500px',
      disableClose: true,
      data: {
        for: 'advertisement',
        userId: this.userId,
        invoiceId: this.invoiceId,
        amount: this.planAmount,
        userName: this.userName,
        uniqueId: this.uniqueId
      }
    })
    dialogRef.afterOpened().subscribe(result => {
      this.isDialogOpen = true
      history.pushState(null, null, location.href);
    })
    dialogRef.afterClosed().subscribe(result => {
      this.isDialogOpen = false
      console.log("result",result)
      if (!result) {
        // If user press cancel
        return;
      }
      else{
        this.isPaymentDone = true
        if( localStorage.getItem('enduserId')) {
          this.router.navigate(['advisor/get-featured'])
        }
      }
      
    })
  }
}