import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { businessTypeIcon } from '../../../selectList';
import { LayoutService } from 'app/shared/services/layout.service';
import { DataSharingService } from 'app/shared/services/data-sharing.service';
@Component({
  selector: 'app-customer-professionals-landing',
  templateUrl: './customer-professionals-landing.component.html',
  styleUrls: ['./customer-professionals-landing.component.scss']
})
export class CustomerProfessionalsLandingComponent implements OnInit {
  layout = null;
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  businessTypeIcon: any = businessTypeIcon;
  selectedRow : Number;

  message:string;

  constructor(private layoutServ: LayoutService, private data: DataSharingService) { 
    this.layout = layoutServ.layoutConf
  }

  ngOnInit() {
    this.data.currentMessage.subscribe(message => this.message = message)
  }

  changeTrigger(key,index){
    this.selectedRow = index;
    localStorage.setItem('businessTypeIcon', key) 
    this.data.changeMessage(index)
  }

  toggleSideNav() {
    if(this.layout.isMobile){
      this.sideNav.opened = !this.sideNav.opened;
    }  
  }

}
