
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSnackBar, MatSidenav } from '@angular/material';
import { Product } from '../../../shared/models/product.model';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../shared/animations/egret-animations';

import { MatProgressBar, MatButton } from '@angular/material';
import { Validators} from '@angular/forms';
import { CustomValidators } from 'ng2-validation';

@Component({
  selector: 'app-customer-subscription',
  templateUrl: './customer-subscription.component.html',
  styleUrls: ['./customer-subscription.component.scss'],
  animations: [egretAnimations]
})
export class CustomerSubscriptionComponent implements OnInit, OnDestroy {

  constructor(
  ) { }

  ngOnInit() {
   
  }


}
