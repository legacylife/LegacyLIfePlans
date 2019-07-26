import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserAPIService } from './../../../userapi.service';
import { StripeService, Elements, Element as StripeElement, ElementsOptions } from 'ngx-stripe';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { ProfilePicService } from 'app/shared/services/profile-pic.service';
import { SubscriptionService } from 'app/shared/services/subscription.service';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog, MatSnackBar } from '@angular/material';
import  * as moment  from 'moment'

@Component({
  selector: 'card-details-modal',
  templateUrl: './card-details-modal.component.html',
  styleUrls: ['./card-details-modal.component.scss']
})
export class CardDetailsComponent implements OnInit {
  for:string = 'subscription'
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
  spaceAlloted:string

  oldCard: string = ""
  userId = ""
  endUserType = ""
  token: string = ""
  stripePaymentError="";
  hideNewCardForm: boolean = false
  payUsingNewCardCheckbox: boolean = false
  today: Date = moment().toDate()
  
  isButtonEnabled:boolean = false

  constructor(private stripeService: StripeService, private userapi: UserAPIService, private loader: AppLoaderService, 
    private fb: FormBuilder, private picService: ProfilePicService, private subscriptionservice:SubscriptionService, 
    private router: Router, @Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog, private snack: MatSnackBar ) {
      // get data from popup to check fro which the popup is open i.e for subscription charges or addon payment
      this.for = data.for
    }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.endUserType = localStorage.getItem("endUserType");
    this.stripePayment = this.fb.group({
      name: ['', [Validators.required,this.picService.noWhitespaceValidator]]
    });
    if( this.for == 'subscription' ) {
      this.getProductDetails()
    }
    else{
      this.getPlanDetails()
    }
    console.log("open modal for",this.for)
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

  // get product plan
  getPlanDetails = (query = {}) => {
    this.subscriptionservice.getPlanDetails( (returnArr) => {
      /* this.productId    = returnArr.productId
      this.planId       = returnArr.planId
      this.planInterval = returnArr.planInterval */
      let subscriptionDate = moment( localStorage.getItem("endUserSubscriptionEndDate") )
      let diff = Math.round(this.subscriptionservice.getDateDiff( this.today, subscriptionDate.toDate() ))
      let addOnCharges = Number (returnArr.metadata.addOnCharges)
      let addOnAmount = diff > 364 ? addOnCharges : ( (addOnCharges/365)*diff ).toFixed(2)
      //this.planAmount   = Number(addOnAmount)
      let finalAddOnAmount = Number(addOnAmount)
      this.planAmount = finalAddOnAmount < 0.5 ? 0.5 : finalAddOnAmount
      //(diff > 364 ? returnArr.metadata.addOnCharges : ( (returnArr.metadata.addOnCharges/365)*diff )).toFixed(2)//diff > 364 ? 50 :( returnArr.metadata.addOnCharges / diff)
      this.planCurrency = (returnArr.currency).toLocaleUpperCase()
      this.spaceAlloted = returnArr.metadata.addOnSpace
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
        this.isButtonEnabled = true
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
      this.isButtonEnabled = true
    });
  }

  //function to generate stripe token
  completePayment = () => {
    if( this.oldCard !== "" && !this.payUsingNewCardCheckbox ) {
      if( this.for == 'subscription' ) {
        this.getSubscription();
      }
      else{
        this.getAddOn();
      }
    }
    else {
      const name = this.stripePayment.get('name').value;
      this.loader.open();
      this.stripeService.createToken(this.card, { name })
        .subscribe(result => {
          if (result && result.token) {
            //send token to backend to complete transaction
            if( this.for == 'subscription' ) {
              this.getSubscription(result.token.id);
            }
            else{
              this.getAddOn(result.token.id);
            }
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
      const data = result.data
      console.log("result:",result)
      if (result.status == "error") {
        this.loader.close();
      }
      
      if(result.status=='success') {
        localStorage.setItem('endUserSubscriptionStartDate', data.subscriptionStartDate);
        localStorage.setItem('endUserSubscriptionEndDate', data.subscriptionEndDate);
        localStorage.setItem('endUserAutoRenewalStatus', "true");
        localStorage.setItem('endUserSubscriptionStatus', "paid");
        let url = '/'+this.endUserType+'/account-setting'
        this.dialog.closeAll(); 
        this.snack.open("Account upgraded successfully. Please check email for more info.", 'OK', { duration: 4000 })
        this.router.navigate([url]);
      }
      this.loader.close();
    }, (err) => {      
      this.loader.close();
    })
  }

  // function to subscribe a paid addon plan
  getAddOn = ( token = null) => {
    this.loader.open();
    const req_vars = {
      query: Object.assign({ _id: this.userId, userType: this.endUserType, token:token, currency: (this.planCurrency).toLocaleLowerCase(), amount: this.planAmount, spaceAlloted: this.spaceAlloted }, {})
    }
    this.userapi.apiRequest('post', 'userlist/getaddon', req_vars).subscribe(result => {
      const data = result.data
      if (result.status == "error") {
        this.loader.close();
      }
      else if(result.status=='success') {
        localStorage.setItem('endUserSubscriptionAddon', 'yes');
        this.dialog.closeAll(); 
        this.snack.open("Add on successfully added to your account. Please check email for more info.", 'OK', { duration: 4000 })
        //let url = '/'+this.endUserType+'/dashboard'
        //this.router.navigate([url]);
      }
      this.loader.close();
    }, (err) => {      
      this.loader.close();
    })
  }
}