import { Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar, MatButton } from '@angular/material';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { ReferAndEarnComponent } from './refer-and-earn/refer-and-earn.component';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit {

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
  }

  openllpmodal(): void {
    const dialogRef = this.dialog.open(ReferAndEarnComponent, {
      width: '720px',
    });

    dialogRef.afterClosed().subscribe(result => {});
  }

}
