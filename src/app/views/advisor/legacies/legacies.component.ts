import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { UserAPIService } from './../../../userapi.service';
import { AppConfirmService } from '../../../shared/services/app-confirm/app-confirm.service';
import { AppLoaderService } from '../../../shared/services/app-loader/app-loader.service';
import { s3Details } from '../../../config';
import { ReferAndEarnModalComponent } from 'app/views/refer-and-earn-modal/refer-and-earn-modal.component';
@Component({
  selector: 'app-legacies-blank',
  templateUrl: './legacies.component.html',
  styleUrls: ['./legacies.component.scss']
})
export class LegaciesComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  legacyDayTwo = false;
  legacyDayOne = true;
  userId = localStorage.getItem("endUserId");
  advisorListing:any = [];
  showAdvisorListing= false;
  showAdvisorListingCnt: any;
  profileUrl = s3Details.url+'/profilePictures/';
  constructor(
    private snack: MatSnackBar,private dialog: MatDialog,private confirmService: AppConfirmService,private loader: AppLoaderService, private router: Router,private userapi: UserAPIService
  ) { }

  ngOnInit() {
    this.getAdvisorlisting();
  }

  getAdvisorlisting(insert = null) {
      const req_vars = {
        query: Object.assign({advisorId:this.userId, status: { $nin:['Rejected','Deleted'] }}),
      } 
      this.loader.open();
      this.userapi.apiRequest('post', 'advisor/hireAdvisorListing', req_vars).subscribe(result => {
      this.loader.close();
        if(result.status == "error"){
          this.snack.open(result.data.message, 'OK', { duration: 4000 })
        } else {
          this.advisorListing = result.data.advisorList;     
          this.showAdvisorListingCnt = this.advisorListing.length;  
          if (this.showAdvisorListingCnt>0) {
            this.showAdvisorListing = true;
          }     
        }
      }, (err) => {
        console.error(err)
      })  
  }

  openReferAndEarnModal(data: any = {}, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(ReferAndEarnModalComponent, {
      width: '720px',
      disableClose: true,
    });
    dialogRef.afterClosed()
    .subscribe(res => {
    this.legacyDayTwo = true;
    this.legacyDayOne = false;
    });
  }

  hireAdvisor(ids,actionName,actionTaken,custEmail,custName,advFname,advLname) {
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
          from: Object.assign({ hiredAdvisorRefId:ids}),
          extraFields: Object.assign({ custEmail:custEmail,custName:custName,advFname:advFname,advLname:advLname})
        }
        this.userapi.apiRequest('post', 'advisor/hireadvisor', req_vars).subscribe(result => {
          this.loader.close();
          if (result.status == "error") {
            this.snack.open(result.data.message, 'OK', { duration: 4000 })
          } else {
            this.getAdvisorlisting();
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
  }
   
}