import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material';
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
