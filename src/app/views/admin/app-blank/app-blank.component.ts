import { Component, OnInit } from '@angular/core';
import { egretAnimations } from 'app/shared/animations/egret-animations';

@Component({
  selector: 'app-blank',
  templateUrl: './app-blank.component.html',
  styleUrls: ['./app-blank.component.scss'],
  animations: egretAnimations
})
export class AppBlankComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
