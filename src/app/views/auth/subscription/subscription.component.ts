import { Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar, MatButton } from '@angular/material';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { ReferAndEarnComponent } from './refer-and-earn/refer-and-earn.component';
import { APIService } from 'app/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit {
  referEarnTargetCount:Number = 0
  referEarnExtendedDays:Number = 0
  referEarnStatus:Boolean = true
  constructor(public dialog: MatDialog, public api:APIService, private router: Router) { 
    this.getReferrelSettings()
  }

  ngOnInit() {
  }

  async getReferrelSettings() {
    let returnArr = await this.api.apiRequest('get', 'referearnsettings/getdetails', {}).toPromise()
    let referEarnSettingsArr   = returnArr.data
    this.referEarnStatus       = referEarnSettingsArr.status == 'On' ? true : false
    if( this.referEarnStatus ) {
      this.referEarnTargetCount  = referEarnSettingsArr.targetCount
      this.referEarnExtendedDays = referEarnSettingsArr.extendedDays
    }
  }

  openllpmodal(): void {
    if( this.referEarnStatus ) {
      const dialogRef = this.dialog.open(ReferAndEarnComponent, {
        width: '720px',
      });

      dialogRef.afterClosed().subscribe(result => {});
    }
  }

}
