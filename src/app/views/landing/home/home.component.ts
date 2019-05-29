// import { Component, OnInit } from '@angular/core';
// import {MatGridListModule} from '@angular/material/grid-list';

// @Component({
//   selector: 'app-landing-home-page',
//   templateUrl: './home.component.html',
//   styleUrls: ['./home.component.scss']
// })
// export class HomeComponent implements OnInit {

//   breakpoint: number;
//   constructor() { }

//   ngOnInit() {
//     this.breakpoint = (window.innerWidth <= 400) ? 1 : 6;
//     this.breakpoint = (window.innerWidth <= 600) ? 3 : 6;
//   }
//   onResize(event) {
//     this.breakpoint = (event.target.innerWidth <= 400) ? 1 : 6;
//     this.breakpoint = (event.target.innerWidth <= 600) ? 3 : 6;
//   }
// }





import { Component, OnInit } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  selector: 'app-landing-home-page',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

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

  slideConfig = { 'slidesToShow': 3, 'slidesToScroll': 1 ,  responsive : [
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
  // pauseOnHover:false,  autoplaySpeed: 1000 , speed: 200,
  slideConfigTwo = { 'slidesToShow': 3, 'centerMode': true, infinite: true,
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


  // autoplay : true, autoplaySpeed: 1000 

  constructor() { }

  ngOnInit() {
  }




  slickInit(e) {
    console.log('slick initialized');
  }
  
  slickInit2(e) {
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
