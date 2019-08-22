import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { CcShareViaEmailModelComponent } from '../cc-share-via-email-model/cc-share-via-email-model.component';

@Component({
  selector: 'app-cc-detailed-view',
  templateUrl: './cc-detailed-view.component.html',
  styleUrls: ['./cc-detailed-view.component.scss']
})
export class CcDetailedViewComponent implements OnInit {

  constructor(private dialog: MatDialog,) { }

  ngOnInit() {
  }

  openCardDetailsModal() {
    let dialogRef: MatDialogRef<any> = this.dialog.open(CcShareViaEmailModelComponent, {
      width: '720px',     
    })
   
  }

}
