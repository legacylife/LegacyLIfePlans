import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSnackBar, MatSidenav } from '@angular/material';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../shared/animations/egret-animations';
import { businessTypeIcon } from '../../../selectList';
@Component({
  selector: 'app-customer-professionals-landing',
  templateUrl: './customer-professionals-landing.component.html',
  styleUrls: ['./customer-professionals-landing.component.scss']
})
export class CustomerProfessionalsLandingComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  businessTypeIcon: any = businessTypeIcon;
  constructor() { }

  ngOnInit() {

  }

  changeTrigger(key){
    localStorage.setItem('businessTypeIcon', key) 
  }

  toggleSideNav() {
    this.sideNav.opened = !this.sideNav.opened;
  }

}
