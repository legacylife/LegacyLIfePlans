import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, Inject } from '@angular/core';

@Component({
  selector: 'app-confirm',
  template: `<div class="ll--modal--header">{{ data.title }}</div>
  <div class="ll--modal--body"><div mat-dialog-content>{{ data.message }}</div></div>
  <div class="ll--modal--footer text-center">
    <div mat-dialog-actions>
    
    <button  class="llp--secondary--btn"
    type="button"
    color="accent"
    mat-raised-button 
    (click)="dialogRef.close(false)">Cancel</button>
    &nbsp;
    <span fxFlex></span>
    <button class="llp--primary--btn"
    type="button" 
    mat-raised-button
    color="primary" 
    (click)="dialogRef.close(true)">OK</button>
   
    </div></div>`,
})
export class AppComfirmComponent {
  constructor(
    public dialogRef: MatDialogRef<AppComfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data:any
  ) {}
}