import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';

import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { Router } from '@angular/router';
import { ProfAddTrusteeModalComponent } from '../prof-add-trustee-modal/prof-add-trustee-modal.component';

@Component({
  selector: 'app-hire-advisor-modal',
  templateUrl: './hire-advisor-modal.component.html',
  styleUrls: ['./hire-advisor-modal.component.scss']
})
export class HireAdvisorComponent implements OnInit {
  selected = 'option1';
  constructor(
    private router: Router, private dialog: MatDialog
  ) {

  }

  ngOnInit() {

  }

  openProAddTrusteeModal(data: any = {}, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(ProfAddTrusteeModalComponent, {
      width: '720px',
      disableClose: true,
    })
  }
}

