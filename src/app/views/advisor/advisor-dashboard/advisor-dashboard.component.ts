import { Component, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { APIService } from './../../../api.service';
import { MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { UserAPIService } from './../../../userapi.service';
import { s3Details } from '../../../config';
import { ReferAndEarnModalComponent } from 'app/views/refer-and-earn-modal/refer-and-earn-modal.component';
//import { ReferAndEarnModalComponent } from '../legacies/refer-and-earn-modal/refer-and-earn-modal.component';

const profileFilePath = s3Details.url + '/' + s3Details.profilePicturesPath;

@Component({
  selector: 'app-advisor-dashboard',
  templateUrl: './advisor-dashboard.component.html',
  styleUrls: ['./advisor-dashboard.component.scss']
})
export class AdvisorDashboardComponent implements OnInit {

  recentLogs: boolean = true;
  userId: string;
  recentActivityLogList: any;
  profileFilePath: string = profileFilePath;
  invitedMembersCount: any = 0
  remainingDays:any = 0
  LeadsCount: any = 0
  invitedMembersCountDefault:string='5'
  constructor(
    private userapi: UserAPIService,
    private router: Router, private dialog: MatDialog,
    private snack: MatSnackBar, private confirmService: AppConfirmService,
    private loader: AppLoaderService
  ) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.getAdvisorActivityLogList();
    this.getInviteMembersCount();
    this.getLeadsCount();
  }
  @HostListener('document:click', ['$event']) clickedOutside(event){
    if(event.srcElement.outerText=='Invite'){
      setTimeout(()=>{     
        this.getInviteMembersCount();    
      },2000);     
    } 
  }

  getInviteMembersCount() {
    const params = {
      inviteById: this.userId,
      inviteType: 'advisor'
    }
    this.userapi.apiRequest('post', 'invite/get-invite-members-count', params).subscribe(result => {
      this.invitedMembersCount = result.data.count
      this.remainingDays = result.data.remainingDays
    })
  }

  getLeadsCount() {
    const params = {
      advisorId: this.userId
    }
    this.userapi.apiRequest('post', 'lead/get-leads-count', params).subscribe(result => {
      this.LeadsCount = result.data.count
    })
  }

  getAdvisorActivityLogList = (query = {}, search = false) => {
    const req_vars = {
      query: Object.assign({ advisorId: this.userId }, query),
      fields: {},
      offset: 0,
      limit: "",
      order: { "modifiedOn": -1 },
    }
    this.userapi.apiRequest('post', 'advisor/recentupdatelist', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.recentActivityLogList = result.data.logList;
        if (result.data.totalRecords > 0) {
          this.recentLogs = true;
        }
        else {
          this.recentLogs = false;
        }
      }
    }, (err) => {
      console.error(err);
    })
  }

  hireAdvisor(hiredAdvisorRefId, actionName, actionTaken, ids) {
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
        let proquery = { status: hirestatus };
        let extraFields = { advFname: localStorage.getItem("endUserFirstName"), advLname: localStorage.getItem("endUserLastName") }

        const req_vars = {
          query: Object.assign({ _id: hiredAdvisorRefId }),
          proquery: Object.assign(proquery),
          from: Object.assign({ logId: ids }),
          extraFields: Object.assign(extraFields)
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

  openInviteModal(data: any = {}, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(ReferAndEarnModalComponent, {
      width: '720px',
      disableClose: true,
    })

    dialogRef.afterClosed()
      .subscribe(res => {
        this.getInviteMembersCount();
        if (!res) {
          // If user press cancel
          return;
        }
      })
  }
}
