import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSnackBar, MatSidenav } from '@angular/material';
import { Product } from '../../../shared/models/product.model';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../shared/animations/egret-animations';

@Component({
  selector: 'app-customer-trustees',
  templateUrl: './customer-trustees.component.html',
  styleUrls: ['./customer-trustees.component.scss']
})
export class CustomerTrusteesComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;

  constructor() { }

  ngOnInit() {
  }
  toggleSideNav() {
    this.sideNav.opened = !this.sideNav.opened;
  }

}
