import { Component, OnInit } from '@angular/core';
import { egretAnimations } from 'app/shared/animations/egret-animations';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
@Component({
  selector: 'app-blank',
  templateUrl: './app-blank.component.html',
  styleUrls: ['./app-blank.component.scss'],
  animations: egretAnimations
})
export class AppBlankComponent implements OnInit {
  dashboardData: any = []
  constructor(private api: APIService,private loader: AppLoaderService) { }
  ngOnInit() {
    this.getDahsboardDetials();
  }

  getDahsboardDetials = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({userType: {$ne : "sysadmin"}}, query),
      fields: {},
      offset: '',
      limit: '',
      order: {"createdOn": -1},
    }
    this.loader.open();
    this.api.apiRequest('post', 'userlist/dashbaorddetails', req_vars).subscribe(result => {
      if (result.status == "error") {
        this.loader.close();
      } else {
        this.dashboardData = result.data;
        this.loader.close();
      }
    }, (err) => {
      console.error(err);
      this.loader.close();
    })
  }



}
