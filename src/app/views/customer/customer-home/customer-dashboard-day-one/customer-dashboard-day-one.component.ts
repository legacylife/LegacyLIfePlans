import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSnackBar, MatSidenav } from '@angular/material';
import { Product } from '../../../../shared/models/product.model';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../../shared/animations/egret-animations';

@Component({
  selector: 'app-customer-home',
  templateUrl: './customer-dashboard-day-one.component.html',
  styleUrls: ['./customer-dashboard-day-one.component.scss'],
  animations: [egretAnimations]
})
export class CustomerDashboardDayOneComponent implements OnInit {

  @ViewChild(MatSidenav) private sideNav: MatSidenav;



  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) { }


  ngOnInit() {

  }


  toggleSideNav() {
    this.sideNav.opened = !this.sideNav.opened;
  }
}

