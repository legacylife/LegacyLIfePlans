
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSnackBar, MatSidenav } from '@angular/material';
import { Product } from '../../../shared/models/product.model';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../shared/animations/egret-animations';

import { MatProgressBar, MatButton } from '@angular/material';
import { Validators} from '@angular/forms';

@Component({
  selector: 'app-advisor-subscription',
  templateUrl: './advisor-subscription.component.html',
  styleUrls: ['./advisor-subscription.component.scss']
})
 export class AdvisorSubscriptionComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}