
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSnackBar, MatSidenav } from '@angular/material';
import { Product } from '../../../shared/models/product.model';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../shared/animations/egret-animations';

import { MatProgressBar, MatButton } from '@angular/material';
import { Validators} from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { AdvisorChangePassComponent } from '../advisor-account-setting/advisor-change-pass/advisor-change-pass.component';


@Component({
  selector: 'app-advisor-account-setting',
  templateUrl: './advisor-account-setting.component.html',
  styleUrls: ['./advisor-account-setting.component.scss'],
  animations: [egretAnimations]
})
export class AdvisorAccountSettingComponent implements OnInit {

  selected = 'option1';

  @ViewChild(MatSidenav) private sideNav: MatSidenav;

  constructor( public dialog: MatDialog) { }

  ngOnInit() {
    }

    changePasspordModal(): void {
      const dialogRef = this.dialog.open(AdvisorChangePassComponent, {
        width: '555px',
      });
      dialogRef.afterClosed().subscribe(result => {});
    }

  }

