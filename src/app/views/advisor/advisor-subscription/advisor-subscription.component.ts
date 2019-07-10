
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { CardDetailsComponent } from 'app/shared/components/card-details-modal/card-details-modal.component';



@Component({
  selector: 'app-advisor-subscription',
  templateUrl: './advisor-subscription.component.html',
  styleUrls: ['./advisor-subscription.component.scss']
})
 export class AdvisorSubscriptionComponent implements OnInit {

  constructor(private dialog: MatDialog,) { }

  ngOnInit() {
  }
  
  openCardDetailsModal() {
    let dialogRef: MatDialogRef<any> = this.dialog.open(CardDetailsComponent, {
      width: '500px',
      disableClose: true,
    })
  }
}