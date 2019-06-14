import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { egretAnimations } from '../../../shared/animations/egret-animations';
import { SendAnEmailComponent } from './send-an-email-modal/send-an-email-modal.component';
import { HireAdvisorComponent } from './hire-advisor-modal/hire-advisor-modal.component';

@Component({
  selector: 'app-customer-professionals',
  templateUrl: './customer-professionals.component.html',
  styleUrls: ['./customer-professionals.component.scss']
})
export class CustomerProfessionalComponent implements OnInit {
  @ViewChild(MatSidenav) private sideNav: MatSidenav;

  constructor(
    private route: ActivatedRoute,
    private router: Router, private dialog: MatDialog,
  ) { }

  ngOnInit() {
  }
  openSendEmailModal(data: any = {}, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(SendAnEmailComponent, {
      width: '720px',
      disableClose: true,
    })
  }
  openHireAdvisorModal(data: any = {}, isNew?) {
    let dialogRef: MatDialogRef<any> = this.dialog.open(HireAdvisorComponent, {
      width: '720px',
      disableClose: true,
    })
  }
}
