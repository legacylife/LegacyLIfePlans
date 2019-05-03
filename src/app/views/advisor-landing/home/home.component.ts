import { Component, OnInit } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

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
  slideConfig = { "slidesToShow": 3, "slidesToScroll": 1};
  // autoplay : true, autoplaySpeed: 1000 
  constructor() { }

  ngOnInit() {
  }



  removeSlide() {
    this.slides.length = this.slides.length - 1;
  }

  slickInit(e) {
    console.log('slick initialized');
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
