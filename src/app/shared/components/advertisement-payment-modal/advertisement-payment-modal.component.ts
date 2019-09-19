/**
 * @copyright: Arkenea technology
 * @author: Nilesh Yadav
 * @since: 10 Aug 2019 10:00 PM
 * @description: Component for payment modal of subscription, addon & renew legacy subscription
 */
import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserAPIService } from './../../../userapi.service';
import { StripeService, Elements, Element as StripeElement, ElementsOptions } from 'ngx-stripe';
import { AppLoaderService } from 'app/shared/services/app-loader/app-loader.service';
import { ProfilePicService } from 'app/shared/services/profile-pic.service';
import { MAT_DIALOG_DATA, MatDialog, MatSnackBar } from '@angular/material';

@Component({
  selector: 'card-details-modal',
  templateUrl: './advertisement-payment-modal.component.html',
  styleUrls: ['./advertisement-payment-modal.component.scss']
})

export class AdvertisementPaymentModalComponent implements OnInit {
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
  planAmount:number = 0
  planCurrency:string = "USD"
  userId = ""
  token: string = ""
  stripePaymentError="";
  
  isButtonEnabled:boolean = false
  userName:String = ""
  invoiceId:String = ""

  constructor(private stripeService: StripeService, private userapi: UserAPIService, private loader: AppLoaderService, 
    private fb: FormBuilder, private picService: ProfilePicService, @Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog, private snack: MatSnackBar ) {
      this.userId = data.userId
      this.invoiceId = data.invoiceId
      this.planAmount = data.amount
      this.userName = data.userName
  }

  ngOnInit() {
    this.stripePayment = this.fb.group({
      name: ['', [Validators.required,this.picService.noWhitespaceValidator]]
    });
    this.mountCard()
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
    this.isButtonEnabled = false
    const name = this.stripePayment.get('name').value;
    this.loader.open();
    this.stripeService.createToken(this.card, { name })
      .subscribe(result => {
        if (result && result.token) {
          //send token to backend to complete transaction
          this.completeTransaction(result.token.id);
        }
        else if (result.error) {
          // Error creating the token
          this.loader.close();
          this.stripePaymentError = result.error.message;
          this.isButtonEnabled = true
          setTimeout( function() {
            this.stripePaymentError="";
          }.bind(this),5000);
          this.loader.close();
        }
      }
    );
  }

  /**
   * @description: method used for renew the legacy owner subscription by the hired user
   * @access private
   * @param string $token : card token return by stripe, if user do payment using new card
   * @returns: success error message
   */
  completeTransaction = ( token = null) => {
    const req_vars = {
      query: Object.assign({ userId: this.userId, invoice: this.invoiceId, uniqueId: this.data.uniqueId, token:token }, {})
    }
    this.userapi.apiRequest('post', 'advertisement/complete-transaction', req_vars).subscribe(result => {
      
      this.isButtonEnabled = true
      if (result.status == "error") {
        this.snack.open(result.data, 'OK', { duration: 4000 })
        this.loader.close();
      }      
      if(result.status=='success') {
        this.dialog.closeAll(); 
        this.snack.open(result.data.message, 'OK', { duration: 4000 })
      }
      this.loader.close();
    }, (err) => {  
      this.snack.open(err, 'OK', { duration: 4000 })    
      this.loader.close();
    })
  }
}