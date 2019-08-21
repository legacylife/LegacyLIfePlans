import { Observable } from 'rxjs';
import { MatDialogRef, MatDialog, MatDialogConfig } from '@angular/material';
import { Injectable } from '@angular/core';

import { AppComfirmComponent } from './app-confirm.component';
import { ReferNEarnPopUpComponent } from 'app/views/admin/userlist/ngx-table-popup/refer-n-earn-popup.component';

interface confirmData {
  title?: string,
  message?: string,
  status?:string
}

@Injectable()
export class AppConfirmService {

  constructor(private dialog: MatDialog) { }

  public confirm(data:confirmData = {}): Observable<boolean> {
    data.title = data.title || 'Confirm';
    data.message = data.message || 'Are you sure?';
    let dialogRef: MatDialogRef<AppComfirmComponent>;
    dialogRef = this.dialog.open(AppComfirmComponent, {
      width: '380px',
      disableClose: true,
      data: {title: data.title, message: data.message}
    });
    return dialogRef.afterClosed();
  }

  public reactivateReferEarnPopup(data:confirmData = {}): Observable<boolean> {
    data.title = data.title || 'Confirm';
    data.message = data.message || 'Are you sure?';
    data.status = data.status
    let dialogRef: MatDialogRef<ReferNEarnPopUpComponent>;
    dialogRef = this.dialog.open(ReferNEarnPopUpComponent, {
      width: '380px',
      disableClose: true,
      data: {title: data.title, message: data.message, status: data.status}
    });
    return dialogRef.afterClosed();
  }
}