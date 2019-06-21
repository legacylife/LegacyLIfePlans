import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { ReferAndEarnModalComponent } from './refer-and-earn-modal/refer-and-earn-modal.component';

@Component({
  selector: 'app-legacies-blank',
  templateUrl: './legacies.component.html',
  styleUrls: ['./legacies.component.scss']
})
export class LegaciesComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  legacyDayTwo = false;
  legacyDayOne = true;

  constructor(
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
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




}
