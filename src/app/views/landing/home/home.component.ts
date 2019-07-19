import { Component, OnInit, OnDestroy } from '@angular/core';
import {MatGridListModule} from '@angular/material/grid-list';
import { Router, ActivatedRoute } from '@angular/router';
import { CountUp, CountUpOptions } from 'countup.js';
import * as $ from 'jquery';
import { debounce } from 'lodash';
import { UserAPIService } from 'app/userapi.service';


@Component({
  selector: 'app-landing-home-page',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  panelOpenState = false;

  resetCounter = debounce(() => {
    this.opts = {
      duration: 1
    }
    setTimeout(() => {
      this.endVal1 = 987852;
      this.endVal2 = 6715;
      this.endVal3 = 78145;
      this.endVal4 = 207816;
    }, 200);
  }, 100);

  userId = localStorage.getItem('endUserId');
  userType = localStorage.getItem('endUserType');



  testomonials = [
    {
      clientSays: 'Lorem Ipsum is simp has been the industrys Lorem Ipsum is simply dummy text of the printing..',
      clientPic: "assets/images/arkenea/james100.png",
      clientName: 'John Smith',
      clientDesc: 'CFC, CIF'

    },
    {
      clientSays: 'Lorem Ipsum is simp has been the industrys Lorem Ipsum is simply dummy text of the printing.',
      clientPic: "assets/images/arkenea/user-male.png",
      clientName: 'John Smith',
      clientDesc: 'CFC, CIF'

    },
    {
      clientSays: 'Lorem Ipsum is simp has been the industrys Lorem Ipsum is simply dummy text of the printing.',
      clientPic: "assets/images/arkenea/john100.png",
      clientName: 'John Smith',
      clientDesc: 'CFC, CIF'

    }, {
      clientSays: 'Lorem Ipsum is simply dummy e industrys Lorem Ipsum is simply dummy text of the printing.',
      clientPic: "assets/images/arkenea/james100.png",
      clientName: 'John Smith',
      clientDesc: 'CFC, CIF'

    },
    {
      clientSays: 'Lorem Ipsum is simp has been the industrys Lorem Ipsum is simply dummy text of the printing.',
      clientPic: "assets/images/arkenea/user-male.png",
      clientName: 'John Smith',
      clientDesc: 'CFC, CIF'

    },
    {
      clientSays: 'Lorem Ipsum is simp has been the industrys Lorem Ipsum is simply dummy text of the printing.',
      clientPic: "assets/images/arkenea/john100.png",
      clientName: 'John Smith',
      clientDesc: 'CFC, CIF'

    }, {
      clientSays: 'Lorem Ipsum is simply dummy e industrys Lorem Ipsum is simply dummy text of the printing.',
      clientPic: "assets/images/arkenea/james100.png",
      clientName: 'John Smith',
      clientDesc: 'CFC, CIF'

    },
    {
      clientSays: 'Lorem Ipsum is simp has been the industrys Lorem Ipsum is simply dummy text of the printing.',
      clientPic: "assets/images/arkenea/user-male.png",
      clientName: 'John Smith',
      clientDesc: 'CFC, CIF'

    },
    {
      clientSays: 'Lorem Ipsum is simp has been the industrys Lorem Ipsum is simply dummy text of the printing.',
      clientPic: "assets/images/arkenea/john100.png",
      clientName: 'John Smith',
      clientDesc: 'CFC, CIF'

    }, {
      clientSays: 'Lorem Ipsum is simply dummy e industrys Lorem Ipsum is simply dummy text of the printing.',
      clientPic: "assets/images/arkenea/james100.png",
      clientName: 'John Smith',
      clientDesc: 'CFC, CIF'

    },
    {
      clientSays: 'Lorem Ipsum is simp has been the industrys Lorem Ipsum is simply dummy text of the printing.',
      clientPic: "assets/images/arkenea/user-male.png",
      clientName: 'John Smith',
      clientDesc: 'CFC, CIF'

    },
    {
      clientSays: 'Lorem Ipsum is simp has been the industrys Lorem Ipsum is simply dummy text of the printing.',
      clientPic: "assets/images/arkenea/john100.png",
      clientName: 'John Smith',
      clientDesc: 'CFC, CIF'

    }
];

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

  endVal1: number = 12
  endVal2: number = 1208
  endVal3: number = 405
  endVal4: number = 320
  opts: CountUpOptions;

  /**
   * declaration: user plan data
   */
  productId:any = ""
  planId:any = ""
  planInterval:string = ""
  planAmount:number = 0
  planCurrency:string = ""
  
  constructor(private router: Router, private userapi: UserAPIService) { }

  ngOnInit() {
    this.opts = {
      duration: 2
    };
    window.addEventListener('scroll', this.isScrolledIntoViewOne, true);

    
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

  isScrolledIntoViewOne = () => {
    const docViewTop = $(window).scrollTop();
    const docViewBottom = docViewTop + $(window).height();

    const elemTop = $('#leadsNumbersAd').offset().top;
    const elemBottom = elemTop + $('#leadsNumbersAd').height();

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
}
