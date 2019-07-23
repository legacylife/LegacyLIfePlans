import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { LayoutService } from 'app/shared/services/layout.service';
@Component({
  selector: 'app-customer-trustees',
  templateUrl: './customer-trustees.component.html',
  styleUrls: ['./customer-trustees.component.scss']
})
export class CustomerTrusteesComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  layout = null
  
  constructor( private layoutServ: LayoutService) {

    this.layout = layoutServ.layoutConf
   }

  ngOnInit() {
  }
  toggleSideNav() {
    if(this.layout.isMobile){
      this.sideNav.opened = !this.sideNav.opened;
    }  
  }

}
