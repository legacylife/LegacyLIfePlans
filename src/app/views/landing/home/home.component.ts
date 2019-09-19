import { Component, OnInit, OnDestroy } from '@angular/core';
import {MatGridListModule} from '@angular/material/grid-list';
import { Router, ActivatedRoute } from '@angular/router';
import { CountUp, CountUpOptions } from 'countup.js';
import * as $ from 'jquery';
import { debounce } from 'lodash';
import { UserAPIService } from 'app/userapi.service';
import { serverUrl, s3Details } from '../../../config';
const customerBucketLink = s3Details.awsserverUrl+s3Details.assetsPath+'customer/';
@Component({
  selector: 'app-landing-home-page',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  panelOpenState = false;
  pageData : any;
  testomonials : any;
  resetCounter : any;
  bucketLink : string;
  topBanner : string;
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

  constructor(private router: Router, private userapi: UserAPIService) { }

  ngOnInit() {
    this.bucketLink = customerBucketLink;
    this.getCMSpageDetails();
    this.opts = {
      duration: 2
    };
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

  getCMSpageDetails(query = {}){
    const req_vars = {
      status:'Active'
    }
    console.log('query >>> ',query)
    this.userapi.apiRequest('post', 'homecms/view', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if(result.data){
          this.pageData = result.data;        
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

  async getFreeTrialSettings(){
    let returnArr = await this.userapi.apiRequest('get', 'freetrialsettings/getdetails', {}).toPromise(),
        freeTrialPeriodSettings = returnArr.data
    this.customerFreeAccessDays  = Number(freeTrialPeriodSettings.customerFreeAccessDays)
    this.customerFreeTrialStatus  = freeTrialPeriodSettings.customerStatus == 'On'? true : false
  }
}
