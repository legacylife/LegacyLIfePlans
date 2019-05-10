import { Component, OnInit } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-landing-home-page',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  slides = [
    {
      name : 'John Smith',
      photo : "assets/images/arkenea/john.png",
      title : 'CFC, CIF'
    },
    {
      name : 'Emily Doe',
      photo : "assets/images/arkenea/emily.png",
      title : 'CFC, CIF'
    },
    {
      name : 'James Anderson',
      photo : "assets/images/arkenea/james.png",
      title : 'CFC, CIF'
    },
    {
      name : '4 John Smith',
      photo : "assets/images/arkenea/john.png",
      title : 'CFC, CIF'
    },
    {
      name : '5 Emily Doe',
      photo : "assets/images/arkenea/emily.png",
      title : 'CFC, CIF'
    },
    {
      name : '6 James Anderson',
      photo : "assets/images/arkenea/james.png",
      title : 'CFC, CIF'
    },
  ];
  testomonial = [
    {
      clientSays: 'Lorem Ipsum is simply dummy e industrys Lorem Ipsum is simply dummy text of the printing.',
      clientPic: "assets/images/arkenea/james.png",
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
      clientSays: 'Lorem Ipsum is simply dummy text ofs simply dummy text of the printing.',
      clientPic: "assets/images/arkenea/john.png",
      clientName: 'John Smith',
      clientDesc: 'CFC, CIF'

    }
];

  slideConfig = { 'slidesToShow': 3, 'slidesToScroll': 1 , responsive : [
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
  // autoplaySpeed: 10000,autoplay : true,
  slideConfigTwo = { 'slidesToShow': 3, 'centerMode': true,   'slidesToScroll': 1 , responsive : [
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


  // autoplay : true, autoplaySpeed: 1000 

  constructor(private activeRoute: ActivatedRoute) { }

  ngOnInit() {
  }



  removeSlide() {
    this.slides.length = this.slides.length - 1;
  }

  slickInit(e) {
    //console.log('slick initialized');
  }
  
  slickInit2(e) {
    //console.log('slick initialized');
  }
  

  breakpoint(e) {
    console.log('breakpoint');
  }

  afterChange(e) {
    console.log('afterChange');
  }

  beforeChange(e) {
    console.log('beforeChange');
  }
}
