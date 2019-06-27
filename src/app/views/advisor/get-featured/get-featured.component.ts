import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { ReferAndEarnModalComponent } from './../legacies/refer-and-earn-modal/refer-and-earn-modal.component';
import { SubmitEnquiryModalComponent } from './submit-enquiry-modal/submit-enquiry-modal.component';

@Component({
  selector: 'app-get-featured',
  templateUrl: './get-featured.component.html',
  styleUrls: ['./get-featured.component.scss']
})
export class GetFeaturedComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;
  legacyDayTwo = false;
  legacyDayOne = true;

  constructor(
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
  }


  openSubmitEnqModal(data: any = {}, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(SubmitEnquiryModalComponent, {
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
