import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../../shared/animations/egret-animations';


@Component({
  selector: 'app-customer-home',
  templateUrl: './customer-my-people.component.html',
  styleUrls: ['./customer-my-people.component.scss'],
  animations: [egretAnimations]
})
export class CustomerMyPeopleComponent implements OnInit {
  constructor(
  ) { }
  ngOnInit() {
  }
}
