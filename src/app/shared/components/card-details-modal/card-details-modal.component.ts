import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatDialog } from '@angular/material';

import { UserAPIService } from './../../../userapi.service';
import { StripeService, Elements, Element as StripeElement, ElementsOptions } from 'ngx-stripe';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { ProfilePicService } from 'app/shared/services/profile-pic.service';

@Component({
  selector: 'card-details-modal',
  templateUrl: './card-details-modal.component.html',
  styleUrls: ['./card-details-modal.component.scss']
})
export class CardDetailsComponent implements OnInit {

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
  userId = ""
  endUserType = ""
  token: string = ""


  /**
   * declaration: flash message data
   */
  showSuccessMessage = false;
  successMessage = "";
  showErrorMessage = false;
  errorMessage = "";

  stripePaymentError="";

  hideNewCardForm: boolean = false
  payUsingNewCardCheckbox: boolean = false

  constructor(private stripeService: StripeService, private userapi: UserAPIService, private loader: AppLoaderService, private fb: FormBuilder, private picService: ProfilePicService ) {
  }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.endUserType = localStorage.getItem("endUserType");
    this.stripePayment = this.fb.group({
      name: ['', [Validators.required,this.picService.noWhitespaceValidator]]
    });
    this.getProductDetails()
  }

  // get product plan
  getProductDetails = (query = {}) => {
    this.loader.open();
    const req_vars = {
      query: Object.assign({ _id: this.userId, userType: this.endUserType }, query)
    }
    
    this.userapi.apiRequest('post', 'userlist/getproductdetails', req_vars).subscribe(result => {
      if (result.status == "error") {
        this.loader.close();
      } else {
        const plans = result.data.plans
        if( plans && result.status=="success" && plans.data.length>0 ) {
          plans.data.forEach( obj => {
            if( this.endUserType== 'customer' && obj.id == 'C_YEARLY' ) {
              this.productId    = obj.product
              this.planId       = obj.id
              this.planInterval = obj.interval
              this.planAmount   = ( obj.amount / 100 )
              this.planCurrency = (obj.currency).toLocaleUpperCase()
            }
            else if( this.endUserType== 'advisor' && obj.id == 'A_MONTHLY' ) {
              this.productId    = obj.product
              this.planId       = obj.id
              this.planInterval = obj.interval
              this.planAmount   = ( obj.amount / 100 )
              this.planCurrency = (obj.currency).toLocaleUpperCase()
            }
          })
        }
        this.getCustomerCard()
        //this.loader.close();
      }
    }, (err) => {
      this.loader.close();
    })
  }

  // get customer cards if exists
  getCustomerCard = (query = {}) => {
    const req_vars = {
      query: Object.assign({ _id: this.userId, userType: this.endUserType }, query)
    }
    this.userapi.apiRequest('post', 'userlist/getcustomercard', req_vars).subscribe(result => {
      const data = result.data
      
      if( data ) {
        this.oldCard = data
        this.hideNewCardForm = true
        this.loader.close();
      }
      else{
        this.mountCard()
      }
    }, (err) => {
      console.log(err.message)
    })
  }

  payUsingNewCard = () => {
    
    if( !this.payUsingNewCardCheckbox ) {
      this.loader.open();
      this.payUsingNewCardCheckbox = true
      this.hideNewCardForm = false
      this.mountCard()
    }
    else{
      this.payUsingNewCardCheckbox = false
      this.hideNewCardForm = true
    }
  }

  // mount user card on HTML Element
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
      this.loader.close();
    });
  }

  //function to generate stripe token
  completePayment = () => {
    if( this.oldCard !== "" && !this.payUsingNewCardCheckbox ) {
      this.getSubscription();
    }
    else {
      const name = this.stripePayment.get('name').value;
      this.loader.open();
      this.stripeService.createToken(this.card, { name })
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
        }
      );
    }
  }

  // function to subscribe a paid plan
  getSubscription = ( token = null) => {
    this.loader.open();
    const req_vars = {
      query: Object.assign({ _id: this.userId, userType: this.endUserType, token:token, planId: this.planId }, {})
    }
    this.userapi.apiRequest('post', 'userlist/getsubscription', req_vars).subscribe(result => {
    
      const data = result
      
      if(data) {
        if(data.errorCode==403) {
          //window.location.href='/logout/';
        }
        else if(data.status=='success') {
          /* this.showSuccessMessage = true;
          this.successMessage = data.message;          
          this.basicPlan = false;
          this.planInfo = true; */
          localStorage.setItem('endUserSubscriptionStartDate', data.subscriptionStartDate);
          localStorage.setItem('endUserSubscriptionEndDate', data.subscriptionEndDate);
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
  }
}