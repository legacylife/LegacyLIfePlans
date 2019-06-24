

import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSnackBar, MatSidenav } from '@angular/material';
import { Product } from '../../../shared/models/product.model';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../shared/animations/egret-animations';

@Component({
  selector: 'app-advisor-legacy-details',
  templateUrl: './advisor-legacy-details.component.html',
  styleUrls: ['./advisor-legacy-details.component.scss'],
  animations: [egretAnimations]
})
export class AdvisorLegacyDetailsComponent implements OnInit, OnDestroy {

  @ViewChild(MatSidenav) private sideNav: MatSidenav;


  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {

  }

  ngOnDestroy() {

  }

  toggleSideNav() {
    this.sideNav.opened = !this.sideNav.opened;
  }
}
