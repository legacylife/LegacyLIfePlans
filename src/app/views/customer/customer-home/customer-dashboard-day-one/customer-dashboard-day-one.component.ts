import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSnackBar, MatSidenav } from '@angular/material';
import { Product } from '../../../../shared/models/product.model';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../userapi.service';

@Component({
  selector: 'app-customer-home',
  templateUrl: './customer-dashboard-day-one.component.html',
  styleUrls: ['./customer-dashboard-day-one.component.scss'],
  animations: [egretAnimations]
})
export class CustomerDashboardDayOneComponent implements OnInit {

  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  recentlyAccessedFiles : boolean = false;
  userId: string;
  fileActivityLogList:any;



  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private userapi: UserAPIService
  ) { }


  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.getFileActivityLogList();
  }

  getFileActivityLogList = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ customerId: this.userId }, query),
      fields: {},
      offset: 0,
      limit: 6,
      order: {"modifiedOn": -1},
    }   
    this.userapi.apiRequest('post', 'customer/file-activity-log-list', req_vars).subscribe(result => {  
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.fileActivityLogList = result.data.activityLogList;        
        if(result.data.totalRecords > 0){
          this.recentlyAccessedFiles = true;
        }        
      }
    }, (err) => {
      console.error(err);
    })
  }

  getIconNUrl(logData){
    return this.userapi.getFileIconNUrl(logData);
  }


  toggleSideNav() {
    this.sideNav.opened = !this.sideNav.opened;
  }
}

