import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSnackBar, MatSidenav } from '@angular/material';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-essenioal-id-box',
  templateUrl: './essenioal-id-box.component.html',
  styleUrls: ['./essenioal-id-box.component.scss']
})
export class AdvisorLegacyDetailsComponent implements OnInit, OnDestroy {

  @ViewChild(MatSidenav) private sideNav: MatSidenav;


  constructor() { }

  ngOnInit() {

  }

  ngOnDestroy() {

  }
}
