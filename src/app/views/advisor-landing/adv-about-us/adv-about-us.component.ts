import { Component, OnInit } from '@angular/core';
import {MatGridListModule} from '@angular/material/grid-list';

@Component({
  selector: 'app-adv-about-us',
  templateUrl: './adv-about-us.component.html',
  styleUrls: ['./adv-about-us.component.css']
})
export class AdvAboutUsComponent implements OnInit {

  breakpoint: number;
  constructor() { }

  ngOnInit() {
    this.breakpoint = (window.innerWidth <= 400) ? 1 : 6;
    this.breakpoint = (window.innerWidth <= 600) ? 3 : 6;
  }
  onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 400) ? 1 : 6;
    this.breakpoint = (event.target.innerWidth <= 600) ? 3 : 6;
  }
}
