import { Component, OnInit } from '@angular/core';
import {MatGridListModule} from '@angular/material/grid-list';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-landing-home-page',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  userId = localStorage.getItem('endUserId');
  userType = localStorage.getItem('endUserType');

  constructor(private router: Router) { 
    /*if(this.userType && this.userType == 'customer'){
      this.router.navigate(['/', 'customer', 'dashboard']);
    }
    if(this.userType && this.userType == 'advisor'){
      this.router.navigate(['/', 'advisor', 'dashboard']);
    }*/
  }

  ngOnInit() {
  }

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
}
