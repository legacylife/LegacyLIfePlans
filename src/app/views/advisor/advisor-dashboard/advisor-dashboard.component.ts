import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';



import { UserAPIService } from './../../../userapi.service';
import { s3Details } from '../../../config';
const profileFilePath = s3Details.url+'/'+s3Details.profilePicturesPath;

@Component({
  selector: 'app-advisor-dashboard',
  templateUrl: './advisor-dashboard.component.html',
  styleUrls: ['./advisor-dashboard.component.scss']
})
export class AdvisorDashboardComponent implements OnInit {

  recentLogs : boolean = false;
  userId: string;
  recentActivityLogList:any;
  profileFilePath:string = profileFilePath;

  constructor(
    private userapi: UserAPIService,
    private router: Router, private dialog: MatDialog, 
    private snack: MatSnackBar, private confirmService: AppConfirmService, 
    private loader: AppLoaderService
  ) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.getAdvisorActivityLogList();
  }

  getAdvisorActivityLogList = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ advisorId: this.userId }, query),
      fields: {},
      offset: 0,
      limit: 6,
      order: {"modifiedOn": -1},
    }   
    this.userapi.apiRequest('post', 'advisor/recentupdatelist', req_vars).subscribe(result => {  
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.recentActivityLogList = result.data.logList;        
        if(result.data.totalRecords > 0){
          this.recentLogs = true;
        }        
      }
    }, (err) => {
      console.error(err);
    })
  }

  hireAdvisor(ids,actionName,actionTaken) {
    let statMsg = 'Are you sure you want to reject hire request?'
    let hirestatus = actionTaken;
    if (actionName == 'confirmHire') {
      statMsg = 'Are you sure you want to confirm hire request?';
      hirestatus = 'Active';
    }
    if (actionName == 'rejectHire') {
      hirestatus = 'Rejected';
    }

    this.confirmService.confirm({ message: statMsg }).subscribe(res => {
      if (res) {
       this.loader.open();
        let query = {};
        let proquery = {status : hirestatus};

        const req_vars = {
          query: Object.assign({ _id:ids}),
          proquery: Object.assign(proquery),
          from: Object.assign({ logId:ids})
        }
        this.userapi.apiRequest('post', 'advisor/hireadvisor', req_vars).subscribe(result => {
          this.loader.close();
          if (result.status == "error") {
            this.snack.open(result.data.message, 'OK', { duration: 4000 })
          } else {
            this.getAdvisorActivityLogList();
            this.snack.open(result.data.message, 'OK', { duration: 4000 })
          }
        }, (err) => {
          console.error(err)
          this.loader.close();
        })
      }
    })
  }

}
