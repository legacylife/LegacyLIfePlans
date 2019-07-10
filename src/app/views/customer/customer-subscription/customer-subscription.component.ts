
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { CardDetailsComponent } from 'app/shared/components/card-details-modal/card-details-modal.component';


import { UserAPIService } from './../../../userapi.service';
import { StripeService, Elements, Element as StripeElement, ElementsOptions } from 'ngx-stripe';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { ProfilePicService } from 'app/shared/services/profile-pic.service';

@Component({
  selector: 'app-customer-subscription',
  templateUrl: './customer-subscription.component.html',
  styleUrls: ['./customer-subscription.component.scss']
})
 export class CustomerSubscriptionComponent implements OnInit {
  tiles: any
  basicPlan = true;
  planInfo = false;
  /**
   * declaration: stripe gateway data
   */
  elements: Elements
  card: StripeElement
  elementsOptions: ElementsOptions = { locale: 'en' }
  stripePayment: FormGroup

  /**
   * declaration: user plan data
   */
  productId:any = ""
  planId:any = ""
  planInterval:string = ""
  planName:string = ""
  planAmount:number = 0
  planDesc:string = ""
  planUsers:number = 0
  planCurrency:string = ""

  cards: any
  oldCard: string = ""
  userId = "";
  token: string = "";


  /**
   * declaration: flash message data
   */
  showSuccessMessage = false;
  successMessage = "";
  showErrorMessage = false;
  errorMessage = "";

  stripePaymentError="";

  constructor(private dialog: MatDialog,) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.stripePayment = this.fb.group({
      name: ['', [Validators.required,this.picService.noWhitespaceValidator]]
    });
    /* this.tiles = [
      {text: 'In-Dept Estate Planing Platform', cols: 2, rows: 1, color: 'lightblue'},
      {text: 'Professional Resources and  Guides', cols: 2, rows: 1, color: 'lightgreen'},
      {text: 'Secure Encrypted Document Storage', cols: 2, rows: 1, color: 'lightpink'},
      {text: 'Online Help', cols: 2, rows: 1, color: '#DDBDF1'},
      {text: 'Unlimited Trustees', cols: 2, rows: 1, color: '#DDBDF1'},
      {text: 'Video & Picture Time Capsule', cols: 2, rows: 1, color: '#DDBDF1'},
      {text: 'Local Advisor Directory', cols: 2, rows: 1, color: '#DDBDF1'},
    ]; */
    this.getProductDetails()
    this.mountCard()
    //this.getCustomerCard()
  }

  //mount card on stripe elements
  mountCard = () => {
    //create stripe card form here
    this.stripeService.elements(this.elementsOptions)
      .subscribe(elements => {
        this.elements = elements;
        if (!this.card) {
          this.card = this.elements.create('card', {
            style: {
              base: {
                iconColor: '#666EE8',
                color: '#31325F',
                lineHeight: '40px',
                fontWeight: 300,
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSize: '18px',
                '::placeholder': {
                  color: '#CFD7E0'
                }
              }
            }
          });
        }
      this.card.mount('#card-fields');
    });
  }

  // get product plan
  getProductDetails = (query = {}) => {
    this.loader.open();
    //this.http.get(environment.employerApiUrl + 'getproductdetails', this.requestOptions).subscribe((result:any) => {
    const req_vars = {
      query: Object.assign({ _id: this.userId, userType: "customer" }, query)
    }
    
    this.userapi.apiRequest('post', 'userlist/getproductdetails', req_vars).subscribe(result => {
      if (result.status == "error") {
        this.loader.close();
      } else {
        const plans = result.data.plans
        if( plans && result.status=="success" && plans.data.length>0 ) {
          plans.data.forEach( obj => {
            console.log("asdas",typeof obj.currency)
            if( obj.id == 'C_YEARLY' ) {
              this.productId    = obj.product
              this.planId       = obj.id
              this.planInterval = obj.interval
              this.planAmount   = ( obj.amount / 100 )
              this.planCurrency = (obj.currency).toLocaleUpperCase()
            }
          })
        }
        //const data = result.json().data
        /* if(data && data.status=="Success" && data.productDetails.length>0) {
          this.productId = data.productDetails[0].id
          this.planName = data.productDetails[0].name
          this.planDesc = data.productDetails[0].description
          if(data.productDetails[0].planDetails.length>0) {
            data.productDetails[0].planDetails.forEach(element => {
              this.planId = element.id
              this.planInterval = element.planInterval
              this.planUsers = element.planMaxUser
              this.planAmount = element.planAmount  
            });          
          }
        } */
        this.loader.close();
      }
    }, (err) => {
      this.loader.close();
    })
  }

  // get customer cards if exists
  getCustomerCard = (query = {}) => {
    const req_vars = {
      query: Object.assign({ _id: this.userId, userType: "customer" }, query)
    }
    this.userapi.apiRequest('post', 'userlist/getcustomercard', req_vars).subscribe(result => {
      const data = JSON.parse((<any>result)._body).data
      if(data && data.cards && data.cards.length > 0) {
        this.oldCard = data.cards[0]
      }
    }, (err) => {
      console.log(err.message)
    })
  }

  //function to generate stripe token
  completePayment = () => {

    if(this.oldCard !== "") {
      this.getSubscription();
      
    } else {
      const name = this.stripePayment.get('name').value;
      this.loader.open();
      this.stripeService
        .createToken(this.card, { name })
        .subscribe(result => {
          if (result && result.token) {
            //send token to backend to complete transaction
            this.getSubscription(result.token.id);
            this.loader.close();
          } else if (result.error) {
            // Error creating the token
            this.loader.close();
            this.stripePaymentError = result.error.message;
            setTimeout( function() {
              this.stripePaymentError="";
            }.bind(this),5000);
            this.loader.close();
          }
        });
    }
  }

  // function to subscribe a paid plan
  getSubscription = ( token = null) => {
    this.loader.open();
    const req_vars = {
      query: Object.assign({ _id: this.userId, userType: "customer", token:token, planId: this.planId }, {})
    }
    this.userapi.apiRequest('post', 'userlist/getsubscription', req_vars).subscribe(result => {
    
      const data = JSON.parse((<any>result)._body).data
      
      if(data) {
        if(data.errorCode==403) {
          //window.location.href='/logout/';
        }
        else if(data.status=='Success') {
          this.showSuccessMessage = true;
          this.successMessage = data.message;          
          this.basicPlan = false;
          this.planInfo = true;
          
          /* this.currentUserJson['subscription'] = true
          this.currentUserJson['subscriptionEnd'] = data.endDate
          localStorage.setItem('currentUser', JSON.stringify(this.currentUserJson));

          this.userService.changeActiveHrUrl();    */      
        }
        else{
          this.showErrorMessage = true
          this.errorMessage = data.message
          //this.sendingRequest=false;
        }
      }
    }, (err) => {      
        this.showErrorMessage = true;
        this.errorMessage = err.message;  
        //this.sendingRequest=false;
    })

    setTimeout(function() {
      this.showSuccessMessage = false
      this.showErrorMessage = false
      this.successMessage = ""
      this.errorMessage = ""
    }.bind(this), 5000)
  }

  openCardDetailsModal() {
     let dialogRef: MatDialogRef<any> = this.dialog.open(CardDetailsComponent, {
       width: '500px',
       disableClose: true,
     })
   }

}
  