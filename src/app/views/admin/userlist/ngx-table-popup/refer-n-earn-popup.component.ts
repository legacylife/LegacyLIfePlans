import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, Inject } from '@angular/core';

@Component({
  selector: 'app-confirm',
  template: `<div class="ll--modal--header">{{ data.title }}</div>
  <div class="ll--modal--body"><div mat-dialog-content>{{ data.message }}</div></div>
  <div class="ll--modal--footer text-center">
    <div mat-dialog-actions *ngIf="status=='activate'">
      <button class="llp--primary--btn" type="button" mat-raised-button color="primary" (click)="dialogRef.close(true)">Yes</button>
      &nbsp;
      <span fxFlex></span>
      <button class="llp--secondary--btn" type="button" mat-raised-button color="accent" (click)="dialogRef.close(false)">No</button>
    </div>

    <div mat-dialog-actions *ngIf="status!='activate'">
      <button class="llp--primary--btn" type="button" mat-raised-button color="primary" (click)="dialogRef.close(false)">Ok</button>
    </div>
  </div>`,
})
export class ReferNEarnPopUpComponent {
  status:string = 'activate'
  constructor(
    public dialogRef: MatDialogRef<ReferNEarnPopUpComponent>,
    @Inject(MAT_DIALOG_DATA) public data:any
  ) {
    this.status = data.status
  }
}