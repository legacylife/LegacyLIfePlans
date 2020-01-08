import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { CountUp, CountUpOptions } from 'countup.js';
import * as $ from 'jquery'
import { debounce } from 'lodash'
import { APIService } from 'app/api.service';
import { UserAPIService } from 'app/userapi.service';
import { serverUrl, s3Details } from '../../../../config';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray} from "@angular/forms";
import { MatSnackBar, MatDialog } from "@angular/material";
import { forEach } from "lodash";
const advisorBucketLink = s3Details.awsserverUrl+s3Details.assetsPath+'advisor/';
@Component({
  selector: 'app-landing-home-page',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  contactForm: FormGroup;
  featuredAdvisorsdata:any;
  actualUsers:boolean=true;
  slides = [
    {
      name: 'John Smith',
      photo: "assets/images/arkenea/john.png",
      title: 'CFC, CIF'
    }
  ];


  slideConfig = {
    'slidesToShow': 3, 'slidesToScroll': 1, responsive: [
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
          arrows: true,
          centerMode: true,
          centerPadding: '40px',
          slidesToShow: 1
        }
      }
    ]
  };
  // autoplaySpeed: 10000,autoplay : true,
  // pauseOnHover:false,  autoplaySpeed: 1000 , speed: 200,
  slideConfigTwo = {
    'slidesToShow': 3, pauseOnHover: false, 'centerMode': true, infinite: true,
    autoplay: true, autoplaySpeed: 2000, 'slidesToScroll': 1, responsive: [
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
    ]
  };

  endVal1: number = 12
  endVal2: number = 1208
  endVal3: number = 405
  endVal4: number = 320
  opts: CountUpOptions;
  // autoplay : true, autoplaySpeed: 1000 
  bfrSubAdvPremiumAccess:Number = 0
  advisorFreeTrialStatus:Boolean = false
  //
pageData : any;
 testomonials : any;
 resetCounter : any;
bucketLink : string;
topBanner : string;
middleBanner : string;
lowerBanner : string;
sectionEightBanner : string;
userId = localStorage.getItem('endUserId');
userType = localStorage.getItem('endUserType');
latitude: Number;
longitude: Number;
  constructor(private api:APIService, private userapi:UserAPIService, private fb: FormBuilder, private snack: MatSnackBar) { }

  ngOnInit() {
    this.bucketLink = advisorBucketLink;
    //https://alligator.io/js/geolocation-api/
    //https://medium.com/@balramchavan/display-and-track-users-current-location-using-google-map-geolocation-in-angular-5-c259ec801d58
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition((position) => {
        console.log(position.coords,">>>>>> Position >>>>>>>",position.coords.longitude,',',position.coords.latitude);       
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.getCMSpageDetails(this.longitude,this.latitude);
      });
    }else{
      this.getCMSpageDetails(this.longitude,this.latitude);
    }

    this.opts = {
      duration: 2
    };
    this.contactForm = this.fb.group({
      email: new FormControl("", [Validators.required, Validators.pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i)]),
      message: new FormControl("", Validators.required)
    });

    window.addEventListener('scroll', this.isScrolledIntoView, true);
    this.getFreeTrialSettings()
  }


  ngOnDestroy() {
    window.removeEventListener('scroll', this.isScrolledIntoView, true);
  }

  getCMSpageDetails(latitude,longitude){       
    let query = {}; 
    const req_vars = {
      query: Object.assign({status:'Active' }, query),
      location:Object.assign({longitude:longitude,latitude:latitude})
    }
    this.userapi.apiRequest('post', 'homecms/advisorView', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        if(result.data.cmsDetails) {
          this.pageData = result.data.cmsDetails;     
          this.featuredAdvisorsdata = this.pageData.featuredAdvisors;
          if(result.data.usersData) {
            this.featuredAdvisorsdata = [];           
            this.actualUsers = false;
            forEach(result.data.usersData,(element, index) => {
              let udata = [];
              udata['name'] = element.firstName+' '+element.lastName;
              udata['certifications'] = element.businessType.join(', ');
              if(element.profilePicture){
                udata['profilePhoto'] = s3Details.url + "/" + s3Details.profilePicturesPath + element.profilePicture;
              }else{
                udata['profilePhoto'] = "assets/images/arkenea/default.jpg"
              }              
              this.featuredAdvisorsdata.push(udata);
            });
          }
          this.topBanner = this.bucketLink+this.pageData.sectionOne.topBanner;     
          this.middleBanner = this.bucketLink+this.pageData.sectionThree.bannerImage;
          this.lowerBanner = this.bucketLink+this.pageData.sectionFour.bannerImage;
          this.sectionEightBanner = this.bucketLink+this.pageData.sectionEight.bannerImage;
          this.testomonials = this.pageData.testimonials;
          this.resetCounter = debounce(() => {
            this.opts = {
              duration: 1
            }
            setTimeout(() => {
              this.endVal1 = this.pageData.facts.savedFiles;
              this.endVal2 = this.pageData.facts.LLPMembers;
              this.endVal3 = this.pageData.facts.trustedAdvisors;
              this.endVal4 = this.pageData.facts.referralConnection;   
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




  isScrolledIntoView = () => {
    const docViewTop = $(window).scrollTop();
    const docViewBottom = docViewTop + $(window).height();

    const elemTop = $('#leadsNumbers').offset().top;
    const elemBottom = elemTop + $('#leadsNumbers').height();

    if ((elemBottom <= docViewBottom) && (elemTop >= docViewTop)) {
      this.opts = {
        duration: 0.1
      }
      this.endVal1 = 0;
      this.endVal2 = 0;
      this.endVal3 = 0;
      this.endVal4 = 0;
      this.resetCounter();
    }
  }


  removeSlide() {
    this.slides.length = this.slides.length - 1;
  }

  slickInit(e) {
    // console.log('slick initialized');
  }

  slickInit2(e) {
    //  console.log('slick initialized');
  }


  breakpoint(e) {
    // console.log('breakpoint');
  }

  afterChange(e) {
    //console.log('afterChange');
  }

  beforeChange(e) {
    // console.log('beforeChange');
  }

  gotoTop() {
    const content = document.getElementsByClassName('rightside-content-hold')[0]

    content.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  async getFreeTrialSettings(){
    let returnArr = await this.userapi.apiRequest('get', 'freetrialsettings/getdetails', {}).toPromise(),
        freeTrialPeriodSettings = returnArr.data
    this.bfrSubAdvPremiumAccess  = Number(freeTrialPeriodSettings.advisorFreeDays)
    this.advisorFreeTrialStatus  = freeTrialPeriodSettings.advisorStatus == 'On'? true : false
  }

}
