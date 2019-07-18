import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserAPIService } from './../../../userapi.service';
import { StripeService, Elements, Element as StripeElement, ElementsOptions } from 'ngx-stripe';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { ProfilePicService } from 'app/shared/services/profile-pic.service';
import { SubscriptionService } from 'app/shared/services/subscription.service';

@Component({
  selector: 'card-details-modal',
  templateUrl: './card-details-modal.component.html',
  styleUrls: ['./card-details-modal.component.scss']
})
export class CardDetailsComponent implements OnInit {
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
  planCurrency:string = ""

  oldCard: string = ""
  userId = ""
  endUserType = ""
  token: string = ""
  stripePaymentError="";
  hideNewCardForm: boolean = false
  payUsingNewCardCheckbox: boolean = false

  constructor(private stripeService: StripeService, private userapi: UserAPIService, private loader: AppLoaderService, 
    private fb: FormBuilder, private picService: ProfilePicService, private subscriptionservice:SubscriptionService ) {}

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
    this.subscriptionservice.getProductDetails({}, (returnArr)=>{
      this.productId    = returnArr.productId
      this.planId       = returnArr.planId
      this.planInterval = returnArr.planInterval
      this.planAmount   = returnArr.planAmount
      this.planCurrency = returnArr.planCurrency
      this.getCustomerCard()
    })
  }

  // get customer cards if exists
  getCustomerCard = (query = {}) => {
    const req_vars = {
      query: Object.assign({ _id: this.userId, userType: this.endUserType }, query)
    }
    this.userapi.apiRequest('post', 'userlist/getcustomercard', req_vars).subscribe(result => {
      const data = result.data
      
      if( data && data.message == 'Yes') {
        this.oldCard = data
        this.hideNewCardForm = true
        this.loader.close();
      }
      else{
        this.mountCard()
      }
    }, (err) => {
      this.loader.close();
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
          }
          else if (result.error) {
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
      if (result.status == "error") {
        this.loader.close();
      }
      
      if(data.status=='success') {
        localStorage.setItem('endUserSubscriptionStartDate', data.subscriptionStartDate);
        localStorage.setItem('endUserSubscriptionEndDate', data.subscriptionEndDate);
        //this.router.navigate(['LoggedoutPage']);
        
        //this.userService.changeActiveHrUrl();
      }
      this.loader.close();
    }, (err) => {      
      this.loader.close();
    })
  }
}