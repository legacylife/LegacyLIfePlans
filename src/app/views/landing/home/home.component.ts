import { Component, OnInit, OnDestroy } from '@angular/core';
import {MatGridListModule} from '@angular/material/grid-list';
import { Router, ActivatedRoute } from '@angular/router';
import { CountUp, CountUpOptions } from 'countup.js';
import * as $ from 'jquery';
import { debounce } from 'lodash';
import { UserAPIService } from 'app/userapi.service';
import { serverUrl, s3Details } from '../../../config';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray} from "@angular/forms";
import { MatSnackBar, MatDialog, MatDialogRef } from "@angular/material";
import { VideoModalComponent } from '../video-modal/video-modal.component';
const customerBucketLink = s3Details.awsserverUrl+s3Details.assetsPath+'customer/';
@Component({
  selector: 'app-landing-home-page',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  contactForm: FormGroup;
  panelOpenState = false;
  pageData : any;
  testomonials : any;
  resetCounter : any;
  bucketLink : string;
  topBanner : string;
  pageTitle : string = '';
  middleBanner : string;
  lowerBanner : string;
  userId = localStorage.getItem('endUserId');
  userType = localStorage.getItem('endUserType');

  slideConfig = { 'slidesToShow': 3, pauseOnHover:false, 'slidesToScroll': 1 ,  responsive : [
    {
      breakpoint: 1212,
      settings: {
        centerMode: true,
        centerPadding: '40px',
        slidesToShow: 2
      }
    },
    {
      breakpoint: 820,
      settings: {
        arrows: false,
        centerMode: true,
        centerPadding: '40px',
        slidesToShow: 1
      }
    }
  ]};
  slideConfigTwo = { 'slidesToShow': 3, pauseOnHover:false, 'centerMode': true, infinite: true,
   autoplay: true,  autoplaySpeed: 2000 , 'slidesToScroll': 1 , responsive : [
    {
      breakpoint: 1212,
      settings: {
        centerMode: true,
        centerPadding: '40px',
        slidesToShow: 2
      }
    },
    {
      breakpoint: 820,
      settings: {
        arrows: false,
        centerMode: true,
        centerPadding: '40px',
        slidesToShow: 1
      }
    }
  ]};
  slickInit(e) {
  }
  slickInit2(e) {
  }
  breakpoint(e) {
  }
  afterChange(e) {
  }
  beforeChange(e) {
  }
  gotoTop() {
    const content = document.getElementsByClassName('rightside-content-hold')[0]
    content.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  endVal1: number;
  endVal2: number;
  endVal3: number;
  endVal4: number;
  opts: CountUpOptions;

  /**
   * declaration: user plan data
   */
  productId:any = ""
  planId:any = ""
  planInterval:string = ""
  planAmount:number = 0
  planCurrency:string = ""
  defaultSpace:Number = 0
  spaceDimension:String = "GB"
  addOnSpace:Number = 0
  addOnCharges:Number = 0
  addOnMaxDurationDay:Number = 0
  fullSpace:Number = 0

  customerFreeAccessDays:Number = 0
  customerFreeTrialStatus:Boolean = false

  constructor(private dialog: MatDialog, private router: Router, private userapi: UserAPIService, private fb: FormBuilder, private snack: MatSnackBar) { }
  

  ngOnInit() {
    this.bucketLink = customerBucketLink;
    this.getCMSpageDetails();
    this.opts = {
      duration: 2
    };

    this.contactForm = this.fb.group({
      email: new FormControl("", [Validators.required, Validators.pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i)]),
      message: new FormControl("", Validators.required)
    });

    window.addEventListener('scroll', this.isScrolledIntoViewOne, true);
    this.getFreeTrialSettings()
    
    this.userapi.apiRequest('post', 'auth/getproductdetails', {}).subscribe(result => {
      const plans = result.data.plans
      let returnArr = {}
      if( plans && result.status=="success" && plans.data.length>0 ) {
        plans.data.forEach( obj => {
          if( obj.id == 'C_YEARLY' ) {
            this.productId =  obj.product
            this.planId = obj.id
            this.planInterval = obj.interval
            this.planAmount = ( obj.amount / 100 )
            this.planCurrency = (obj.currency).toLocaleUpperCase()
            this.defaultSpace = Number(obj.metadata.defaultSpace)
            this.spaceDimension = obj.metadata.spaceDimension
            this.addOnSpace = Number(obj.metadata.addOnSpace)
            this.addOnCharges = Number(obj.metadata.addOnCharges)
            this.addOnMaxDurationDay = Number(obj.metadata.addOnMaxDurationDay)
            this.fullSpace = Number(obj.metadata.defaultSpace) + Number(obj.metadata.addOnSpace)
          }
        })
      }
    },
    (err) => {
      
    })
  }
  
  ngOnDestroy() {
    window.removeEventListener('scroll', this.isScrolledIntoViewOne, true);
  }

  contactFormSubmit() {
    let query = {};
    let data = {
      query: Object.assign({ email: this.contactForm.value.email, message: this.contactForm.value.message }, query)
    };
    if(this.contactForm.controls['email'].valid && this.contactForm.controls['message'].valid){
      this.userapi.apiRequest("post", "sendMails/contact-us", data).subscribe(
        result => {
          if (result.status == "error") {
            this.snack.open(result.data.message, "OK", { duration: 4000 });
          } else {
            this.snack.open(result.data.message, "OK", { duration: 4000 });
            this.contactForm.reset();
          }
        },
        err => {
          console.error(err);
        }
      );
    }  
    else {
      if(this.contactForm.controls['email'].invalid)
        this.contactForm.controls['email'].markAsTouched();
      if(this.contactForm.controls['message'].invalid)
        this.contactForm.controls['message'].markAsTouched();
    }      
  }

  getCMSpageDetails(query = {}){
    const req_vars = {
      status:'Active'
    }
    this.userapi.apiRequest('post', 'homecms/view', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if(result.data){
          this.pageData = result.data;        
          this.pageTitle = this.pageData.pageTitle;
          this.topBanner = this.bucketLink+this.pageData.topBanner;
          this.middleBanner = this.bucketLink+this.pageData.middleBanner;
          this.lowerBanner = this.bucketLink+this.pageData.lowerBanner;

          this.testomonials = this.pageData.testimonials;
          this.resetCounter = debounce(() => {
            this.opts = {
              duration: 1
            }
            setTimeout(() => {
              this.endVal1 = this.pageData.facts.savedFiles;
              this.endVal2 = this.pageData.facts.trustedAdvisors;
              this.endVal3 = this.pageData.facts.successLogin;
              this.endVal4 = this.pageData.facts.LLPMembers;   
            }, 200);
          }, 100);
        }
      }
    }, (err) => {
      console.error(err)
    })
  }
  
  getUrl(name)
  {
    if(name == 'topBanner'){
      return "url('"+this.topBanner+"')";
    } else if(name == 'middleBanner'){
      return "url('"+this.middleBanner+"')";
    } else if(name == 'lowerBanner'){
      return "url('"+this.lowerBanner+"')";
    }
  }

  isScrolledIntoViewOne = () => {
    const docViewTop = $(window).scrollTop();
    const docViewBottom = docViewTop + $(window).height();

    const elemTop = $('#leadsNumbersAd').offset().top;
    const elemBottom = elemTop + $('#leadsNumbersAd').height();

    if ((elemBottom <= docViewBottom) && (elemTop >= docViewTop)) {
      this.opts = {
        duration: 0.1
      }
      this.endVal1 = this.pageData.facts.savedFiles;
      this.endVal2 = this.pageData.facts.trustedAdvisors;
      this.endVal3 = this.pageData.facts.successLogin;
      this.endVal4 = this.pageData.facts.LLPMembers;   
      this.resetCounter();
    }
  }

  contentScroll(scrolldivid) {
    console.log('>>>>>>>>>>>>>scrolldivid',scrolldivid)
    var content = document.getElementById("customer-home-content")
    // console.log(content)
    var scrolldiv = document.getElementById(scrolldivid)
    var topPos = scrolldiv ? scrolldiv.offsetTop : 0;
    if(content) {
      content.scrollTop = topPos;
    }

    // var scrolldiv = document.getElementById(scrolldivid)
    // scrolldiv.scrollIntoView()
  }

  async getFreeTrialSettings(){
    let returnArr = await this.userapi.apiRequest('get', 'freetrialsettings/getdetails', {}).toPromise(),
        freeTrialPeriodSettings = returnArr.data
    this.customerFreeAccessDays  = Number(freeTrialPeriodSettings.customerFreeAccessDays)
    this.customerFreeTrialStatus  = freeTrialPeriodSettings.customerStatus == 'On'? true : false
  }

  openVideoModal(datas) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(VideoModalComponent, {
      width: '500px',
      data: datas,
    })
  }
}
