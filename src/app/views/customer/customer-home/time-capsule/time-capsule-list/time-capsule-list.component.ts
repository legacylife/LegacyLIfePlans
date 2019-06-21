import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { egretAnimations } from '../../../../../shared/animations/egret-animations';
import { UserAPIService } from './../../../../../userapi.service';
import { AppLoaderService } from '../../../../../shared/services/app-loader/app-loader.service';
import { TimeCapsuleMoalComponent } from './../time-capsule-modal/time-capsule-modal.component';
@Component({
  selector: 'app-customer-home',
  templateUrl: './time-capsule-list.component.html',
  styleUrls: ['./time-capsule-list.component.scss'],
  animations: [egretAnimations]
})
export class TimeCapsuleListComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  showTimeCapsuleListing = false;
  showTimeCapsuleListingCnt: any;  
  userId: string;
  timeCapsuleListing:any = [];
  modifiedDate:any;
  constructor(private route: ActivatedRoute,private router: Router, private dialog: MatDialog,private userapi: UserAPIService, private loader: AppLoaderService) { }

  ngOnInit() {
    this.userId = localStorage.getItem("endUserId");
    this.getTimecapsuleList();
  }

  getTimecapsuleList = (query = {}) => {
    const req_vars = {
      query: Object.assign({ customerId: this.userId, status: "Active" }, query),
      fields: {},
      order: {"createdOn": -1},
    }
    this.userapi.apiRequest('post', 'timecapsule/timeCapsuleListing', req_vars).subscribe(result => {
      if (result.status == "error") {
        console.log(result.data)
      } else {
        this.timeCapsuleListing = result.data.timeCapsuleList;
        this.showTimeCapsuleListingCnt = this.timeCapsuleListing.length;  
        if (this.showTimeCapsuleListingCnt>0) {
          this.showTimeCapsuleListing = true;
        }
      }
    }, (err) => {
      console.error(err);
    })
  }

  openTimeCapsuleModal() {
    let dialogRef: MatDialogRef<any> = this.dialog.open(TimeCapsuleMoalComponent, {     
      width: '720px',
      disableClose: true,
    });
    dialogRef.afterClosed()
    .subscribe(res => {
      this.getTimecapsuleList();
      if (!res) {
        // If user press cancel
        return;
      }
    })
  }
}